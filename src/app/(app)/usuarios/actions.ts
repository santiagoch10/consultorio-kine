"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, type UserRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateUserState = { error: string; ok: boolean };

export async function createUser(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  // Solo el admin puede crear usuarios (verificación en el servidor).
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    return { error: "No tenés permiso para esta acción.", ok: false };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = (String(formData.get("role") ?? "profesional") as UserRole);

  if (!name || !email) {
    return { error: "Completá nombre y email.", ok: false };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres.", ok: false };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
    app_metadata: { role },
  });

  if (error) {
    return { error: error.message, ok: false };
  }

  revalidatePath("/usuarios");
  return { error: "", ok: true };
}
