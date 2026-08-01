-- ============================================================
-- ClariPet Ecommerce — 011 Database Linter Fixes
-- Clears the WARN findings from the Supabase security linter.
--
-- NOTE: 010_security_fixes.sql already revoked handle_payment_webhook from
-- anon/authenticated, yet the linter still reports it. That means 010 was
-- never applied to the production database. The revoke is repeated below so
-- this migration is correct whether or not 010 ran.
--
-- Deliberately NOT changed here: public.is_admin(). See section 5.
-- ============================================================

-- ------------------------------------------------------------
-- 1. set_updated_at: pin search_path (lint 0011)
--
-- ALTER rather than CREATE OR REPLACE so the body is untouched — a mutable
-- search_path lets a caller shadow unqualified names with objects from a
-- schema they control, which matters because the function runs on every write.
-- ------------------------------------------------------------
alter function public.set_updated_at() set search_path = public, pg_temp;

-- ------------------------------------------------------------
-- 2. Trigger functions: revoke EXECUTE entirely (lints 0028, 0029)
--
-- These fire from triggers, and PostgreSQL does not check EXECUTE privilege
-- when firing a trigger — only when calling the function directly. Revoking
-- therefore closes the PostgREST /rpc/ route without affecting the triggers.
-- Both are SECURITY DEFINER and write to profiles / rewards, so a direct call
-- by anon is pure downside.
-- ------------------------------------------------------------
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_new_user_rewards() from public, anon, authenticated;

-- ------------------------------------------------------------
-- 3. handle_payment_webhook: service_role only (lints 0028, 0029)
--
-- Called exclusively by app/api/payments/webhook/route.ts through the admin
-- client (service_role). It marks orders paid, so an anon-key holder calling
-- it directly could mark their own order paid without paying.
-- ------------------------------------------------------------
revoke all on function public.handle_payment_webhook(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.handle_payment_webhook(uuid, text, text)
  to service_role;

-- ------------------------------------------------------------
-- 4. create_order_from_cart / restore_stock_for_order: drop anon only
--
-- Both are called from server routes that use the *user-scoped* client
-- (lib/supabase/server.ts), so the caller's role is `authenticated`, not
-- service_role:
--   - create_order_from_cart  <- app/api/orders/route.ts:102        (checkout)
--   - restore_stock_for_order <- app/api/admin/orders/[id]/route.ts:44
--
-- Revoking from `authenticated` would break checkout and admin order edits,
-- so that grant stays. restore_stock_for_order additionally re-checks
-- public.is_admin() in its own body, so a non-admin authenticated caller is
-- rejected inside the function.
--
-- The linter will keep reporting lint 0029 for these two. That is expected and
-- correct: they are meant to be callable by signed-in users.
-- ------------------------------------------------------------
revoke all on function public.create_order_from_cart(jsonb, integer, text, text)
  from public, anon;
grant execute on function public.create_order_from_cart(jsonb, integer, text, text)
  to authenticated, service_role;

revoke all on function public.restore_stock_for_order(uuid) from public, anon;
grant execute on function public.restore_stock_for_order(uuid)
  to authenticated, service_role;

-- ------------------------------------------------------------
-- 5. public.is_admin(): intentionally left executable
--
-- DO NOT revoke EXECUTE from anon on this function.
--
-- RLS policy expressions are evaluated as the querying role, so the role needs
-- EXECUTE on any function the policy calls. is_admin() appears in policies that
-- anonymous visitors depend on, including the storefront product list:
--
--   002_rls.sql:91  products select using (status = 'active' or public.is_admin())
--
-- Revoking from anon would make every anonymous product query fail with
-- "permission denied for function is_admin" — i.e. it would take the shop down.
--
-- The clean fix is to move the function into a schema PostgREST does not
-- expose (e.g. `private.is_admin()`) and repoint all ~15 policies at it. That
-- is a larger change and is left as follow-up work; the function itself only
-- reads the caller's own role, so exposure is low risk.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 6. product-images: drop the broad SELECT policy (lint 0025)
--
-- The bucket is public, so objects are served over the public object URL and
-- do not consult storage.objects RLS. The policy's only practical effect is to
-- let any client LIST every file in the bucket. Uploads and deletes go through
-- app/api/admin/uploads/route.ts on the admin client (service_role), which
-- bypasses RLS, and getPublicUrl() builds a URL string without querying.
-- ------------------------------------------------------------
drop policy if exists "product_images_public_read" on storage.objects;
