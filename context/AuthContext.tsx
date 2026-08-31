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
  signUp: (email: string, password: string, fullName: string, turnstileToken?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string, turnstileToken?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
  signInWithGooglePopup: (redirectPath?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string, turnstileToken?: string) => Promise<{ error: string | null }>;
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

/**
 * POST JSON to one of our own /api/auth/* routes and unwrap the standard
 * { success, data | error } envelope from lib/helpers/response.ts.
 *
 * signIn/signUp/requestPasswordReset go through these routes (rather than
 * calling the Supabase browser client directly, as they used to) so the
 * app's own rate limiting, account lockout, and bot-check actually apply —
 * a direct client call bypasses this Next.js server entirely.
 */
async function postAuthJson<T>(path: string, body: unknown): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { data: null, error: json.error || "Something went wrong. Please try again." };
    }
    return { data: json.data as T, error: null };
  } catch (err) {
    console.error(`[auth] ${path} request failed`, err);
    return { data: null, error: "Something went wrong. Please check your connection and try again." };
  }
}

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
    async (email: string, password: string, fullName: string, turnstileToken?: string) => {
      const { error } = await postAuthJson("/api/auth/signup", {
        email,
        password,
        full_name: fullName,
        turnstileToken,
      });
      return { error };
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string, turnstileToken?: string) => {
      const { error } = await postAuthJson("/api/auth/login", { email, password, turnstileToken });
      if (error) return { error };
      // The API route authenticates server-side and sets the session cookies
      // on its response; the client SDK never called signInWithPassword
      // itself, so onAuthStateChange won't fire on its own — sync now.
      await refreshUser();
      return { error: null };
    },
    [refreshUser],
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

  /**
   * Google sign-in in a popup, over the standard OAuth redirect flow.
   *
   * The popup runs the same journey the full-page redirect would — Supabase ->
   * Google -> /api/auth/callback -> /auth/popup-done — so the session cookies
   * are set by our own server route on this origin, exactly as before. Only the
   * window it happens in differs.
   *
   * Deliberately NOT Google Identity Services: GIS hands back an ID token from
   * the browser, which requires third-party cookies and an exact JavaScript-
   * origin allowlist entry, and reports every mismatch as an opaque
   * "invalid_client". This flow depends on neither.
   */
  const signInWithGooglePopup = useCallback(
    async (redirectPath = "/") => {
      if (typeof window === "undefined") return { error: "No browser window" };

      // Opened synchronously, before any await: a window.open() that follows an
      // await is no longer attributable to the click and popup blockers kill it.
      // It starts blank and is pointed at Google once we have the URL.
      const popup = window.open(
        "",
        "claripet-google-signin",
        "width=520,height=640,menubar=no,toolbar=no,location=yes,status=no",
      );

      if (!popup) {
        return { error: "Popup diblokir browser. Izinkan popup untuk situs ini, lalu coba lagi." };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // The popup ends on /auth/popup-done, which messages this window and
          // closes itself. `next` is a relative path, as the callback requires.
          redirectTo: `${authOrigin()}/api/auth/callback?next=%2Fauth%2Fpopup-done`,
          skipBrowserRedirect: true,
          // Always show the chooser: without it a signed-in Google user is
          // silently reused, which is surprising on a shared machine.
          queryParams: { prompt: "select_account" },
        },
      });

      if (error || !data?.url) {
        popup.close();
        return { error: error?.message ?? "Gagal memulai proses masuk dengan Google." };
      }

      popup.location.href = data.url;

      // Settle on the popup's message, or on it closing — a popup dismissed by
      // the user must not leave the button spinning forever.
      await new Promise<void>((resolve) => {
        let settled = false;

        const finish = () => {
          if (settled) return;
          settled = true;
          window.removeEventListener("message", onMessage);
          clearInterval(closedTimer);
          resolve();
        };

        const onMessage = (event: MessageEvent) => {
          // Same-origin only: any other window may post here.
          if (event.origin !== window.location.origin) return;
          if (event.data?.type !== "claripet:google-auth") return;
          finish();
        };

        window.addEventListener("message", onMessage);
        const closedTimer = setInterval(() => {
          if (popup.closed) finish();
        }, 400);
      });

      // The session is the only thing worth trusting here: the message can be
      // lost if the popup closes a beat early, and a closed popup says nothing
      // about whether sign-in actually happened. Ask the server.
      const {
        data: { user: signedIn },
      } = await supabase.auth.getUser();

      if (!signedIn) {
        return { error: "Proses masuk dibatalkan. Silakan coba lagi." };
      }

      await refreshUser();
      return { error: null };
    },
    [supabase, refreshUser],
  );

  const requestPasswordReset = useCallback(
    async (email: string, turnstileToken?: string) => {
      const { error } = await postAuthJson("/api/auth/forgot-password", { email, turnstileToken });
      return { error };
    },
    [],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: error.message };
      // Changing the password should not leave other devices/sessions
      // signed in. scope: "others" revokes every session except this one
      // and needs no admin/service-role client — it uses the current
      // session's own token.
      await supabase.auth.signOut({ scope: "others" });
      return { error: null };
    },
    [supabase],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, profileLoading, signUp, signIn, signInWithGoogle, signInWithGooglePopup, signOut, refreshUser, requestPasswordReset, updatePassword }}
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
