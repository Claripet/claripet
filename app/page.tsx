import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Hero";
import { SITE_URL } from "@/lib/site";

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
  // Deliberately the bare app name, matching the Google Cloud console App name
  // 1:1 for OAuth brand verification. Restore the keyword title
  // ("ClariPet | Premium Pet Care & Grooming Supplies Indonesia") once the app
  // is approved — this costs home page SEO for as long as it stands.
  title: "ClariPet",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <main>
        <Hero />
        <ShopByCategory />
        <PetParentFavorites />
        <WhyChoose />
        <QuizCTA />
      </main>
    </>
  );
}

