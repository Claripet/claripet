const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function sync() {
  console.log("Fetching categories...");
  const { data: cats } = await supabase.from('categories').select('*');
  const catMap = {};
  for (const c of cats) catMap[c.slug] = c.id;

  console.log("Deleting old dummy products...");
  // Clear the products first (cascades sizes and images if FK are set up, but let's be safe and clear them)
  const { data: oldProds } = await supabase.from('products').select('id');
  if (oldProds && oldProds.length > 0) {
      const ids = oldProds.map(p => p.id);
      await supabase.from('product_images').delete().in('product_id', ids);
      await supabase.from('product_sizes').delete().in('product_id', ids);
      await supabase.from('products').delete().in('id', ids);
  }

  // We read the actual ts file using regex, because TS node execution is tricky in commonjs
  const file = fs.readFileSync('data/products.ts', 'utf-8');
  
  // A naive approach for a one-off script: extract via regex
  // Or simpler: compile it using tsc to js, then require it
}

sync();
