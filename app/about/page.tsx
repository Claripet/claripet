import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { BannerDecor } from "@/components/BannerDecor";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Merawat hewan peliharaan adalah perjalanan yang penuh cinta, tantangan, dan momen-momen kecil. ClariPet hadir untuk membuat perjalanan itu lebih mudah.",
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
              Merawat hewan peliharaan adalah perjalanan yang penuh cinta,
              tantangan, dan momen-momen kecil yang tak terhitung.
            </p>
            <p>
              Kami hadir untuk membuat perjalanan itu lebih mudah dengan
              produk yang lembut, efektif, dan bisa Anda percaya setiap hari.
            </p>
            <Link href="/shop" className="btn btn-primary btn-lg about-hero-cta">
              Jelajahi ClariPet <Icon name="arrowRight" size={18} />
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
            Siapa pun yang pernah berbagi hidup dengan hewan peliharaan pasti
            mengenal perasaan ini. Bersih-bersih tengah malam. Rasa cemas saat
            ada yang terasa tidak beres. Waktu mandi yang mereka benci. Obat
            yang mereka tolak. Pencarian tanpa henti akan produk yang aman,
            lembut, dan benar-benar bekerja.
          </p>
          <p>
            Menjadi pet parent adalah salah satu kebahagiaan terbesar dalam
            hidup. Namun terkadang juga bisa terasa berat, membebani, dan
            melelahkan. Dan itu tidak apa-apa.
          </p>
          <p className="about-accent">
            Di ClariPet, kami percaya perawatan hewan peliharaan seharusnya
            tidak menambah beban. Justru harus membantu meringankannya.
          </p>
          <p>Setiap produk yang kami ciptakan dirancang berdasarkan satu pertanyaan sederhana:</p>
          <p className="about-accent">Bagaimana kami bisa membuat perawatan hewan peliharaan lebih mudah?</p>
          <p>
            Agar Anda bisa menghabiskan lebih sedikit waktu untuk khawatir,
            dan lebih banyak waktu menikmati hidup bersama hewan peliharaan
            yang Anda cintai.
          </p>
          <p className="about-script">Helping You Help Them. ♡</p>
          <p>
            Karena di balik setiap hewan peliharaan yang bahagia, ada
            seseorang yang berusaha sebaik mungkin. Dan kami di sini untuk
            mendukung mereka, di setiap langkah.
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
