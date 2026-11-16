// The inline gtag bootstrap. Shared by components/GoogleAnalytics.tsx (which
// renders it) and lib/csp.ts (which allows it by its SHA-256 hash on the
// strict-CSP pages). Any change to this string changes the hash automatically,
// but it must stay byte-identical between the two, so only build it here.
export function gaInlineSnippet(measurementId: string): string {
  return `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `;
}
