-- ============================================================
-- ClariPet Ecommerce — 007 My ClariPet account features
-- Adds: wishlist (Saved Products), pet_profiles, reward_points +
-- reward_events (Rewards), recently_viewed.
-- Run AFTER 006. Safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- wishlist (Saved Products)
-- ------------------------------------------------------------
create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_slug)
);
create index if not exists wishlist_user_id_idx on public.wishlist(user_id);

-- ------------------------------------------------------------
-- pet_profiles
-- ------------------------------------------------------------
create table if not exists public.pet_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null default 'Dog',     -- 'Dog' | 'Cat' | other
  breed text,
  birthdate date,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists pet_profiles_user_id_idx on public.pet_profiles(user_id);

-- ------------------------------------------------------------
-- reward_points (one balance row per user)
-- ------------------------------------------------------------
create table if not exists public.reward_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  lifetime integer not null default 0,
  tier text not null default 'Friend',
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- reward_events (points ledger)
-- ------------------------------------------------------------
create table if not exists public.reward_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists reward_events_user_id_idx on public.reward_events(user_id);

-- ------------------------------------------------------------
-- recently_viewed
-- ------------------------------------------------------------
create table if not exists public.recently_viewed (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  viewed_at timestamptz not null default now(),
  unique (user_id, product_slug)
);
create index if not exists recently_viewed_user_id_idx on public.recently_viewed(user_id);

-- ============================================================
-- Row Level Security — owner-only (mirrors public.addresses)
-- ============================================================
alter table public.wishlist        enable row level security;
alter table public.pet_profiles    enable row level security;
alter table public.reward_points   enable row level security;
alter table public.reward_events   enable row level security;
alter table public.recently_viewed enable row level security;

do $$
declare t text;
begin
  foreach t in array array['wishlist','pet_profiles','reward_points','reward_events','recently_viewed']
  loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$s;', t);
    execute format('drop policy if exists "%1$s_insert_own" on public.%1$s;', t);
    execute format('drop policy if exists "%1$s_update_own" on public.%1$s;', t);
    execute format('drop policy if exists "%1$s_delete_own" on public.%1$s;', t);

    execute format($f$create policy "%1$s_select_own" on public.%1$s
      for select using (user_id = auth.uid());$f$, t);
    execute format($f$create policy "%1$s_insert_own" on public.%1$s
      for insert with check (user_id = auth.uid());$f$, t);
    execute format($f$create policy "%1$s_update_own" on public.%1$s
      for update using (user_id = auth.uid()) with check (user_id = auth.uid());$f$, t);
    execute format($f$create policy "%1$s_delete_own" on public.%1$s
      for delete using (user_id = auth.uid());$f$, t);
  end loop;
end $$;

-- ------------------------------------------------------------
-- Auto-create a reward_points row for new users
-- ------------------------------------------------------------
create or replace function public.handle_new_user_rewards()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.reward_points (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_rewards on auth.users;
create trigger on_auth_user_created_rewards
  after insert on auth.users
  for each row execute function public.handle_new_user_rewards();
