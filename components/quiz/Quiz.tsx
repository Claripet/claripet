"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { getProduct } from "@/data/products";
import {
  COMING_SOON,
  INTRO,
  TOO_YOUNG,
  buildSteps,
  isAnswered,
  recommend,
  resultHeading,
  type Answers,
  type AnswerKey,
  type Ref as ProductRef,
  type Step,
} from "@/data/quiz";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/PageHead";
import { StarRating } from "@/components/ui/StarRating";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { useCart } from "@/context/CartContext";
import { useFlyToCart } from "@/context/FlyToCartContext";

/** Milliseconds a single-select answer stays visible before advancing. */
const ADVANCE_DELAY = 220;

/* ------------------------------------------------------------- helpers --- */

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

/**
 * Recommendation card. A coming-soon ref has no catalogue entry, so it renders
 * as a muted card with a "Segera Hadir" badge and no purchase button.
 */
function RecCard({
  refItem,
  variant,
}: {
  refItem: ProductRef;
  variant: "primary" | "companion";
}) {
  const cart = useCart();
  const { flyToCart } = useFlyToCart();
  const addRef = useRef<HTMLDivElement>(null);

  const product: Product | undefined = refItem.comingSoon ? undefined : getProduct(refItem.slug);
  const placeholder = refItem.comingSoon ? COMING_SOON[refItem.slug] : undefined;

  // A ref that points at neither a real product nor a placeholder is a data
  // bug, not something to render an empty card for.
  if (!product && !placeholder) return null;

  const name = product?.name ?? placeholder!.name;
  const subtitle = product?.subtitle ?? placeholder!.subtitle;
  const image = product?.images?.[0];

  const handleAdd = () => {
    if (!product) return;
    if (addRef.current) flyToCart(addRef.current);
    cart.add(product.slug, refItem.size, 1, product);
  };

  return (
    <article className={`quiz-rec quiz-rec-${variant}`}>
      <div className="quiz-rec-media">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? name}
            fill
            sizes={variant === "primary" ? "(max-width: 720px) 90vw, 320px" : "(max-width: 720px) 45vw, 220px"}
            className="quiz-rec-img"
          />
        ) : (
          <span className="quiz-rec-empty">
            <Icon name="image" size={28} className="muted" />
          </span>
        )}
        {refItem.comingSoon && <span className="quiz-rec-soon">Segera Hadir</span>}
      </div>

      <div className="quiz-rec-body">
        <div className="quiz-rec-role">
          {variant === "primary" ? "Rekomendasi Utama" : "Produk Pendamping"}
        </div>
        {product ? (
          <Link className="quiz-rec-name" href={`/product/${product.slug}`}>
            {name}
          </Link>
        ) : (
          <span className="quiz-rec-name">{name}</span>
        )}
        <p className="quiz-rec-sub">{refItem.why ?? subtitle}</p>

        {product ? (
          <>
            <div className="quiz-rec-meta">
              <span className="quiz-rec-price">{formatPrice(product.price)}</span>
              {refItem.size && <span className="quiz-rec-size">{refItem.size}</span>}
              <StarRating rating={product.rating} reviews={product.reviews} />
            </div>
            <div className="quiz-rec-actions" ref={addRef}>
              <PrimaryButton size="sm" onClick={handleAdd} aria-label={`Tambah ${name} ke keranjang`}>
                Tambah ke Keranjang
              </PrimaryButton>
              <Link className="btn btn-secondary btn-sm" href={`/product/${product.slug}`}>
                Lihat Produk
              </Link>
            </div>
          </>
        ) : (
          <p className="quiz-rec-soon-note">
            Produk ini belum tersedia untuk dibeli. Nantikan peluncurannya, ya!
          </p>
        )}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- quiz --- */

export function Quiz() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvance = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);
  useEffect(() => clearAdvance, [clearAdvance]);

  const steps = useMemo(() => buildSteps(answers), [answers]);
  const tooYoung = answers.age === "under2m";

  // Answering an earlier question can shorten the branch under it, so the index
  // has to be pulled back inside the new list rather than pointing past its end.
  const safeIndex = Math.min(index, Math.max(steps.length - 1, 0));
  const current: Step | undefined = steps[safeIndex];

  const reset = () => {
    clearAdvance();
    setAnswers({});
    setIndex(0);
    setDone(false);
    setStarted(false);
  };

  const setAnswer = (key: AnswerKey, value: unknown) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const goNext = useCallback(() => {
    clearAdvance();
    setIndex((i) => i + 1);
  }, [clearAdvance]);

  // The optional pet-name field is always the terminal step, so it — not the
  // index — is what decides whether the CTA finishes the quiz. Using the index
  // would mislabel the age question during the brief window before a branch
  // opens up beneath it.
  const isLast = current?.kind === "text";

  const chooseSingle = (step: Step, value: string) => {
    clearAdvance();
    setAnswer(step.key, value);
    // The last step is never a single-select (the name field is), so advancing
    // here can only ever move onto another question.
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      setIndex((i) => i + 1);
    }, ADVANCE_DELAY);
  };

  const toggleMulti = (step: Extract<Step, { kind: "multi" }>, value: string) => {
    const selected = asArray(answers[step.key]);
    const option = step.options.find((o) => o.value === value);

    if (selected.includes(value)) {
      setAnswer(step.key, selected.filter((v) => v !== value));
      return;
    }
    if (option?.exclusive) {
      setAnswer(step.key, [value]);
      return;
    }
    // Picking a normal option drops any exclusive one ("Semuanya") first.
    const exclusives = step.options.filter((o) => o.exclusive).map((o) => o.value);
    const kept = selected.filter((v) => !exclusives.includes(v));
    if (kept.length >= step.max) return;
    setAnswer(step.key, [...kept, value]);
  };

  /* ------------------------------------------------------------ intro --- */

  if (!started) {
    return (
      <main>
        <div className="wrap quiz-shell">
          <h1 className="quiz-intro-title">{INTRO.title}</h1>
          <div className="quiz-card quiz-intro">
            <div className="eyebrow center" style={{ justifyContent: "center" }}>
              <Icon name="sparkle" size={16} /> Temukan yang cocok
            </div>
            <p className="quiz-intro-body">{INTRO.body}</p>
            <div className="quiz-intro-perks">
              {INTRO.perks.map((perk, i) => (
                <span key={perk}>
                  {i > 0 && <span className="quiz-intro-dot">•</span>}
                  <Icon name="shield" size={14} /> {perk}
                </span>
              ))}
            </div>
            <PrimaryButton size="lg" icon="arrowRight" onClick={() => setStarted(true)}>
              {INTRO.cta}
            </PrimaryButton>
          </div>
        </div>
      </main>
    );
  }

  /* --------------------------------------------------- under 2 months --- */

  // Deliberately renders no product, price or cart control of any kind.
  if (tooYoung) {
    return (
      <main>
        <div className="wrap quiz-shell">
          <div className="quiz-card quiz-stop">
            <span className="quiz-stop-icon">
              <Icon name="shield" size={28} />
            </span>
            <h2 className="h3">{TOO_YOUNG.title}</h2>
            {TOO_YOUNG.body.map((p) => (
              <p key={p} className="quiz-stop-body">
                {p}
              </p>
            ))}
            <PrimaryButton onClick={reset}>{TOO_YOUNG.cta}</PrimaryButton>
          </div>
        </div>
      </main>
    );
  }

  /* ----------------------------------------------------------- result --- */

  if (done || !current) {
    const { primary, companions, disclaimers } = recommend(answers);
    const heading = resultHeading(answers.petName);
    return (
      <main>
        <PageHead title={heading.title} subtitle={heading.subtitle} />
        <div className="wrap quiz-shell quiz-result-shell">
          {primary ? (
            <>
              <RecCard refItem={primary} variant="primary" />
              {companions.length > 0 && (
                <div className="quiz-rec-companions">
                  {companions.map((ref) => (
                    <RecCard key={`${ref.slug}|${ref.size ?? ""}`} refItem={ref} variant="companion" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="quiz-stop-body center">
              Kami belum bisa menyusun rekomendasi dari jawaban ini. Coba ulangi kuisnya, ya.
            </p>
          )}

          {disclaimers.map((text) => (
            <div key={text} className="quiz-disclaimer" role="note">
              <Icon name="shield" size={18} />
              <p>{text}</p>
            </div>
          ))}

          <div className="quiz-result-nav">
            <SecondaryButton onClick={reset}>Ulangi Kuis</SecondaryButton>
          </div>
        </div>
      </main>
    );
  }

  /* --------------------------------------------------------- question --- */

  const answered = isAnswered(current, answers);
  const progress = ((safeIndex + 1) / steps.length) * 100;

  return (
    <main>
      <div className="wrap quiz-shell">
        {/* Crawlers land on this state, so it carries the page's only h1.
            Visually hidden rather than rendered, matching components/home/Hero.tsx. */}
        <h1 className="sr-only">Quiz Rekomendasi Produk ClariPet untuk Anjing &amp; Kucing</h1>

        <div className="quiz-progress">
          <div className="bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="quiz-step-label">
          Langkah {safeIndex + 1} dari {steps.length}
        </div>

        <div className="quiz-card">
          <h2 className="h3">{current.q}</h2>
          {current.hint && <p className="quiz-hint">{current.hint}</p>}

          {current.kind === "single" && (
            <div className="quiz-options" role="radiogroup" aria-label={current.q}>
              {current.options.map((o) => {
                const selected = answers[current.key] === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={"quiz-opt" + (selected ? " selected" : "")}
                    onClick={() => chooseSingle(current, o.value)}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {current.kind === "multi" && (
            <div className="quiz-options" role="group" aria-label={current.q}>
              {current.options.map((o) => {
                const selected = asArray(answers[current.key]).includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={selected}
                    className={"quiz-opt" + (selected ? " selected" : "")}
                    onClick={() => toggleMulti(current, o.value)}
                  >
                    <span className="quiz-opt-check" aria-hidden>
                      {selected && <Icon name="check" size={14} />}
                    </span>
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {current.kind === "text" && (
            <div className="quiz-text-field">
              <input
                type="text"
                className="quiz-input"
                placeholder={current.placeholder}
                maxLength={40}
                autoComplete="off"
                value={(answers[current.key] as string) ?? ""}
                onChange={(e) => setAnswer(current.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setDone(true);
                }}
              />
              <button type="button" className="btn btn-ghost" onClick={() => setDone(true)}>
                {current.skipLabel}
              </button>
            </div>
          )}

          <div className="quiz-nav">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                clearAdvance();
                setIndex((i) => Math.max(0, Math.min(i, steps.length - 1) - 1));
              }}
              disabled={safeIndex === 0}
              style={{ opacity: safeIndex === 0 ? 0.4 : 1 }}
            >
              Kembali
            </button>
            {answered && (
              <PrimaryButton
                icon="arrowRight"
                onClick={() => (isLast ? setDone(true) : goNext())}
              >
                {isLast ? "Lihat Rekomendasi" : "Lanjut"}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
