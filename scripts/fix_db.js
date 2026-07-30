const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Products currently linked to 'perfume' should link to 'perfumes'
  const { data: perfumeCat } = await supabase.from('categories').select('id').eq('slug', 'perfume').single();
  const { data: perfumesCat } = await supabase.from('categories').select('id').eq('slug', 'perfumes').single();
  
  if (perfumeCat && perfumesCat) {
      await supabase.from('products').update({ category_id: perfumesCat.id }).eq('category_id', perfumeCat.id);
      await supabase.from('categories').delete().eq('id', perfumeCat.id);
      console.log("Merged 'perfume' into 'perfumes'");
  }

  // Delete the old dummy categories that have no products
  const toDelete = ['oral-care', 'tear-stain-care', 'supplements'];
  const { data: oldCats } = await supabase.from('categories').select('id').in('slug', toDelete);
  if (oldCats && oldCats.length > 0) {
      const ids = oldCats.map(c => c.id);
      await supabase.from('categories').delete().in('id', ids);
      console.log("Deleted unused dummy categories", toDelete);
  }
}
run();
