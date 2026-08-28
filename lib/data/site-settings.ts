import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

// Fixed row id — `site_settings` is a singleton table (see migration 011).
export const SITE_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export interface HomeStat {
  value: number;
  label: string;
}

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  gtmId: string | null;
  metaPixelId: string | null;
  // Always exactly 3 — the home page's stat counters (StatsSection).
  stats: [HomeStat, HomeStat, HomeStat];
}

type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

function mapSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
    gtmId: row.gtm_id,
    metaPixelId: row.meta_pixel_id,
    stats: [
      { value: row.stat_1_value, label: row.stat_1_label },
      { value: row.stat_2_value, label: row.stat_2_label },
      { value: row.stat_3_value, label: row.stat_3_label },
    ],
  };
}

// Uses the admin (service-role) client because this data is meant to be
// public-readable — same rationale as getProducts()/getProductLines().
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", SITE_SETTINGS_ID)
    .single();

  if (error) throw error;
  return mapSiteSettings(data);
}
