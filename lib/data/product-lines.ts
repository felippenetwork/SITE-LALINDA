import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

export interface ProductLine {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  available: boolean;
}

type ProductLineRow = Database["public"]["Tables"]["product_lines"]["Row"];

function mapProductLine(row: ProductLineRow): ProductLine {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image_url,
    sortOrder: row.sort_order,
    available: row.available,
  };
}

// Uses the admin (service-role) client because lines are meant to be
// public-readable — same rationale as getProducts()/getTimelineEvents().
export async function getProductLines(): Promise<ProductLine[]> {
  const { data, error } = await supabaseAdmin
    .from("product_lines")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProductLine);
}

export async function getProductLineBySlug(slug: string): Promise<ProductLine | null> {
  const { data, error } = await supabaseAdmin
    .from("product_lines")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProductLine(data) : null;
}
