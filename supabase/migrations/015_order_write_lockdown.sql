-- ============================================================
-- ClariPet Ecommerce — 015 Order Write Lockdown
--
-- Closes three ways a normal signed-in customer could defraud the
-- store using nothing but the public anon key and their own JWT.
-- None of these go through application code, so every server-side
-- price check in app/api/* was being walked around entirely.
--
--   1. Forged orders    — INSERT on orders/order_items was never revoked
--   2. Stock inflation  — restore_stock_for_order accepted the order OWNER
--   3. No DB backstop   — no CHECK constraints on money or stock
--
-- Run AFTER 014. Safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Revoke direct writes to orders / order_items
--
-- 002_rls.sql's insert policies only ever constrained ownership:
--
--   create policy "orders_insert_own" on public.orders
--     for insert with check (auth.uid() = user_id);
--
-- They say nothing about `total`, `subtotal`, `shipping_fee` or
-- `status`, and no migration ever revoked table-level INSERT. So
-- `POST /rest/v1/orders` with {total: 1000, status: 'paid'} was
-- accepted. /api/payments/create then reads gross_amount from that
-- forged row, and the webhook's amount guard compares the Midtrans
-- notification against the SAME forged total — so it passes and the
-- order legitimately becomes 'paid'.
--
-- Checkout is unaffected: it goes through create_order_from_cart,
-- which is SECURITY DEFINER (so it bypasses these grants) and sums
-- p.price * ci.qty from the products table. It is already granted to
-- `authenticated` in 011_linter_fixes.sql.
-- ------------------------------------------------------------
revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;

-- SELECT stays: the RLS policies in 002_rls.sql already scope reads to
-- the owner (or an admin), and /account/orders depends on them.
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- ------------------------------------------------------------
-- 2. restore_stock_for_order: admin / service_role only
--
-- The guard in 003_functions.sql was:
--
--   if not (public.is_admin() or exists (
--     select 1 from orders where id = p_order_id and user_id = auth.uid()
--   )) then raise exception 'FORBIDDEN' ...
--
-- That OR let the ORDER OWNER through. Combined with the EXECUTE grant
-- to `authenticated` in 011_linter_fixes.sql:68-70 and PostgREST's
-- /rest/v1/rpc/ surface, any customer could call it with their own
-- order id. There is no status check and no idempotency, so N calls
-- add qty to stock N times — inventory could be set arbitrarily, which
-- then lets everyone order goods that do not exist.
--
-- (The comment at 011_linter_fixes.sql:56-58 claims this function
-- "re-checks public.is_admin() in its own body, so a non-admin
-- authenticated caller is rejected". That was never true — it is an
-- OR, not an AND.)
--
-- Cancellation still works: the webhook path calls it via the
-- service-role client, and the admin route is being moved to the same
-- client. Both bypass this grant.
-- ------------------------------------------------------------
-- Note on the removed in-body check: is_admin() resolves the caller via
-- auth.uid() (002_rls.sql:16-19). Under the service-role client there is no
-- JWT, so auth.uid() is NULL and is_admin() returns FALSE. Keeping an
-- `if not is_admin() then raise` guard here would therefore reject the only
-- caller that is still allowed to execute this function, breaking admin
-- cancellation. The EXECUTE grant below is the authorization gate now:
-- only service_role can call it, and every route that uses the service-role
-- client has already passed requireAdmin() server-side.
create or replace function public.restore_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update product_sizes ps
  set stock = ps.stock + oi.qty
  from order_items oi
  where oi.order_id = p_order_id
    and oi.product_id is not null
    and ps.product_id = oi.product_id
    and ps.label = oi.size_label;
end;
$$;

revoke all on function public.restore_stock_for_order(uuid)
  from public, anon, authenticated;
grant execute on function public.restore_stock_for_order(uuid) to service_role;

-- ------------------------------------------------------------
-- 3. Defence in depth: money and stock constraints
--
-- These are backstops, not the primary control. Even with the grants
-- above correct, a future code path (or the raw admin inventory PATCH)
-- should not be able to write negative money or negative stock.
--
-- NOT VALID skips the scan of existing rows, so this is safe to run on
-- a live table; validate separately once you have confirmed no
-- pre-existing row violates it (see the VALIDATE statements below).
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_total_non_negative'
  ) then
    alter table public.orders
      add constraint orders_total_non_negative check (total >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'orders_subtotal_non_negative'
  ) then
    alter table public.orders
      add constraint orders_subtotal_non_negative check (subtotal >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'orders_shipping_fee_non_negative'
  ) then
    alter table public.orders
      add constraint orders_shipping_fee_non_negative check (shipping_fee >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'order_items_qty_positive'
  ) then
    alter table public.order_items
      add constraint order_items_qty_positive check (qty > 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'order_items_unit_price_non_negative'
  ) then
    alter table public.order_items
      add constraint order_items_unit_price_non_negative check (unit_price >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'product_sizes_stock_non_negative'
  ) then
    alter table public.product_sizes
      add constraint product_sizes_stock_non_negative check (stock >= 0) not valid;
  end if;
end
$$;

-- Run these once you have confirmed no existing row violates them:
--   select count(*) from public.orders where total < 0 or subtotal < 0 or shipping_fee < 0;
--   select count(*) from public.order_items where qty <= 0 or unit_price < 0;
--   select count(*) from public.product_sizes where stock < 0;
-- Then:
--   alter table public.orders validate constraint orders_total_non_negative;
--   alter table public.orders validate constraint orders_subtotal_non_negative;
--   alter table public.orders validate constraint orders_shipping_fee_non_negative;
--   alter table public.order_items validate constraint order_items_qty_positive;
--   alter table public.order_items validate constraint order_items_unit_price_non_negative;
--   alter table public.product_sizes validate constraint product_sizes_stock_non_negative;

-- ------------------------------------------------------------
-- 4. Re-apply the 010 profiles fix
--
-- 011_linter_fixes.sql:5-8 records that 010_security_fixes.sql "was
-- never applied to the production database" (an earlier version of it
-- referenced OLD.role, which RLS policies cannot do, and failed with
-- 42P01). 011 re-ran 010's *webhook* revoke but NOT its profiles
-- revoke — so if 010 was never re-run, the live policy is still the
-- 002 version, which has `using (auth.uid() = id)` and no WITH CHECK,
-- allowing `UPDATE profiles SET role='admin' WHERE id=auth.uid()`.
--
-- Repeated here so the fix is guaranteed regardless of what actually
-- ran. Idempotent.
-- ------------------------------------------------------------
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- ------------------------------------------------------------
-- Post-run verification (expect zero rows / permission denied)
--
--   -- as a NON-ADMIN user, via PostgREST with the anon key:
--   POST /rest/v1/orders {"user_id":"<self>","total":1000,"status":"paid",...}
--     -> must be 403
--   POST /rest/v1/rpc/restore_stock_for_order {"p_order_id":"<own order>"}
--     -> must be 403 / FORBIDDEN
--   PATCH /rest/v1/profiles?id=eq.<self> {"role":"admin"}
--     -> must be 403
--
--   -- then confirm the happy paths still work:
--   cart -> checkout -> order created -> Snap -> webhook -> 'paid'
--   admin cancel -> stock restored exactly once
-- ------------------------------------------------------------
