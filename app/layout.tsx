import type { Metadata } from "next";
import { Poppins, Caveat } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./Providers";
import { SiteChrome } from "@/components/SiteChrome";
import { FlyToCartProvider } from "@/context/FlyToCartContext";
import { SITE_URL } from "@/lib/site";

const Toast = dynamic(
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ClariPetAr | Premium Pet Care",
    template: "%s | ClariPetAr",
  },
  description:
    "Safe. Gentle. Effective. Premium, pet-safe care made with love in Indonesia.",
  openGraph: {
    title: {
      default: "ClariPetAr | Premium Pet Care",
      template: "%s | ClariPetAr",
    },
    description:
      "Safe. Gentle. Effective. Premium, pet-safe care made with love in Indonesia.",
    siteName: "ClariPetAr",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "ClariPetAr | Premium Pet Care",
      template: "%s | ClariPetAr",
    },
    description:
      "Safe. Gentle. Effective. Premium, pet-safe care made with love in Indonesia.",
    creator: "@ClariPetAr",
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
