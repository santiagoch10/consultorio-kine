"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { isMissingTable } from "@/lib/supabase/errors";
import type { EstadoTratamiento } from "@/lib/types";

export type FormResult = { error: string; ok: boolean };

// Crea un tratamiento (plan de sesiones) para un paciente.
export async function createTratamiento(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const pacienteId = String(formData.get("paciente_id") ?? "");
  const prestacionId = String(formData.get("prestacion_id") ?? "");
  const sesiones = parseInt(
    String(formData.get("sesiones_planificadas") ?? "1"),
    10,
  );
  const obs = String(formData.get("observaciones") ?? "").trim();

  if (!pacienteId) return { error: "Elegí un paciente.", ok: false };
  if (!prestacionId) return { error: "Elegí una prestación.", ok: false };

  const supabase = await createClient();

  // El nombre del paciente y el precio se toman de sus fichas (fuente autoritativa).
  const [{ data: pac }, { data: prest }] = await Promise.all([
    supabase.from("pacientes").select("nombre").eq("id", pacienteId).single(),
    supabase.from("prestaciones").select("nombre, precio").eq("id", prestacionId).single(),
  ]);

  if (!pac) return { error: "El paciente no existe.", ok: false };
  if (!prest) return { error: "La prestación no existe.", ok: false };

  const { error } = await supabase.from("tratamientos").insert({
    paciente_id: pacienteId,
    paciente_nombre: pac.nombre,
    prestacion_nombre: prest.nombre,
    precio_sesion: prest.precio,
    sesiones_planificadas:
      Number.isNaN(sesiones) || sesiones < 1 ? 1 : sesiones,
    observaciones: obs || null,
    profesional_id: me.id,
    profesional_nombre: me.name,
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

  revalidatePath("/sesiones");
  return { error: "", ok: true };
}

// Registra una sesión realizada y actualiza el estado si se completó.
export async function registrarSesion(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const tratamientoId = String(formData.get("tratamiento_id") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  const monto = parseFloat(String(formData.get("monto") ?? "0"));
  const medio = String(formData.get("medio_pago") ?? "");
  const obs = String(formData.get("observaciones") ?? "").trim();

  if (!tratamientoId || !fecha) {
    return { error: "Faltan datos de la sesión.", ok: false };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("sesiones").insert({
    tratamiento_id: tratamientoId,
    fecha,
    monto: Number.isNaN(monto) ? 0 : monto,
    medio_pago: medio || null,
    observaciones: obs || null,
    profesional_id: me.id,
  });

  if (error) return { error: error.message, ok: false };

  // ¿Se completó el tratamiento?
  const { data: trat } = await supabase
    .from("tratamientos")
    .select("sesiones_planificadas, estado")
    .eq("id", tratamientoId)
    .single();

  const { count } = await supabase
    .from("sesiones")
    .select("*", { count: "exact", head: true })
    .eq("tratamiento_id", tratamientoId);

  if (
    trat &&
    trat.estado === "activo" &&
    count != null &&
    count >= trat.sesiones_planificadas
  ) {
    await supabase
      .from("tratamientos")
      .update({ estado: "completado" })
      .eq("id", tratamientoId);
  }

  revalidatePath(`/sesiones/${tratamientoId}`);
  revalidatePath("/sesiones");
  return { error: "", ok: true };
}

// Cambia el estado de un tratamiento (activo / completado / abandonado).
export async function updateEstado(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("tratamiento_id") ?? "");
  const estado = String(formData.get("estado") ?? "") as EstadoTratamiento;
  if (!id) return;
  if (!["activo", "completado", "abandonado"].includes(estado)) return;

  const supabase = await createClient();
  await supabase.from("tratamientos").update({ estado }).eq("id", id);

  revalidatePath(`/sesiones/${id}`);
  revalidatePath("/sesiones");
}

// Agrega más sesiones planificadas a un tratamiento (y lo reactiva si estaba completado).
export async function agregarSesiones(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("tratamiento_id") ?? "");
  const cantidad = parseInt(String(formData.get("cantidad") ?? "0"), 10);
  if (!id || Number.isNaN(cantidad) || cantidad < 1) return;

  const supabase = await createClient();
  const { data: trat } = await supabase
    .from("tratamientos")
    .select("sesiones_planificadas, estado")
    .eq("id", id)
    .single();

  if (!trat) return;

  const nuevoTotal = trat.sesiones_planificadas + cantidad;
  const nuevoEstado =
    trat.estado === "completado" ? "activo" : trat.estado;

  await supabase
    .from("tratamientos")
    .update({ sesiones_planificadas: nuevoTotal, estado: nuevoEstado })
    .eq("id", id);

  revalidatePath(`/sesiones/${id}`);
  revalidatePath("/sesiones");
}
