"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import Image from "next/image";
import { BannerDecor } from "@/components/BannerDecor";
import { FAQS } from "@/data/faqs";

const WHATSAPP = "6281234567890";

export function FaqView() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main>
      <section className="wrap" style={{ paddingTop: 28 }}>
        <div className="page-banner">
          <BannerDecor />
          <div className="page-banner-copy">
            <h1 className="h1" style={{ marginBottom: 0 }}>Curious About ClariPet?</h1>
            <p className="lead">Everything you need to know — what we do, and how we&apos;re helping you help them.</p>
          </div>
          <div className="page-banner-media" style={{ aspectRatio: "1500 / 962" }}>
            <Image
              src="/images/faq-hero.jpg"
              alt="A curious dog nosing into an open ClariPet Care box"
              fill
              priority
              sizes="(max-width: 860px) 92vw, 560px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 38 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              <Icon name="sparkle" size={16} /> Top Questions
            </div>
            <h2 className="h2">Here are the most common questions about ClariPet</h2>
          </div>

          <div className="faq-grid">
            {FAQS.map((f, i) => (
              <div key={i} className={"faq-card" + (open === i ? " open" : "")}>
                <button
                  className="faq-head"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="faq-ic">
                    <Icon name={f.icon} size={20} />
                  </span>
                  <span className="faq-q">{f.q}</span>
                  <Icon name="chevDown" size={18} className="chev" />
                </button>
                <div className="faq-body">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="faq-cta">
            <div>
              <h2 className="h2" style={{ marginBottom: 10 }}>
                Still Have Questions?
              </h2>
              <p className="muted">
                We&apos;re always happy to help. Reach our team and we&apos;ll get back to you quickly.
              </p>
            </div>
            <div className="faq-cta-actions">
              <a
                className="btn btn-primary btn-lg"
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </a>
              <Link className="btn btn-secondary btn-lg" href="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
