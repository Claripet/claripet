import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "../data/products";
import { CATEGORIES } from "../data/categories";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  console.log("Fetching categories...");
  let { data: cats } = await supabase.from("categories").select("*");
  const catMap: Record<string, string> = {};
  
  if (!cats || cats.length === 0) {
      console.log("Categories empty, inserting...");
      for (let i = 0; i < CATEGORIES.length; i++) {
         const c = CATEGORIES[i];
         const res = await supabase.from("categories").insert({
            slug: c.slug,
            name: c.name,
            tone: c.tone,
            icon: c.icon,
            blurb: c.blurb,
            sort_order: i
         }).select().single();
         catMap[c.slug] = res.data.id;
      }
  } else {
      for (const c of cats) catMap[c.slug] = c.id;
  }

  console.log("Clearing old products...");
  const { data: oldProds } = await supabase.from('products').select('id');
  if (oldProds && oldProds.length > 0) {
      const ids = oldProds.map((p: any) => p.id);
      await supabase.from('product_images').delete().in('product_id', ids);
      await supabase.from('product_sizes').delete().in('product_id', ids);
      await supabase.from('products').delete().in('id', ids);
  }

  console.log("Inserting new products...");
  for (const p of PRODUCTS) {
      // Find category ID
      // Some products might have a generic category string if we mapped them wrong, so handle gracefully
      // Actually all real products map to 'perfume', 'hygiene', 'grooming', 'beauty-coat-care', 'beauty-supplement', 'home-environment-care', 'behavior-training', 'skin-care'
      
      // We might need to ensure these slugs exist in the DB category list!
      let catId = catMap[p.category];
      if (!catId) {
          console.log(`Missing category '${p.category}' for product ${p.slug}, creating it...`);
          const res = await supabase.from("categories").insert({
              slug: p.category,
              name: p.categoryName || p.category,
              sort_order: 99
          }).select().single();
          catId = res.data.id;
          catMap[p.category] = catId;
      }

      const { data: insertedProduct, error } = await supabase.from('products').insert({
          slug: p.slug,
          name: p.name,
          subtitle: p.subtitle,
          category_id: catId,
          price: p.price,
          rating: p.rating,
          reviews_count: p.reviews,
          tone: p.tone,
          best_seller: p.bestSeller,
          short: p.short,
          benefits: p.benefits,
          features: p.features,
          mascot: p.mascot,
          ingredients: p.ingredients,
          howto: p.howto,
          status: 'active'
      }).select().single();
      
      if (error) {
          console.error(`Error inserting ${p.slug}:`, error.message);
          continue;
      }

      const pid = insertedProduct.id;

      // Insert sizes
      if (p.sizes && p.sizes.length > 0) {
          const sizesToInsert = p.sizes.map(s => ({
              product_id: pid,
              label: s,
              stock: 100 // dummy stock
          }));
          await supabase.from('product_sizes').insert(sizesToInsert);
      }

      // Insert images
      if (p.images && p.images.length > 0) {
          const imagesToInsert = p.images.map((img, i) => ({
              product_id: pid,
              url: img.url,
              alt: img.alt || p.name,
              sort_order: i
          }));
          await supabase.from('product_images').insert(imagesToInsert);
      }
  }

  console.log("Done syncing products to Supabase!");
}
run();
