import { supabaseAdmin } from "@/lib/supabase/admin";

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image: string;
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const { data, error } = await supabaseAdmin
    .from("timeline_events")
    .select("*")
    .order("year", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((e) => ({
    year: e.year,
    title: e.title,
    description: e.description,
    image: e.image_url,
  }));
}
