import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import {
  getCategoryBySlug,
  getProductsByCategory,
  getAllCategories,
} from "@/lib/data";
import { CollectionView } from "@/components/shop/CollectionView";
import { ShopCategoryPills } from "@/components/shop/ShopCategoryPills";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlug(params.category);
  if (!category) return {};
  return {
    title: `${category.name} Collection`,
    description: category.blurb,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: {
      title: `${category.name} — ClariPet`,
      description: category.blurb,
      url: `/shop/${category.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} Collection`,
      description: category.blurb,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: { category: string };
}) {
  const category = await getCategoryBySlug(params.category);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProductsByCategory(params.category),
    getAllCategories(),
  ]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${SITE_URL}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${SITE_URL}/shop/${category.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ShopCategoryPills />
      <CollectionView
        products={products}
        category={category}
        categories={categories}
      />
    </>
  );
}
