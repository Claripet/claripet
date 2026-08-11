"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Placeholder } from "@/components/Placeholder";
import { SectionDoodles } from "@/components/DecorIcons";

const STORIES = [
  {
    name: "Jessica & Mochi",
    pet: "Mochi · Poodle",
    tone: "pink" as const,
    text: "Anjing saya dulu benci waktu mandi, tapi Smell Clean dari ClariPet bikin rutinitas kami jauh lebih mudah. Wanginya tahan berhari-hari tanpa iritasi sama sekali!",
  },
  {
    name: "David & Milo",
    pet: "Milo · Bulldog",
    tone: "sky" as const,
    text: "Noda air mata di sekitar mata Milo memudar drastis. ClariPet adalah produk pertama yang benar-benar memberikan hasil sesuai janjinya.",
  },
  {
    name: "Michael & Bruno",
    pet: "Bruno · Golden",
    tone: "cream" as const,
    text: "ClariPet Breath sangat membantu mengatasi bau mulut anjing saya. Sekarang waktu bermanja jadi jauh lebih menyenangkan — lembut dan efektif.",
  },
];

const PRODUCT_REVIEWS = [
  { name: "Smell Clean", tone: "pink" as const, rating: 4.9, by: "Sarah", text: "Wanginya enak banget dan tahan berhari-hari — kucing saya juga nggak keberatan sama sekali." },
  { name: "ClariPet Breath", tone: "sky" as const, rating: 4.8, by: "Kevin", text: "Akhirnya ada produk yang beneran ampuh bikin napas segar." },
  { name: "Tear Stain Remover", tone: "lavender" as const, rating: 4.9, by: "Nina", text: "Lembut di mata dan gampang dipakai. Hasilnya kelihatan dalam dua minggu." },
  { name: "Gentle Wash Shampoo", tone: "sage" as const, rating: 4.8, by: "Ricky", text: "Lembut, menenangkan, dan aman untuk kulit sensitif. Sekarang jadi shampoo andalan kami." },
];

const RESULTS = [
  { name: "Tear Stain Remover", tone: "lavender" as const },
  { name: "Gentle Wash Shampoo", tone: "sage" as const },
  { name: "Smell Clean", tone: "pink" as const },
  { name: "ClariPet Breath", tone: "sky" as const },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={14} />
      ))}
      <span className="num">{value.toFixed(1)}</span>
    </span>
  );
}

export function ReviewsView() {
  return (
    <main>
      <section className="wrap reviews-hero section-doodles">
        <SectionDoodles marks={["heart-mini", "sparkle-mini", "leaf", "trail-curve"]} />
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          <Icon name="heart" size={16} /> Reviews
        </div>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          Loved By Pet Parents Across Indonesia
        </h1>
        <p className="lead mx-auto" style={{ marginBottom: 20 }}>
          Ribuan pemilik hewan peliharaan mempercayai ClariPet sebagai bagian dari rutinitas perawatan sehari-hari.
        </p>
        <Stars value={4.9} />
      </section>

      <section className="section" style={{ paddingTop: 28 }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 38 }}>
            <h2 className="h2">Real Stories From Real Pet Parents</h2>
          </div>
          <div className="story-grid">
            {STORIES.map((s, i) => (
              <figure className="story-card" key={i}>
                <div className="story-media">
                  <Placeholder tone={s.tone} label={s.name} />
                </div>
                <blockquote>“{s.text}”</blockquote>
                <Stars value={5} />
                <figcaption>
                  <strong>{s.name}</strong>
                  <span>{s.pet}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 38 }}>
            <h2 className="h2">Reviews By Product</h2>
          </div>
          <div className="prod-review-grid">
            {PRODUCT_REVIEWS.map((r, i) => (
              <div className="prod-review" key={i}>
                <div className="pr-media"><Placeholder tone={r.tone} label={r.name} /></div>
                <div className="pr-body">
                  <div className="pr-name">{r.name}</div>
                  <Stars value={r.rating} />
                  <p>“{r.text}”</p>
                  <span className="pr-by">— {r.by}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 38 }}>
            <h2 className="h2">Real Pets. Real Results.</h2>
            <p className="muted">Lihat perbedaan yang dihasilkan ClariPet, sebelum dan sesudah.</p>
          </div>
          <div className="results-grid">
            {RESULTS.map((r, i) => (
              <div className="result-card" key={i}>
                <div className="result-pair">
                  <div className="result-img">
                    <span className="result-tag">Sebelum</span>
                    <div className="ph cream">Sebelum</div>
                  </div>
                  <div className="result-img">
                    <span className="result-tag after">Sesudah</span>
                    <div className={"ph " + r.tone}>Sesudah</div>
                  </div>
                </div>
                <div className="result-name">{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="quiz-cta">
            <div>
              <h2 className="h2" style={{ marginBottom: 12 }}>
                Thank You For Being Part Of Our Journey
              </h2>
              <p className="lead">
                Bergabunglah dengan ribuan pet parents yang mempercayai ClariPet untuk perawatan sehari-hari.
              </p>
              <div style={{ marginTop: 22 }}>
                <Link href="/shop" className="btn btn-primary btn-lg">
                  <Icon name="arrowRight" size={18} /> Jelajahi Produk ClariPet
                </Link>
              </div>
            </div>
            <div className="quiz-cta-media">
              <div className="ph sky">Hewan peliharaan bahagia</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
