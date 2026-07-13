type SupabaseError = { code?: string; message?: string } | null | undefined;

// Detecta si el error se debe a que la tabla todavía no existe en Supabase.
export function isMissingTable(error: SupabaseError): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  if (["42P01", "PGRST205", "PGRST202"].includes(code)) return true;
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("does not exist") || msg.includes("schema cache");
}
