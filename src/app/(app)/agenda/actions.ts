"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, listUsers } from "@/lib/auth";
import { isMissingTable } from "@/lib/supabase/errors";
import type { EstadoTurno } from "@/lib/types";

export type TurnoState = { error: string; ok: boolean };

const ESTADOS_VALIDOS: EstadoTurno[] = [
  "pendiente",
  "confirmado",
  "asistio",
  "ausente",
  "cancelado",
];

export async function createTurno(
  _prev: TurnoState,
  formData: FormData,
): Promise<TurnoState> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "");
  const duracion = parseInt(String(formData.get("duracion_min") ?? "30"), 10);
  const pacienteId = String(formData.get("paciente_id") ?? "");
  const profesionalId = String(formData.get("profesional_id") ?? "");
  const notas = String(formData.get("notas") ?? "").trim();

  if (!fecha || !hora) return { error: "Elegí fecha y hora.", ok: false };
  if (!pacienteId) return { error: "Elegí un paciente.", ok: false };

  const supabase = await createClient();

  const { data: pac } = await supabase
    .from("pacientes")
    .select("nombre")
    .eq("id", pacienteId)
    .single();
  if (!pac) return { error: "El paciente no existe.", ok: false };

  // Profesional: por defecto el usuario logueado; si se elige otro, se busca su nombre.
  let profesional_id = me.id;
  let profesional_nombre = me.name;
  if (profesionalId && profesionalId !== me.id) {
    const users = await listUsers();
    const prof = users.find((u) => u.id === profesionalId);
    if (prof) {
      profesional_id = prof.id;
      profesional_nombre = prof.name;
    }
  }

  const { error } = await supabase.from("turnos").insert({
    fecha,
    hora,
    duracion_min: Number.isNaN(duracion) || duracion < 5 ? 30 : duracion,
    paciente_id: pacienteId,
    paciente_nombre: pac.nombre,
    profesional_id,
    profesional_nombre,
    estado: "pendiente",
    notas: notas || null,
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

  revalidatePath("/agenda");
  revalidatePath("/inicio");
  return { error: "", ok: true };
}

// Cambia el estado de un turno (un clic).
export async function setEstadoTurno(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado") ?? "") as EstadoTurno;
  if (!id || !ESTADOS_VALIDOS.includes(estado)) return;

  const supabase = await createClient();
  await supabase.from("turnos").update({ estado }).eq("id", id);

  revalidatePath("/agenda");
  revalidatePath("/inicio");
}

export async function deleteTurno(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("turnos").delete().eq("id", id);

  revalidatePath("/agenda");
  revalidatePath("/inicio");
}
