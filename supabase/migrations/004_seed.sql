-- ============================================================
-- ClariPet Ecommerce — 004 Seed Data
-- Run AFTER 003_functions.sql
--
-- IMPORTANT: After running this, create an admin user:
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Create a user with your email and password
--   3. Copy the user's UUID
--   4. Run: UPDATE profiles SET role = 'admin' WHERE id = '<uuid>';
--
-- Alternatively, the admin seed below creates a profile row
-- for the first user who signs up as admin. You'll just need
-- to UPDATE that profile's role to 'admin' manually.
-- ============================================================

-- Disable RLS for seeding (service role anyway)
-- This is safe because these statements are run via the SQL Editor
-- which uses the service-role key.

-- ============================================================
-- Categories
-- ============================================================
insert into public.categories (slug, name, tone, icon, blurb, sort_order) values
  ('perfumes',        'Perfumes',        'pink',     'spray',   'Long-lasting, gentle fragrances',      1),
  ('oral-care',       'Oral Care',       'sky',      'droplet', 'Fresh breath, healthy gums',           2),
  ('tear-stain-care', 'Tear Stain Care', 'lavender', 'sparkle', 'Clear, bright-eyed faces',             3),
  ('skin-care',       'Skin Care',       'sage',     'leaf',    'Soothe, calm & protect',               4),
  ('grooming',        'Grooming',        'cream',    'smile',   'Clean coats, happy days',              5),
  ('supplements',     'Supplements',     'peach',    'shield',  'Wellness from the inside out',         6)
on conflict (slug) do nothing;

-- ============================================================
-- Products
-- ============================================================
insert into public.products (slug, name, subtitle, category_id, price, rating, reviews_count, tone, best_seller, short, benefits, features, mascot, ingredients, howto, status)
values
  (
    'breath-oral-spray',
    'ClariPet Breath Oral Spray',
    'Fresh breath, healthy gums',
    (select id from categories where slug = 'oral-care'),
    165000, 4.9, 320, 'sky', true,
    'A gentle daily oral spray that freshens breath and supports healthy teeth and gums — no brushing battle required.',
    '{"Freshens Breath","Reduces Plaque & Tartar","Daily Oral Care Support"}',
    '{"Pet Safe Ingredients","Alcohol Free","Easy to Use Daily","Made in Indonesia"}',
    'Clean mouth, happy pet!',
    'Purified Water, Vegetable Glycerin, Aloe Vera Extract, Green Tea Extract, Peppermint Oil, Sodium Bicarbonate, Citric Acid.',
    E'Lift your pet\u2019s lip and spray 1\u20132 times directly onto teeth and gums, once or twice daily. No rinsing needed. Avoid contact with eyes.',
    'active'
  ),
  (
    'tear-stain-remover',
    'ClariPet Tear Stain Remover',
    'Gentle on delicate eye areas',
    (select id from categories where slug = 'tear-stain-care'),
    150000, 4.9, 289, 'lavender', true,
    'A soothing solution that gently lifts away tear stains and keeps the delicate area around the eyes clean and bright.',
    '{"Removes Tear Stains","Gentle & Non-Irritating","Brightens Eye Area"}',
    '{"Pet Safe Ingredients","Alcohol Free","Tear-Free Formula","Made in Indonesia"}',
    'Bright eyes, big smiles!',
    'Purified Water, Witch Hazel, Chamomile Extract, Aloe Vera, Colloidal Silver, Boric Acid (trace).',
    'Dampen a cotton pad and gently wipe the stained area below the eyes once daily. Do not apply directly into the eyes.',
    'active'
  ),
  (
    'pet-perfume-baby-powder',
    'Pet Perfume Baby Powder',
    'Soft, clean baby-powder scent',
    (select id from categories where slug = 'perfumes'),
    120000, 4.9, 410, 'pink', true,
    'A delicate, long-lasting fragrance that leaves your fur baby smelling fresh and cuddle-ready all day long.',
    '{"Long-Lasting Scent","Gentle on Coat","Neutralises Odour"}',
    '{"Pet Safe Ingredients","Alcohol Free","Skin Friendly","Made in Indonesia"}',
    'Smell-good snuggles!',
    'Purified Water, Plant-Derived Fragrance, Vegetable Glycerin, Panthenol, Aloe Vera Extract.',
    'Hold 20-30cm away and lightly mist the coat, avoiding the face. Brush through for an even finish.',
    'active'
  ),
  (
    'shu-shu-deodorizing-spray',
    'Shu Shu Deodorizing Spray',
    'Instant odour neutraliser',
    (select id from categories where slug = 'grooming'),
    125000, 4.9, 245, 'sage', true,
    'A waterless deodorising mist that neutralises odours between baths and keeps coats soft, fresh and shiny.',
    '{"Neutralises Odour","Waterless & Quick","Conditions Coat"}',
    '{"Pet Safe Ingredients","Alcohol Free","No-Rinse Formula","Made in Indonesia"}',
    'Fresh between baths!',
    'Purified Water, Plant Extracts, Vegetable Glycerin, Odour-Neutralising Complex, Vitamin E.',
    'Spray evenly over the coat from 20cm away, avoiding eyes. Massage in lightly. No rinsing required.',
    'active'
  ),
  (
    'soothing-skin-serum',
    'Soothing Skin Serum',
    'Calms itchy, irritated skin',
    (select id from categories where slug = 'skin-care'),
    175000, 4.8, 168, 'sage', false,
    'A lightweight serum with oat and aloe that calms redness and soothes dry, itchy patches for happier skin.',
    '{"Soothes Irritation","Hydrates Dry Skin","Supports Coat Health"}',
    '{"Pet Safe Ingredients","Fragrance Free","Vet Formulated","Made in Indonesia"}',
    'No more itchy days!',
    'Purified Water, Colloidal Oatmeal, Aloe Vera, Allantoin, Ceramides, Vitamin E.',
    'Apply a few drops to affected areas and massage gently into the skin once or twice daily.',
    'active'
  ),
  (
    'gentle-cleansing-shampoo',
    'Gentle Cleansing Shampoo',
    'Tearless, soap-free wash',
    (select id from categories where slug = 'grooming'),
    110000, 4.8, 203, 'sky', false,
    E'A sulphate-free, tearless shampoo that cleans deeply while keeping skin\u2019s natural moisture balance intact.',
    '{"Deep Yet Gentle Clean","Tearless Formula","Leaves Coat Soft"}',
    '{"Pet Safe Ingredients","Sulphate Free","pH Balanced","Made in Indonesia"}',
    'Bath time, the easy way!',
    E'Purified Water, Coconut-Derived Cleansers, Glycerin, Oat Protein, Chamomile, Provitamin B5.',
    'Wet the coat, massage in a small amount, lather and rinse thoroughly. Repeat if needed.',
    'active'
  ),
  (
    'daily-wellness-supplement',
    'Daily Wellness Supplement',
    'Coat, joints & immunity',
    (select id from categories where slug = 'supplements'),
    195000, 4.9, 142, 'peach', false,
    'A daily chew packed with omega-3, vitamins and probiotics to support a shiny coat, supple joints and strong immunity.',
    '{"Supports Shiny Coat","Joint & Mobility Support","Boosts Immunity"}',
    '{"Pet Safe Ingredients","Natural Flavour","Vet Approved","Made in Indonesia"}',
    'Wellness in every chew!',
    'Salmon Oil (Omega-3), Vitamin E, Biotin, Glucosamine, Probiotic Blend, Natural Chicken Flavour.',
    'Give 1 chew per 10kg of body weight daily, with or after food.',
    'active'
  ),
  (
    'lavender-calm-perfume',
    'Lavender Calm Perfume',
    'Relaxing lavender scent',
    (select id from categories where slug = 'perfumes'),
    120000, 4.7, 96, 'lavender', false,
    'A calming lavender mist that keeps your pet smelling lovely while helping them feel relaxed and at ease.',
    '{"Calming Aroma","Long-Lasting Scent","Gentle on Coat"}',
    '{"Pet Safe Ingredients","Alcohol Free","Skin Friendly","Made in Indonesia"}',
    'Calm & cuddly!',
    'Purified Water, Lavender Extract, Plant-Derived Fragrance, Glycerin, Panthenol.',
    E'Lightly mist the coat from 20\u201330cm away, avoiding the face. Brush through for an even finish.',
    'active'
  )
on conflict (slug) do nothing;

-- ============================================================
-- Product Sizes (with 100 stock each)
-- ============================================================
insert into public.product_sizes (product_id, label, stock, sku) values
  ((select id from products where slug='breath-oral-spray'),    '60ml',      100, 'CLP-BOS-60'),
  ((select id from products where slug='breath-oral-spray'),    '120ml',     100, 'CLP-BOS-120'),
  ((select id from products where slug='tear-stain-remover'),   '60ml',      100, 'CLP-TSR-60'),
  ((select id from products where slug='tear-stain-remover'),   '120ml',     100, 'CLP-TSR-120'),
  ((select id from products where slug='pet-perfume-baby-powder'), '50ml',   100, 'CLP-PPB-50'),
  ((select id from products where slug='pet-perfume-baby-powder'), '100ml',  100, 'CLP-PPB-100'),
  ((select id from products where slug='shu-shu-deodorizing-spray'), '100ml', 100, 'CLP-SDS-100'),
  ((select id from products where slug='shu-shu-deodorizing-spray'), '200ml', 100, 'CLP-SDS-200'),
  ((select id from products where slug='soothing-skin-serum'),  '30ml',      100, 'CLP-SSS-30'),
  ((select id from products where slug='soothing-skin-serum'),  '60ml',      100, 'CLP-SSS-60'),
  ((select id from products where slug='gentle-cleansing-shampoo'), '250ml', 100, 'CLP-GCS-250'),
  ((select id from products where slug='gentle-cleansing-shampoo'), '500ml', 100, 'CLP-GCS-500'),
  ((select id from products where slug='daily-wellness-supplement'), '60 chews',  100, 'CLP-DWS-60'),
  ((select id from products where slug='daily-wellness-supplement'), '120 chews', 100, 'CLP-DWS-120'),
  ((select id from products where slug='lavender-calm-perfume'), '50ml',     100, 'CLP-LCP-50'),
  ((select id from products where slug='lavender-calm-perfume'), '100ml',    100, 'CLP-LCP-100');

-- ============================================================
-- Articles
-- ============================================================
insert into public.articles (slug, title, category, read_time, tone, featured, excerpt, body, sections) values
  (
    'why-does-my-dog-have-bad-breath',
    'Why Does My Dog Have Bad Breath?',
    'Health', '6 min', 'sky', true,
    'Bad breath is more than an unpleasant smell — it''s often the first sign of a dental issue. Here''s what causes it and how to keep your dog''s mouth fresh and healthy.',
    ARRAY[
      'If your dog''s breath makes you turn away during cuddle time, you''re not alone — and it''s worth paying attention to. While a little "dog breath" is normal, persistent bad odour usually points to something happening beneath the surface.',
      'The most common culprit is plaque and tartar build-up. As bacteria accumulate along the gumline, they produce the sulphur compounds responsible for that unmistakable smell. Left unchecked, this can progress to gum disease, which affects the majority of dogs over the age of three.',
      'The good news: daily oral care makes a real difference. A gentle oral spray, dental chews and regular check-ups all help keep bacteria in check without the wrestling match of brushing.'
    ],
    '[{"h":"Common causes","p":"Plaque and tartar, gum inflammation, retained food particles, and occasionally diet or digestive issues can all contribute to bad breath."},{"h":"When to see a vet","p":"If bad breath is sudden, severe, or paired with drooling, loss of appetite or bleeding gums, book a check-up to rule out infection or other health concerns."},{"h":"A simple daily routine","p":"Introduce oral care gradually. A no-brush spray applied once or twice a day is the easiest place to start and supports fresher breath within weeks."}]'::jsonb
  ),
  (
    'how-to-remove-tear-stains',
    'How to Remove Tear Stains from Dogs and Cats',
    'Care Tips', '5 min', 'lavender', false,
    'Those reddish-brown marks below the eyes are common in light-coated breeds. Learn what causes them and the gentle way to keep faces clean and bright.',
    ARRAY[
      'Tear stains — the reddish-brown streaks beneath your pet''s eyes — are caused by porphyrins, pigments found in tears. They''re especially visible on light-coloured coats and, while usually harmless, can be a cosmetic frustration for many pet parents.',
      'The key to managing them is gentle, consistent cleaning. Wiping the area daily prevents build-up and keeps the fur from discolouring further.'
    ],
    '[{"h":"Why they happen","p":"Excess tearing, shallow eye sockets, blocked tear ducts and diet can all play a role. Some breeds are simply more prone to staining than others."},{"h":"The gentle method","p":"Use a dedicated, tear-free remover on a soft cotton pad. Wipe outward from the inner corner once a day, never letting product enter the eye itself."}]'::jsonb
  ),
  (
    'how-often-bathe-dog-cat',
    'How Often Should You Bathe Your Dog or Cat?',
    'Grooming', '4 min', 'sage', false,
    E'Over-bathing can strip natural oils, while under-bathing leaves coats dull. Here\u2019s how to find the right rhythm for your pet.',
    ARRAY[
      E'Bathing frequency depends on your pet\u2019s coat type, lifestyle and skin health. Most dogs do well with a bath every four to six weeks, while many cats groom themselves and rarely need one at all.',
      'Between baths, a no-rinse deodorising spray keeps coats fresh without stripping the natural oils that protect the skin.'
    ],
    '[{"h":"Signs it''s bath time","p":"A noticeable smell, visible dirt, or a greasy coat are good cues. Active, outdoorsy dogs will need more frequent baths than homebodies."},{"h":"Don''t overdo it","p":"Too-frequent bathing can dry out skin and cause irritation. When in doubt, reach for a waterless freshening spray instead."}]'::jsonb
  ),
  (
    'understanding-skin-and-coat-health',
    E'Understanding Your Pet\u2019s Skin and Coat Health',
    'Health', '6 min', 'pink', false,
    E'A shiny coat starts with healthy skin. Discover the everyday factors that influence your pet\u2019s skin and how to support it from the outside in.',
    ARRAY[
      E'Your pet\u2019s coat is a window into their overall health. A glossy, soft coat usually signals good nutrition and well-balanced skin, while dryness, flaking or excessive shedding can hint at something that needs attention.',
      'Supporting skin health is a combination of the right diet, gentle grooming products and, where needed, targeted topical care.'
    ],
    '[{"h":"Feed the coat","p":"Omega-3 and omega-6 fatty acids, found in fish oil and quality supplements, are the building blocks of a healthy, shiny coat."},{"h":"Be gentle outside","p":"Choose pH-balanced, fragrance-free products for sensitive skin, and soothe dry patches with a calming serum rather than harsh washes."}]'::jsonb
  ),
  (
    'natural-ingredients-that-matter',
    'Natural Ingredients That Actually Matter',
    'Ingredients', '5 min', 'cream', false,
    E'\u201cNatural\u201d is everywhere on pet labels \u2014 but which ingredients earn their place? A look at the gentle, effective ones we love.',
    ARRAY[
      E'Not all \u201cnatural\u201d claims are equal. The ingredients that genuinely benefit your pet are the ones with a track record of being both gentle and effective.',
      E'At ClariPet we lean on a short list of trusted botanicals \u2014 aloe vera, oat, chamomile and green tea among them \u2014 chosen for what they do, not for how they look on a label.'
    ],
    '[{"h":"Soothers","p":"Colloidal oatmeal and aloe vera calm irritation and lock in moisture, making them ideal for sensitive skin."},{"h":"Fresheners","p":"Green tea and peppermint naturally neutralise odours and support oral freshness without harsh chemicals."}]'::jsonb
  ),
  (
    'making-grooming-stress-free',
    'Making Grooming a Stress-Free Ritual',
    'Lifestyle', '4 min', 'sky', false,
    E'Grooming doesn\u2019t have to be a battle. Small changes can turn it into a calm, bonding part of your day.',
    ARRAY[
      E'For many pets, grooming feels stressful simply because it\u2019s unfamiliar. The secret is to make it predictable, gentle and positive.',
      'Short, frequent sessions paired with calm products and plenty of praise transform grooming from a chore into a moment of connection.'
    ],
    '[{"h":"Go slow","p":"Start with short sessions and build up. Let your pet sniff and explore products before you use them."},{"h":"Set the mood","p":"A calming scent and a quiet space help anxious pets relax. Reward calm behaviour to build positive associations."}]'::jsonb
  )
on conflict (slug) do nothing;
