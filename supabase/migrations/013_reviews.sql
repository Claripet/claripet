-- ============================================================
-- ClariPet Ecommerce — 013 Reviews
-- Admin-curated customer reviews. Replaces the hardcoded arrays that used to
-- live in components/reviews/ReviewsView.tsx, and feeds the reviews page, the
-- home page shelf and the product page "Ulasan" tab.
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  author_name text not null,
  -- Free-form subtitle under the name, e.g. "Mochi · Poodle".
  pet_name text,
  rating smallint not null default 5 check (rating between 1 and 5),
  body text not null,
  -- Uploaded photo (product-images bucket, reviews/ prefix). Null → the card
  -- falls back to the illustrated `tone` placeholder.
  photo_url text,
  -- Optional link to the product being reviewed. `set null` so deleting a
  -- product keeps the testimonial rather than silently dropping it.
  product_id uuid references public.products(id) on delete set null,
  tone text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reviews_published_idx
  on public.reviews(published, sort_order, created_at desc);
create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_featured_idx
  on public.reviews(featured) where featured;

alter table public.reviews enable row level security;

-- Storefront reads published reviews with the anon key (lib/supabase/public.ts).
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (published);

-- Everything else is admin-only; reviews are authored in /admin/reviews, not
-- submitted by customers.
drop policy if exists "reviews_admin_read" on public.reviews;
create policy "reviews_admin_read" on public.reviews
  for select using (public.is_admin());

drop policy if exists "reviews_admin_insert" on public.reviews;
create policy "reviews_admin_insert" on public.reviews
  for insert with check (public.is_admin());

drop policy if exists "reviews_admin_update" on public.reviews;
create policy "reviews_admin_update" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete" on public.reviews
  for delete using (public.is_admin());
