import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Hero";
import { SITE_URL } from "@/lib/site";

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
  title: "ClariPet | Premium Pet Care & Grooming Supplies Indonesia",
  description:
    "ClariPet menyediakan produk perawatan hewan peliharaan premium (anjing & kucing) yang aman dan efektif. Temukan parfum, vitamin, dan shampoo terbaik untuk sahabat bulu Anda.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ClariPet | Premium Pet Care & Grooming Supplies Indonesia",
    description:
      "ClariPet menyediakan produk perawatan hewan peliharaan premium (anjing & kucing) yang aman dan efektif. Temukan parfum, vitamin, dan shampoo terbaik untuk sahabat bulu Anda.",
    url: "/",
    type: "website",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ClariPet",
  url: SITE_URL,
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

