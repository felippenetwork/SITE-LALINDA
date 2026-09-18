import "server-only";
import { headers } from "next/headers";

// Extraído de lib/security/lead-rate-limit.ts (Sprint 6 bloco 3) — agora
// usado também por bradesco-webhook-rate-limit.ts, deixou de ser algo
// só de lead.
//
// Vercel overwrites x-forwarded-for at the edge and does not forward a
// client-supplied value, so this header is trustworthy there. In local dev
// (no proxy in front of `next dev`) it's absent — fall back to a fixed
// marker so rate limiting is still exercisable locally instead of silently
// no-op'ing.
export async function getClientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip || "127.0.0.1";
}
