-- ============================================================
-- ClariPet Ecommerce — 009 Webhook Handling Simplification
-- The processed_webhooks dedup table (008) keyed idempotency on transaction_id
-- alone, but Midtrans reuses one transaction_id across multiple status events
-- (e.g. QRIS/e-wallet: pending -> settlement), so the settlement event was
-- wrongly skipped and orders stuck at 'pending'.
--
-- The table is also redundant: duplicate-safety already comes from the
-- SELECT ... FOR UPDATE row lock + the same-status early return. So we drop the
-- table and add a single guard against a late 'pending' downgrading an order
-- that has already advanced.
-- ============================================================

drop table if exists public.processed_webhooks;

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
  -- Row lock serializes duplicate/concurrent notifications for this order.
  select status::text into v_current_status
  from orders where id = p_order_id for update;

  if v_current_status is null then
    raise exception 'Order not found';
  end if;

  -- Duplicate of the current state -> no-op (handles Midtrans retries).
  if v_current_status = p_new_status then
    return;
  end if;

  -- Ignore a late/duplicate 'pending' that would downgrade an advanced order.
  if p_new_status = 'pending' and v_current_status <> 'pending' then
    return;
  end if;

  -- Restore stock only on the transition into 'cancelled'.
  if p_new_status = 'cancelled' and v_current_status <> 'cancelled' then
    update product_sizes ps
    set stock = ps.stock + oi.qty
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
