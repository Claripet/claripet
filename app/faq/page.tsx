import type { Metadata } from "next";
import { FaqView } from "@/components/faq/FaqView";
import { FAQS } from "@/data/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about ClariPet products, shipping, and care.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — ClariPet",
    description:
      "Frequently asked questions about ClariPet products, shipping, and care.",
    url: "/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ",
    description:
      "Frequently asked questions about ClariPet products, shipping, and care.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqView />
    </>
  );
}
