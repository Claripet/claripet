import type { Metadata } from "next";
import { Quiz } from "@/components/quiz/Quiz";

export const metadata: Metadata = {
  title: "Quiz Rekomendasi Produk",
  description:
    "Jawab beberapa pertanyaan singkat dan temukan produk ClariPet yang paling cocok untuk anjing atau kucing Anda — mandi, kulit, bulu dan nutrisi, mata, telinga, mulut, aroma, hingga perilaku dan bau di rumah.",
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
