import { Icon } from "@/components/icons";

const TRUST = [
  { ic: "shield", tone: "sage", t: "Pet Safe", s: "Formulas" },
  { ic: "leaf", tone: "lavender", t: "Premium", s: "Ingredients" },
  { ic: "pin", tone: "sky", t: "Made in", s: "Indonesia" },
  { ic: "users", tone: "pink", t: "Trusted by", s: "Thousands" },
];

export function TrustBadges() {
  return (
    <div className="wrap" style={{ marginTop: -40, position: "relative", zIndex: 2 }}>
      <div className="trust reveal">
        {TRUST.map((b, i) => (
          <div className="trust-item" key={i}>
            <div className="trust-ic" style={{ background: `var(--${b.tone})` }}>
              <Icon name={b.ic as any} size={24} />
            </div>
            <div>
              <div className="t">{b.t}</div>
              <div className="s">{b.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

