import { cache } from "react";
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
// cache(): dentro de una misma carga de página, el layout y la página piden
// este mismo dato — sin esto, cada uno dispara su propio viaje de red a
// Supabase para validar la sesión.
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();
  // getClaims valida el JWT localmente en vez de consultar al servidor de
  // Auth en cada carga de página (getUser hace un viaje de red siempre).
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) return null;

  const userMeta = claims.user_metadata as
    | { full_name?: string }
    | undefined;
  const appMeta = claims.app_metadata as { role?: UserRole } | undefined;

  return {
    id: claims.sub,
    email: (claims.email as string | undefined) ?? "",
    name: userMeta?.full_name ?? (claims.email as string | undefined) ?? "Usuario",
    role: appMeta?.role ?? "profesional",
  };
});

// Lista todos los usuarios del equipo (para selects de profesional, etc.).
// cache(): evita repetir la llamada a la API de administración si varias
// partes de la misma página la necesitan.
export const listUsers = cache(async (): Promise<AppUser[]> => {
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
});
