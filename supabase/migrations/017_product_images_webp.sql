-- ============================================================
-- ClariPet Ecommerce — 017 Product Images WebP
--
-- public/images/products/*.png (128 files, ~160MB, flat product photos
-- with no transparency) were converted to WebP (~10MB total, same pixels,
-- ~93% smaller) — see scripts/convert_product_images_webp.js and the
-- matching data/products.ts update in the same commit.
--
-- product_images.url was populated by scripts/sync_products_db.ts reading
-- data/products.ts at whatever point the DB was last seeded, so any row
-- pointing at the old *.png paths needs the same rename here. This is a
-- pure data update — it does not touch products, product_sizes, orders, or
-- any other table, and does not delete/reinsert anything (unlike re-running
-- sync_products_db.ts, which wipes and reinserts every product and would
-- orphan any existing order_items — do NOT use that script for this).
--
-- IMPORTANT — deploy ordering: this migration and the code change that
-- replaces the PNG files with WebP must ship together. Running this before
-- the WebP files are deployed, or deploying the WebP files before running
-- this, both 404 live product images for whatever window they're out of
-- sync. Run this as part of the same deploy as the commit containing
-- scripts/convert_product_images_webp.js's output.
--
-- Safe to re-run (idempotent — a second run matches zero rows).
-- ============================================================

update public.product_images
set url = regexp_replace(url, '\.png$', '.webp')
where url like '/images/products/%.png';

-- ------------------------------------------------------------
-- Post-run verification (expect zero rows)
--
--   select count(*) from public.product_images
--   where url like '/images/products/%.png';
-- ------------------------------------------------------------
