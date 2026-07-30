import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Placeholder } from "@/components/Placeholder";
import type { Article, Tone } from "@/lib/types";

const TONE_BADGE: Record<Tone, { bg: string; text: string }> = {
  sky: { bg: "bg-[#AECBEB]/25", text: "text-navy" },
  sage: { bg: "bg-[#C5D6C8]/30", text: "text-navy" },
  pink: { bg: "bg-[#F5CDD3]/30", text: "text-navy" },
  lavender: { bg: "bg-[#E0CBE8]/30", text: "text-navy" },
  cream: { bg: "bg-[#F5DBA8]/35", text: "text-navy" },
  peach: { bg: "bg-[#F7D2BE]/35", text: "text-navy" },
};

export function ArticleCard({
  article,
  compact = false,
}: {
  article: Article;
  compact?: boolean;
}) {
  const badge = TONE_BADGE[article.tone] ?? TONE_BADGE.sky;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/journal/${article.slug}`}
        className="block rounded-xl overflow-hidden mb-3 bg-mist transition-transform duration-300 group-hover:-translate-y-1"
        aria-label={article.title}
      >
        {article.image ? (
          <span className="relative block" style={{ aspectRatio: "4 / 3" }}>
            <Image
              src={article.image}
              alt=""
              fill
              sizes="(max-width: 768px) 90vw, 320px"
              style={{ objectFit: "cover" }}
            />
          </span>
        ) : (
          <Placeholder
            tone={article.tone}
            paw={false}
            label=""
            className="!w-full"
            style={{ aspectRatio: "4 / 3", height: "auto" }}
          />
        )}
      </Link>

      <span
        className={`inline-flex w-fit items-center text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full mb-2 ${badge.bg} ${badge.text}`}
      >
        {article.category}
      </span>

      <h3 className="font-bold text-navy leading-snug mb-1.5 text-[15px] line-clamp-2">
        <Link href={`/journal/${article.slug}`} className="hover:underline">
          {article.title}
        </Link>
      </h3>

      {!compact && article.excerpt && (
        <p className="text-[13px] text-[#5A6072] leading-snug line-clamp-2 mb-2">
          {article.excerpt}
        </p>
      )}

      <div className="mt-auto flex items-center gap-1.5 text-[12px] text-[#8A90A0]">
        <Icon name="clock" size={13} />
        <span>{article.readTime} read</span>
      </div>
    </article>
  );
}