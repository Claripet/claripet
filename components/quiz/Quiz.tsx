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
  icon: string;
  tone: string;
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
      { value: "dog", label: "Anjing", icon: "dog", tone: "sky" },
      { value: "cat", label: "Kucing", icon: "cat", tone: "pink" },
    ],
  },
  {
    key: "concern",
    q: "Apa perhatian utama Anda saat ini?",
    options: [
      { value: "bad-breath", label: "Bau mulut", icon: "droplet", tone: "sky" },
      { value: "tear-stains", label: "Noda air mata", icon: "sparkle", tone: "lavender" },
      { value: "odor-freshness", label: "Bau badan & kesegaran", icon: "spray", tone: "sage" },
      { value: "general", label: "Perawatan umum", icon: "heart", tone: "pink" },
    ],
  },
  {
    key: "skin",
    q: "Bagaimana kondisi kulit & bulunya?",
    options: [
      { value: "sensitive", label: "Sensitif / gatal", icon: "leaf", tone: "sage" },
      { value: "normal", label: "Normal & sehat", icon: "smile", tone: "cream" },
      { value: "dull", label: "Kusam atau kering", icon: "droplet", tone: "sky" },
      { value: "unsure", label: "Tidak yakin", icon: "check", tone: "lavender" },
    ],
  },
  {
    key: "scent",
    q: "Ada preferensi aroma?",
    options: [
      { value: "baby-powder", label: "Baby powder lembut", icon: "sparkle", tone: "pink" },
      { value: "lavender", label: "Lavender yang menenangkan", icon: "leaf", tone: "lavender" },
      { value: "fresh", label: "Bersih & segar", icon: "droplet", tone: "sky" },
      { value: "none", label: "Tanpa aroma", icon: "check", tone: "sage" },
    ],
  },
];

const HYGIENE_CONCERNS = new Set(["bad-breath", "tear-stains", "odor-freshness"]);

function recommend(answers: Record<string, string>): Product[] {
  const recs = new Set<string>();
  const byCat = (c: string) => PRODUCTS.filter((p) => p.category === c).forEach((p) => recs.add(p.slug));

  if (HYGIENE_CONCERNS.has(answers.concern)) byCat("hygiene-grooming");
  else {
    recs.add("claripet-skin-guard-silver-heal");
    recs.add("claripet-shu-shu-cat");
  }

  if (answers.skin === "sensitive" || answers.skin === "dull") recs.add("claripet-skin-guard-fungal-spray");

  if (answers.scent === "baby-powder") recs.add("claripet-baby-powder");
  else if (answers.scent === "lavender") recs.add("claripet-botanica-bloom");
  else if (answers.scent === "fresh") recs.add("claripet-shu-shu-cat");

  let list = Array.from(recs)
    .map((s) => getProduct(s))
    .filter((p): p is Product => Boolean(p));
  if (list.length === 0) list = PRODUCTS.filter((p) => p.bestSeller);
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
                <span className="qic" style={{ background: `var(--${o.tone})`, color: "var(--navy)" }}>
                  <Icon name={o.icon} size={22} />
                </span>
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
