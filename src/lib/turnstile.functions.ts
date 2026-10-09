import { createServerFn } from "@tanstack/react-start";

// Cloudflare's official always-pass test keys.
// Used as a fallback when real TURNSTILE_* secrets are not configured
// or contain placeholder values. Swap in real keys from
// https://dash.cloudflare.com → Turnstile for production security.
const TEST_SITE_KEY = "1x00000000000000000000AA";
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

function isValidTurnstileKey(k: string | undefined): k is string {
  return !!k && /^0x4/.test(k) && k.length >= 20;
}

export const getTurnstileSiteKey = createServerFn({ method: "GET" }).handler(
  async () => {
    const configured = process.env.TURNSTILE_SITE_KEY;
    return { siteKey: isValidTurnstileKey(configured) ? configured : TEST_SITE_KEY };
  },
);

export const verifyTurnstile = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) => {
    if (!input || typeof input.token !== "string" || input.token.length < 5) {
      throw new Error("Missing captcha token");
    }
    return { token: input.token };
  })
  .handler(async ({ data }) => {
    const configured = process.env.TURNSTILE_SECRET_KEY;
    const secret = isValidTurnstileKey(configured) ? configured : TEST_SECRET_KEY;

    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", data.token);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const json = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (!json.success) {
      throw new Error("Captcha verification failed");
    }
    return { ok: true };
  });
