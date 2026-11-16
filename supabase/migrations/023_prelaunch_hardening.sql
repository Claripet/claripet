-- ============================================================
-- ClariPet Ecommerce — 023 Pre-launch hardening
--
--   1. Shipping weight per size, so ongkir is quoted on the real parcel
--      weight instead of a flat 1 kg.
--   2. Orders remember the courier the customer picked, the parcel weight,
--      the resi (tracking number) and the Midtrans Snap token.
--   3. create_order_from_cart becomes service-role only. Until now any
--      signed-in customer could call it through /rest/v1/rpc with their own
--      p_shipping_fee (0 = free shipping) and skip the API's RajaOngkir quote.
--   4. handle_payment_webhook no longer moves an order backwards (a repeated
--      settlement resetting a shipped order to paid, a late cancel restoring
--      stock for a parcel already sent), and a payment that lands on an order
--      the expiry sweep already cancelled takes its stock back out.
--   5. Reward points / events become read-only for customers.
--
-- DEPLOY ORDER: run this, then deploy the matching app code straight away.
-- The old 4-argument create_order_from_cart is dropped here, so checkout on
-- the previous build fails until the new build is live.
--
-- Run AFTER 022. Safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. product_sizes.weight_grams
--
-- Backfill is an estimate from the size label (ml ≈ grams of liquid, plus the
-- bottle). CHECK EVERY SIZE IN ADMIN → Products and put in the real packed
-- weight; it decides the ongkir the customer pays.
-- ------------------------------------------------------------
alter table public.product_sizes
  add column if not exists weight_grams integer;

update public.product_sizes
set weight_grams = case
  when label ~* '\d+(\.\d+)?\s*(kg|l|liter|litre)\y'
    then ceil((substring(label from '(?i)(\d+(?:\.\d+)?)\s*(?:kg|l|liter|litre)\y'))::numeric * 1000)::int + 60
  when label ~* '\d+\s*(ml|g|gr|gram)\y'
    then (substring(label from '(?i)(\d+)\s*(?:ml|g|gr|gram)\y'))::int + 60
  else 300
end
where weight_grams is null;

alter table public.product_sizes
  alter column weight_grams set default 300,
  alter column weight_grams set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_sizes_weight_positive'
  ) then
    alter table public.product_sizes
      add constraint product_sizes_weight_positive check (weight_grams > 0);
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. orders: shipping, resi and payment-token columns
-- ------------------------------------------------------------
alter table public.orders
  add column if not exists courier_code text,
  add column if not exists courier_service text,
  add column if not exists shipping_etd text,
  add column if not exists shipping_weight_grams integer,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists payment_token text,
  add column if not exists payment_url text,
  add column if not exists payment_expires_at timestamptz,
  add column if not exists paid_email_sent_at timestamptz,
  add column if not exists shipped_email_sent_at timestamptz;

-- ------------------------------------------------------------
-- 3. create_order_from_cart: service role only
--
-- The API route resolves the user (requireUser) and the RajaOngkir fee, then
-- calls this with the service-role client. auth.uid() is NULL under that
-- client, so the user id is now an explicit parameter — which is exactly why
-- nobody but service_role may execute it.
-- ------------------------------------------------------------
drop function if exists public.create_order_from_cart(jsonb, integer, text, text);

create or replace function public.create_order_from_cart(
  p_user_id uuid,
  p_shipping_address jsonb,
  p_shipping_fee int,
  p_courier_code text,
  p_courier_service text,
  p_shipping_etd text,
  p_shipping_weight_grams int,
  p_payment_method text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal int := 0;
  v_item record;
begin
  if p_user_id is null then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  if p_shipping_fee is null or p_shipping_fee < 0 then
    raise exception 'INVALID_SHIPPING_FEE' using errcode = 'P0001';
  end if;

  if not exists (select 1 from cart_items where user_id = p_user_id) then
    raise exception 'CART_EMPTY' using errcode = 'P0001';
  end if;

  for v_item in
    select ci.qty, p.name as product_name, ps.price, ps.stock
    from cart_items ci
    join products p on p.id = ci.product_id
    join product_sizes ps on ps.id = ci.size_id
    where ci.user_id = p_user_id
    for update of ps
  loop
    if v_item.stock < v_item.qty then
      raise exception 'INSUFFICIENT_STOCK: % (% available, % requested)',
        v_item.product_name, v_item.stock, v_item.qty
        using errcode = 'P0002';
    end if;
    v_subtotal := v_subtotal + (v_item.price * v_item.qty);
  end loop;

  insert into orders (
    user_id, status, subtotal, shipping_fee, total,
    shipping_address, payment_method, notes,
    courier_code, courier_service, shipping_etd, shipping_weight_grams
  )
  values (
    p_user_id, 'pending', v_subtotal, p_shipping_fee, v_subtotal + p_shipping_fee,
    p_shipping_address, p_payment_method, p_notes,
    p_courier_code, p_courier_service, p_shipping_etd, p_shipping_weight_grams
  )
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, size_label, qty, unit_price)
  select v_order_id, ci.product_id, p.name, ps.label, ci.qty, ps.price
  from cart_items ci
  join products p on p.id = ci.product_id
  join product_sizes ps on ps.id = ci.size_id
  where ci.user_id = p_user_id;

  update product_sizes ps
  set stock = ps.stock - ci.qty
  from cart_items ci
  where ci.size_id = ps.id and ci.user_id = p_user_id;

  delete from cart_items where user_id = p_user_id;

  return v_order_id;
end;
$$;

revoke all on function public.create_order_from_cart(uuid, jsonb, integer, text, text, text, integer, text, text)
  from public, anon, authenticated;
grant execute on function public.create_order_from_cart(uuid, jsonb, integer, text, text, text, integer, text, text)
  to service_role;

-- ------------------------------------------------------------
-- 4. handle_payment_webhook: forward-only
--
--   pending   -> paid | cancelled          (normal)
--   cancelled -> paid                      (paid after the expiry sweep:
--                                           stock is taken back out)
--   processing/shipped/delivered           (fulfilment already started:
--                                           every notification is ignored,
--                                           refunds are handled by hand)
--   paid      -> cancelled                 (deny/cancel after capture:
--                                           stock restored)
-- ------------------------------------------------------------
create or replace function public.handle_payment_webhook(
  p_order_id uuid,
  p_new_status text,
  p_payment_ref text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;
begin
  select status::text into v_current_status
  from orders where id = p_order_id for update;

  if v_current_status is null then
    raise exception 'Order not found';
  end if;

  if v_current_status = p_new_status then
    return;
  end if;

  if p_new_status = 'pending' then
    return;
  end if;

  if v_current_status in ('processing', 'shipped', 'delivered') then
    return;
  end if;

  if p_new_status = 'cancelled' then
    update product_sizes ps
    set stock = ps.stock + oi.qty
    from order_items oi
    where oi.order_id = p_order_id
      and oi.product_id is not null
      and ps.product_id = oi.product_id
      and ps.label = oi.size_label;
  end if;

  if p_new_status = 'paid' and v_current_status = 'cancelled' then
    update product_sizes ps
    set stock = greatest(ps.stock - oi.qty, 0)
    from order_items oi
    where oi.order_id = p_order_id
      and oi.product_id is not null
      and ps.product_id = oi.product_id
      and ps.label = oi.size_label;
  end if;

  update orders
  set status = p_new_status::order_status,
      payment_ref = coalesce(p_payment_ref, payment_ref),
      updated_at = now()
  where id = p_order_id;
end;
$$;

revoke all on function public.handle_payment_webhook(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.handle_payment_webhook(uuid, text, text)
  to service_role;

-- ------------------------------------------------------------
-- 5. Reward points / events: customers may read, never write
--
-- 007_account_features.sql gave owners insert/update/delete, so a customer
-- could PATCH their own balance through /rest/v1/reward_points. The signup
-- trigger that creates the row is SECURITY DEFINER and is unaffected.
-- ------------------------------------------------------------
drop policy if exists "reward_points_insert_own" on public.reward_points;
drop policy if exists "reward_points_update_own" on public.reward_points;
drop policy if exists "reward_points_delete_own" on public.reward_points;
drop policy if exists "reward_events_insert_own" on public.reward_events;
drop policy if exists "reward_events_update_own" on public.reward_events;
drop policy if exists "reward_events_delete_own" on public.reward_events;

revoke insert, update, delete on public.reward_points from anon, authenticated;
revoke insert, update, delete on public.reward_events from anon, authenticated;

-- ------------------------------------------------------------
-- Post-run verification
--
-- Every size has a weight (eyeball them, then fix in admin):
--   select p.slug, ps.label, ps.weight_grams
--   from product_sizes ps join products p on p.id = ps.product_id
--   order by p.slug, ps.label;
--
-- As a signed-in NON-admin via PostgREST (anon key + user JWT), all 403:
--   POST  /rest/v1/rpc/create_order_from_cart {...}
--   PATCH /rest/v1/reward_points?user_id=eq.<self> {"balance": 99999}
--
-- Happy path after deploying the new build:
--   cart -> checkout -> order has courier_code + shipping_weight_grams
--   -> pay -> paid -> admin enters resi -> shipped
-- ------------------------------------------------------------
