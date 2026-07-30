-- ============================================================
-- ClariPet Ecommerce — 002 Row Level Security
-- Run AFTER 001_schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Helper: is_admin() — checks the caller's profile role
-- SECURITY DEFINER so it can read profiles regardless of RLS.
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- Auto-create profile on new auth user
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.addresses     enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.product_sizes enable row level security;
alter table public.cart_items    enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.articles      enable row level security;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ------------------------------------------------------------
-- addresses (owner only)
-- ------------------------------------------------------------
drop policy if exists "addresses_all_own" on public.addresses;
create policy "addresses_all_own" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- categories (public read, admin write)
-- ------------------------------------------------------------
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories
  for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- products (public read active, admin sees+writes all)
-- ------------------------------------------------------------
drop policy if exists "products_select_active" on public.products;
create policy "products_select_active" on public.products
  for select using (status = 'active' or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- product_sizes (public read, admin write)
-- ------------------------------------------------------------
drop policy if exists "product_sizes_select_all" on public.product_sizes;
create policy "product_sizes_select_all" on public.product_sizes
  for select using (true);

drop policy if exists "product_sizes_admin_write" on public.product_sizes;
create policy "product_sizes_admin_write" on public.product_sizes
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- cart_items (owner only)
-- ------------------------------------------------------------
drop policy if exists "cart_items_all_own" on public.cart_items;
create policy "cart_items_all_own" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- orders (owner read/create, admin read all + update)
-- ------------------------------------------------------------
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- order_items (read if you own the parent order or admin)
-- ------------------------------------------------------------
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- articles (public read, admin write)
-- ------------------------------------------------------------
drop policy if exists "articles_select_all" on public.articles;
create policy "articles_select_all" on public.articles
  for select using (true);

drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write" on public.articles
  for all using (public.is_admin()) with check (public.is_admin());
