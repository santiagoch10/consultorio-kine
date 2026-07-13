"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

// Aplica el precio calculado como el nuevo precio de esa prestación.
// Esto NO modifica tratamientos/sesiones ya registrados (guardan su propio precio_sesion/monto).
export async function aplicarPrecioPrestacion(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("prestacion_id") ?? "");
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  if (!id || Number.isNaN(precio) || precio < 0) return;

  const supabase = await createClient();
  await supabase.from("prestaciones").update({ precio }).eq("id", id);

  revalidatePath("/configuracion");
  revalidatePath("/calculadora");
  revalidatePath("/sesiones");
}
