"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/data/products";
import { productSchema } from "@/lib/validation/product";

// Thin RPC wrapper so the admin dashboard (a Client Component, kept on
// TanStack Query for cache/invalidation) can call the server-only read.
export async function getProductsAction() {
  return getProducts();
}

// Defense in depth: RLS already allows any `authenticated` user to write
// products, so this explicit `has_role` check is the real gate — mirrors
// the pre-migration server-function behavior exactly.
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

  return supabase;
}

function revalidateProductPages() {
  revalidatePath("/admin/catalogo");
  revalidatePath("/produtos", "layout");
  revalidatePath("/");
}

export async function saveProduct(input: unknown) {
  const data = productSchema.parse(input);
  const supabase = await requireAdmin();

  if (data.id) {
    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        weight: data.weight,
        box_weight: data.boxWeight ?? null,
        image_url: data.image_url,
        category_id: data.categoryId,
        description: data.description ?? null,
        available: data.available,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw error;
  } else {
    // New products append to the end of their line's manual order rather
    // than defaulting to 0, which would keep jumping newest items to the
    // front of an already hand-ordered list.
    const { data: lastRow } = await supabase
      .from("products")
      .select("sort_order")
      .eq("category_id", data.categoryId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = (lastRow?.sort_order ?? -1) + 1;

    const { error } = await supabase.from("products").insert([
      {
        name: data.name,
        weight: data.weight,
        box_weight: data.boxWeight ?? null,
        image_url: data.image_url,
        category_id: data.categoryId,
        available: data.available,
        description: data.description ?? null,
        sort_order: nextSortOrder,
      },
    ]);
    if (error) throw error;
  }

  revalidateProductPages();
  return { success: true };
}

export async function reorderProducts(orderedIds: string[]) {
  const supabase = await requireAdmin();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("products").update({ sort_order: index }).eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  revalidateProductPages();
  return { success: true };
}

export async function toggleProductAvailability(id: string, available: boolean) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({ available, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  revalidateProductPages();
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;

  revalidateProductPages();
  return { success: true };
}
