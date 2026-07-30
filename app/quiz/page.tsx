import type { Metadata } from "next";
import { Quiz } from "@/components/quiz/Quiz";

export const metadata: Metadata = {
  title: "Product Finder Quiz",
  description:
    "Answer a few quick questions and we'll match your pet with the right ClariPet care products — grooming, oral care, skin care, and more.",
  alternates: { canonical: "/quiz" },
  openGraph: {
    title: "Find the Right Product for Your Pet — ClariPet Quiz",
    description:
      "Answer a few quick questions and we'll match your pet with the right ClariPet care products.",
    url: "/quiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Finder Quiz",
    description:
      "Answer a few quick questions and we'll match your pet with the right ClariPet care products.",
  },
};

export default function QuizPage() {
  return <Quiz />;
}
