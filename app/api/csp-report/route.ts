import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/helpers/clientIp";
import { rateLimit } from "@/lib/helpers/rateLimit";

// Receives the browser's violation reports for the strict CSP on /checkout,
// /account and /admin (report-uri in lib/csp.ts) and writes a one-line
// summary to Workers Logs. Search the logs for "[csp]" before switching
// STRICT_CSP_ENFORCE on: anything listed there would be blocked once enforced.
const MAX_BYTES = 8 * 1024;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!(await rateLimit(`csp_${ip}`, 30, 60 * 1000))) {
    return new NextResponse(null, { status: 204 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BYTES) return new NextResponse(null, { status: 204 });

  try {
    const body = JSON.parse(raw);
    const reports = Array.isArray(body) ? body.map((r) => r?.body ?? r) : [body?.["csp-report"] ?? body];
    for (const r of reports.slice(0, 5)) {
      const directive = String(r?.["effective-directive"] ?? r?.effectiveDirective ?? r?.["violated-directive"] ?? "?").slice(0, 60);
      const blocked = String(r?.["blocked-uri"] ?? r?.blockedURL ?? "?").slice(0, 200);
      const page = String(r?.["document-uri"] ?? r?.documentURL ?? "?").replace(/[?#].*$/, "").slice(0, 200);
      const source = String(r?.["source-file"] ?? r?.sourceFile ?? "").slice(0, 200);
      console.warn(`[csp] ${directive} blocked=${blocked} page=${page}${source ? ` source=${source}` : ""}`);
    }
  } catch {
    // malformed report, ignore
  }
  return new NextResponse(null, { status: 204 });
}
