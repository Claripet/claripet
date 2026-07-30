"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // eslint-disable-next-line no-console
    console.log("Newsletter signup:", email);
    setDone(true);
    setEmail("");
    window.setTimeout(() => setDone(false), 4000);
  };

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #EAF2FB 0%, #E0CBE8 60%, #F5EEF8 100%)",
      }}
    >
      <div className="p-8 md:p-12 lg:p-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: copy + form */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-navy">
              <Icon name="leaf" size={20} className="text-sage" strokeWidth={2} />
            </div>
            <h2
              className="text-navy font-bold leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
            >
              Stay Updated, Pet Parent!
            </h2>
            <p className="text-[#5A6072] leading-relaxed max-w-md text-[0.95rem]">
              Get helpful pet care tips, exclusive offers, and ClariPet news
              straight to your inbox.
            </p>

            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A90A0] pointer-events-none">
                  <Icon name="mail" size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-full bg-white pl-11 pr-4 py-3 text-[15px] text-navy outline-none border border-transparent focus:border-sky transition-colors"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-navy hover:bg-[#11203c] text-white font-semibold px-7 py-3 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#5A6072]">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={14} className="text-sage" /> No spam, ever
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={14} className="text-sage" /> Unsubscribe anytime
              </span>
            </div>

            {done && (
              <p className="text-[13px] text-sage font-medium flex items-center gap-1.5">
                <Icon name="check" size={15} /> Thanks! Check your inbox to confirm.
              </p>
            )}
          </div>

          {/* Right: accompanying photo */}
          <div className="relative">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "4 / 3",
                background: "linear-gradient(135deg, #EAF2FB, #F5EEF8)",
              }}
            >
              <Image
                src="/images/journal/perfume.png"
                alt="Two dogs curled up together"
                fill
                loading="lazy"
                sizes="(max-width: 768px) 90vw, 45vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}