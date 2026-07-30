import Link from "next/link";
import Image from "next/image";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export function Hero() {
  return (
    <section className="hero" style={{ background: "#ffffff" }}>
      <div className="wrap hero-inner">
        {/* Image sits behind the copy and melts into white on the left edge */}
        <div className="hero-media" aria-hidden="false" style={{ transform: "translateX(160px)" }}>
          <Image
            src="/images/hero-home.png"
            alt="A happy, healthy pet cared for with ClariPet premium grooming and wellness products"
            fill
            priority
            sizes="(max-width: 768px) 160vw, 1600px"
            style={{ objectFit: "contain" }}
            className="hero-img"
          />
        </div>

        {/* Copy floats on top */}
        <div className="hero-copy">
          <span className="hero-eyebrow hero-mobile-hide">
            <span aria-hidden="true">🐾</span>
            PREMIUM PET CARE FOR CATS &amp; DOGS
          </span>
          <h1 className="sr-only">ClariPet - Premium Pet Care, Grooming &amp; Health Products</h1>
          <h2 className="h-display hero-title">
            Helping You<br />
            Help Them.<span className="hero-title-accent">♡</span>
          </h2>
          <p className="lead hero-sub hero-mobile-hide">
            Perawatan hewan peliharaan yang lembut dan efektif untuk memudahkan rutinitas grooming, menjaga kesehatan, dan mempererat ikatan setiap hari.
          </p>

          <div className="hero-actions">
            <Link
              href="/shop"
              tabIndex={-1}
              aria-hidden="true"
              style={{ "--primary-btn-bg": "#348dda", "--primary-btn-border": "#348dda" } as React.CSSProperties}
              className="hero-action-link"
            >
              <PrimaryButton size="lg" icon="arrowRight" aria-label="Shop Products" className="w-full justify-center">
                Shop Products
              </PrimaryButton>
            </Link>
            <Link
              href="/quiz"
              tabIndex={-1}
              aria-hidden="true"
              style={{ "--secondary-btn-bg": "transparent", "--secondary-btn-border": "#348dda", "--secondary-btn-text": "#348dda" } as React.CSSProperties}
              className="hero-action-link hero-mobile-hide"
            >
              <SecondaryButton size="lg" aria-label="Find My Product" className="w-full justify-center">
                Find My Product
              </SecondaryButton>
            </Link>
          </div>

          <div className="hero-trust hero-mobile-hide" aria-label="Trusted by pet parents across Indonesia.">
            <div className="flex -space-x-2 mr-3">
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-500">SI</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-sky/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-sky-700">MR</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-pink/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-pink-700">DW</span>
              </div>
            </div>
            <div>
              <span aria-hidden="true" role="img" aria-label="5 stars" className="hero-stars block mb-1">★★★★★</span>
              <span className="hero-trust-text">&quot;Wanginya tahan lama banget!&quot; <span className="opacity-75">— Sarah, JKT</span></span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* ---------- Layout ---------- */
        .hero { position: relative; }
        .hero-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 28px 24px 56px;
          min-height: calc(100vh - var(--nav-h, 76px));
        }

        /* ---------- Image: behind copy, melts into white ---------- */
        .hero-media {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .hero-img {
          /* Default (desktop): fade the left edge into white so the image merges with the copy */
          -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 30%, black 60%, black 100%);
          mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 30%, black 60%, black 100%);
        }

        /* ---------- Copy on top ---------- */
        .hero-copy {
          position: relative;
          z-index: 2;
          max-width: 560px;
          padding-top: 8px;
        }

        /* ---------- Eyebrow ---------- */
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid rgba(75,159,227,0.22);
          color: #2c7cb8;
          font-weight: 700;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          padding: 6px 11px;
          border-radius: 999px;
          margin-bottom: 16px;
        }

        /* ---------- Title ---------- */
        .hero-title { color: var(--navy); font-weight: 800; line-height: 1.02; margin-bottom: 18px; letter-spacing: -0.02em; }
        .hero-title-accent { color: #8eb6dc; }
        .h-display.hero-title { font-size: clamp(2.2rem, 8vw, 3rem); }

        /* ---------- Subtext ---------- */
        .hero-sub { color: var(--navy); max-width: 480px; opacity: 0.88; font-size: 0.92rem; line-height: 1.55; margin: 0; }

        /* ---------- Actions ---------- */
        .hero-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 26px; }
        .hero-action-link { width: 100%; }

        /* ---------- Trust row ---------- */
        .hero-trust { display: flex; flex-direction: row; align-items: center; gap: 10px; margin-top: 24px; color: var(--navy); font-weight: 600; font-size: 0.85rem; }
        .hero-stars { color: #fbb03b; letter-spacing: 2px; font-size: 1.1rem; }
        .hero-trust-text { opacity: 0.85; }

        /* ---------- Mobile: full-bg image, minimal copy pinned to bottom ---------- */
        @media (max-width: 767px) {
          .hero-inner {
            display: block;
            padding: 0;
            min-height: calc(100vh - var(--nav-h, 76px));
            position: relative;
          }
          .hero-media {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            transform: none !important;
          }
          /* Fill the viewport rather than letterboxing: a landscape photo
             contained in a portrait hero leaves ~300px of dead white between
             the image and the headline. The ::after fade below keeps the
             copy legible over the cropped photo. */
          .hero-img {
            object-fit: cover !important;
            object-position: center !important;
            -webkit-mask-image: none !important;
            mask-image: none !important;
          }
          /* Soft fade at the bottom so headline sits cleanly over white */
          .hero::after {
            content: "";
            position: absolute;
            left: 0; right: 0; bottom: 0;
            height: 40%;
            background: linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 40%, transparent 100%);
            z-index: 1;
            pointer-events: none;
          }
          .hero-copy {
            position: absolute;
            left: 0; right: 0; bottom: 0;
            z-index: 2;
            max-width: none;
            /* Clear the fixed .bottom-nav (61px), which otherwise covers the
               lower third of the Shop Products button. */
            padding: 0 24px calc(72px + env(safe-area-inset-bottom));
            padding-top: 40px;
          }
          .hero-mobile-hide { display: none !important; }
          .hero-title {
            font-size: clamp(2.1rem, 9vw, 2.9rem) !important;
            margin-bottom: 14px !important;
            text-shadow: 0 2px 24px rgba(255,255,255,0.6);
          }
          .hero-actions {
            flex-direction: row !important;
            gap: 12px;
            margin-top: 18px !important;
          }
          .hero-action-link { width: auto; flex: 1; }
        }

        /* ---------- Desktop ---------- */
        @media (min-width: 768px) {
          .hero-inner { padding: 48px 28px 64px; }
          .hero-media { width: 88%; }
          .hero-eyebrow { font-size: 0.74rem; padding: 7px 13px; margin-bottom: 20px; }
          .h-display.hero-title { font-size: clamp(2.8rem, 4.2vw, 4rem); }
          .hero-sub { font-size: 1.05rem; max-width: 520px; }
          .hero-actions { flex-direction: row; gap: 14px; margin-top: 28px; }
          .hero-action-link { width: auto; }
          .hero-trust { font-size: 0.92rem; margin-top: 28px; }
          .hero-stars { font-size: 1.15rem; }
          .hero-copy { padding-top: 12px; }
        }

        /* ---------- Large desktop ---------- */
        @media (min-width: 1200px) {
          .hero-inner { padding: 56px 28px 72px; }
          .h-display.hero-title { font-size: clamp(3.4rem, 4.5vw, 4.6rem); }
          .hero-media { width: 82%; }
        }

        /* ---------- Small phones ---------- */
        @media (max-width: 380px) {
          .hero-eyebrow { font-size: 0.62rem; padding: 5px 10px; }
          .h-display.hero-title { font-size: 2rem; }
          .hero-sub { font-size: 0.86rem; }
        }
        `
      }} />
    </section>
  );
}
