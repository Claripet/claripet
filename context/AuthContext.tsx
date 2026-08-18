"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
}

interface AuthUser extends User {
  profile: Profile | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /**
   * True while the profile row for the current user is still in flight. The
   * session lands first and the profile follows, so anything gating on
   * `profile.role` must wait for this rather than treating a null profile as
   * "not an admin".
   */
  profileLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
  signInWithGoogleIdToken: (idToken: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Origin used to build auth redirect URLs.
 *
 * Prefers the live browser origin so localhost, preview deployments and
 * production each return to themselves; falls back to the configured site URL
 * when there is no window (SSR).
 */
function authOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

/** Milliseconds before a profile fetch is abandoned so the UI stops waiting. */
const PROFILE_TIMEOUT_MS = 10_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  // Guards against out-of-order profile responses and lets a sign-out cancel a
  // fetch that is still in flight.
  const profileRequestId = useRef(0);
  // The user id whose profile is already loaded, so a token refresh does not
  // re-query it on every event.
  const profileLoadedFor = useRef<string | null>(null);
  // Stabilise the client so it is created only once per provider mount, not on
  // every render.  createClient() reads env vars and allocates internal state,
  // so repeated calls are wasteful even if the library caches internally.
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, role")
        .eq("id", userId)
        .single();
      return data as Profile | null;
    },
    [supabase],
  );

  /**
   * Loads the profile in the background and patches it onto the user.
   *
   * Deliberately fire-and-forget: this is called from `onAuthStateChange`,
   * and `signInWithPassword` does not resolve until every state-change
   * listener has returned. Awaiting a Supabase query in there makes the whole
   * sign-in wait on it — a slow or stalled profile query left the login button
   * frozen on "Signing in..." with no error, which is exactly what happened in
   * production.
   */
  const loadProfileInBackground = useCallback(
    (authUser: User) => {
      const requestId = ++profileRequestId.current;
      setProfileLoading(true);

      const timer = setTimeout(() => {
        if (requestId === profileRequestId.current) {
          console.warn("[auth] profile fetch timed out");
          setProfileLoading(false);
        }
      }, PROFILE_TIMEOUT_MS);

      fetchProfile(authUser.id)
        .then((profile) => {
          if (requestId !== profileRequestId.current) return;
          profileLoadedFor.current = authUser.id;
          setUser((prev) =>
            prev && prev.id === authUser.id ? { ...prev, profile } : prev,
          );
        })
        .catch((err) => {
          console.error("[auth] profile fetch failed", err);
        })
        .finally(() => {
          clearTimeout(timer);
          if (requestId === profileRequestId.current) setProfileLoading(false);
        });
    },
    [fetchProfile],
  );

  const refreshUser = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const profile = await fetchProfile(authUser.id);
      profileLoadedFor.current = authUser.id;
      setUser({ ...authUser, profile });
    } else {
      profileLoadedFor.current = null;
      setUser(null);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    let cancelled = false;

    // Timeout: stop loading after 6 s even if auth never responds (free-tier
    // Supabase may be paused / unreachable) so the page doesn't stay blank.
    const timer = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 6_000);

    // Initial load
    refreshUser().finally(() => {
      if (!cancelled) {
        clearTimeout(timer);
        setLoading(false);
      }
    });

    // Listen for auth changes.
    //
    // The callback is intentionally synchronous. Supabase awaits every listener
    // before `signIn*` resolves, so anything awaited in here blocks sign-in
    // itself — the session is published immediately and the profile is patched
    // on afterwards by `loadProfileInBackground`.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user;

      if (authUser) {
        // Keep the profile already held for this user across token refreshes
        // so the UI never flickers back to a profile-less state.
        setUser((prev) =>
          prev && prev.id === authUser.id
            ? { ...authUser, profile: prev.profile }
            : { ...authUser, profile: null },
        );
        if (profileLoadedFor.current !== authUser.id) {
          loadProfileInBackground(authUser);
        }
      } else {
        // Cancels any profile fetch still in flight for the old session.
        profileRequestId.current++;
        profileLoadedFor.current = null;
        setProfileLoading(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [supabase, loadProfileInBackground, refreshUser]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // Confirmation links must land on the callback route so the session
          // is exchanged; without this Supabase uses the project Site URL and
          // the code arrives on a page that cannot consume it.
          emailRedirectTo: `${authOrigin()}/api/auth/callback?next=%2F`,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    profileRequestId.current++;
    profileLoadedFor.current = null;
    setProfileLoading(false);
    setUser(null);
  }, [supabase]);

  const signInWithGoogle = useCallback(
    async (redirectPath = "/") => {
      const next = encodeURIComponent(redirectPath);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${authOrigin()}/api/auth/callback?next=${next}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [supabase],
  );

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string) => {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [supabase],
  );

  const requestPasswordReset = useCallback(
    async (email: string) => {
      // Route recovery links through the callback too — the reset link carries
      // a PKCE code that has to be exchanged before /reset-password can call
      // updateUser().
      const redirectTo = `${authOrigin()}/api/auth/callback?next=%2Freset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return { error: error.message };
      return { error: null };
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: error.message };
      return { error: null };
    },
    [supabase],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, profileLoading, signUp, signIn, signInWithGoogle, signInWithGoogleIdToken, signOut, refreshUser, requestPasswordReset, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
