/** @type {import('next').NextConfig} */

// Security headers applied to every response.
// CSP is intentionally permissive for Midtrans Snap (requires app.sandbox.midtrans.com
// and app.midtrans.com scripts + connect) and Supabase (wss + https for realtime).
// Tighten further before production launch by removing 'unsafe-inline' once you add
// a nonce-based approach or hash inline styles.

// Next.js's dev server (React Refresh / webpack HMR) compiles and evaluates code
// with eval(), uses blob: workers, and opens a localhost websocket for hot reload.
// A production-strict script-src/connect-src therefore blocks hydration in dev,
// which silently kills all client interactivity (onClick handlers never attach).
// Relax those two directives in development only.
const isDev = process.env.NODE_ENV !== "production";

const scriptSrc = [
  "script-src 'self' 'unsafe-inline'",
  isDev ? "'unsafe-eval' blob:" : "",
  "https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com/gsi/client https://challenges.cloudflare.com",
]
  .filter(Boolean)
  .join(" ");

const connectSrc = [
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com/gsi/ https://challenges.cloudflare.com",
  isDev ? "ws://localhost:* http://localhost:*" : "",
]
  .filter(Boolean)
  .join(" ");

const securityHeaders = [
  // Prevent embedding in foreign iframes (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop browsers sniffing the MIME type of responses
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin as referrer on cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Enforce HTTPS for 2 years (including sub-domains). Enable only when you
  // are fully on HTTPS — safe for Vercel / any TLS-terminated host.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Permissions: disable powerful browser features this app doesn't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Content Security Policy
  // - Supabase realtime uses wss:// and https://
  // - Midtrans Snap loads a script from app.sandbox.midtrans.com (test) /
  //   app.midtrans.com (production) and POSTs to those origins
  // - Google Identity Services (GSI) for Google Sign-In button and One Tap
  // - RajaOngkir API calls are server-side only (not listed here)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: own origin + Midtrans Snap widget + Google Identity Services (+ eval/blob in dev for HMR)
      scriptSrc,
      // Styles: own origin + inline styles (Tailwind generates inline styles in some cases) + Google GSI styles
      "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
      // Images: own origin + Supabase storage + Midtrans QR + Google avatars
      "img-src 'self' data: https://*.supabase.co https://api.sandbox.midtrans.com https://api.midtrans.com https://*.googleusercontent.com https://lh3.googleusercontent.com",
      // Fonts: own origin + Google fonts
      "font-src 'self' https://fonts.gstatic.com",
      // XHR/fetch: own origin + Supabase REST/Auth/Realtime + Midtrans + Google (+ ws in dev for HMR)
      connectSrc,
      // Frames: Midtrans Snap renders an iframe for the payment sheet + Google GSI iframe + Turnstile challenge iframe
      "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com/ https://challenges.cloudflare.com",
      // Everything else denied
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,

  // Drop `X-Powered-By: Next.js`. It tells an attacker the framework and, by
  // implication, which CVE set to try, and buys nothing in return.
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Compress responses with gzip (serves dev proxy too; production CDN can override)
  compress: true,

  experimental: {
    // Tree-shake lucide-react so only the icons actually imported end up in
    // the client bundle.  Without this Next.js bundles the full icon library
    // (~300 KB raw / ~60 KB gzip) even though only ~30 icons are used.
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hoovfmyaurswccarygki.supabase.co",
      },
    ],
  },
};

export default nextConfig;
