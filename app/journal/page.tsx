import type { Metadata } from "next";
import { JournalView } from "@/components/journal/JournalView";
import { getAllArticles, getFeaturedArticle } from "@/lib/data";

// Prerendered at build, then refreshed in the background every 5 minutes so
// admin edits appear without a redeploy. Was `force-dynamic`, which made every
// visit a full SSR plus a Supabase round-trip inside the Worker.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Pet Care Journal",
  description:
    "Tips, guides, and insights for happy, healthy pets — from oral care and grooming to nutrition and skin health.",
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "Pet Care Journal — ClariPet",
    description:
      "Tips, guides, and insights for happy, healthy pets — from oral care and grooming to nutrition and skin health.",
    url: "/journal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pet Care Journal",
    description:
      "Tips, guides, and insights for happy, healthy pets — from oral care and grooming to nutrition and skin health.",
  },
};

export default async function JournalPage() {
  const [articles, featured] = await Promise.all([
    getAllArticles(),
    getFeaturedArticle(),
  ]);

  return <JournalView articles={articles} featured={featured} />;
}
