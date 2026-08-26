"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { detectImageType } from "@/lib/upload/detect-image-type";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — matches the bucket's file_size_limit

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

export async function uploadImage(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Nenhum arquivo enviado");
  }
  if (file.size === 0) {
    throw new Error("Arquivo vazio");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem maior que 5MB");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected) {
    throw new Error("Formato de imagem não suportado (use JPG, PNG, WEBP ou GIF)");
  }

  const supabase = await requireCatalogAccess();

  const path = `uploads/${randomUUID()}.${detected.ext}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: detected.mime,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
