-- ============================================================
-- ClariPet Ecommerce — 003 Functions
-- Atomic order creation, stock management, updated_at trigger.
-- Run AFTER 002_rls.sql
-- ============================================================

-- ------------------------------------------------------------
-- updated_at trigger helper
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- create_order_from_cart
-- Atomically:
--   1. Reads the user's cart
--   2. Validates stock for each item
--   3. Creates the order + order_items
--   4. Decrements product_sizes.stock
--   5. Clears the cart
-- Returns the new order id.
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

  -- Validate cart not empty
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
      p.price,
      ps.label as size_label,
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

  -- Create order
  insert into orders (
    user_id, status, subtotal, shipping_fee, total,
    shipping_address, payment_method, notes
  )
  values (
    v_user_id, 'pending', v_subtotal, coalesce(p_shipping_fee, 0), v_total,
    p_shipping_address, p_payment_method, p_notes
  )
  returning id into v_order_id;

  -- Create order_items + decrement stock
  insert into order_items (order_id, product_id, product_name, size_label, qty, unit_price)
  select
    v_order_id, ci.product_id, p.name, ps.label, ci.qty, p.price
  from cart_items ci
  join products p on p.id = ci.product_id
  join product_sizes ps on ps.id = ci.size_id
  where ci.user_id = v_user_id;

  update product_sizes ps
  set stock = ps.stock - ci.qty
  from cart_items ci
  where ci.size_id = ps.id and ci.user_id = v_user_id;

  -- Clear cart
  delete from cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;

-- ------------------------------------------------------------
-- restore_stock_for_order
-- Used when an order is cancelled — re-adds stock.
-- ------------------------------------------------------------
create or replace function public.restore_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or exists (
    select 1 from orders where id = p_order_id and user_id = auth.uid()
  )) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update product_sizes ps
  set stock = ps.stock + oi.qty
  from order_items oi
  where oi.order_id = p_order_id
    and oi.product_id is not null
    and ps.product_id = oi.product_id
    and ps.label = oi.size_label;
end;
$$;
