/**
 * One-off: copy the supplied A-B asset pack into public/images with the
 * project's flat kebab-case naming, resizing oversized sources and running
 * lossless PNG compression.  Delete this script once the assets are in.
 *
 * Run: node scripts/prep_asset_pack.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = "C:/Users/USER/Downloads/A-B-20260728T051438Z-1-001/A-B";
const OUT = path.join(__dirname, "..", "public", "images");

// [source relative to SRC, destination relative to OUT, max width, opts]
// opts.trim strips the transparent margin around the subject. Without it the
// art renders visibly off-centre, because `object-fit` centres the whole
// canvas — padding included — rather than the artwork.
const JOBS = [
  // --- Page heroes / banners ---
  // A11 must NOT be written to hero-home.png — the home hero keeps its own
  // original photograph. It is reused here for the About story section instead.
  ["A11/Hero Home Page PNG.png", "about-story.png", 1400],
  // Full photograph, not the cut-out: the quiz CTA shows it as a framed image
  // in its own column, so the room background is wanted. No trim.
  ["A12/Quiz.png", "quiz-cta.png", 1500],
  // Page-banner photographs. Sourced from the pack's JPGs and emitted as JPEG:
  // these are photographs with no transparency, so PNG only inflated them
  // (474-780KB each) for no benefit.
  ["A4/Pet Care Journal JPG.jpg", "journal-hero.jpg", 1800, { jpeg: true }],
  ["A3/About Us JPG.jpg", "about-us.jpg", 1500, { jpeg: true }],
  ["A7/Let_s Talk JPG.jpg", "contact-hero.jpg", 1500, { jpeg: true }],
  ["A6/Curious About Claripet JPG.jpg", "faq-hero.jpg", 1500, { jpeg: true }],

  ["A8/Message Us PNG.png", "contact-message-us.png", 1200],
  ["A1/Shop Banner Transparent.png", "shop-hero.png", 2000, { trim: true }],
  // Cut-out, not the photo: the shop CTA sits it directly on the tinted panel.
  // Trimmed, because the animals occupy only ~16% of a 5.4:1 canvas — keeping
  // that padding makes them impossible to size predictably in CSS.
  ["A10/Helping You Helping Them Transparent.png", "shop-cta-banner.png", 2000, { trim: true }],

  // "Made in Indonesia" ships as a finished banner with the copy baked in, so
  // it needs two crops: the 6.7:1 strip is unreadable on a phone.
  ["A9/Made in Indonesia 2400x360.png", "made-in-indonesia-wide.png", 2400],
  ["A9/Made In Indonesia, Loved Everywhere.png", "made-in-indonesia-narrow.png", 1600],

  // --- Collection page banners, one per category slug ---
  // 2400x560 with the animals in the right ~40% and the left half transparent,
  // i.e. drawn to sit behind left-aligned copy. Deliberately NOT trimmed: the
  // empty left half is what positions the art correctly at full bleed.
  // Only the four categories with a matching banner in the pack. Oral and Tear
  // Stain art is unused: the site has no such category. Behavior & Training and
  // Home & Environment have no banner art and fall back to their card.
  ["A2/Product Section Banner Transparent PNG/Perfume.png", "categories/perfumes-banner.png", 2000],
  ["A2/Product Section Banner Transparent PNG/Grooming.png", "categories/grooming-banner.png", 2000],
  ["A2/Product Section Banner Transparent PNG/Skin Care.png", "categories/skin-care-banner.png", 2000],
  ["A2/Product Section Banner Transparent PNG/Beauty.png", "categories/supplements-banner.png", 2000],

  // --- Decorative grain tile (already 512px, keep as-is) ---
  ["B/B/Claripet_Icons/PNG/claripet-grain-seamless-512.png", "texture/grain.png", 512],
];


// Note: the A2 "Normal PNG" photographs are intentionally unused. They would
// have to replace the six category grid cards, which are a matching illustrated
// set with copy baked into the artwork — swapping four of six for photographs
// would break the set.

async function main() {
  let totalIn = 0;
  let totalOut = 0;

  for (const [rel, dest, maxWidth, opts = {}] of JOBS) {
    const from = path.join(SRC, rel);
    const to = path.join(OUT, dest);

    if (!fs.existsSync(from)) {
      console.error(`MISSING SOURCE: ${rel}`);
      process.exitCode = 1;
      continue;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });

    const inBytes = fs.statSync(from).size;
    let pipeline = sharp(from);
    if (opts.trim) pipeline = pipeline.trim();
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    const buf = await (opts.jpeg
      ? pipeline.jpeg({ quality: 86, mozjpeg: true })
      // Lossless: next/image re-encodes to WebP/AVIF at request time, so the
      // origin PNG only needs to be small, not lossy.
      : pipeline.png({ compressionLevel: 9, effort: 10 })
    ).toBuffer();
    fs.writeFileSync(to, buf);

    const meta = await sharp(buf).metadata();
    totalIn += inBytes;
    totalOut += buf.length;
    console.log(
      `${dest.padEnd(42)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)}  ` +
        `${(inBytes / 1024).toFixed(0).padStart(5)}KB -> ${(buf.length / 1024).toFixed(0).padStart(5)}KB`,
    );
  }


  console.log(
    `\nTotal: ${(totalIn / 1024 / 1024).toFixed(1)}MB -> ${(totalOut / 1024 / 1024).toFixed(1)}MB`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
