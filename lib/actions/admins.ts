"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createAdminSchema } from "@/lib/validation/admin";

export interface AdminUser {
  userId: string;
  email: string;
  isSelf: boolean;
}

// Defense in depth: RLS already allows any `authenticated` user to read
// user_roles, so this explicit `has_role` check is the real gate. Writes to
// user_roles go through `supabaseAdmin` below — `authenticated` only has a
// `select` grant on that table (see migration 002_user_roles.sql).
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

  return { supabase, currentUserId: user.id };
}

// auth.users isn't in the generated Database type, so admin lookups go
// through the GoTrue admin API (typed by supabase-js itself) instead of a
// typed table query. Paginated since listUsers() caps each page.
async function listAllAuthUsers() {
  const users = [];
  const perPage = 200;
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < perPage) break;
  }
  return users;
}

export async function listAdmins(): Promise<AdminUser[]> {
  const { supabase, currentUserId } = await requireAdmin();

  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  if (error) throw error;

  const users = await listAllAuthUsers();
  const emailByUserId = new Map(users.map((u) => [u.id, u.email ?? "(sem e-mail)"]));

  return (roles ?? []).map((r) => ({
    userId: r.user_id,
    email: emailByUserId.get(r.user_id) ?? "(usuário não encontrado)",
    isSelf: r.user_id === currentUserId,
  }));
}

export async function createAdmin(input: unknown): Promise<{ granted: "created" | "existing" }> {
  const data = createAdminSchema.parse(input);
  const { currentUserId } = await requireAdmin();
  const email = data.email.trim().toLowerCase();

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
  });

  let userId: string;
  let granted: "created" | "existing";

  if (createError) {
    const alreadyExists =
      createError.code === "email_exists" || /already.*registered/i.test(createError.message);
    if (!alreadyExists) throw createError;

    const users = await listAllAuthUsers();
    const existing = users.find((u) => u.email?.toLowerCase() === email);
    if (!existing) throw createError;

    userId = existing.id;
    granted = "existing";
  } else {
    userId = created.user.id;
    granted = "created";
  }

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleError) throw roleError;

  await supabaseAdmin.from("audit_logs").insert({
    user_id: currentUserId,
    action: granted === "created" ? "CREATE_ADMIN" : "GRANT_ADMIN",
    target_table: "user_roles",
    target_id: userId,
  });

  revalidatePath("/admin/config");
  return { granted };
}

export async function removeAdmin(userId: string) {
  const { currentUserId } = await requireAdmin();
  if (userId === currentUserId) {
    throw new Error("Você não pode remover seu próprio acesso de administrador.");
  }

  const { error } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", "admin");
  if (error) {
    if (error.code === "P0001") {
      throw new Error("Não é possível remover o último administrador.");
    }
    throw error;
  }

  await supabaseAdmin.from("audit_logs").insert({
    user_id: currentUserId,
    action: "REMOVE_ADMIN",
    target_table: "user_roles",
    target_id: userId,
  });

  revalidatePath("/admin/config");
  return { success: true };
}
