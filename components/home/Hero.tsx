import Link from "next/link";
import Image from "next/image";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        {/* Image sits behind the copy and melts into the panel on the left edge */}
        <div className="hero-media" aria-hidden="false" style={{ transform: "translateX(215px)" }}>
          <Image
            src="/images/hero-home.jpg"
            alt="A cat and a golden retriever resting on a sofa beside their owner at home"
            fill
            priority
            sizes="(max-width: 768px) 160vw, 1600px"
            className="hero-img"
          />
        </div>

        {/* Copy floats on top */}
        <div className="hero-copy">
          <span className="hero-eyebrow hero-mobile-hide">
            <span aria-hidden="true">🐾</span>
            Better Care for Every Pet
          </span>
          <h1 className="sr-only">ClariPet - Premium Pet Care, Grooming &amp; Health Products</h1>
          <h2 className="h-display hero-title">
            Helping You<br />
            Help Them.<span className="hero-title-accent">♡</span>
          </h2>
          {/* Visible, English statement of what this site is. Google's OAuth
              brand review requires the home page to explain the app's purpose,
              and a reviewer who does not read the Indonesian copy below would
              otherwise see only the slogan above. Keep this in sync with the
              sr-only h1 and the metadata description. */}
          <p className="hero-purpose hero-mobile-hide">
            ClariPet is a pet care brand dedicated to thoughtful, effective products for everyday grooming, hygiene, health and wellness.
          </p>
          <p className="lead hero-sub hero-mobile-hide">
            Perawatan hewan peliharaan yang lembut dan efektif untuk memudahkan rutinitas grooming, menjaga kesehatan, dan mempererat ikatan setiap hari.
          </p>

          <div className="hero-actions">
            <Link
              href="/shop"
              style={{ "--primary-btn-bg": "#348dda", "--primary-btn-border": "#348dda" } as React.CSSProperties}
              className="hero-action-link"
            >
              <PrimaryButton size="lg" icon="arrowRight" className="w-full justify-center">
                Belanja Produk
              </PrimaryButton>
            </Link>
            <Link
              href="/quiz"
              style={{ "--secondary-btn-bg": "transparent", "--secondary-btn-border": "#348dda", "--secondary-btn-text": "#348dda" } as React.CSSProperties}
              className="hero-action-link hero-mobile-hide"
            >
              <SecondaryButton size="lg" className="w-full justify-center">
                Temukan Produk Saya
              </SecondaryButton>
            </Link>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* ---------- Layout ---------- */
        /* The hero photo is an opaque JPEG-style PNG with a white interior, so
           the panel can only be blue where the photo isn't: pastel blue behind
           the copy on the left, resolving to white under the photo on the right
           (the .hero-img mask fades its left edge across the same span). The
           first layer then melts the whole band into the page canvas at the
           bottom, so there is no hard edge against the section below. */
        .hero {
          position: relative;
          background:
            linear-gradient(to bottom, transparent 58%, var(--page) 100%),
            linear-gradient(100deg,
              var(--panel) 0%,
              var(--panel) 24%,
              #fff 60%,
              #fff 100%);
        }
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
        /* The hero band is far taller than the 3:2 photo, so object-fit cover
           crops it horizontally, and how much survives depends on the viewport.
           Narrow
           screens keep only ~60% of the frame, so they centre it to hold both
           animals; wide screens keep ~82% and can anchor left, which brings the
           cat clear of the masked edge without losing the dog. See the
           min-width: 1200px block. */
        .hero-img {
          object-fit: cover;
          object-position: center;
          /* Fade the left edge so the image melts into the copy panel. */
          -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.30) 26%, black 52%, black 100%);
          mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.30) 26%, black 52%, black 100%);
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

        /* ---------- Purpose line (English) ---------- */
        .hero-purpose {
          color: var(--navy);
          max-width: 480px;
          font-weight: 600;
          font-size: 0.98rem;
          line-height: 1.5;
          margin: 0 0 10px;
        }

        /* ---------- Subtext ---------- */
        .hero-sub { color: var(--navy); max-width: 480px; opacity: 0.88; font-size: 0.92rem; line-height: 1.55; margin: 0; }

        /* ---------- Actions ---------- */
        .hero-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 26px; }
        .hero-action-link { width: 100%; }

        /* ---------- Mobile: full-bg image, minimal copy pinned to bottom ---------- */
        @media (max-width: 767px) {
          /* Was a full 100vh-minus-nav panel, so the phone opened on nothing
             but hero with no hint that content continued below the fold. A
             fixed band shows the photo whole and still lets the next section
             peek, so the page reads as scrollable. */
          .hero-inner {
            display: block;
            padding: 0;
            height: 76vw;
            min-height: 320px;
            max-height: 440px;
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
          /* The photo covers the whole band on mobile, so the horizontal blue
             never shows — the fade below the copy carries the colour instead
             and hands off to the page canvas. */
          .hero { background: var(--page); }
          /* Soft fade at the bottom so headline sits cleanly over the canvas.
             The hero photo is a dark interior shot, so the fade has to carry
             most of the contrast here: navy on the unfaded photo measures as
             low as 1.3:1, well under the 3:1 large-text minimum. These stops
             keep every part of the headline above 3:1 while still letting the
             photo read through above it. */
          .hero::after {
            content: "";
            position: absolute;
            left: 0; right: 0; bottom: 0;
            height: 54%;
            background: linear-gradient(to top, var(--page) 0%, var(--page) 26%, rgba(239, 244, 252, 0.92) 52%, transparent 100%);
            z-index: 1;
            pointer-events: none;
          }
          /* The hero no longer fills the viewport, so it no longer needs to
             reserve room for the fixed .bottom-nav — that bar now sits over
             whatever has scrolled to the bottom of the screen, not over this
             panel. Reserving 72px here would just be dead space. */
          .hero-copy {
            position: absolute;
            left: 0; right: 0; bottom: 0;
            z-index: 2;
            max-width: none;
            padding: 24px 16px 18px;
          }
          .hero-mobile-hide { display: none !important; }
          .hero-title {
            font-size: 26px !important;
            line-height: 1.15 !important;
            margin-bottom: 10px !important;
            text-shadow: 0 2px 24px rgba(255,255,255,0.6);
          }
          .hero-actions {
            flex-direction: row !important;
            gap: 10px;
            margin-top: 14px !important;
          }
          .hero-action-link { width: auto; flex: 1; }
        }

        /* ---------- Desktop ---------- */
        @media (min-width: 768px) {
          .hero-inner { padding: 48px 28px 64px; }
          .hero-media { width: 88%; }
          .hero-eyebrow { font-size: 0.74rem; padding: 7px 13px; margin-bottom: 20px; }
          .h-display.hero-title { font-size: clamp(2.8rem, 4.2vw, 4rem); }
          .hero-purpose { font-size: 1.05rem; max-width: 520px; margin-bottom: 12px; }
          /* Stops short of .hero-purpose so the line ends before the photo
             turns fully opaque — at 520px its tail fell to 4.1:1 on navy. */
          .hero-sub { font-size: 1.05rem; max-width: 468px; }
          .hero-actions { flex-direction: row; gap: 14px; margin-top: 28px; }
          .hero-action-link { width: auto; }
          .hero-copy { padding-top: 12px; }
        }

        /* ---------- Large desktop ---------- */
        @media (min-width: 1200px) {
          .hero-inner { padding: 56px 28px 72px; }
          .h-display.hero-title { font-size: clamp(3.4rem, 4.5vw, 4.6rem); }
          /* Bleed the photo out of the centred content column to the right
             edge of the screen. .hero-media is absolutely positioned inside
             .hero-inner (a .wrap), so without this it stops at the column and
             leaves a white gap on wide monitors. 100% here is the wrap's width,
             so the offset is exactly half the leftover viewport. body has
             overflow-x: hidden, so the bleed cannot create a scrollbar. */
          .hero-media {
            width: auto;
            left: 34%;
            right: calc((100% - 100vw) / 2);
            transform: none !important;
          }
          /* Enough of the frame survives here to show the cat and the dog, so
             anchor left and let the fade resolve early — centred + a wide fade
             buries the cat entirely. */
          .hero-img {
            object-position: left center;
            -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 12%, black 30%, black 100%);
            mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 12%, black 30%, black 100%);
          }
        }

        /* ---------- Small phones ---------- */
        @media (max-width: 380px) {
          .hero-eyebrow { font-size: 0.62rem; padding: 5px 10px; }
          /* Matches the !important on the ≤767 rule it has to override. */
          .h-display.hero-title { font-size: 23px !important; }
          .hero-sub { font-size: 0.86rem; }
        }
        `
      }} />
    </section>
  );
}
