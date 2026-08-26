"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings, SITE_SETTINGS_ID } from "@/lib/data/site-settings";
import { siteSettingsSchema } from "@/lib/validation/site-settings";

export async function getSiteSettingsAction() {
  return getSiteSettings();
}

// Defense in depth: RLS already allows any `authenticated` user to write
// site_settings, so this explicit `has_role` check is the real gate.
async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (roleError || !hasRole) throw new Error("Forbidden: Admin role required");

  return { supabase, userId: user.id };
}

export async function saveSiteSettings(input: unknown) {
  const data = siteSettingsSchema.parse(input);
  const { supabase, userId } = await requireAdmin();

  const { error } = await supabase
    .from("site_settings")
    .update({
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      instagram_url: data.instagramUrl || null,
      facebook_url: data.facebookUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", SITE_SETTINGS_ID);
  if (error) throw error;

  await supabase.from("audit_logs").insert({
    user_id: userId,
    action: "UPDATE",
    target_table: "site_settings",
    target_id: SITE_SETTINGS_ID,
  });

  revalidatePath("/admin/config");
  revalidatePath("/");
  return { success: true };
}
