import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/data";
import { ARTICLES } from "@/data/articles";
import { ArticleView } from "@/components/journal/ArticleView";
import { SITE_URL } from "@/lib/site";
import { metaDescription, jsonLdScript } from "@/lib/seo";

// See app/journal/page.tsx — prerendered, revalidated in the background.
export const revalidate = 300;

// Without this the route stays on-demand and every article view is a fresh
// Worker render. Seeded from the static catalogue, same as the product route;
// DB-only articles still resolve at request time and are cached from then on.
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  const ogImage = (article as any).image
    ? [{ url: (article as any).image, alt: article.title }]
    : undefined;

  return {
    // No brand suffix here: the root layout's template already appends
    // " | ClariPet", so "… — ClariPet Journal" doubled it and pushed titles
    // past 70 characters, where Google truncates.
    title: article.title,
    description: metaDescription(article.excerpt),
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      title: article.title,
      description: metaDescription(article.excerpt),
      type: "article",
      url: `/journal/${article.slug}`,
      ...(article.publishedAt && { publishedTime: article.publishedAt }),
      ...(article.updatedAt && { modifiedTime: article.updatedAt }),
      ...(ogImage && { images: ogImage }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: metaDescription(article.excerpt),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const all = await getAllArticles();
  const more = all.filter((a) => a.slug !== article.slug).slice(0, 3);

  const articleUrl = `${SITE_URL}/journal/${article.slug}`;

  // `datePublished` and `author` are only emitted when the data actually
  // carries them — an invented date is worse than an absent one.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    url: articleUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(article.image && { image: `${SITE_URL}${article.image}` }),
    ...(article.publishedAt && { datePublished: article.publishedAt }),
    ...((article.updatedAt || article.publishedAt) && {
      dateModified: article.updatedAt ?? article.publishedAt,
    }),
    author: {
      "@type": article.author ? "Person" : "Organization",
      name: article.author ?? "ClariPet",
    },
    publisher: {
      "@type": "Organization",
      name: "ClariPet",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/brand/logo-dark.png`,
      },
    },
    ...(article.category && { articleSection: article.category }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: `${SITE_URL}/journal`,
      },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      <ArticleView article={article} more={more} />
    </>
  );
}
