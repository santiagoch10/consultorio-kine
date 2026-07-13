import { createClient } from "@supabase/supabase-js";

// Cliente ADMIN de Supabase (usa la service_role key).
// SOLO se puede usar en el servidor. Nunca en componentes de cliente.
// Permite crear usuarios, asignar roles, etc.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
