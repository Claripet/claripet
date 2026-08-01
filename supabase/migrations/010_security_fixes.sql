-- ============================================================
-- ClariPet Ecommerce — 010 Security Fixes
-- Addresses two CRITICAL findings from the 2026-07-03 review:
--   1. profiles_update_own policy allowed role self-elevation (no with check)
--   2. handle_payment_webhook RPC (security definer) callable by anon/authenticated
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles_update_own: prevent role self-elevation
-- A user may still update their own row, but cannot change their
-- role column (only admins/service_role can grant roles).
-- ------------------------------------------------------------
-- NOTE: an earlier version of this file used `old.role` in the with-check.
-- RLS policies cannot reference OLD/NEW — those exist only in triggers and
-- rules — so that statement failed with 42P01 and this migration never
-- applied. Column privileges give the same guarantee more simply: revoke the
-- ability to write `role` at all, so the attempt is rejected before RLS is
-- even consulted.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Table-level UPDATE implies every column, so it has to be revoked before the
-- writable columns can be granted back. app/api/profile/route.ts writes only
-- full_name and phone; `role` is granted to nobody, leaving service_role (which
-- bypasses these checks) as the only way to promote an admin.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Service-role (used by server API routes) bypasses RLS, so admin
-- role grants via the admin client still work. Direct anon/authenticated
-- attempts to set role='admin' are now rejected at the policy gate.

-- ------------------------------------------------------------
-- 2. handle_payment_webhook: restrict execute to service_role only
-- The function is SECURITY DEFINER (bypasses RLS) and mutates order
-- status + stock. Any anon-key holder could previously call it via
-- PostgREST to mark orders paid without paying.
-- ------------------------------------------------------------
revoke execute on function public.handle_payment_webhook(uuid, text, text)
  from anon, authenticated;
grant execute on function public.handle_payment_webhook(uuid, text, text)
  to service_role;
