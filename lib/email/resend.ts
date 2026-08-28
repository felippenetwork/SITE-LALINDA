import "server-only";
import { Resend } from "resend";

let _resend: Resend | undefined;

// Returns null (not a throw) when RESEND_API_KEY is unset — lead
// notification email is a best-effort side effect, never a hard
// requirement for the site to run. See send-lead-notification.ts.
export function getResendClient(): Resend | null {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return null;

  if (!_resend) _resend = new Resend(apiKey);
  return _resend;
}
