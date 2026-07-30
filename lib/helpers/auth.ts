import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface AuthUser extends User {
  profile: Profile | null;
}

/**
 * Get current user from Supabase auth.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { ...user, profile } as AuthUser;
}

/**
 * Require authenticated user. Returns user or throws.
 * Used in API routes where auth is mandatory.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Require admin user. Returns user or throws.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.profile?.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.profile?.role === "admin";
}
