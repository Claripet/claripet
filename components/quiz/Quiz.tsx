"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { PRODUCTS, getProduct } from "@/data/products";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/PageHead";
import { Mascot } from "@/components/Mascot";
import { ProductCard } from "@/components/ProductCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { useCart } from "@/context/CartContext";

interface QuizOption {
  value: string;
  label: string;
}
interface QuizStep {
  key: string;
  q: string;
  options: QuizOption[];
}

const QUIZ_STEPS: QuizStep[] = [
  {
    key: "pet",
    q: "Sedang belanja untuk siapa hari ini?",
    options: [
      { value: "dog", label: "Anjing" },
      { value: "cat", label: "Kucing" },
    ],
  },
  {
    key: "concern",
    q: "Apa perhatian utama Anda saat ini?",
    options: [
      { value: "bad-breath", label: "Bau mulut" },
      { value: "tear-stains", label: "Noda air mata" },
      { value: "odor-freshness", label: "Bau badan & kesegaran" },
      { value: "general", label: "Perawatan umum" },
    ],
  },
  {
    key: "skin",
    q: "Bagaimana kondisi kulit & bulunya?",
    options: [
      { value: "sensitive", label: "Sensitif / gatal" },
      { value: "normal", label: "Normal & sehat" },
      { value: "dull", label: "Kusam atau kering" },
      { value: "unsure", label: "Tidak yakin" },
    ],
  },
  {
    key: "scent",
    q: "Ada preferensi aroma?",
    options: [
      { value: "baby-powder", label: "Baby powder lembut" },
      { value: "lavender", label: "Lavender yang menenangkan" },
      { value: "fresh", label: "Bersih & segar" },
      { value: "none", label: "Tanpa aroma" },
    ],
  },
];

function recommend(answers: Record<string, string>): Product[] {
  const scores = new Map<string, number>();
  PRODUCTS.forEach((p) => scores.set(p.slug, 0));

  const addScore = (slug: string, points: number) => {
    scores.set(slug, (scores.get(slug) || 0) + points);
  };

  const byCat = (cat: string, points: number) => {
    PRODUCTS.forEach((p) => {
      if (p.category === cat) addScore(p.slug, points);
    });
  };

  if (answers.concern === "bad-breath") {
    addScore("claripet-smell-clean", 10);
    byCat("hygiene-grooming", 2);
  } else if (answers.concern === "tear-stains") {
    addScore("claripet-tear-stain-remover", 10);
    byCat("hygiene-grooming", 5);
  } else if (answers.concern === "odor-freshness") {
    addScore("claripet-shu-shu-cat", 10);
    byCat("perfumes", 5);
  } else {
    byCat("skin-care", 2);
    byCat("perfumes", 2);
  }

  if (answers.skin === "sensitive") {
    addScore("claripet-skin-guard-silver-heal", 10);
    addScore("claripet-skin-guard-fungal-spray", 8);
  } else if (answers.skin === "dull") {
    addScore("claripet-skin-guard-fungal-spray", 5);
    addScore("claripet-baby-powder", 2);
  }

  if (answers.scent === "baby-powder") {
    addScore("claripet-baby-powder", 10);
  } else if (answers.scent === "lavender") {
    addScore("claripet-botanica-bloom", 10);
  } else if (answers.scent === "fresh") {
    addScore("claripet-shu-shu-cat", 10);
    addScore("claripet-smell-clean", 5);
  }

  PRODUCTS.forEach((p) => {
    if (p.bestSeller) addScore(p.slug, 1);
  });

  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .filter((entry) => entry[1] > 0)
    .map((entry) => getProduct(entry[0]))
    .filter((p): p is Product => Boolean(p));

  let list = sorted.length > 0 ? sorted : PRODUCTS.filter((p) => p.bestSeller);
  return list.slice(0, 3);
}

export function Quiz() {
  const cart = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const done = step >= QUIZ_STEPS.length;
  const progress = done ? 100 : (step / QUIZ_STEPS.length) * 100;

  const choose = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => setStep((s) => s + 1), 220);
  };
  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  if (done) {
    const recs = recommend(answers);
    const petLabel = answers.pet === "cat" ? "kucing" : "anjing";
    return (
      <main>
        <PageHead
          title="Rekomendasi Personal untuk Anda"
          subtitle={`Berdasarkan jawaban Anda, ini yang akan kami sarankan pertama kali untuk ${petLabel} Anda.`}
        />
        <div className="wrap quiz-shell" style={{ maxWidth: 980 }}>
          <Mascot tone="sky" speech="Pilihan bagus menanti!" sub="Rekomendasi ClariPet" />
          <div
            className="prod-grid"
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, marginTop: 28 }}
          >
            {recs.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
            <PrimaryButton
              onClick={() => {
                recs.forEach((p) => cart.add(p.slug));
                router.push("/cart");
              }}
            >
              Tambah Semua ke Keranjang
            </PrimaryButton>
            <SecondaryButton onClick={reset}>Ulangi Kuis</SecondaryButton>
          </div>
        </div>
      </main>
    );
  }

  const current = QUIZ_STEPS[step];
  return (
    <main>
      <div className="wrap quiz-shell">
        {/* The results branch above gets its <h1> from PageHead, but this is the
            state crawlers land on, and it had no <h1> at all. Visually hidden
            rather than rendered, matching components/home/Hero.tsx, so the
            page's existing layout is unchanged. */}
        <h1 className="sr-only">
          Quiz Rekomendasi Produk ClariPet untuk Anjing &amp; Kucing
        </h1>
        <div className="eyebrow center" style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <Icon name="sparkle" size={16} /> Temukan yang cocok
        </div>
        <div className="quiz-progress">
          <div className="bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="quiz-step-label">
          Langkah {step + 1} dari {QUIZ_STEPS.length}
        </div>
        <div className="quiz-card">
          <h2 className="h3">{current.q}</h2>
          <div className="quiz-options">
            {current.options.map((o) => (
              <button
                key={o.value}
                className={"quiz-opt" + (answers[current.key] === o.value ? " selected" : "")}
                onClick={() => choose(current.key, o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="quiz-nav">
            <button
              className="btn btn-ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.4 : 1 }}
            >
              Kembali
            </button>
            {answers[current.key] && (
              <PrimaryButton onClick={() => setStep((s) => s + 1)} icon="arrowRight">
                Lanjut
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
