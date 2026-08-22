-- ============================================================
-- ClariPet Ecommerce — 016 Security Events
--
-- Persistent, append-only log of security-relevant events (failed
-- logins, account lockouts, CSRF/origin blocks, bot-check failures,
-- payment webhook signature/amount mismatches). Previously these only
-- went to console.error/warn, which doesn't survive past whatever log
-- retention the host gives you.
--
-- Written exclusively via lib/helpers/securityLog.ts using the
-- service-role client (app code never runs as anon/authenticated for
-- this table), so RLS locks it down to service_role only — same
-- pattern as restore_stock_for_order in 015_order_write_lockdown.sql.
--
-- Run AFTER 015. Safe to re-run (idempotent).
-- ============================================================

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_events_created_at_idx
  on public.security_events (created_at desc);

create index if not exists security_events_event_type_idx
  on public.security_events (event_type);

alter table public.security_events enable row level security;

-- No policies are created for anon/authenticated: with RLS enabled and
-- zero policies, every role except the table owner / service_role
-- (which bypasses RLS entirely) is denied by default. Revoked
-- explicitly below anyway as defence in depth against a future grant.
revoke all on public.security_events from anon, authenticated;

-- ------------------------------------------------------------
-- Post-run verification (expect permission denied / empty result)
--
--   -- as a signed-in user, via PostgREST with the anon/authenticated key:
--   GET  /rest/v1/security_events        -> must be 403 / empty
--   POST /rest/v1/security_events {...}  -> must be 403
-- ------------------------------------------------------------
