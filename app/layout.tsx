import type { Metadata } from "next";
import { Poppins, Caveat } from "next/font/google";
import nextDynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./Providers";
import { SiteChrome } from "@/components/SiteChrome";
import { FlyToCartProvider } from "@/context/FlyToCartContext";
import { SITE_URL } from "@/lib/site";

const Toast = nextDynamic(
  () => import("@/components/Toast").then((mod) => mod.Toast),
  { ssr: false },
);

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
  display: "swap",
});

// AuthProvider (wrapped around every route via Providers below) memoizes a
// Supabase browser client with `useMemo`, which runs even during Next's
// build-time static-generation pass. That pass never has real secrets — by
// design, secrets are a deploy/runtime concern — so any attempt to statically
// prerender a page crashed the build the moment it rendered the root layout,
// including pages with no Supabase dependency at all (e.g. /terms). Forcing
// every route dynamic means nothing is prerendered at build time; the app is
// SSR'd per-request instead, where the real secrets are always present.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Renders <meta name="application-name" content="ClariPet">. Google's OAuth
  // brand check compares the console App name against the site's declared name,
  // so this must stay character-for-character identical to that field.
  applicationName: "ClariPet",
  title: {
    default: "ClariPet | Premium Pet Care",
    template: "%s | ClariPet",
  },
  description:
    "ClariPet is an online store for premium pet care products for cats and dogs — grooming sprays, perfumes, skin and coat care, dental drops and odour removers. Create an account to track orders, save favourites and manage your pet profiles. Safe, gentle and effective, made with love in Indonesia.",
  openGraph: {
    title: {
      default: "ClariPet | Premium Pet Care",
      template: "%s | ClariPet",
    },
    description:
      "ClariPet is an online store for premium pet care products for cats and dogs — grooming sprays, perfumes, skin and coat care, dental drops and odour removers. Create an account to track orders, save favourites and manage your pet profiles. Safe, gentle and effective, made with love in Indonesia.",
    siteName: "ClariPet",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "ClariPet | Premium Pet Care",
      template: "%s | ClariPet",
    },
    description:
      "ClariPet is an online store for premium pet care products for cats and dogs — grooming sprays, perfumes, skin and coat care, dental drops and odour removers. Create an account to track orders, save favourites and manage your pet profiles. Safe, gentle and effective, made with love in Indonesia.",
    creator: "@ClariPet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${caveat.variable}`}>
      <body>
        <Providers>
          <FlyToCartProvider>
            <SiteChrome>{children}</SiteChrome>
          </FlyToCartProvider>
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
