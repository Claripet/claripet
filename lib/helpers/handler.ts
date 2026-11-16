import { ZodError } from "zod";
import { error, unauthorized, forbidden, serverError } from "./response";
import { logSecurityEvent } from "./securityLog";

// Generous for JSON payloads (cart/order/etc. bodies). Routes that accept
// files (app/api/admin/uploads) pass a larger maxBodyBytes: with this default
// applied to them, every product photo over 100 KB was rejected with a 413.
const MAX_BODY_BYTES = 100 * 1024;

export interface HandlerOptions {
  maxBodyBytes?: number;
}

/**
 * Wrap an API route handler with standard error handling and basic CSRF protection.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
  options: HandlerOptions = {},
) {
  const maxBodyBytes = options.maxBodyBytes ?? MAX_BODY_BYTES;
  return async (...args: Args): Promise<Response> => {
    try {
      const req = args[0] as Request;

      if (req && req.method && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        // Reject oversized bodies before they're read into memory.
        const contentLength = req.headers.get("content-length");
        if (contentLength && Number(contentLength) > maxBodyBytes) {
          return error("Request body too large", 413);
        }

        // Basic CSRF Protection: Ensure mutating requests come from our own origin
        const origin = req.headers.get("origin");
        const host = req.headers.get("host");

        if (origin && host) {
          try {
            const originHost = new URL(origin).host;
            // Webhooks don't send origin, but Midtrans calls won't pass through this wrapper
            // because they are custom structured, or we handle it explicitly.
            if (originHost !== host) {
              console.warn(`[CSRF Blocked] Origin: ${originHost}, Host: ${host}`);
              await logSecurityEvent("csrf_origin_blocked", { originHost, host, path: new URL(req.url).pathname });
              return error("Invalid Origin (CSRF)", 403);
            }
          } catch (e) {
            return error("Malformed Origin Header", 400);
          }
        }
      }

      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        const msg = err.issues.map((i) => i.message).join(", ");
        return error(msg, 422);
      }
      if (err instanceof Error) {
        if (err.message === "UNAUTHORIZED") return unauthorized();
        if (err.message === "FORBIDDEN") return forbidden();
      }
      console.error("[API ERROR]", err);
      return serverError();
    }
  };
}
