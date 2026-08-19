-- ============================================================
-- Gentle Wash Shampoo: add the 500ml size
-- ============================================================
-- The "Kuis ClariPet" quiz asks which Gentle Wash size suits the pet
-- (250 ml for trying out, 500 ml for routine use). The catalogue only carried
-- a 250ml row, so picking 500 ml made POST /api/cart fail with
-- "Size not found" for signed-in shoppers. This adds the missing size.
--
-- Stock is seeded at 0 on purpose: the row makes the size resolvable and
-- visible, but leaves it out of stock until inventory is actually counted in
-- via the admin dashboard. Set a real stock figure (and an SKU) before
-- promoting the size.
insert into public.product_sizes (product_id, label, stock, sku)
select id, '500ml', 0, 'CLP-GWS-500'
from public.products
where slug = 'claripet-gentle-wash-shampoo'
on conflict (product_id, label) do nothing;
