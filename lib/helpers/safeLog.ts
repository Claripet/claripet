export const safeLog = {
  error: (context: string, err: any) => {
    let msg = "Unknown error";
    if (err instanceof Error) {
      msg = err.message;
    } else if (typeof err === "string") {
      msg = err;
    } else {
      try {
        msg = JSON.stringify(err);
      } catch {
        msg = "Error could not be stringified";
      }
    }

    // Strip strings longer than 200 chars to avoid memory exhaustion/log bloat
    if (msg.length > 200) {
      msg = msg.substring(0, 200) + "... [TRUNCATED]";
    }

    // Redact potential PII (emails and basic phone patterns)
    msg = msg.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
    msg = msg.replace(/\+?[0-9 ()-]{8,20}/g, "[REDACTED_PHONE]");

    console.error(`[${context}]`, msg);
  }
};