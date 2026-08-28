import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Anti-bot timestamp token for the public lead form: minted server-side
// when the form renders (see ContactSection.tsx), verified server-side on
// submit. A submission arriving less than MIN_FILL_MS after mint is almost
// certainly scripted, not a human filling the form. HMAC-signed so a bot
// can't just forge an old-enough timestamp — it would need LEAD_FORM_SECRET,
// which never reaches the client.
const MIN_FILL_MS = 3000;

function getSecret(): string {
  const secret = process.env["LEAD_FORM_SECRET"];
  if (!secret) throw new Error("Missing LEAD_FORM_SECRET environment variable.");
  return secret;
}

function sign(timestamp: string): string {
  return createHmac("sha256", getSecret()).update(timestamp).digest("hex");
}

export function mintFormToken(): string {
  const timestamp = Date.now().toString();
  return `${timestamp}.${sign(timestamp)}`;
}

export function isFormTokenValid(token: string): boolean {
  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  const expected = sign(timestamp);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const elapsed = Date.now() - Number(timestamp);
  return elapsed >= MIN_FILL_MS;
}
