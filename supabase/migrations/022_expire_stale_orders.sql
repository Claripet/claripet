-- ============================================================
-- ClariPet Ecommerce — 022 Expire stale pending orders
--
-- create_order_from_cart reserves stock the moment an order is created, before
-- the customer has paid. The only thing that ever released it was a Midtrans
-- `expire` notification, and Midtrans sends none when the customer closes the
-- Snap popup without choosing a payment method (no transaction exists on their
-- side). Those orders stayed `pending` forever and kept their stock: on
-- 2026-11-04 two reviewer-account orders from 10-23 and 10-30 were still
-- pending, days past the 60-minute Snap expiry.
--
-- expire_stale_orders() cancels every `pending` order older than the cutoff and
-- restores its stock, and pg_cron runs it every 15 minutes.
--
-- Why 3 hours. /api/payments/create sets a 60-minute Snap expiry, so no payment
-- can settle on an order older than that. The extra two hours cover a webhook
-- outage: a settlement that Midtrans is still retrying should land while the
-- order is still `pending`, not after this sweep has cancelled it (a
-- cancelled -> paid flip in handle_payment_webhook does not take the stock back
-- out again).
--
-- Stock is restored with the same product_id + size_label match as
-- handle_payment_webhook (009) and restore_stock_for_order (015). FOR UPDATE
-- SKIP LOCKED leaves alone any order a webhook is processing at that moment.
--
-- Run AFTER 021. Safe to re-run (idempotent): the function is replaced, and
-- cron.schedule with an existing job name updates that job.
-- ============================================================

create or replace function public.expire_stale_orders(
  p_older_than interval default interval '3 hours'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_count int := 0;
begin
  for v_order_id in
    select id
    from orders
    where status = 'pending'
      and created_at < now() - p_older_than
    order by created_at
    for update skip locked
  loop
    update product_sizes ps
    set stock = ps.stock + oi.qty
    from order_items oi
    where oi.order_id = v_order_id
      and oi.product_id is not null
      and ps.product_id = oi.product_id
      and ps.label = oi.size_label;

    update orders
    set status = 'cancelled',
        updated_at = now()
    where id = v_order_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- Same lockdown as restore_stock_for_order: nobody reachable through PostgREST
-- may call this. pg_cron runs it as the postgres role.
revoke all on function public.expire_stale_orders(interval)
  from public, anon, authenticated;
grant execute on function public.expire_stale_orders(interval) to service_role;

-- ------------------------------------------------------------
-- Schedule: every 15 minutes
-- ------------------------------------------------------------
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'claripet-expire-stale-orders',
  '*/15 * * * *',
  $cron$select public.expire_stale_orders()$cron$
);

-- ------------------------------------------------------------
-- Post-run verification
--
-- The job exists:
--   select jobname, schedule, command, active from cron.job
--   where jobname = 'claripet-expire-stale-orders';
--
-- What the first run will cancel (pending orders older than 3 hours):
--   select id, created_at, total from public.orders
--   where status = 'pending' and created_at < now() - interval '3 hours'
--   order by created_at;
--
-- Run it once by hand instead of waiting 15 minutes (returns the count):
--   select public.expire_stale_orders();
--
-- Later runs and their outcome:
--   select status, return_message, start_time from cron.job_run_details
--   where jobid = (select jobid from cron.job
--                  where jobname = 'claripet-expire-stale-orders')
--   order by start_time desc limit 10;
-- ------------------------------------------------------------
