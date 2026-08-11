/**
 * Curated subset of the ClariPet decorative icon pack (128 viewBox,
 * currentColor, round caps) — sourced from the brand's SVG asset drop.
 * Purely ornamental ambient marks; positioning/tint come from the CSS classes
 * the caller supplies (see .decor-mark / .decor-a..d in globals.css).
 */

type DecorPath = { d: string; strokeWidth: number };

export type DecorIconName =
  | "paw-mini"
  | "paw-soft"
  | "paw-walking"
  | "heart-mini"
  | "heart-small"
  | "heart-round"
  | "sparkle-mini"
  | "sparkle-four"
  | "sparkle-soft"
  | "trail-tiny"
  | "trail-curve"
  | "trail-sweep"
  | "leaf";

const ICONS: Record<DecorIconName, DecorPath[]> = {
  "paw-mini": [
    { strokeWidth: 3.6, d: "M46 70C37 74 31 83 33 93C35 103 44 107 53 103C61 99 68 100 76 104" },
    { strokeWidth: 3.6, d: "M80 104C90 107 98 101 97 91C96 81 90 73 81 70C70 66 58 66 46 70" },
    { strokeWidth: 3.6, d: "M39 56C32 57 28 52 28 46C28 39 32 34 38 34C44 34 48 40 47 46C46 52 43 55 39 56" },
    { strokeWidth: 3.6, d: "M61 49C55 48 51 43 52 36C53 29 58 25 64 25C70 26 73 32 72 38C71 44 67 48 61 49" },
    { strokeWidth: 3.6, d: "M87 56C81 57 76 53 76 47C75 40 80 35 86 35C92 35 96 41 95 47C94 53 91 55 87 56" },
  ],
  "paw-soft": [
    { strokeWidth: 4.6, d: "M46 70C37 74 31 83 33 93C35 103 44 107 53 103C61 99 68 100 76 104" },
    { strokeWidth: 4.6, d: "M80 104C90 107 98 101 97 91C96 81 90 73 81 70C70 66 58 66 46 70" },
    { strokeWidth: 4.6, d: "M39 56C32 57 28 52 28 46C28 39 32 34 38 34C44 34 48 40 47 46C46 52 43 55 39 56" },
    { strokeWidth: 4.6, d: "M61 49C55 48 51 43 52 36C53 29 58 25 64 25C70 26 73 32 72 38C71 44 67 48 61 49" },
    { strokeWidth: 4.6, d: "M87 56C81 57 76 53 76 47C75 40 80 35 86 35C92 35 96 41 95 47C94 53 91 55 87 56" },
  ],
  "paw-walking": [
    { strokeWidth: 6, d: "M46 70C37 74 31 83 33 93C35 103 44 107 53 103C61 99 68 100 76 104" },
    { strokeWidth: 6, d: "M80 104C90 107 98 101 97 91C96 81 90 73 81 70C70 66 58 66 46 70" },
    { strokeWidth: 6, d: "M39 56C32 57 28 52 28 46C28 39 32 34 38 34C44 34 48 40 47 46C46 52 43 55 39 56" },
    { strokeWidth: 6, d: "M61 49C55 48 51 43 52 36C53 29 58 25 64 25C70 26 73 32 72 38C71 44 67 48 61 49" },
    { strokeWidth: 6, d: "M87 56C81 57 76 53 76 47C75 40 80 35 86 35C92 35 96 41 95 47C94 53 91 55 87 56" },
  ],
  "heart-mini": [
    { strokeWidth: 3.2, d: "M64 112C53 102 33 85 28 72C24 54 36 46 48 47C54 48 60 57 63 64" },
    { strokeWidth: 3.2, d: "M67 62C71 51 78 47 86 48C99 49 104 65 100 75C95 86 79 102 67 112" },
  ],
  "heart-small": [
    { strokeWidth: 3.5, d: "M64 108C53 98 33 81 28 68C24 50 36 42 48 43C54 44 60 53 63 60" },
    { strokeWidth: 3.5, d: "M67 58C71 47 78 43 86 44C99 45 104 61 100 71C95 82 79 98 67 108" },
  ],
  "heart-round": [
    { strokeWidth: 4.2, d: "M64 102C53 92 33 75 28 62C24 44 36 36 48 37C54 38 60 47 63 54" },
    { strokeWidth: 4.2, d: "M67 52C71 41 78 37 86 38C99 39 104 55 100 65C95 76 79 92 67 102" },
  ],
  "sparkle-mini": [
    { strokeWidth: 3.5, d: "M64 38C66 40 73 52 84 61" },
    { strokeWidth: 3.5, d: "M88 64C76 70 67 83 64 90" },
    { strokeWidth: 3.5, d: "M61 85C58 81 50 72 43 65" },
    { strokeWidth: 3.5, d: "M46 61C52 54 60 43 62 43" },
  ],
  "sparkle-four": [
    { strokeWidth: 4, d: "M64 22C66 40 73 52 92 61" },
    { strokeWidth: 4, d: "M96 64C76 70 67 83 64 104" },
    { strokeWidth: 4, d: "M61 99C58 81 50 72 34 65" },
    { strokeWidth: 4, d: "M37 61C52 54 60 43 62 27" },
  ],
  "sparkle-soft": [
    { strokeWidth: 4.6, d: "M64 24C66 40 73 52 90 61" },
    { strokeWidth: 4.6, d: "M94 64C76 70 67 83 64 102" },
    { strokeWidth: 4.6, d: "M61 97C58 81 50 72 36 65" },
    { strokeWidth: 4.6, d: "M39 61C52 54 60 43 62 29" },
  ],
  "trail-tiny": [
    { strokeWidth: 4, d: "M21 75C28 68 35 64 43 62" },
    { strokeWidth: 4, d: "M52 60C62 61 71 64 80 70" },
  ],
  "trail-curve": [
    { strokeWidth: 4, d: "M14 91C17 82 20 74 25 67" },
    { strokeWidth: 4, d: "M31 58C36 51 42 46 49 42" },
    { strokeWidth: 4, d: "M59 37C67 34 75 34 83 36" },
    { strokeWidth: 4, d: "M93 39C101 43 108 48 114 55" },
  ],
  "trail-sweep": [
    { strokeWidth: 4, d: "M28 82C34 70 42 60 52 53" },
    { strokeWidth: 4, d: "M61 47C72 44 83 45 97 51" },
  ],
  leaf: [
    { strokeWidth: 3.8, d: "M35 91C47 72 58 54 82 34" },
    { strokeWidth: 3.8, d: "M48 71C39 68 35 61 36 54C45 54 52 58 55 64" },
    { strokeWidth: 3.8, d: "M63 57C62 47 67 39 76 36C80 45 76 53 69 59" },
  ],
};

export function DecorIcon({ name, className }: { name: DecorIconName; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 128 128" fill="none">
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {ICONS[name].map((p, i) => (
            <path key={i} strokeWidth={p.strokeWidth} d={p.d} />
          ))}
        </g>
      </svg>
    </span>
  );
}

const TONE: Record<DecorIconName, "paw" | "heart" | "sparkle" | "trail" | "leaf"> = {
  "paw-mini": "paw",
  "paw-soft": "paw",
  "paw-walking": "paw",
  "heart-mini": "heart",
  "heart-small": "heart",
  "heart-round": "heart",
  "sparkle-mini": "sparkle",
  "sparkle-four": "sparkle",
  "sparkle-soft": "sparkle",
  "trail-tiny": "trail",
  "trail-curve": "trail",
  "trail-sweep": "trail",
  leaf: "leaf",
};

/**
 * Four ambient marks pinned to a section's own padding band (see
 * .decor-a/.decor-b/.decor-c/.decor-d in globals.css) — corner "a" (top-left)
 * is the only one near the top, since top-right is where a .sec-head "View
 * All" link usually sits. Pass any four DecorIconName values for variety
 * between sections so the whole site doesn't repeat the same four icons.
 */
export function SectionDoodles({
  marks,
}: {
  marks: [DecorIconName, DecorIconName, DecorIconName, DecorIconName];
}) {
  const slots = ["decor-a", "decor-b", "decor-c", "decor-d"];
  return (
    <>
      {marks.map((name, i) => (
        <DecorIcon key={i} name={name} className={`decor-mark ${slots[i]} tone-${TONE[name]}`} />
      ))}
    </>
  );
}
