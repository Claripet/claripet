import type { Metadata } from "next";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with ClariPet — WhatsApp, email, and our contact form.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — ClariPet",
    description:
      "Get in touch with ClariPet — WhatsApp, email, and our contact form.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us",
    description:
      "Get in touch with ClariPet — WhatsApp, email, and our contact form.",
  },
};

export default function ContactPage() {
  return <ContactView />;
}
