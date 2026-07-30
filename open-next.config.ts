// open-next.config.ts — created for the @opennextjs/cloudflare adapter.
// No incremental-cache override is set, so ISR/data-cache entries live only
// for the lifetime of a single Worker instance. Add the R2-backed cache
// (see https://opennext.js.org/cloudflare/caching) once that's needed.
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig();
