import type { Metadata } from "next";
import { ReviewsView } from "@/components/reviews/ReviewsView";

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

export default function ReviewsPage() {
  return <ReviewsView />;
}
