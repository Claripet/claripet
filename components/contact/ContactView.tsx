"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { BannerDecor } from "@/components/BannerDecor";

const WHATSAPP = "62881080963188";
const WHATSAPP_DISPLAY = "0881.0809.63188";
const EMAIL = "claripetindonesia@gmail.com";

const INQUIRIES = [
  { icon: "bag", t: "Product Questions", d: "Need help choosing the right ClariPet product?" },
  { icon: "package", t: "Order Support", d: "Questions about your order, shipping, or delivery?" },
  { icon: "users", t: "Business & Partnerships", d: "Retailers, distributors, media, or collaborations." },
  { icon: "heart", t: "General Inquiries", d: "Anything else? We're happy to help." },
];

const SUBJECTS = [
  "Product Questions",
  "Order Support",
  "Business & Partnerships",
  "General Inquiries",
];

export function ContactView() {
  const [sent, setSent] = useState(false);

  return (
    <main>
      <section className="wrap" style={{ paddingTop: 28 }}>
        <div className="page-banner">
          <BannerDecor />
          <div className="page-banner-copy">
            <h1 className="h1" style={{ marginBottom: 0 }}>Let&apos;s Talk.</h1>
            <p className="lead">Whether you have questions about our products, your order, or simply need help finding the right solution for your pet — we&apos;re here to help.</p>
          </div>
          <div className="page-banner-media" style={{ aspectRatio: "1500 / 867" }}>
            <Image
              src="/images/contact-hero.jpg"
              alt="A pet parent sitting on the floor with his cat, messaging ClariPet support"
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
            <h2 className="h2" style={{ marginBottom: 10 }}>
              How Can We Help You?
            </h2>
            <p className="muted">Choose the topic that best fits your inquiry so we can assist you faster.</p>
          </div>
          <div className="inquiry-grid">
            {INQUIRIES.map((q, i) => (
              <div className="inquiry-card" key={i}>
                <span className="inquiry-ic">
                  <Icon name={q.icon} size={24} />
                </span>
                <div className="t">{q.t}</div>
                <div className="d">{q.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
            <div className="contact-info">
            <div className="contact-block">
              <h3 className="h3">Customer Support</h3>
              <a className="contact-line" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                <span className="contact-line-ic"><Icon name="smile" size={18} /></span>
                <span>
                  <strong>WhatsApp</strong>
                  <em>{WHATSAPP_DISPLAY}</em>
                </span>
              </a>
              <a className="contact-line" href={`mailto:${EMAIL}`}>
                <span className="contact-line-ic"><Icon name="package" size={18} /></span>
                <span>
                  <strong>Email</strong>
                  <em>{EMAIL}</em>
                </span>
              </a>
              <div className="contact-line">
                <span className="contact-line-ic"><Icon name="clock" size={18} /></span>
                <span>
                  <strong>Operating Hours</strong>
                  <em>Senin–Jumat 09.00–17.00 WIB</em>
                </span>
              </div>
            </div>

            <div className="contact-block">
              <h3 className="h3">Connect With Us</h3>
              <a className="contact-line" href="#"><span className="contact-line-ic"><Icon name="instagram" size={18} /></span><span><strong>Instagram</strong><em>@claripetcare</em></span></a>
              <a className="contact-line" href="#"><span className="contact-line-ic"><Icon name="tiktok" size={18} /></span><span><strong>TikTok</strong><em>@claripetcare</em></span></a>
            </div>

            <div className="contact-block">
              <h3 className="h3">Our Location</h3>
              <div className="contact-line">
                <span className="contact-line-ic"><Icon name="pin" size={18} /></span>
                <span>
                  <strong>Jakarta, Indonesia</strong>
                  <em>Melayani pet parents di seluruh Indonesia.</em>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="contact-form-wrap">
            <div>
              <h2 className="h2" style={{ marginBottom: 10 }}>Message Us</h2>
              <p className="muted">
                Fill out the form and our team will get back to you as soon as possible.
              </p>
              <div className="contact-form-media">
                <Image
                  src="/images/contact-message-us.png"
                  alt="A rabbit dozing against a laptop, waiting on a reply"
                  fill
                  loading="lazy"
                  sizes="(max-width: 860px) 100vw, 380px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="cf-row">
                <label className="cf-field">
                  <span>Name <b>*</b></span>
                  <input required placeholder="Your full name" />
                </label>
                <label className="cf-field">
                  <span>Email <b>*</b></span>
                  <input required type="email" placeholder="your@email.com" />
                </label>
              </div>
              <label className="cf-field">
                <span>Subject <b>*</b></span>
                <select required defaultValue="">
                  <option value="" disabled>Select a subject</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="cf-field">
                <span>Message <b>*</b></span>
                <textarea required rows={5} placeholder="How can we help?" />
              </label>
              <button type="submit" className="btn btn-primary btn-lg">
                <Icon name="arrowRight" size={18} /> Send Message
              </button>
              {sent && (
                <p className="cf-success">
                  Thanks for reaching out! This is a demo form — connect it to your inbox or WhatsApp to receive messages.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
