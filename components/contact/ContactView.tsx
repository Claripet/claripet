"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { BannerDecor } from "@/components/BannerDecor";

const WHATSAPP = "62881080963188";
const WHATSAPP_DISPLAY = "0881.0809.63188";
const EMAIL = "claripetindonesia@gmail.com";

const INQUIRIES = [
  { icon: "bag", t: "Pertanyaan Produk", d: "Butuh bantuan memilih produk ClariPet yang tepat?" },
  { icon: "package", t: "Bantuan Pesanan", d: "Ada pertanyaan seputar pesanan, pengiriman, atau pengantaran?" },
  { icon: "users", t: "Bisnis & Kemitraan", d: "Untuk retailer, distributor, media, atau kolaborasi." },
  { icon: "heart", t: "Pertanyaan Umum", d: "Ada hal lain? Kami siap membantu." },
];

const SUBJECTS = [
  "Pertanyaan Produk",
  "Bantuan Pesanan",
  "Bisnis & Kemitraan",
  "Pertanyaan Umum",
];

export function ContactView() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function selectInquiry(topic: string) {
    setSubject(topic);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <section className="wrap" style={{ paddingTop: 28 }}>
        <div className="page-banner">
          <BannerDecor />
          <div className="page-banner-copy">
            <h1 className="h1" style={{ marginBottom: 0 }}>Let&apos;s Talk.</h1>
            <p className="lead">Baik Anda punya pertanyaan seputar produk kami, pesanan Anda, atau butuh bantuan menemukan solusi yang tepat untuk hewan peliharaan Anda — kami siap membantu.</p>
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
            <p className="muted">Pilih topik yang paling sesuai dengan pertanyaan Anda agar kami bisa membantu lebih cepat.</p>
          </div>
          <div className="inquiry-grid">
            {INQUIRIES.map((q, i) => (
              <button
                type="button"
                className="inquiry-card"
                key={i}
                onClick={() => selectInquiry(q.t)}
              >
                <span className="inquiry-ic">
                  <Icon name={q.icon} size={24} />
                </span>
                <div className="t">{q.t}</div>
                <div className="d">{q.d}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
            <div className="contact-info">
            <div className="contact-block">
              <h3 className="h3">Layanan Pelanggan</h3>
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
                  <strong>Jam Operasional</strong>
                  <em>Senin–Jumat 09.00–17.00 WIB</em>
                </span>
              </div>
            </div>

            <div className="contact-block">
              <h3 className="h3">Terhubung Dengan Kami</h3>
              <a className="contact-line" href="#"><span className="contact-line-ic"><Icon name="instagram" size={18} /></span><span><strong>Instagram</strong><em>@claripetcare</em></span></a>
              <a className="contact-line" href="#"><span className="contact-line-ic"><Icon name="tiktok" size={18} /></span><span><strong>TikTok</strong><em>@claripetcare</em></span></a>
            </div>

            <div className="contact-block">
              <h3 className="h3">Lokasi Kami</h3>
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
                Isi formulir ini dan tim kami akan segera menghubungi Anda kembali.
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
              ref={formRef}
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitError(null);
                const form = e.currentTarget;
                const data = new FormData(form);
                setSending(true);
                try {
                  const res = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: data.get("name"),
                      email: data.get("email"),
                      subject: data.get("subject"),
                      message: data.get("message"),
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    throw new Error(json.error || "Gagal mengirim pesan.");
                  }
                  setSent(true);
                  form.reset();
                  setSubject("");
                } catch (err) {
                  setSubmitError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
                } finally {
                  setSending(false);
                }
              }}
            >
              <div className="cf-row">
                <label className="cf-field">
                  <span>Nama <b>*</b></span>
                  <input required name="name" placeholder="Nama lengkap Anda" />
                </label>
                <label className="cf-field">
                  <span>Email <b>*</b></span>
                  <input required type="email" name="email" placeholder="your@email.com" />
                </label>
              </div>
              <label className="cf-field">
                <span>Subjek <b>*</b></span>
                <select required name="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="" disabled>Pilih subjek</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="cf-field">
                <span>Pesan <b>*</b></span>
                <textarea required name="message" rows={5} placeholder="Bagaimana kami bisa membantu?" />
              </label>
              <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
                <Icon name="arrowRight" size={18} /> {sending ? "Mengirim..." : "Kirim Pesan"}
              </button>
              {submitError && (
                <p className="cf-error">{submitError}</p>
              )}
              {sent && (
                <p className="cf-success">
                  Terima kasih sudah menghubungi kami! Tim kami akan segera merespons.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
