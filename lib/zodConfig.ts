import { z } from "zod";

// zod 4 probes for eval support with `Function("")` the first time an object
// schema is used, to decide whether to JIT-compile parsers. Under the strict
// CSP on /checkout, /account and /admin that probe is a (caught, harmless)
// violation that would show up in every CSP report. jitless skips the probe;
// the interpreted parsers are plenty fast for form-sized input.
z.config({ jitless: true });
