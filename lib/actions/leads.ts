"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getLeads } from "@/lib/data/leads";
import { leadSchema } from "@/lib/validation/lead";
import { isFormTokenValid } from "@/lib/security/lead-form-token";
import { checkLeadRateLimit, getClientIp } from "@/lib/security/lead-rate-limit";

// Thin RPC wrapper for the admin dashboard's useQuery — `getLeads` itself
// still enforces the `has_role` check, this adds no extra trust.
export async function getLeadsAction() {
  return getLeads();
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
  return { success: true };
}
