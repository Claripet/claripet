import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { BannerDecor } from "@/components/BannerDecor";

export const metadata: Metadata = {
  title: "About Us | ClariPet",
  description:
    "Caring for pets is a journey filled with love, challenges, and countless little moments. ClariPet is here to make that journey easier.",
  alternates: { canonical: "/about" },
};

const PROMISE = [
  { icon: "paw", tone: "sky", label: "Pet Safe Formulations" },
  { icon: "leaf", tone: "sage", label: "Premium Ingredients" },
  { icon: "pin", tone: "pink", label: "Made in Indonesia" },
  { icon: "heart", tone: "cream", label: "Crafted With Care" },
  { icon: "star", tone: "lavender", label: "Helping You Help Them" },
] as const;

export default function AboutPage() {
  return (
    <main>
      {/* ===== Hero: same tinted panel as the other page banners ===== */}
      <section className="wrap" style={{ paddingTop: 28 }}>
        <div className="page-banner page-banner-tall">
          <BannerDecor />
          <div className="page-banner-copy about-hero-copy">
            <span className="about-eyebrow">About ClariPet</span>
            <h1 className="about-hero-title">
              Helping You Help Them.<span className="about-heart">♡</span>
            </h1>
            <p>
              Caring for pets is a journey filled with love, challenges, and countless little
              moments.
            </p>
            <p>
              We&apos;re here to make that journey easier with gentle, effective products you can
              trust every day.
            </p>
            <Link href="/shop" className="btn btn-primary btn-lg about-hero-cta">
              Explore ClariPet <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          <div className="page-banner-media" style={{ aspectRatio: "1500 / 1000" }}>
            <Image
              src="/images/about-us.jpg"
              alt="A pet parent holding her dog and cat close on a soft blanket"
              fill
              priority
              sizes="(max-width: 860px) 92vw, 560px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* ===== Story: photo bleeding off the left edge, copy right ===== */}
      <section className="about-story">
        <div className="about-story-media">
          <Image
            src="/images/about-story.png"
            alt="A pet parent at home with her dog, part of an ordinary everyday routine"
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="about-story-copy">
          <h2 className="about-story-title">
            Because Loving Them Is Easy.
            <br />
            Caring For Them Isn&apos;t.<span className="about-heart">♡</span>
          </h2>
          <p>
            Anyone who has ever shared their life with a pet knows the feeling. The late-night
            cleanups. The worry when something doesn&apos;t seem right. The baths they hate. The
            medications they refuse. The endless search for products that are safe, gentle, and
            actually work.
          </p>
          <p>
            Being a pet parent is one of life&apos;s greatest joys. But it can also be challenging,
            overwhelming, and exhausting at times. And that&apos;s okay.
          </p>
          <p className="about-accent">
            At ClariPet, we believe pet care shouldn&apos;t add to the burden. It should help
            lighten it.
          </p>
          <p>Every product we create is designed around a simple question:</p>
          <p className="about-accent">How can we make caring for pets easier?</p>
          <p>
            So you can spend less time worrying, and more time enjoying life with the pets you
            love.
          </p>
          <p className="about-script">Helping You Help Them. ♡</p>
          <p>
            Because behind every happy pet is someone doing their very best. And we&apos;re here to
            support them, every step of the way.
          </p>
        </div>
      </section>

      {/* ===== Our Promise ===== */}
      <section className="wrap section-sm" style={{ paddingBottom: 72 }}>
        <div className="about-promise">
          <h2 className="about-promise-title">
            Our Promise<span className="about-heart">♡</span>
          </h2>
          <ul className="about-promise-grid">
            {PROMISE.map((p) => (
              <li className="about-promise-item" key={p.label}>
                <span className={`about-promise-ic tone-${p.tone}`}>
                  <Icon name={p.icon} size={26} />
                </span>
                <span className="about-promise-label">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
