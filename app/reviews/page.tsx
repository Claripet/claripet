import type { Metadata } from "next";
import { ReviewsView } from "@/components/reviews/ReviewsView";
import { getReviews } from "@/lib/data";

// Prerendered at build, refreshed in the background every 5 minutes so reviews
// added in /admin/reviews appear without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Real stories, ratings, and before & after results from ClariPet pet parents.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "ClariPet Reviews & Ratings",
    description:
      "Real stories, ratings, and before & after results from ClariPet pet parents.",
    url: "/reviews",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClariPet Reviews & Ratings",
    description:
      "Real stories, ratings, and before & after results from ClariPet pet parents.",
  },
};

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return <ReviewsView reviews={reviews} />;
}
