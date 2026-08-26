import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

export interface BreadItem {
  id: string;
  name: string;
  weight: string;
  boxWeight?: string | null;
  image: string;
  categoryId: string;
  category: string;
  description?: string | null;
  available: boolean;
  sortOrder: number;
}

type ProductRow = Database["public"]["Tables"]["products"]["Row"] & {
  product_lines: { name: string } | null;
};

function mapProduct(row: ProductRow): BreadItem {
  return {
    id: row.id,
    name: row.name,
    weight: row.weight,
    boxWeight: row.box_weight,
    image: row.image_url,
    categoryId: row.category_id,
    category: row.product_lines?.name ?? "",
    description: row.description,
    available: row.available ?? true,
    sortOrder: row.sort_order,
  };
}

// Uses the admin (service-role) client because products are meant to be
// public-readable — same rationale RLS already grants via a public SELECT policy.
export async function getProducts(): Promise<BreadItem[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, product_lines(name)")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getProductsByLineId(lineId: string): Promise<BreadItem[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, product_lines(name)")
    .eq("category_id", lineId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getProductById(id: string): Promise<BreadItem | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, product_lines(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProduct(data) : null;
}
