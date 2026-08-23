-- ============================================================
-- ClariPet Ecommerce — 018 Add Fruity Fresh & Salmon Oil
--
-- Two new catalogue products, matching the data/products.ts entries added in
-- the same commit:
--   * ClariPet Fruity Fresh  — Perfumes, 100ml, Rp 59.000
--   * ClariPet Salmon Oil    — Fur Care & Supplements, 100ml / 250ml
--
-- Written as targeted inserts rather than a re-run of
-- scripts/sync_products_db.ts on purpose: that script wipes and reinserts
-- every product row, which would orphan existing order_items (see the note in
-- 017_product_images_webp.sql). This migration only adds rows.
--
-- PRICING NOTE — the schema carries a single `price` per product, so Salmon
-- Oil's 250ml (Rp 115.000) cannot be priced separately from its 100ml
-- (Rp 55.000). `price` is seeded at the 100ml figure, matching how the
-- existing multi-size products (Smell Clean, Baby Powder, Gentle Wash) already
-- behave. Per-size pricing needs a schema change, not a data one.
--
-- STOCK NOTE — sizes are seeded at 100, the same placeholder every other
-- synced product carries, so the new products are immediately purchasable
-- alongside the rest of the catalogue. Set real figures in the admin dashboard
-- before relying on these counts.
--
-- Safe to re-run (idempotent — a second run inserts nothing).
--
-- Deploy ordering: ship together with the WebP files added under
-- public/images/products/ in the same commit. Running this before those files
-- are deployed 404s the new product images.
-- ============================================================

-- ------------------------------------------------------------
-- Products
-- ------------------------------------------------------------
insert into public.products (
  slug, name, subtitle, category_id, price, rating, reviews_count,
  tone, best_seller, short, benefits, features, mascot, ingredients, howto, status
)
values
  (
    'claripet-fruity-fresh',
    'ClariPet Fruity Fresh',
    'Aroma buah yang juicy, fresh, dan bikin pengen peluk terus.',
    (select id from public.categories where slug = 'perfumes'),
    59000, 4.8, 74, 'sage', false,
    'Fruity Fresh adalah parfum ClariPet dengan aroma buah yang segar, juicy, dan menyenangkan. Perpaduan aroma buah-buahan tropis menciptakan wangi fruity yang fresh tanpa terasa terlalu manis atau bikin eneg. Aromanya dibuka dengan kesegaran buah yang bright dan juicy, kemudian perlahan menjadi lebih lembut dengan sentuhan floral.',
    array[
      'Aroma fruity yang juicy dan fresh tanpa terasa terlalu manis',
      'Clean finish yang lembut',
      'Membantu membuat bulu terasa lebih lembut',
      'Formula non-alkohol yang ramah untuk hewan peliharaan'
    ],
    array['Pet Safe Ingredients', 'Made in Indonesia'],
    'Aroma buah yang juicy, fresh, dan bikin pengen peluk terus.',
    'Water, Stabilizer Complex, Aromatic Blend, Glycerin, Aloe Vera Extract',
    'Semprotkan secukupnya pada area tubuh hewan peliharaan dari jarak sekitar 10–15cm. Hindari area mata, hidung, mulut, dan telinga bagian dalam.',
    'active'
  ),
  (
    'claripet-salmon-oil',
    'ClariPet Salmon Oil',
    'Kulit sehat dan bulu berkilau dimulai dari dalam.',
    (select id from public.categories where slug = 'fur-care-supplements'),
    55000, 4.9, 61, 'peach', false,
    'ClariPet Salmon Oil adalah nutrisi harian dari salmon yang kaya akan Omega-3 & 6, DHA, dan EPA untuk membantu merawat kesehatan anabul dari dalam. Essential fatty acids di dalamnya membantu menjaga kesehatan kulit serta mendukung bulu yang sehat, lembut, dan berkilau. Rasa dan aroma alami salmon juga membantu membuat makanan lebih appealing, termasuk untuk anabul yang picky eater.',
    array[
      'Kaya akan Omega-3 & 6, DHA, dan EPA',
      'Membantu menjaga kulit sehat dan bulu berkilau',
      'DHA membantu mendukung fungsi otak dan penglihatan',
      'EPA dan Omega-3 membantu mendukung kesehatan tubuh dan persendian',
      'Rasa dan aroma alami salmon membuat makanan lebih appealing',
      'Praktis digunakan setiap hari: pump, mix, enjoy'
    ],
    array['Pet Safe Ingredients', 'Made in Indonesia'],
    'Kulit sehat dan bulu berkilau dimulai dari dalam.',
    'Salmon Oil',
    E'Pump ClariPet Salmon Oil sesuai takaran harian berdasarkan berat badan anabul (1 pump ≈ 1 mL, 1× sehari): ≤ 5 kg 1 pump, 5–15 kg 2 pumps, 15–30 kg 3 pumps, di atas 30 kg 4 pumps.\nCampurkan langsung ke dry food, wet food, atau makanan harian hingga merata. Bisa juga diberikan langsung apabila anabul menyukai rasanya.\nUntuk pemakaian pertama, mulai dengan setengah takaran harian selama 3–5 hari, lalu tingkatkan bertahap hingga takaran penuh.\nSimpan di tempat sejuk dan kering, jauh dari sinar matahari langsung, dan tutup kembali dengan baik setelah digunakan.',
    'active'
  )
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Sizes
-- ------------------------------------------------------------
insert into public.product_sizes (product_id, label, stock, sku)
select p.id, v.label, v.stock, v.sku
from (values
  ('claripet-fruity-fresh', '100ml', 100, 'FF-100'),
  ('claripet-salmon-oil',   '100ml', 100, 'SALM100'),
  ('claripet-salmon-oil',   '250ml', 100, 'SALM250')
) as v(slug, label, stock, sku)
join public.products p on p.slug = v.slug
on conflict (product_id, label) do nothing;

-- ------------------------------------------------------------
-- Images
--
-- product_images has no unique constraint to conflict on, so re-runs are
-- guarded with `not exists` on (product_id, url) instead.
-- ------------------------------------------------------------
insert into public.product_images (product_id, url, alt, sort_order)
select p.id, v.url, v.alt, v.sort_order
from (values
  ('claripet-fruity-fresh', '/images/products/fruity-fresh.webp',   'Botol parfum ClariPet Fruity Fresh 100ml aroma buah untuk anjing dan kucing', 0),
  ('claripet-fruity-fresh', '/images/products/fruity-fresh-1.webp', 'ClariPet Fruity Fresh dengan buah pir, peach, dan raspberry segar',           1),
  ('claripet-fruity-fresh', '/images/products/fruity-fresh-2.webp', 'Semprotan halus ClariPet Fruity Fresh di antara bunga yang bermekaran',       2),
  ('claripet-fruity-fresh', '/images/products/fruity-fresh-3.webp', 'ClariPet Fruity Fresh di dalam tas piknik bersama buah-buahan',               3),
  ('claripet-fruity-fresh', '/images/products/fruity-fresh-4.webp', 'ClariPet Fruity Fresh disemprotkan pada bulu anjing saat piknik',             4),
  ('claripet-fruity-fresh', '/images/products/fruity-fresh-5.webp', 'Kucing berbulu panjang dipeluk pawrent di samping ClariPet Fruity Fresh',     5),
  ('claripet-salmon-oil',   '/images/products/salmon-oil.webp',     'Botol pump ClariPet Salmon Oil ukuran 250ml dan 100ml',                       0),
  ('claripet-salmon-oil',   '/images/products/salmon-oil-1.webp',   'Anjing Shiba Inu berbulu sehat di samping ClariPet Salmon Oil 250ml',         1),
  ('claripet-salmon-oil',   '/images/products/salmon-oil-2.webp',   'ClariPet Salmon Oil dari salmon Norwegia kaya Omega-3 dan 6',                 2),
  ('claripet-salmon-oil',   '/images/products/salmon-oil-3.webp',   'ClariPet Salmon Oil dipompa ke makanan kucing',                               3),
  ('claripet-salmon-oil',   '/images/products/salmon-oil-4.webp',   'Kandungan Omega-3 & 6, DHA, dan EPA dalam ClariPet Salmon Oil',               4),
  ('claripet-salmon-oil',   '/images/products/salmon-oil-5.webp',   'Kucing menikmati makanan yang dicampur ClariPet Salmon Oil di rumah',         5)
) as v(slug, url, alt, sort_order)
join public.products p on p.slug = v.slug
where not exists (
  select 1 from public.product_images pi
  where pi.product_id = p.id and pi.url = v.url
);

-- ------------------------------------------------------------
-- Post-run verification (expect 2 products, 3 sizes, 12 images)
--
--   select p.slug, count(distinct s.id) as sizes, count(distinct i.id) as images
--   from public.products p
--   left join public.product_sizes s on s.product_id = p.id
--   left join public.product_images i on i.product_id = p.id
--   where p.slug in ('claripet-fruity-fresh', 'claripet-salmon-oil')
--   group by p.slug;
-- ------------------------------------------------------------
