-- ============================================================
-- ClariPet Ecommerce — 021 Ratings and Best Seller refresh
--
-- Two merchandising changes, both set by hand rather than derived:
--
--   * products.rating      — 5.0 for the shampoos, Skin Guard, Beauty Powder
--                            and Salmon Oil; 4.9 for everything else.
--   * products.best_seller — narrowed to the five products that carry the
--                            "Terlaris" tag: Smell Clean, Baby Powder, Tear
--                            Stain Remover, Gentle Wash and VitaBulu+ Beauty
--                            Powder. Every other product is cleared.
--
-- Nothing recomputes products.rating from the reviews table — it is a display
-- figure, so writing it here is the only way it changes. reviews_count is left
-- alone. data/products.ts carries the same values for the static catalogue.
--
-- Written as absolute CASE assignments over the whole table rather than a list
-- of per-slug updates: that way a product added later without being named here
-- lands on the 4.9 / not-a-best-seller default instead of keeping a stale
-- value, and the file stays safe to re-run.
--
-- Applies to archived rows too. They are filtered out on read, and leaving them
-- behind would mean an un-archive silently restores an old rating.
--
-- Deploy ordering: ship together with the data/products.ts change in the same
-- commit. The static catalogue is the fallback whenever the DB query fails or
-- comes back empty, so letting the two drift apart makes the storefront show
-- different stars depending on which source answered.
-- ============================================================

-- ------------------------------------------------------------
-- Ratings
-- ------------------------------------------------------------
update public.products
set rating = case
  when slug in (
    'claripet-gentle-wash-shampoo',
    'claripet-vitabulu-beauty-shampoo',
    'claripet-skin-guard-silver-heal',
    'claripet-skin-guard-fungal-spray',
    'claripet-vitabulu-beauty-powder',
    'claripet-salmon-oil'
  ) then 5.0
  else 4.9
end
where rating is distinct from case
  when slug in (
    'claripet-gentle-wash-shampoo',
    'claripet-vitabulu-beauty-shampoo',
    'claripet-skin-guard-silver-heal',
    'claripet-skin-guard-fungal-spray',
    'claripet-vitabulu-beauty-powder',
    'claripet-salmon-oil'
  ) then 5.0
  else 4.9
end;

-- ------------------------------------------------------------
-- Best sellers
--
-- Tear Stain Remover is the only tear-stain product in the catalogue; the
-- brief listed it twice ("Tear Stain Remover" and "Tear Stain"), so the new
-- set is five products, not six.
-- ------------------------------------------------------------
update public.products
set best_seller = (slug in (
  'claripet-smell-clean',
  'claripet-baby-powder',
  'claripet-tear-stain-remover',
  'claripet-gentle-wash-shampoo',
  'claripet-vitabulu-beauty-powder'
))
where best_seller is distinct from (slug in (
  'claripet-smell-clean',
  'claripet-baby-powder',
  'claripet-tear-stain-remover',
  'claripet-gentle-wash-shampoo',
  'claripet-vitabulu-beauty-powder'
));

-- ------------------------------------------------------------
-- Post-run verification
--
-- Expect exactly 6 rows at 5.0 and the rest at 4.9:
--
--   select rating, count(*) from public.products group by rating order by rating;
--
-- Expect exactly these 5 slugs, and no others:
--
--   select slug, name, rating, best_seller
--   from public.products
--   where best_seller
--   order by slug;
-- ------------------------------------------------------------
