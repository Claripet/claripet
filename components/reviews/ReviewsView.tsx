"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Placeholder } from "@/components/Placeholder";

const STORIES = [
  {
    name: "Jessica & Mochi",
    pet: "Mochi · Poodle",
    tone: "pink" as const,
    text: "My dog used to hate bath time, but ClariPet's Smell Clean has made our routine so much easier. He smells fresh for days without any irritation!",
  },
  {
    name: "David & Milo",
    pet: "Milo · Bulldog",
    tone: "sky" as const,
    text: "The tear stains around Milo's eyes have faded so much. ClariPet was the first product that actually delivered what it promised.",
  },
  {
    name: "Michael & Bruno",
    pet: "Bruno · Golden",
    tone: "cream" as const,
    text: "ClariPet Breath really helped with my dog's bad breath. Now cuddle time is so much better — gentle and effective.",
  },
];

const PRODUCT_REVIEWS = [
  { name: "Smell Clean", tone: "pink" as const, rating: 4.9, by: "Sarah", text: "Smells amazing and lasts for days — my cat doesn't mind it at all." },
  { name: "ClariPet Breath", tone: "sky" as const, rating: 4.8, by: "Kevin", text: "Finally something that actually works for fresh breath." },
  { name: "Tear Stain Remover", tone: "lavender" as const, rating: 4.9, by: "Nina", text: "Gentle on the eyes and so easy to use. Visible results in two weeks." },
  { name: "Gentle Wash Shampoo", tone: "sage" as const, rating: 4.8, by: "Ricky", text: "Soft, soothing, and kind to sensitive skin. Our go-to shampoo now." },
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
      <section className="wrap reviews-hero">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          <Icon name="heart" size={16} /> Reviews
        </div>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          Loved By Pet Parents Across Indonesia
        </h1>
        <p className="lead mx-auto" style={{ marginBottom: 20 }}>
          Thousands of pet owners trust ClariPet as part of their everyday care routine.
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
            <p className="muted">See the difference ClariPet makes, before and after.</p>
          </div>
          <div className="results-grid">
            {RESULTS.map((r, i) => (
              <div className="result-card" key={i}>
                <div className="result-pair">
                  <div className="result-img">
                    <span className="result-tag">Before</span>
                    <div className="ph cream">Before</div>
                  </div>
                  <div className="result-img">
                    <span className="result-tag after">After</span>
                    <div className={"ph " + r.tone}>After</div>
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
                Join thousands of pet parents who trust ClariPet for everyday care.
              </p>
              <div style={{ marginTop: 22 }}>
                <Link href="/shop" className="btn btn-primary btn-lg">
                  <Icon name="arrowRight" size={18} /> Explore ClariPet Products
                </Link>
              </div>
            </div>
            <div className="quiz-cta-media">
              <div className="ph sky">Happy pets</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
