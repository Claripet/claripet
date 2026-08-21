import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { jsonLdScript } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
// Async server component (reads reviews from Supabase), so it is imported
// statically rather than through next/dynamic.
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { SITE_URL } from "@/lib/site";
import { SAME_AS } from "@/lib/social";

// Prerendered at build, refreshed in the background every 5 minutes — the
// Pet Parent Favorites shelf reads best sellers from the catalogue.
export const revalidate = 300;

const ShopByCategory = dynamic(() =>
  import("@/components/home/ShopByCategory").then((mod) => mod.ShopByCategory),
);
const PetParentFavorites = dynamic(() =>
  import("@/components/home/PetParentFavorites").then((mod) => mod.PetParentFavorites),
);
const WhyChoose = dynamic(() =>
  import("@/components/home/WhyChoose").then((mod) => mod.WhyChoose),
);
const QuizCTA = dynamic(() =>
  import("@/components/home/QuizCTA").then((mod) => mod.QuizCTA),
);

export const metadata: Metadata = {
  // Was pinned to the bare app name ("ClariPet") to match the Google Cloud
  // console App name 1:1 while OAuth brand verification was under review. That
  // review has been approved, so the keyword title is restored as the original
  // note intended — this is the highest-value title tag on the site, and the
  // brand competes for the string "claripet" against an unrelated claripet.com.
  //
  // `applicationName` in app/layout.tsx still renders <meta
  // name="application-name" content="ClariPet">, so the exact-match brand
  // signal OAuth review looked for survives independently of this title.
  title: "ClariPet | Premium Pet Care & Grooming Supplies Indonesia",
  description:
    "Produk perawatan hewan peliharaan premium untuk anjing & kucing: parfum, shampoo, vitamin, dan perawatan kulit & bulu. Aman, efektif, dibuat di Indonesia.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ClariPet | Premium Pet Care & Grooming Supplies Indonesia",
    description:
      "Produk perawatan hewan peliharaan premium untuk anjing & kucing: parfum, shampoo, vitamin, dan perawatan kulit & bulu. Aman, efektif, dibuat di Indonesia.",
    url: "/",
    type: "website",
    // Next replaces the parent openGraph object wholesale rather than merging
    // field by field, so omitting this dropped og:site_name from the home page
    // — the one page Google's brand review actually scans.
    siteName: "ClariPet",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ClariPet",
  url: SITE_URL,
  // A logo lets Google associate the brand mark with the entity; without it the
  // Organization node has nothing to render in a knowledge panel.
  logo: `${SITE_URL}/images/brand/logo-dark.png`,
  description:
    "Premium, pet-safe care made with love in Indonesia. Gentle formulas for happy, healthy pets.",
  // Ties this domain to the profiles that already rank for "claripet". Without
  // it Google has no stated relationship between the storefront and the
  // Instagram/Shopee/Tokopedia pages outranking it for the brand's own name.
  sameAs: SAME_AS,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ClariPet",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }}
      />
      <main>
        <Hero />
        <ShopByCategory />
        <PetParentFavorites />
        <WhyChoose />
        <CustomerReviews />
        <QuizCTA />
      </main>
    </>
  );
}

