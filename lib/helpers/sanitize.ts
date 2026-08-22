/**
 * Minimal denylist-based stripping for plain-text fields (reviews, articles,
 * contact messages). This is NOT a full HTML sanitizer/parser — these fields
 * are rendered as plain React text (auto-escaped), so this is defense in
 * depth only, to keep obviously dangerous markup out of storage.
 */
export function stripDangerousMarkup(input: string): string {
  return input
    // <script ...>...</script> blocks (including malformed/self-closing)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*\/?>/gi, "")
    // <iframe ...>...</iframe> blocks (including malformed/self-closing)
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/<iframe\b[^>]*\/?>/gi, "")
    // inline event-handler attributes: onclick="...", onerror='...', onload=...
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    // javascript: URI prefixes
    .replace(/javascript\s*:/gi, "");
}
