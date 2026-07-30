/**
 * Decorative marks from the ClariPet icon pack (128 viewBox, currentColor,
 * round caps). Purely ornamental — the parent supplies position, size and tint
 * via `.banner-deco` + `.deco-*` so one set of paths serves every banner.
 */
export function BannerDecor() {
  return (
    <>
      <span className="banner-deco deco-paw" aria-hidden="true">
        <svg viewBox="0 0 128 128" fill="none">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.8">
            <g transform="scale(0.8) translate(12.8 12.8)">
              <path d="M46 70C37 74 31 83 33 93C35 103 44 107 53 103C61 99 68 100 76 104" />
              <path d="M80 104C90 107 98 101 97 91C96 81 90 73 81 70C70 66 58 66 46 70" />
              <path d="M39 56C32 57 28 52 28 46C28 39 32 34 38 34C44 34 48 40 47 46C46 52 43 55 39 56" />
              <path d="M61 49C55 48 51 43 52 36C53 29 58 25 64 25C70 26 73 32 72 38C71 44 67 48 61 49" />
              <path d="M87 56C81 57 76 53 76 47C75 40 80 35 86 35C92 35 96 41 95 47C94 53 91 55 87 56" />
            </g>
          </g>
        </svg>
      </span>

      <span className="banner-deco deco-sparkle" aria-hidden="true">
        <svg viewBox="0 0 128 128" fill="none">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path strokeWidth="3.5" d="M47 22C49 38 56 48 69 54M73 57C59 63 52 72 49 88M46 83C44 71 38 63 27 58M31 54C42 49 47 41 48 27" />
            <path strokeWidth="2.8" d="M92 50C93 60 97 66 105 69M109 72C100 75 95 82 92 90M90 86C88 79 84 75 78 72M81 69C87 66 90 61 91 55" />
          </g>
        </svg>
      </span>

      <span className="banner-deco deco-heart" aria-hidden="true">
        <svg viewBox="0 0 128 128" fill="none">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2">
            <path d="M64 112C53 102 33 85 28 72C24 54 36 46 48 47C54 48 60 57 63 64" />
            <path d="M67 62C71 51 78 47 86 48C99 49 104 65 100 75C95 86 79 102 67 112" />
          </g>
        </svg>
      </span>

      <span className="banner-deco deco-trail" aria-hidden="true">
        <svg viewBox="0 0 128 128" fill="none">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M14 96C19 85 25 75 34 67" />
            <path d="M44 59C56 56 66 59 73 67" />
            <path d="M81 76C90 81 101 80 114 73" />
          </g>
        </svg>
      </span>
    </>
  );
}
