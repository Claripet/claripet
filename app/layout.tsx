import type { Metadata } from "next";
import { Poppins, Caveat } from "next/font/google";
import nextDynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./Providers";
import { SiteChrome } from "@/components/SiteChrome";
import { FlyToCartProvider } from "@/context/FlyToCartContext";
import { SITE_URL } from "@/lib/site";
import { GlobalDecor } from "@/components/GlobalDecor";

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

// NOTE: this segment deliberately declares no `dynamic` config. It used to set
// `force-dynamic`, because AuthProvider builds a Supabase browser client while
// the root layout renders and that threw when the build had no credentials.
// Since a root-layout export applies to every route beneath it, that single line
// opted the whole site out of static generation: nothing was prerendered,
// `generateStaticParams` never ran, and every request — storefront pages
// included — paid a full SSR inside the Worker. lib/supabase/client.ts now
// falls back to a placeholder instead of throwing, so each route is free to
// choose its own rendering mode. Do not reintroduce a `dynamic` export here;
// set it on the individual routes that genuinely need per-request data.
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
  // Indonesian, matching <html lang="id"> and the market the store actually
  // ships to (IDR pricing, Midtrans, RajaOngkir). Kept under ~160 chars so
  // Google renders it whole instead of truncating mid-sentence.
  description:
    "Toko online produk perawatan hewan peliharaan premium untuk anjing & kucing — parfum, shampoo, perawatan kulit & bulu, dan penghilang bau. Aman & dibuat di Indonesia.",
  openGraph: {
    title: {
      default: "ClariPet | Premium Pet Care",
      template: "%s | ClariPet",
    },
    description:
      "Toko online produk perawatan hewan peliharaan premium untuk anjing & kucing — parfum, shampoo, perawatan kulit & bulu, dan penghilang bau. Aman & dibuat di Indonesia.",
    siteName: "ClariPet",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "ClariPet | Premium Pet Care",
      template: "%s | ClariPet",
    },
    description:
      "Toko online produk perawatan hewan peliharaan premium untuk anjing & kucing — parfum, shampoo, perawatan kulit & bulu, dan penghilang bau. Aman & dibuat di Indonesia.",
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
    // "id", not "en": prices are IDR, checkout is Midtrans, shipping is
    // RajaOngkir, and the legal pages and most product copy are Indonesian.
    // Declaring "en" over Indonesian body copy told Google to rank the site for
    // the wrong market. Individual English articles still rank on their own
    // content — Google reads the page, not just this attribute.
    <html lang="id" className={`${poppins.variable} ${caveat.variable}`}>
      <body>
        <Providers>
          <FlyToCartProvider>
            <SiteChrome>{children}</SiteChrome>
          </FlyToCartProvider>
          <Toast />
          <GlobalDecor />
        </Providers>
      </body>
    </html>
  );
}
