"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { isMissingTable } from "@/lib/supabase/errors";

export type PrestacionState = { error: string; ok: boolean };

export async function createPrestacion(
  _prev: PrestacionState,
  formData: FormData,
): Promise<PrestacionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const sesiones = parseInt(
    String(formData.get("sesiones_sugeridas") ?? "1"),
    10,
  );
  const duracion = parseInt(String(formData.get("duracion_min") ?? "60"), 10);
  const costoVariable = parseFloat(
    String(formData.get("costo_variable") ?? "0"),
  );

  if (!nombre) return { error: "Poné un nombre para la prestación.", ok: false };

  const supabase = await createClient();
  const { error } = await supabase.from("prestaciones").insert({
    nombre,
    precio: Number.isNaN(precio) ? 0 : precio,
    sesiones_sugeridas: Number.isNaN(sesiones) || sesiones < 1 ? 1 : sesiones,
    duracion_min: Number.isNaN(duracion) || duracion < 1 ? 60 : duracion,
    costo_variable: Number.isNaN(costoVariable) ? 0 : costoVariable,
  });

  if (error) {
    if (isMissingTable(error)) {
      return {
        error: "Todavía no está creada la base de datos. Ejecutá el script SQL en Supabase.",
        ok: false,
      };
    }
    return { error: error.message, ok: false };
  }

  revalidatePath("/configuracion");
  revalidatePath("/sesiones");
  revalidatePath("/calculadora");
  return { error: "", ok: true };
}

export async function updatePrestacion(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const duracion = parseInt(String(formData.get("duracion_min") ?? "60"), 10);
  const costoVariable = parseFloat(
    String(formData.get("costo_variable") ?? "0"),
  );

  const supabase = await createClient();
  await supabase
    .from("prestaciones")
    .update({
      precio: Number.isNaN(precio) ? 0 : precio,
      duracion_min: Number.isNaN(duracion) || duracion < 1 ? 60 : duracion,
      costo_variable: Number.isNaN(costoVariable) ? 0 : costoVariable,
    })
    .eq("id", id);

  revalidatePath("/configuracion");
  revalidatePath("/sesiones");
  revalidatePath("/calculadora");
}

export async function deletePrestacion(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("prestaciones").delete().eq("id", id);
  revalidatePath("/configuracion");
}

export type CosteoState = { error: string; ok: boolean };

export async function updateConfiguracionCosteo(
  _prev: CosteoState,
  formData: FormData,
): Promise<CosteoState> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const horasPorDia = parseFloat(String(formData.get("horas_por_dia") ?? "6"));
  const diasPorSemana = parseInt(
    String(formData.get("dias_por_semana") ?? "5"),
    10,
  );
  const ocupacionPct = parseFloat(
    String(formData.get("ocupacion_pct") ?? "60"),
  );
  const margenDefault = parseFloat(
    String(formData.get("margen_default_pct") ?? "30"),
  );
  const objetivoGanancia = parseFloat(
    String(formData.get("objetivo_ganancia") ?? "0"),
  );

  const supabase = await createClient();
  const { error } = await supabase.from("configuracion_costeo").upsert({
    id: 1,
    horas_por_dia: Number.isNaN(horasPorDia) ? 6 : horasPorDia,
    dias_por_semana: Number.isNaN(diasPorSemana) ? 5 : diasPorSemana,
    ocupacion_pct: Number.isNaN(ocupacionPct) ? 60 : ocupacionPct,
    margen_default_pct: Number.isNaN(margenDefault) ? 30 : margenDefault,
    objetivo_ganancia: Number.isNaN(objetivoGanancia) ? 0 : objetivoGanancia,
  });

  if (error) {
    if (isMissingTable(error)) {
      return {
        error: "Falta actualizar la base de datos. Ejecutá el script SQL en Supabase.",
        ok: false,
      };
    }
    return { error: error.message, ok: false };
  }

  revalidatePath("/configuracion");
  revalidatePath("/calculadora");
  revalidatePath("/numeros");
  return { error: "", ok: true };
}

export async function updateObjetivo(
  _prev: CosteoState,
  formData: FormData,
): Promise<CosteoState> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const activo = formData.get("objetivo_activo") === "on";
  const monto = parseFloat(String(formData.get("objetivo_monto") ?? "0"));

  const supabase = await createClient();
  const { error } = await supabase.from("configuracion_costeo").upsert(
    {
      id: 1,
      objetivo_activo: activo,
      objetivo_monto: Number.isNaN(monto) ? 0 : monto,
    },
    { onConflict: "id" },
  );

  if (error) {
    if (isMissingTable(error)) {
      return {
        error: "Falta actualizar la base de datos. Ejecutá el script SQL en Supabase.",
        ok: false,
      };
    }
    return { error: error.message, ok: false };
  }

  revalidatePath("/configuracion");
  revalidatePath("/numeros");
  revalidatePath("/inicio");
  return { error: "", ok: true };
}
