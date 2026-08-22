import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

export interface BreadItem {
  id: string;
  name: string;
  weight: string;
  boxWeight?: string | null;
  image: string;
  category: string;
  description?: string | null;
  available: boolean;
}

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

function mapProduct(row: ProductRow): BreadItem {
  return {
    id: row.id,
    name: row.name,
    weight: row.weight,
    boxWeight: row.box_weight,
    image: row.image_url,
    category: row.category,
    description: row.description,
    available: row.available ?? true,
  };
}

// Uses the admin (service-role) client because products are meant to be
// public-readable — same rationale RLS already grants via a public SELECT policy.
export async function getProducts(): Promise<BreadItem[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getProductById(id: string): Promise<BreadItem | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProduct(data) : null;
}
