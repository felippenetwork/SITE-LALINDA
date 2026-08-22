"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getLeads } from "@/lib/data/leads";
import { leadSchema } from "@/lib/validation/lead";

// Thin RPC wrapper for the admin dashboard's useQuery — `getLeads` itself
// still enforces the `has_role` check, this adds no extra trust.
export async function getLeadsAction() {
  return getLeads();
}

export async function submitLead(input: unknown) {
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
