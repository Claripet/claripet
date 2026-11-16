// Reads NEXT_PUBLIC_GA_MEASUREMENT_ID so local/staging builds without an ID
// render nothing instead of shipping a broken gtag call, mirroring the
// google-site-verification fallback in app/layout.tsx.
//
// Deliberately plain <script> tags, not next/script: every next/script
// strategy (afterInteractive, beforeInteractive) routes the tag through
// Next's own script-loading machinery, so the raw server-rendered HTML never
// contains a literal `<script src="https://www.googletagmanager.com/...">` —
// afterInteractive leaves only a <link rel="preload">, beforeInteractive
// leaves a `__next_s` queue push. Google's tag-setup checker fetches the raw
// HTML looking for that literal tag, so both strategies reported the tag as
// "not detected" even though it worked fine in a real browser. A bare
// <script> element is emitted by React as real markup instead.
import { gaInlineSnippet } from "@/lib/gaSnippet";

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{ __html: gaInlineSnippet(measurementId) }}
      />
    </>
  );
}
