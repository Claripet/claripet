import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/data";
import { ArticleView } from "@/components/journal/ArticleView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};
  const ogImage = (article as any).image
    ? [{ url: (article as any).image, alt: article.title }]
    : undefined;

  return {
    title: `${article.title} — ClariPet Journal`,
    description: article.excerpt,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `/journal/${article.slug}`,
      ...(ogImage && { images: ogImage }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const all = await getAllArticles();
  const more = all.filter((a) => a.slug !== article.slug).slice(0, 3);

  return <ArticleView article={article} more={more} />;
}
