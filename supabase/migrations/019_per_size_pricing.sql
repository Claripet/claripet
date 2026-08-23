-- ============================================================
-- ClariPet Ecommerce — 019 Per-Size Pricing
--
-- Until now a product carried ONE price (`products.price`) regardless of which
-- size the shopper picked, so ClariPet Salmon Oil 250ml (Rp 115.000) checked
-- out at the 100ml price (Rp 55.000), and Smell Clean / Baby Powder 100ml
-- (Rp 59.000) checked out at their 30ml price (Rp 30.000). Every one of those
-- was money left on the table on a real order.
--
-- This migration moves price onto `product_sizes` and makes that column the
-- single source of truth for what a line item costs.
--
-- `products.price` is KEPT, but its meaning changes: it is now the derived
-- "from" price — the cheapest size — used for cards, sorting, price filters,
-- and search. It is maintained by a trigger (below) and must not be written
-- by hand any more. Nothing charges money off it after this migration.
--
-- Safe to re-run (idempotent).
--
-- Deploy ordering: run this BEFORE (or with) the matching code deploy. Running
-- it early is harmless — the backfill copies today's product price onto every
-- size, so prices are unchanged until the new per-size figures below land.
-- ============================================================

-- ------------------------------------------------------------
-- 1. product_sizes.price
--
-- Added nullable and backfilled first, so no row is ever briefly visible at
-- a DEFAULT 0 price. NOT NULL goes on only after every row has a real value.
-- ------------------------------------------------------------
alter table public.product_sizes
  add column if not exists price integer;

update public.product_sizes ps
set price = p.price
from public.products p
where p.id = ps.product_id
  and ps.price is null;

alter table public.product_sizes
  alter column price set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_sizes_price_non_negative'
  ) then
    alter table public.product_sizes
      add constraint product_sizes_price_non_negative check (price >= 0);
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. Real per-size prices
--
-- Sourced from "Produk Claripet Description" (the product spec doc). Every
-- product not listed here is single-size, so the backfill above already gave
-- it the correct figure.
--
-- NOT LISTED — claripet-gentle-wash-shampoo 500ml. The spec doc prices only
-- the 250ml (Rp 65.000); the 500ml row was added by 014_gentle_wash_500ml.sql
-- with stock 0 and has never been priced. The backfill leaves it at Rp 65.000,
-- i.e. the same price as the 250ml, which is almost certainly wrong. It is
-- unsellable at stock 0, so nothing can be bought at that price today — but
-- set a real figure here before putting it in stock.
-- ------------------------------------------------------------
update public.product_sizes ps
set price = v.price
from (values
  ('claripet-smell-clean', '100ml', 59000),
  ('claripet-smell-clean', '30ml',  30000),
  ('claripet-baby-powder', '100ml', 59000),
  ('claripet-baby-powder', '30ml',  30000),
  ('claripet-salmon-oil',  '100ml', 55000),
  ('claripet-salmon-oil',  '250ml', 115000)
) as v(slug, label, price)
join public.products p on p.slug = v.slug
where ps.product_id = p.id
  and ps.label = v.label
  and ps.price is distinct from v.price;

-- ------------------------------------------------------------
-- 3. products.price becomes the derived "from" price
--
-- Keeping it in sync in the database rather than in application code means the
-- storefront can never advertise a price on a card that no size actually sells
-- for — including when a size is added, repriced, or deleted by the admin
-- dashboard, by a migration, or by hand in the SQL editor.
--
-- coalesce(..., products.price) leaves the existing value alone for a product
-- with no sizes at all, so a mid-edit product (PUT deletes then reinserts its
-- sizes) never flickers to 0.
-- ------------------------------------------------------------
create or replace function public.sync_product_from_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id uuid := coalesce(new.product_id, old.product_id);
begin
  update products p
  set price = coalesce(
    (select min(ps.price) from product_sizes ps where ps.product_id = v_product_id),
    p.price
  )
  where p.id = v_product_id;

  return null;
end;
$$;

drop trigger if exists product_sizes_sync_price on public.product_sizes;
create trigger product_sizes_sync_price
  after insert or update of price or delete on public.product_sizes
  for each row execute function public.sync_product_from_price();

-- Bring every existing product in line with the trigger's invariant.
update public.products p
set price = sub.min_price
from (
  select product_id, min(price) as min_price
  from public.product_sizes
  group by product_id
) sub
where sub.product_id = p.id
  and p.price is distinct from sub.min_price;

-- ------------------------------------------------------------
-- 4. create_order_from_cart: charge the size price
--
-- Supersedes the body in 003_functions.sql. The only changes are `p.price` ->
-- `ps.price` in the subtotal loop and in the order_items insert; stock
-- locking, validation, and cart clearing are unchanged.
--
-- This is the security-critical half of the migration: the function is
-- SECURITY DEFINER and is the ONLY path that writes orders/order_items
-- (015_order_write_lockdown.sql revoked direct insert from authenticated), so
-- the price it computes here is the price the Midtrans webhook's amount guard
-- later validates against. The client never supplies a price at any point.
-- ------------------------------------------------------------
create or replace function public.create_order_from_cart(
  p_shipping_address jsonb,
  p_shipping_fee int default 0,
  p_payment_method text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal int := 0;
  v_total int := 0;
  v_item record;
begin
  if v_user_id is null then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  if not exists (select 1 from cart_items where user_id = v_user_id) then
    raise exception 'CART_EMPTY' using errcode = 'P0001';
  end if;

  -- Lock involved rows + validate stock
  for v_item in
    select
      ci.qty,
      ci.product_id,
      ci.size_id,
      p.name as product_name,
      ps.label as size_label,
      ps.price,
      ps.stock
    from cart_items ci
    join products p on p.id = ci.product_id
    join product_sizes ps on ps.id = ci.size_id
    where ci.user_id = v_user_id
    for update of ps
  loop
    if v_item.stock < v_item.qty then
      raise exception 'INSUFFICIENT_STOCK: % (% available, % requested)',
        v_item.product_name, v_item.stock, v_item.qty
        using errcode = 'P0002';
    end if;
    v_subtotal := v_subtotal + (v_item.price * v_item.qty);
  end loop;

  v_total := v_subtotal + coalesce(p_shipping_fee, 0);

  insert into orders (
    user_id, status, subtotal, shipping_fee, total,
    shipping_address, payment_method, notes
  )
  values (
    v_user_id, 'pending', v_subtotal, coalesce(p_shipping_fee, 0), v_total,
    p_shipping_address, p_payment_method, p_notes
  )
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, size_label, qty, unit_price)
  select
    v_order_id, ci.product_id, p.name, ps.label, ci.qty, ps.price
  from cart_items ci
  join products p on p.id = ci.product_id
  join product_sizes ps on ps.id = ci.size_id
  where ci.user_id = v_user_id;

  update product_sizes ps
  set stock = ps.stock - ci.qty
  from cart_items ci
  where ci.size_id = ps.id and ci.user_id = v_user_id;

  delete from cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;

-- Grants are unchanged from 011_linter_fixes.sql, but CREATE OR REPLACE keeps
-- them only because the signature is identical — restated here so a fresh
-- database built from these files in order ends up with the same ACL.
revoke all on function public.create_order_from_cart(jsonb, integer, text, text)
  from public, anon;
grant execute on function public.create_order_from_cart(jsonb, integer, text, text)
  to authenticated;

-- ------------------------------------------------------------
-- Post-run verification
--
-- Every size priced, and every product's "from" price matching its cheapest
-- size (expect zero rows from both):
--
--   select id from public.product_sizes where price is null;
--
--   select p.slug, p.price, min(ps.price) as cheapest_size
--   from public.products p
--   join public.product_sizes ps on ps.product_id = p.id
--   group by p.id, p.slug, p.price
--   having p.price is distinct from min(ps.price);
--
-- The multi-size products, for eyeballing:
--
--   select p.slug, ps.label, ps.price
--   from public.products p
--   join public.product_sizes ps on ps.product_id = p.id
--   where p.id in (
--     select product_id from public.product_sizes group by product_id having count(*) > 1
--   )
--   order by p.slug, ps.price;
-- ------------------------------------------------------------
