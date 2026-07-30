"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  FlaskConical,
  Heart,
  HeartHandshake,
  HandHeart,
  Sparkles,
  CalendarHeart,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Feature data                                                       */
/* ------------------------------------------------------------------ */

const TOP_FEATURES = [
  {
    icon: ShieldCheck,
    bg: "bg-indigo-50",
    color: "text-indigo-500",
    title: "Pet Safe Formulations",
    desc: "Gentle and safe for pets of all ages and breeds.",
  },
  {
    icon: FlaskConical,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    title: "Premium Ingredients",
    desc: "Carefully selected, high-quality ingredients for the best results.",
  },
  {
    icon: Heart,
    bg: "bg-rose-50",
    color: "text-rose-500",
    title: "Made in Indonesia",
    desc: "Proudly made locally with global quality standards.",
  },
  {
    icon: HeartHandshake,
    bg: "bg-blue-50",
    color: "text-blue-500",
    title: "Trusted by Thousands",
    desc: "Real pet parents, real stories, real love and trust.",
  },
];

const BOTTOM_FEATURES = [
  {
    icon: HandHeart,
    title: "Crafted With Care",
    desc: "Not mass-produced, every ClariPet product is thoughtfully developed around real pet care needs.",
  },
  {
    icon: Sparkles,
    title: "Beyond Just Fragrance",
    desc: "From oral care to skin support, ClariPet is designed as a complete pet care ecosystem.",
  },
  {
    icon: CalendarHeart,
    title: "Everyday Friendly",
    desc: "Gentle enough to become part of your routine, not just used when problems appear.",
  },
];

/* ------------------------------------------------------------------ */
/*  Decorative doodle SVGs                                             */
/*  Paw / heart / sparkle come from the ClariPet decorative asset pack  */
/*  (128x128 viewBox, currentColor, round caps) so they match the       */
/*  hand-drawn brand style rather than being redrawn ad hoc.            */
/* ------------------------------------------------------------------ */

const DOODLE_TINT = { color: "#818cf8", opacity: 0.2 } as const;

function DoodlePaw() {
  return (
    <svg width="64" height="64" viewBox="0 0 128 128" fill="none" className="select-none pointer-events-none" aria-hidden style={DOODLE_TINT}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8">
        <g transform="rotate(4 64 64)">
          <path d="M46 70C37 74 31 83 33 93C35 103 44 107 53 103C61 99 68 100 76 104" />
          <path d="M80 104C90 107 98 101 97 91C96 81 90 73 81 70C70 66 58 66 46 70" />
          <path d="M39 56C32 57 28 52 28 46C28 39 32 34 38 34C44 34 48 40 47 46C46 52 43 55 39 56" />
          <path d="M61 49C55 48 51 43 52 36C53 29 58 25 64 25C70 26 73 32 72 38C71 44 67 48 61 49" />
          <path d="M87 56C81 57 76 53 76 47C75 40 80 35 86 35C92 35 96 41 95 47C94 53 91 55 87 56" />
        </g>
      </g>
    </svg>
  );
}

function DoodleHeartLine() {
  return (
    <svg width="72" height="72" viewBox="0 0 128 128" fill="none" className="select-none pointer-events-none" aria-hidden style={DOODLE_TINT}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="3.4" d="M65 101C52 89 31 78 28 60C26 47 35 37 46 38C56 39 61 46 64 54" />
        <path strokeWidth="3.4" d="M67 51C72 43 79 39 87 40C99 42 105 53 100 66C95 79 80 91 69 100" />
        <path strokeWidth="2.4" d="M58 95C47 85 36 74 33 63" />
      </g>
    </svg>
  );
}

function DoodleSparkle() {
  return (
    <svg width="52" height="52" viewBox="0 0 128 128" fill="none" className="select-none pointer-events-none" aria-hidden style={DOODLE_TINT}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.6">
        <path d="M64 18C66 40 73 52 95 61" />
        <path d="M99 64C76 70 67 83 64 108" />
        <path d="M61 103C58 81 50 72 30 65" />
        <path d="M33 61C52 54 60 43 62 23" />
      </g>
    </svg>
  );
}

function DoodleMolecule() {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none" className="select-none pointer-events-none" aria-hidden>
      <circle cx="12" cy="12" r="5" stroke="#818cf8" strokeWidth="1.3" fill="none" opacity="0.18" />
      <circle cx="32" cy="6" r="5" stroke="#818cf8" strokeWidth="1.3" fill="none" opacity="0.18" />
      <circle cx="50" cy="14" r="5" stroke="#818cf8" strokeWidth="1.3" fill="none" opacity="0.18" />
      <circle cx="20" cy="30" r="5" stroke="#818cf8" strokeWidth="1.3" fill="none" opacity="0.18" />
      <circle cx="42" cy="28" r="5" stroke="#818cf8" strokeWidth="1.3" fill="none" opacity="0.18" />
      <line x1="16" y1="16" x2="20" y2="26" stroke="#818cf8" strokeWidth="1.3" opacity="0.18" />
      <line x1="28" y1="10" x2="24" y2="26" stroke="#818cf8" strokeWidth="1.3" opacity="0.18" />
      <line x1="36" y1="10" x2="38" y2="24" stroke="#818cf8" strokeWidth="1.3" opacity="0.18" />
      <line x1="46" y1="18" x2="38" y2="24" stroke="#818cf8" strokeWidth="1.3" opacity="0.18" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Botanical decorative SVGs                                          */
/* ------------------------------------------------------------------ */

function BotanicalLeft() {
  return (
    <svg width="200" height="400" viewBox="0 0 200 400" fill="none" className="select-none pointer-events-none" aria-hidden>
      <path d="M40 400 Q50 320 30 240" stroke="#C5B6E0" strokeWidth="1.8" fill="none" opacity="0.35" />
      <path d="M50 400 Q60 310 45 220" stroke="#C5B6E0" strokeWidth="1.4" fill="none" opacity="0.3" />
      <ellipse cx="30" cy="245" rx="6" ry="8" stroke="#C5B6E0" strokeWidth="1.2" fill="none" opacity="0.35" />
      <ellipse cx="35" cy="260" rx="5" ry="7" stroke="#C5B6E0" strokeWidth="1.2" fill="none" opacity="0.3" />
      <ellipse cx="25" cy="270" rx="5" ry="7" stroke="#C5B6E0" strokeWidth="1.2" fill="none" opacity="0.3" />
      <ellipse cx="38" cy="280" rx="4" ry="6" stroke="#C5B6E0" strokeWidth="1.2" fill="none" opacity="0.25" />
      <ellipse cx="45" cy="225" rx="5" ry="7" stroke="#C5B6E0" strokeWidth="1.2" fill="none" opacity="0.3" />
      <ellipse cx="42" cy="210" rx="4" ry="6" stroke="#C5B6E0" strokeWidth="1.2" fill="none" opacity="0.25" />
      <ellipse cx="48" cy="240" rx="4" ry="6" stroke="#C5B6E0" strokeWidth="1.2" fill="none" opacity="0.25" />
      <path d="M60 360 Q75 350 70 335" stroke="#B5C8B5" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M65 330 Q80 320 75 305" stroke="#B5C8B5" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M55 310 Q70 300 65 285" stroke="#B5C8B5" strokeWidth="1.5" fill="none" opacity="0.2" />
    </svg>
  );
}

function BotanicalRight() {
  return (
    <svg width="200" height="400" viewBox="0 0 200 400" fill="none" className="select-none pointer-events-none" aria-hidden>
      <path d="M160 400 Q155 310 165 230" stroke="#A8C8A8" strokeWidth="1.8" fill="none" opacity="0.35" />
      <path d="M150 400 Q148 320 155 250" stroke="#A8C8A8" strokeWidth="1.4" fill="none" opacity="0.3" />
      <ellipse cx="170" cy="370" rx="14" ry="5" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.3" transform="rotate(-15 170 370)" />
      <ellipse cx="148" cy="365" rx="12" ry="4.5" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.3" transform="rotate(15 148 365)" />
      <ellipse cx="172" cy="340" rx="13" ry="4.5" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.25" transform="rotate(-18 172 340)" />
      <ellipse cx="146" cy="335" rx="11" ry="4" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.25" transform="rotate(18 146 335)" />
      <ellipse cx="168" cy="310" rx="12" ry="4" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.2" transform="rotate(-12 168 310)" />
      <ellipse cx="150" cy="305" rx="10" ry="3.5" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.2" transform="rotate(12 150 305)" />
      <ellipse cx="170" cy="280" rx="11" ry="4" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.2" transform="rotate(-20 170 280)" />
      <ellipse cx="152" cy="270" rx="10" ry="3.5" stroke="#A8C8A8" strokeWidth="1.3" fill="none" opacity="0.18" transform="rotate(15 152 270)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-triggered animation hook (inView + reduced-motion-aware)    */
/* ------------------------------------------------------------------ */

function useInViewOnce(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefsReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefsReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

/* ------------------------------------------------------------------ */
/*  Animated wrapper                                                   */
/* ------------------------------------------------------------------ */

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInViewOnce(ref);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hairline divider component                                         */
/* ------------------------------------------------------------------ */

function Hairline({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`hidden md:block ${className}`}
      style={{
        width: 1,
        minHeight: "70%",
        alignSelf: "center",
        background: "#E2E8F0",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function WhyChoose() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingVisible = useInViewOnce(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        padding: "84px 0",
        background: "var(--offwhite)",
      }}
    >
      {/* Decorative doodles — hidden below md */}
      <div className="hidden md:block absolute top-10 left-[8%]" style={{ zIndex: 0 }}>
        <DoodlePaw />
      </div>
      <div className="hidden md:block absolute top-16 left-[22%]" style={{ zIndex: 0 }}>
        <DoodleHeartLine />
      </div>
      <div className="hidden md:block absolute top-8 right-[12%]" style={{ zIndex: 0 }}>
        <DoodleSparkle />
      </div>
      <div className="hidden md:block absolute bottom-24 right-[18%]" style={{ zIndex: 0 }}>
        <DoodleMolecule />
      </div>

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* ---- Section header ---- */}
        <div
          className="text-center mb-12"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 0s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0s",
          }}
        >
          <h2
            className="font-bold"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#1B2A4A",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Why Pet Parents Choose ClariPet
          </h2>
          <p
            className="font-normal"
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.125rem)",
              color: "#5A6072",
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            Thoughtfully crafted pet care designed for everyday life.
          </p>
        </div>

        {/* ---- Main white card ---- */}
        <div
          className="relative"
          style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 20px 50px rgba(27, 42, 74, 0.10)",
            padding: 0,
            overflow: "hidden",
          }}
        >
          {/* Seamless grain tile from the brand asset pack; its README calls
              for 5–8% opacity, which keeps the card from reading as flat white. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/images/texture/grain.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "512px 512px",
              opacity: 0.06,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Botanicals bleeding in from edges — hidden below md */}
          <div className="hidden md:block absolute left-0 top-0 h-full" style={{ zIndex: 0, width: 200, pointerEvents: "none" }}>
            <div className="absolute" style={{ bottom: 0, left: 0 }}>
              <BotanicalLeft />
            </div>
          </div>
          <div className="hidden md:block absolute right-0 top-0 h-full" style={{ zIndex: 0, width: 200, pointerEvents: "none" }}>
            <div className="absolute" style={{ bottom: 0, right: 0 }}>
              <BotanicalRight />
            </div>
          </div>

          {/* Card content */}
          <div className="relative" style={{ zIndex: 1, padding: "60px 56px" }}>
            {/* ---- Top row: 4 columns ---- */}
            <div
              className="why-choose-grid-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0,
              }}
            >
              {TOP_FEATURES.map((feat, i) => (
                <div
                  key={feat.title}
                  className="flex flex-col items-center text-center"
                  style={{ padding: "0 20px" }}
                >
                  <FadeUp delay={i * 0.1}>
                    <div
                      className={`${feat.bg} flex items-center justify-center mx-auto`}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        marginBottom: 16,
                      }}
                    >
                      <feat.icon className={feat.color} size={28} aria-hidden />
                    </div>
                    <h3
                      className="font-semibold"
                      style={{
                        fontSize: "1rem",
                        color: "#1B2A4A",
                        lineHeight: 1.3,
                        marginBottom: 8,
                      }}
                    >
                      {feat.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#5A6072",
                        lineHeight: 1.6,
                        maxWidth: 220,
                        margin: "0 auto",
                      }}
                    >
                      {feat.desc}
                    </p>
                  </FadeUp>
                </div>
              ))}
            </div>

            {/* ---- Hairline dividers between top columns ---- */}
            <div className="hidden md:flex" style={{ justifyContent: "space-around", marginTop: -16, marginBottom: 8, position: "relative", height: 0, overflow: "visible" }}>
              <Hairline className="relative" style={{ left: "12.5%" }} />
              <Hairline className="relative" style={{ left: "12.5%" }} />
              <Hairline className="relative" style={{ left: "12.5%" }} />
            </div>

            {/* ---- Second row: 3 columns ---- */}
            <div
              className="why-choose-grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                marginTop: 48,
                paddingTop: 40,
                borderTop: "1px solid #F1F1F6",
              }}
            >
              {BOTTOM_FEATURES.map((feat, i) => (
                <div
                  key={feat.title}
                  className="flex"
                  style={{
                    padding: "0 20px",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <FadeUp delay={i * 0.1}>
                    <div className="flex" style={{ gap: 16, alignItems: "center" }}>
                      <div
                        className="bg-blue-50 flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                        }}
                      >
                        <feat.icon className="text-blue-500" size={22} aria-hidden />
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{
                            fontSize: "0.95rem",
                            color: "#1B2A4A",
                            lineHeight: 1.3,
                            marginBottom: 4,
                          }}
                        >
                          {feat.title}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#5A6072",
                            lineHeight: 1.6,
                          }}
                        >
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </FadeUp>
                </div>
              ))}
            </div>

            {/* ---- Hairline dividers between second-row columns ---- */}
            <div className="hidden md:flex" style={{ justifyContent: "space-around", marginTop: -24, position: "relative", height: 0, overflow: "visible" }}>
              <Hairline className="relative" style={{ left: "16.66%" }} />
              <Hairline className="relative" style={{ left: "16.66%" }} />
            </div>
          </div>
        </div>

        {/* ---- Bottom banner ----
             Finished artwork with the copy baked into the image, so the
             wording lives in alt text / an sr-only heading.  The 6.7:1 strip
             renders ~56px tall on a 375px phone, where the baked-in type is
             illegible — hence the squarer crop below md. */}
        <div className="relative overflow-hidden" style={{ marginTop: 40, borderRadius: 24 }}>
          <h3 className="sr-only">Made in Indonesia, Loved Everywhere. Local pride, global love.</h3>
          <Image
            src="/images/made-in-indonesia-wide.png"
            alt="Made in Indonesia, Loved Everywhere — local pride, global love"
            width={2400}
            height={360}
            sizes="(min-width: 768px) 1200px, 1px"
            className="hidden md:block w-full h-auto"
          />
          <Image
            src="/images/made-in-indonesia-narrow.png"
            alt=""
            width={1600}
            height={683}
            sizes="(max-width: 767px) 100vw, 1px"
            className="block md:hidden w-full h-auto"
          />
        </div>
      </div>

      {/* Responsive overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 1023px) {
          .why-choose-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .why-choose-grid-3 { grid-template-columns: 1fr !important; }
          .why-choose-grid-3 > div { border-top: 1px solid #F1F1F6; padding-top: 24px; margin-top: 24px; }
          .why-choose-grid-3 > div:first-child { border-top: none; padding-top: 0; margin-top: 0; }
        }
        @media (max-width: 639px) {
          .why-choose-grid-4 { grid-template-columns: 1fr !important; }
          .why-choose-grid-4 > div:not(:last-child) { border-bottom: 1px solid #F1F1F6; padding-bottom: 28px; margin-bottom: 28px; }
        }
        @media (max-width: 860px) {
          .card-content { padding: 32px 24px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .why-choose-fade { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}} />
    </section>
  );
}
