export type Category = {
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  tone: "sky" | "pink" | "sage" | "lavender" | "cream" | "peach";
  image?: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "perfumes",
    name: "Perfumes",
    blurb: "Parfum Non-Alkohol yang diracik khusus untuk kehangatan pelukan setiap hari.",
    icon: "sparkle",
    tone: "pink",
    image: "/assets/images/categories/Perfume Card.png",
  },
  {
    slug: "hygiene-grooming",
    name: "Hygiene & Grooming",
    blurb: "Perawatan mandi, mulut, dan telinga agar hewan peliharaan segar dan bersih.",
    icon: "droplet",
    tone: "sky",
    image: "/assets/images/categories/Hygiene & Grooming Card.png",
  },
  {
    slug: "skin-care",
    name: "Skin Care",
    blurb: "Perawatan khusus untuk mengatasi masalah kulit.",
    icon: "shield",
    tone: "sage",
    image: "/assets/images/categories/Skin Care Card.png",
  },
  {
    slug: "fur-care-supplements",
    name: "Fur Care & Supplements",
    blurb: "Untuk bulu yang sehat, berkilau, dan dukungan nutrisi dari dalam.",
    icon: "leaf",
    tone: "lavender",
    image: "/assets/images/categories/Fur Care & Supplements Card.png",
  },
  {
    slug: "behavior-training",
    name: "Behavior & Training",
    blurb: "Solusi lembut untuk hewan peliharaan yang nakal.",
    icon: "smile",
    tone: "peach",
    image: "/assets/images/categories/Behavior & Training Card.png",
  },
  {
    slug: "home-environment-care",
    name: "Home & Environment Care",
    blurb: "Solusi efektif menghilangkan bau tak sedap di rumah.",
    icon: "pin",
    tone: "sky",
    image: "/assets/images/categories/Home & Environment Card.png",
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
