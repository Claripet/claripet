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
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role is not distinct from old.role);

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
