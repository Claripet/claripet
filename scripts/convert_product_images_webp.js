/**
 * One-off: convert public/images/products/*.png to WebP (quality 85,
 * dimensions unchanged) and delete the PNG originals. Cuts the deploy
 * artifact from ~184MB to a fraction of that with no visible quality loss —
 * these are flat product photos, not graphics that need transparency.
 *
 * Run: node scripts/convert_product_images_webp.js
 *
 * IMPORTANT: data/products.ts (and any already-synced Supabase
 * `product_images.url` rows) reference these files by exact filename+extension.
 * This script only touches the files on disk — see data/products.ts for the
 * matching source-reference update and supabase/migrations/017_product_images_webp.sql
 * for the corresponding database update. Deploy the code change and run that
 * migration together; deploying one without the other 404s live product images.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "images", "products");

async function run() {
  const files = fs.readdirSync(DIR).filter((f) => /\.png$/i.test(f));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const src = path.join(DIR, file);
    const before = fs.statSync(src).size;
    const webpName = file.replace(/\.png$/i, ".webp");
    const dest = path.join(DIR, webpName);

    const buffer = await sharp(src).webp({ quality: 85 }).toBuffer();
    fs.writeFileSync(dest, buffer);
    const after = buffer.length;

    fs.unlinkSync(src);

    totalBefore += before;
    totalAfter += after;
    console.log(
      `${file} -> ${webpName}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
    );
  }

  console.log(
    `\nConverted ${files.length} files. Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB (${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}% smaller)`,
  );
}

run();
