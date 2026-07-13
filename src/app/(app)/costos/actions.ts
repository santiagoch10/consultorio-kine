"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, listUsers } from "@/lib/auth";
import { isMissingTable } from "@/lib/supabase/errors";
import type { AlcanceCosto, TipoCosto } from "@/lib/types";

export type CostoState = { error: string; ok: boolean };

export async function createCosto(
  _prev: CostoState,
  formData: FormData,
): Promise<CostoState> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const fecha = String(formData.get("fecha") ?? "");
  const concepto = String(formData.get("concepto") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "Otros");
  const tipo = String(formData.get("tipo") ?? "fijo") as TipoCosto;
  const alcance = String(formData.get("alcance") ?? "compartido") as AlcanceCosto;
  const monto = parseFloat(String(formData.get("monto") ?? "0"));
  const profesionalId = String(formData.get("profesional_id") ?? "");

  if (!concepto) return { error: "Ingresá un concepto.", ok: false };
  if (!fecha) return { error: "Elegí una fecha.", ok: false };

  let profesional_id: string | null = null;
  let profesional_nombre: string | null = null;

  if (alcance === "individual") {
    if (!profesionalId) {
      return { error: "Elegí el profesional del costo individual.", ok: false };
    }
    const users = await listUsers();
    const prof = users.find((u) => u.id === profesionalId);
    if (!prof) return { error: "Profesional no encontrado.", ok: false };
    profesional_id = prof.id;
    profesional_nombre = prof.name;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("costos").insert({
    fecha,
    concepto,
    categoria,
    tipo,
    alcance,
    profesional_id,
    profesional_nombre,
    monto: Number.isNaN(monto) ? 0 : monto,
    registrado_por: me.id,
  });

  if (error) {
    if (isMissingTable(error)) {
      return {
        error: "Falta crear la base de datos. Ejecutá el script SQL en Supabase.",
        ok: false,
      };
    }
    return { error: error.message, ok: false };
  }

  revalidatePath("/costos");
  return { error: "", ok: true };
}

export async function deleteCosto(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("costos").delete().eq("id", id);
  revalidatePath("/costos");
}
