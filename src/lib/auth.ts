import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserRole = "admin" | "profesional";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

// Devuelve el usuario logueado (o null), con su nombre y rol.
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      "Usuario",
    role:
      (user.app_metadata?.role as UserRole | undefined) ?? "profesional",
  };
}

// Lista todos los usuarios del equipo (para selects de profesional, etc.).
export async function listUsers(): Promise<AppUser[]> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  return (data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    name:
      (u.user_metadata?.full_name as string | undefined) ??
      u.email ??
      "Usuario",
    role: (u.app_metadata?.role as UserRole | undefined) ?? "profesional",
  }));
}
