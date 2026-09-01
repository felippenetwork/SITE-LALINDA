"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getLeads, getLeadById } from "@/lib/data/leads";
import { leadSchema } from "@/lib/validation/lead";
import { isFormTokenValid } from "@/lib/security/lead-form-token";
import { checkLeadRateLimit, getClientIp } from "@/lib/security/lead-rate-limit";
import { sendLeadNotificationEmail } from "@/lib/email/send-lead-notification";
import { getSiteSettings } from "@/lib/data/site-settings";

// Thin RPC wrapper for the admin dashboard's useQuery — `getLeads` itself
// still enforces the `has_role` check, this adds no extra trust.
export async function getLeadsAction() {
  return getLeads();
}

// Used only to pre-fill the "Converter em cliente" form on /admin/clientes.
export async function getLeadByIdAction(id: string) {
  return getLeadById(id);
}

interface SubmitLeadMeta {
  // Decoy field a bot's auto-fill fills in and a human never sees (hidden
  // by CSS in LeadForm.tsx, not by `type="hidden"`). Non-empty = bot.
  honeypot: string;
  // HMAC-signed render timestamp minted by ContactSection.tsx. Missing,
  // forged, or submitted under 3s after render = bot.
  formToken: string;
}

// A discriminated result rather than a thrown error for the rate-limit
// case: whether a Server Action's thrown error `.message` survives to the
// client is a serialization detail worth not depending on. An explicit
// return value is unambiguous regardless.
type SubmitLeadResult = { success: true } | { success: false; reason: "rate_limited" };

export async function submitLead(input: unknown, meta: SubmitLeadMeta): Promise<SubmitLeadResult> {
  // Bot signals: never reveal detection to the client — return the exact
  // same shape a real success would, and skip the DB entirely.
  if (meta.honeypot.length > 0 || !isFormTokenValid(meta.formToken)) {
    return { success: true };
  }

  const ip = await getClientIp();
  const allowed = await checkLeadRateLimit(ip);
  if (!allowed) return { success: false, reason: "rate_limited" };

  const data = leadSchema.parse(input);

  const { error } = await supabaseAdmin.from("leads").insert([
    {
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      interest: data.interest ?? null,
      message: data.message ?? null,
    },
  ]);

  if (error) throw error;

  // Scheduled to run after the response is already sent — never delays
  // this action's return, and (per Next.js docs) runs even if something
  // later in this function were to throw. Resend/network failures are
  // caught and logged inside sendLeadNotificationEmail itself; nothing
  // here can turn an email problem into a broken lead submission.
  after(async () => {
    try {
      const host = (await headers()).get("host") ?? "";
      const protocol = host.startsWith("localhost") ? "http" : "https";
      const settings = await getSiteSettings();

      await sendLeadNotificationEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        interest: data.interest,
        message: data.message,
        to: settings.contactEmail,
        adminUrl: `${protocol}://${host}/admin/leads`,
      });
    } catch (error) {
      console.error("[lead-notification] failed before send could be attempted:", error);
    }
  });

  return { success: true };
}
