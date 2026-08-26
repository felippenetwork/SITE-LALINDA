"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProductLines } from "@/lib/data/product-lines";
import { productLineSchema } from "@/lib/validation/product-line";

// Thin RPC wrapper so the admin dashboard (a Client Component, kept on
// TanStack Query for cache/invalidation) can call the server-only read.
export async function getProductLinesAction() {
  return getProductLines();
}

// Defense in depth: RLS already allows any `authenticated` user to write
// product_lines, so this explicit `has_role` check is the real gate. Admin
// and Operador both manage the catálogo; Operador just can't reach Config.
async function requireCatalogAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [{ data: isAdmin }, { data: isOperador }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: user.id, _role: "operador" }),
  ]);
  if (!isAdmin && !isOperador) throw new Error("Forbidden: Admin or Operador role required");

  return supabase;
}

function revalidateProductPages() {
  revalidatePath("/admin/catalogo");
  revalidatePath("/produtos", "layout");
  revalidatePath("/");
}

export async function saveProductLine(input: unknown): Promise<{ success: true; id: string }> {
  const data = productLineSchema.parse(input);
  const supabase = await requireCatalogAccess();

  let id = data.id;
  if (id) {
    const { error } = await supabase
      .from("product_lines")
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image_url: data.image_url || null,
        available: data.available,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data: inserted, error } = await supabase
      .from("product_lines")
      .insert([
        {
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          image_url: data.image_url || null,
          available: data.available,
        },
      ])
      .select("id")
      .single();
    if (error) throw error;
    id = inserted.id;
  }

  revalidateProductPages();
  return { success: true, id };
}

export async function reorderProductLines(orderedIds: string[]) {
  const supabase = await requireCatalogAccess();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("product_lines").update({ sort_order: index }).eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  revalidateProductPages();
  return { success: true };
}

export async function toggleProductLineAvailability(id: string, available: boolean) {
  const supabase = await requireCatalogAccess();

  const { error } = await supabase
    .from("product_lines")
    .update({ available, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  revalidateProductPages();
  return { success: true };
}

export async function deleteProductLine(id: string, options?: { cascade?: boolean }) {
  const supabase = await requireCatalogAccess();

  if (options?.cascade) {
    const { error: productsError } = await supabase.from("products").delete().eq("category_id", id);
    if (productsError) throw productsError;
  }

  const { error } = await supabase.from("product_lines").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("Não é possível excluir: existem produtos cadastrados nesta linha.");
    }
    throw error;
  }

  revalidateProductPages();
  return { success: true };
}
