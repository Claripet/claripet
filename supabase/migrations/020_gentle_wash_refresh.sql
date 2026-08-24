-- ============================================================
-- ClariPet Ecommerce — 020 Gentle Wash refresh
--
-- New product photography, and the 500ml goes on sale:
--   * product_images  — replaced with the 8 new shots (the old set included
--                       gentle-wash-chatgpt.webp, which no longer exists on
--                       disk; leaving that row behind 404s a gallery slide).
--   * 250ml           — repriced Rp 65.000 -> Rp 90.000
--   * 500ml           — priced Rp 160.000 (it has been sitting at the 250ml's
--                       Rp 65.000 since the 019 backfill — see the note there)
--                       and stocked, so it is finally purchasable.
--
-- `products.price` is NOT written here: the product_sizes_sync_price trigger
-- from 019 recomputes it as the cheapest size, so it lands on Rp 90.000 by
-- itself. data/products.ts carries the same figures for the static catalogue.
--
-- Safe to re-run (the image rows are replaced wholesale; prices are absolute).
--
-- Deploy ordering: ship together with the WebP files in the same commit.
-- Running this before those files are deployed 404s the new gallery images;
-- deploying the files without this leaves the old alt text and the dead
-- chatgpt row in the database.
-- ============================================================

-- ------------------------------------------------------------
-- Images
--
-- Replaced rather than upserted: five of the eight filenames already exist
-- with different photos behind them and stale alt text, so matching on url
-- would silently keep the old descriptions.
-- ------------------------------------------------------------
delete from public.product_images
where product_id = (
  select id from public.products where slug = 'claripet-gentle-wash-shampoo'
);

insert into public.product_images (product_id, url, alt, sort_order)
select p.id, v.url, v.alt, v.sort_order
from (values
  ('/images/products/gentle-wash.webp',   'Botol ClariPet Gentle Wash Pet Shampoo ukuran 250ml dan 500ml',                                    0),
  ('/images/products/gentle-wash-1.webp', 'ClariPet Gentle Wash 250ml dan 500ml di tepi bathtub kamar mandi',                                 1),
  ('/images/products/gentle-wash-2.webp', 'ClariPet Gentle Wash 500ml di samping anjing berbulu panjang yang sedang disisir',                 2),
  ('/images/products/gentle-wash-3.webp', 'Botol ClariPet Gentle Wash 250ml di meja kamar mandi bersama handuk putih',                        3),
  ('/images/products/gentle-wash-4.webp', 'ClariPet Gentle Wash 250ml di atas busa lembut dengan taburan oatmeal',                            4),
  ('/images/products/gentle-wash-5.webp', 'Kucing dimandikan dengan ClariPet Gentle Wash di dalam baskom berbusa',                            5),
  ('/images/products/gentle-wash-6.webp', 'Anjing chihuahua dimandikan dengan ClariPet Gentle Wash yang membantu menjaga dari kutu dan jamur', 6),
  ('/images/products/gentle-wash-7.webp', 'Kucing dan anjing bermain bersih dan wangi setelah dimandikan dengan ClariPet Gentle Wash',         7)
) as v(url, alt, sort_order)
cross join public.products p
where p.slug = 'claripet-gentle-wash-shampoo';

-- ------------------------------------------------------------
-- Prices
-- ------------------------------------------------------------
update public.product_sizes ps
set price = v.price
from (values
  ('250ml',  90000),
  ('500ml', 160000)
) as v(label, price)
where ps.product_id = (
    select id from public.products where slug = 'claripet-gentle-wash-shampoo'
  )
  and ps.label = v.label
  and ps.price is distinct from v.price;

-- ------------------------------------------------------------
-- Stock
--
-- 100 is the placeholder every other synced size carries; set the real figure
-- in the admin dashboard. Guarded on stock = 0 so a re-run can never overwrite
-- a count that has since been entered (or sold down) for real.
-- ------------------------------------------------------------
update public.product_sizes ps
set stock = 100
where ps.product_id = (
    select id from public.products where slug = 'claripet-gentle-wash-shampoo'
  )
  and ps.label = '500ml'
  and ps.stock = 0;

-- ------------------------------------------------------------
-- Post-run verification
--
-- Expect 8 image rows, sort_order 0..7:
--
--   select i.sort_order, i.url, i.alt
--   from public.product_images i
--   join public.products p on p.id = i.product_id
--   where p.slug = 'claripet-gentle-wash-shampoo'
--   order by i.sort_order;
--
-- Expect 250ml = 90000 / stock unchanged, 500ml = 160000 / stock 100, and the
-- product's "from" price at 90000:
--
--   select p.slug, p.price as from_price, ps.label, ps.price, ps.stock
--   from public.products p
--   join public.product_sizes ps on ps.product_id = p.id
--   where p.slug = 'claripet-gentle-wash-shampoo'
--   order by ps.price;
-- ------------------------------------------------------------
