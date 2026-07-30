-- ============================================================
-- ClariPet Ecommerce — 001 Schema
-- Run this first in the Supabase SQL Editor.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('active', 'draft', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- profiles (extends auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- addresses
-- ------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  full_name text not null,
  phone text not null,
  street text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_id_idx on public.addresses(user_id);

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  tone text,
  icon text,
  blurb text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  subtitle text,
  category_id uuid references public.categories(id) on delete set null,
  price integer not null default 0,            -- IDR, no decimals
  rating numeric(2,1) not null default 5.0,
  reviews_count integer not null default 0,
  tone text,
  best_seller boolean not null default false,
  short text,
  benefits text[] not null default '{}',
  features text[] not null default '{}',
  mascot text,
  ingredients text,
  howto text,
  status product_status not null default 'draft',
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_status_idx on public.products(status);

-- ------------------------------------------------------------
-- product_sizes (variant + inventory)
-- ------------------------------------------------------------
create table if not exists public.product_sizes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  stock integer not null default 0,
  sku text,
  unique (product_id, label)
);
create index if not exists product_sizes_product_idx on public.product_sizes(product_id);

-- ------------------------------------------------------------
-- cart_items
-- ------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size_id uuid not null references public.product_sizes(id) on delete cascade,
  qty integer not null default 1 check (qty > 0),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, size_id)
);
create index if not exists cart_items_user_idx on public.cart_items(user_id);

-- ------------------------------------------------------------
-- orders
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status order_status not null default 'pending',
  subtotal integer not null default 0,
  shipping_fee integer not null default 0,
  total integer not null default 0,
  shipping_address jsonb not null,
  payment_method text,
  payment_ref text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

-- ------------------------------------------------------------
-- order_items
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size_label text not null,
  qty integer not null check (qty > 0),
  unit_price integer not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ------------------------------------------------------------
-- articles (journal)
-- ------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  category text,
  read_time text,
  tone text,
  featured boolean not null default false,
  excerpt text,
  body text[] not null default '{}',
  sections jsonb not null default '[]',
  created_at timestamptz not null default now()
);
