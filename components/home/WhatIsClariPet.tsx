import Link from "next/link";

/**
 * Plain-English statement of what this site is, who it serves, and why it asks
 * for a Google sign-in.
 *
 * Exists for Google's OAuth brand verification, which rejected the site twice:
 * once for a home page that "does not explain the purpose of your app", once
 * for an app name that "does not match the app name on your home page".
 *
 * Three properties are load-bearing — do not drop them when restyling:
 *  1. It renders on every viewport. The hero's purpose line is hidden below
 *     768px and its <h1> is sr-only, so a reviewer on a phone saw only a
 *     slogan and Indonesian copy.
 *  2. It is server-rendered and statically imported, so the text is present in
 *     the initial HTML that Google's automated scanner reads.
 *  3. It spells the name exactly "ClariPet", matching the Google Cloud console
 *     App name field character for character.
 */

const STEPS = [
  {
    title: "Browse",
    desc: "Shop perfumes, shampoos, vitamins, oral care and skin care for cats and dogs.",
  },
  {
    title: "Order",
    desc: "Check out securely and pick the courier and delivery speed that suit you.",
  },
  {
    title: "Track",
    desc: "Follow your delivery and revisit past orders from your account page.",
  },
];

export function WhatIsClariPet() {
  return (
    <section
      aria-labelledby="what-is-claripet"
      // Rhythm comes from `.section`, not an inline `padding`. Inline styles are
      // unreachable by media queries, so the old 64px stayed put on a phone
      // while every neighbouring section shrank to 40px.
      className="section"
      style={{ background: "var(--page)" }}
    >
      <div className="wrap">
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2
            id="what-is-claripet"
            className="font-bold"
            style={{
              fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)",
              color: "#1B2A4A",
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            What is ClariPet?
          </h2>

          <p
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.125rem)",
              color: "#5A6072",
              lineHeight: 1.65,
              marginBottom: 14,
            }}
          >
            <strong style={{ color: "#1B2A4A" }}>ClariPet</strong> is an online
            pet care shop based in Indonesia. We sell premium grooming, hygiene
            and health products &mdash; perfumes, shampoos, vitamins, oral care
            and skin care &mdash; made to be gentle and safe for cats and dogs.
          </p>

          <p
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)",
              color: "#5A6072",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Create a ClariPet account, or sign in with Google, to save your cart
            and wishlist, check out faster, and track your orders. Signing in
            with Google only shares your name and email address so we can
            identify your account &mdash; ClariPet never posts on your behalf
            and never reads your Google data.
          </p>
        </div>

        <ol
          className="what-is-steps"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 28,
            listStyle: "none",
            maxWidth: 900,
            margin: "40px auto 0",
            padding: 0,
          }}
        >
          {STEPS.map((step, i) => (
            <li key={step.title} style={{ textAlign: "center" }}>
              <div
                aria-hidden
                className="flex items-center justify-center mx-auto"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "1px solid rgba(75,159,227,0.28)",
                  color: "#2c7cb8",
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {i + 1}
              </div>
              <h3
                className="font-semibold"
                style={{ fontSize: "1rem", color: "#1B2A4A", marginBottom: 6 }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#5A6072", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </li>
          ))}
        </ol>

        <p style={{ textAlign: "center", marginTop: 32 }}>
          <Link
            href="/about"
            style={{ color: "#2c7cb8", fontWeight: 600, textDecoration: "underline" }}
          >
            More about ClariPet
          </Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 639px) {
          .what-is-steps { grid-template-columns: 1fr !important; gap: 22px !important; }
        }
      `}} />
    </section>
  );
}
