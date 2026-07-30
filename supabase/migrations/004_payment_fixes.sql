-- ============================================================
-- ClariPet Ecommerce — 004 Payment Fixes
-- Atomic webhook processing and fraud status handling
-- ============================================================

-- Add challenged status for fraud loophole
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'challenged';

-- ------------------------------------------------------------
-- handle_payment_webhook
-- Atomically processes payment status updates and restores stock
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
  -- Lock the specific order row to prevent race conditions (Database Hiccups)
  select status::text into v_current_status 
  from orders 
  where id = p_order_id 
  for update;
  
  if v_current_status is null then
    raise exception 'Order not found';
  end if;

  -- Idempotency Check: if it is already the target status, do nothing
  if v_current_status = p_new_status then
    return;
  end if;

  -- Inventory Multiplier Fix: Restore stock only if moving to cancelled from a non-cancelled state
  if p_new_status = 'cancelled' and v_current_status != 'cancelled' then
    update product_sizes ps
    set stock = ps.stock + oi.qty
    from order_items oi
    where oi.order_id = p_order_id
      and oi.product_id is not null
      and ps.product_id = oi.product_id
      and ps.label = oi.size_label;
  end if;

  -- Update order status
  update orders
  set status = p_new_status::order_status,
      payment_ref = coalesce(p_payment_ref, payment_ref)
  where id = p_order_id;
end;
$$;
