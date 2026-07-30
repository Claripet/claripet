"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { Icon } from "@/components/icons";
import { Placeholder } from "@/components/Placeholder";
import { BannerDecor } from "@/components/BannerDecor";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { NewsletterSignup } from "@/components/journal/NewsletterSignup";

/* ---------------------------------------------------------------------------
 *  Category visual config — cycled pastel + lucide icon per category.
 *  Categories are derived from article data; this map only supplies styling.
 * ------------------------------------------------------------------------- */

const CATEGORY_STYLE: Record<
  string,
  { icon: string; bg: string; iconColor: string }
> = {
  "All Articles": { icon: "paw", bg: "bg-[#AECBEB]/30", iconColor: "text-navy" },
  Health: { icon: "heart", bg: "bg-[#F5CDD3]/30", iconColor: "text-navy" },
  "Care Tips": { icon: "lightbulb", bg: "bg-[#E0CBE8]/30", iconColor: "text-navy" },
  Grooming: { icon: "spray", bg: "bg-[#C5D6C8]/30", iconColor: "text-navy" },
  Ingredients: { icon: "leaf", bg: "bg-[#F5DBA8]/35", iconColor: "text-navy" },
  Lifestyle: { icon: "sparkle", bg: "bg-[#F7D2BE]/35", iconColor: "text-navy" },
};

const FALLBACK_STYLE = {
  icon: "sparkle",
  bg: "bg-[#AECBEB]/30",
  iconColor: "text-navy",
};

const PASTEL_CYCLE = [
  "bg-[#AECBEB]/30",
  "bg-[#C5D6C8]/30",
  "bg-[#F5CDD3]/30",
  "bg-[#E0CBE8]/30",
  "bg-[#F5DBA8]/35",
  "bg-[#F7D2BE]/35",
];

function styleForCategory(cat: string, index: number) {
  const known = CATEGORY_STYLE[cat];
  if (known) return known;
  return {
    icon: "sparkle",
    bg: PASTEL_CYCLE[index % PASTEL_CYCLE.length],
    iconColor: "text-navy",
  };
}

export function JournalView({
  articles,
  featured,
}: {
  articles: Article[];
  featured?: Article;
}) {
  const [filter, setFilter] = useState("All Articles");

  const categories = useMemo(() => {
    const seen = Array.from(
      new Set(articles.map((a) => a.category).filter(Boolean)),
    );
    return ["All Articles", ...seen];
  }, [articles]);

  const filtered = useMemo(
    () =>
      filter === "All Articles"
        ? articles
        : articles.filter((a) => a.category === filter),
    [articles, filter],
  );

  const showFeatured =
    !!featured && (filter === "All Articles" || featured.category === filter);

  const latest = useMemo(
    () =>
      filtered.filter(
        (a) => !(showFeatured && featured && a.slug === featured.slug),
      ),
    [filtered, featured, showFeatured],
  );

  // No "popular" / "views" field in data — use a visually distinct re-order
  // (reverse + rotate) so Popular looks different from Latest at a glance.
  const popular = useMemo(() => {
    const base = [...filtered];
    // rotate by half so it differs from the natural order
    const mid = Math.ceil(base.length / 2);
    return [...base.slice(mid), ...base.slice(0, mid)];
  }, [filtered]);

  return (
    <main>
      {/* ===== Hero banner ===== */}
      <section className="wrap" style={{ paddingTop: 28 }}>
        <div className="page-banner">
          <BannerDecor />
          <div className="page-banner-copy">
            <h1 className="h1" style={{ marginBottom: 0 }}>
              Pet Care Journal
              <Icon name="heart" size={22} className="inline-block ml-2 text-pink align-middle" strokeWidth={2} />
            </h1>
            <p className="lead">Tips, guides, and insights for happier, healthier pets.</p>
          </div>
          <div className="page-banner-media" style={{ aspectRatio: "1800 / 600" }}>
            <Image
              src="/images/journal-hero.jpg"
              alt="A puppy and a cat dozing over an open pet care journal"
              fill
              priority
              sizes="(max-width: 860px) 92vw, 560px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>


      {/* ===== Category filter strip — overlaps hero bottom ===== */}
      <section className="wrap" style={{ paddingTop: 0 }}>
        <div
          className="bg-offwhite rounded-2xl shadow-md relative z-10 p-6 md:p-8"
          style={{ marginTop: -32 }}
        >
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
            {categories.map((cat, i) => {
              const s = styleForCategory(cat, i);
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  aria-pressed={active}
                  className="group flex flex-col items-center gap-2 text-center focus:outline-none"
                >
                  <span
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                      active ? "ring-2 ring-navy/30" : ""
                    } ${s.bg}`}
                  >
                    <Icon
                      name={s.icon}
                      size={20}
                      className={s.iconColor}
                      strokeWidth={2}
                    />
                  </span>
                  <span
                    className={
                      "text-[13px] leading-tight " +
                      (active
                        ? "text-navy font-bold underline underline-offset-4 decoration-navy/60"
                        : "text-[#5A6072] font-medium")
                    }
                  >
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Featured Article ===== */}
      {showFeatured && featured && (
        <section className="wrap" style={{ paddingTop: 56 }}>
          <div className="flex items-center gap-2 mb-4 text-[#8A90A0]">
            <Icon name="star" size={16} className="text-cream" />
            <span className="text-[12px] font-semibold tracking-wide uppercase">
              Featured Article
            </span>
          </div>

          <article className="bg-white rounded-2xl shadow-sm border border-[#EFF3F8] overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <Link
                href={`/journal/${featured.slug}`}
                className="block bg-mist overflow-hidden"
                aria-label={featured.title}
              >
                {featured.image ? (
                  <span className="relative block h-full" style={{ aspectRatio: "4 / 3" }}>
                    <Image
                      src={featured.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                ) : (
                  <Placeholder
                    tone={featured.tone}
                    paw={false}
                    label={featured.title}
                    className="!w-full !h-full"
                    style={{ aspectRatio: "4 / 3", height: "auto" }}
                  />
                )}
              </Link>
              {/* Content */}
              <div className="p-8 md:p-10 flex flex-col justify-center gap-4">
                <span className="inline-flex w-fit items-center text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#C5D6C8]/35 text-navy">
                  {featured.category}
                </span>
                <h2
                  className="text-navy font-bold leading-tight"
                  style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)" }}
                >
                  {featured.title}
                </h2>
                <p className="text-[#5A6072] leading-relaxed line-clamp-2">
                  {featured.excerpt}
                </p>

                {/* Rover&apos;s Tip callout */}
                <div className="flex items-start gap-3 bg-mist rounded-xl p-4">
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Icon name="paw" size={18} className="text-navy" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-bold text-navy text-[13px] mb-0.5">
                      Rover&apos;s Tip
                    </p>
                    <p className="text-[13px] text-[#5A6072] leading-snug">
                      Consistency beats intensity — a short daily routine
                      outperforms a once-a-week deep clean.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/journal/${featured.slug}`}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-sky hover:bg-sky/80 text-white font-semibold px-7 py-3 transition-colors text-[0.95rem]"
                >
                  Read Article
                  <Icon name="arrowRight" size={18} />
                </Link>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ===== Latest Articles ===== */}
      <section className="wrap" style={{ paddingTop: 56 }}>
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-navy font-bold text-[15px] tracking-wide uppercase">
            Latest Articles
          </h2>
          <Link
            href="/journal"
            className="journal-more-link inline-flex items-center gap-1.5 text-navy font-semibold text-[14px] hover:underline"
          >
            View All Articles
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>

        {latest.length === 0 ? (
          <div className="text-center py-16 text-[#8A90A0]">
            No articles in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latest.slice(0, 4).map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </section>

      {/* ===== Popular Articles ===== */}
      <section className="wrap" style={{ paddingTop: 56 }}>
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-navy font-bold text-[15px] tracking-wide uppercase">
            Popular Articles
          </h2>
          <Link
            href="/journal"
            className="journal-more-link inline-flex items-center gap-1.5 text-navy font-semibold text-[14px] hover:underline"
          >
            View All Articles
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>

        {popular.length === 0 ? (
          <div className="text-center py-16 text-[#8A90A0]">
            No articles in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.slice(0, 4).map((a) => (
              <ArticleCard key={a.slug} article={a} compact />
            ))}
          </div>
        )}
      </section>

      {/* ===== Newsletter signup band ===== */}
      <section className="wrap" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <NewsletterSignup />
      </section>
    </main>
  );
}