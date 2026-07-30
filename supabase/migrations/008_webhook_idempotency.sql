-- ============================================================
-- ClariPet Ecommerce — 008 Webhook Idempotency
-- Prevents double-processing of Midtrans webhooks
-- ============================================================

create table if not exists public.processed_webhooks (
  id uuid primary key default uuid_generate_v4(),
  transaction_id text not null unique,
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  processed_at timestamptz not null default now()
);

-- RLS: purely server-side
alter table public.processed_webhooks enable row level security;

-- Update handle_payment_webhook to use idempotency
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
  -- Idempotency check: Have we processed this specific transaction ID?
  if p_payment_ref is not null then
    insert into public.processed_webhooks (transaction_id, order_id, status)
    values (p_payment_ref, p_order_id, p_new_status)
    on conflict (transaction_id) do nothing;

    -- If no row was inserted (because it conflicted), we've already processed this exact webhook.
    if not found then
      return;
    end if;
  end if;

  -- Lock the specific order row to prevent race conditions
  select status::text into v_current_status 
  from orders 
  where id = p_order_id 
  for update;
  
  if v_current_status is null then
    raise exception 'Order not found';
  end if;

  -- Logic state idempotency Check: if it is already the target status, do nothing
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
      payment_ref = coalesce(p_payment_ref, payment_ref),
      updated_at = now()
  where id = p_order_id;
end;
$$;