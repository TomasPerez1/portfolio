import { Resend } from "resend";
import type { EmailData } from "./types";
import { validateEmailDeliverable } from "../_lib/email-validation";

const { RESEND_API_KEY, RESEND_FROM, OWNER_EMAIL } = process.env;

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const ipHits = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    const oldest = hits[0];
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { ok: false, retryAfterSec };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    if (!RESEND_API_KEY) {
      return Response.json({ error: "Server misconfigured: missing RESEND_API_KEY" }, { status: 500 });
    }

    const body: EmailData = await request.json();
    const website = body.website;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (website && website.trim().length > 0) {
      return Response.json({ ok: true });
    }

    if (!name || !email || !subject || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const limit = checkRateLimit(ip);
    if (!limit.ok) {
      return Response.json(
        { error: "RATE_LIMIT", retryAfterSec: limit.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    const emailCheck = await validateEmailDeliverable(email);
    if (!emailCheck.ok) {
      return Response.json({ error: emailCheck.code }, { status: 400 });
    }

    const resend = new Resend(RESEND_API_KEY);
    const from = RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";
    const to = OWNER_EMAIL ?? "tomas.perez.developer@gmail.com";

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `
        <h2>${safeName}</h2>
        <p><a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <hr/>
        <p style="white-space:pre-wrap">${safeMessage}</p>
      `,
    });

    if (error) {
      return Response.json({ error: error.message ?? "Resend send failed" }, { status: 502 });
    }

    return Response.json({ ok: true, id: data?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
