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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
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

  const refreshUser = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const profile = await fetchProfile(authUser.id);
      setUser({ ...authUser, profile });
    } else {
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser({ ...session.user, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, refreshUser]);

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
      value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, refreshUser, requestPasswordReset, updatePassword }}
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
