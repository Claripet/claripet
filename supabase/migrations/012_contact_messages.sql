-- ============================================================
-- ClariPet Ecommerce — 012 Contact Messages
-- Backs the public Contact page form (components/contact/ContactView.tsx)
-- so submissions are actually persisted instead of being a UI-only demo.
-- ============================================================

create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new', -- 'new' | 'read' | 'archived'
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

alter table public.contact_messages enable row level security;

-- Anyone (including anonymous visitors) can submit a contact message, but
-- only admins can read them back — this is a write-only inbox from the
-- client's perspective, same shape as a mailto form.
drop policy if exists "contact_messages_insert_anyone" on public.contact_messages;
create policy "contact_messages_insert_anyone" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "contact_messages_admin_write" on public.contact_messages;
create policy "contact_messages_admin_write" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());
