import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 3;

// Returns true if this IP is still under the cap and the attempt was
// recorded; false if it should be rejected. Never throws — a rate-limit
// infra hiccup (DB blip, unexpected error) fails OPEN so a real lead is
// never lost over an anti-abuse mechanism, consistent with how a Resend
// outage must not block lead creation either.
export async function checkLeadRateLimit(ip: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();

    // Opportunistic cleanup: this table only ever needs to answer "how many
    // in the last hour," so anything older is dead weight. No cron needed.
    await supabaseAdmin.from("leads_rate_limit").delete().lt("created_at", since);

    const { count, error: countError } = await supabaseAdmin
      .from("leads_rate_limit")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if (countError) throw countError;

    if ((count ?? 0) >= MAX_PER_WINDOW) return false;

    const { error: insertError } = await supabaseAdmin.from("leads_rate_limit").insert([{ ip }]);
    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error("[lead-rate-limit] failed, failing open:", error);
    return true;
  }
}
