import { promises as dns } from "node:dns";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "yopmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "fakeinbox.com",
  "getnada.com",
  "maildrop.cc",
  "sharklasers.com",
  "dispostable.com",
  "mintemail.com",
  "tempinbox.com",
  "tempr.email",
  "mohmal.com",
  "emailondeck.com",
  "tempmailaddress.com",
  "discard.email",
  "spam4.me",
  "mytrashmail.com",
  "harakirimail.com",
  "anonbox.net",
]);

export type EmailValidationResult =
  | { ok: true }
  | { ok: false; code: "INVALID_EMAIL_FORMAT" | "DISPOSABLE_EMAIL" | "INVALID_EMAIL_DOMAIN" };

const SYNTAX_RE = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;

export async function validateEmailDeliverable(email: string): Promise<EmailValidationResult> {
  const match = SYNTAX_RE.exec(email);
  if (!match) return { ok: false, code: "INVALID_EMAIL_FORMAT" };

  const domain = match[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, code: "DISPOSABLE_EMAIL" };

  try {
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) return { ok: false, code: "INVALID_EMAIL_DOMAIN" };
    return { ok: true };
  } catch {
    return { ok: false, code: "INVALID_EMAIL_DOMAIN" };
  }
}
