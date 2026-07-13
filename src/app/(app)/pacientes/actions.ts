"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { isMissingTable } from "@/lib/supabase/errors";

export type PacienteState = { error: string; ok: boolean };

function leerCampos(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    telefono: String(formData.get("telefono") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    fecha_nacimiento: String(formData.get("fecha_nacimiento") ?? "") || null,
    obra_social: String(formData.get("obra_social") ?? "").trim() || null,
    notas: String(formData.get("notas") ?? "").trim() || null,
  };
}

export async function createPaciente(
  _prev: PacienteState,
  formData: FormData,
): Promise<PacienteState> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const campos = leerCampos(formData);
  if (!campos.nombre) return { error: "Ingresá el nombre del paciente.", ok: false };

  const supabase = await createClient();
  const { error } = await supabase.from("pacientes").insert(campos);

  if (error) {
    if (isMissingTable(error)) {
      return {
        error: "Falta crear la base de datos. Ejecutá el script SQL en Supabase.",
        ok: false,
      };
    }
    return { error: error.message, ok: false };
  }

  revalidatePath("/pacientes");
  return { error: "", ok: true };
}

export async function updatePaciente(
  _prev: PacienteState,
  formData: FormData,
): Promise<PacienteState> {
  const me = await getCurrentUser();
  if (!me) return { error: "No autorizado.", ok: false };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el paciente.", ok: false };

  const campos = leerCampos(formData);
  if (!campos.nombre) return { error: "Ingresá el nombre del paciente.", ok: false };

  const supabase = await createClient();
  const { error } = await supabase.from("pacientes").update(campos).eq("id", id);

  if (error) return { error: error.message, ok: false };

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
  return { error: "", ok: true };
}

export async function deletePaciente(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("pacientes").delete().eq("id", id);

  revalidatePath("/pacientes");
  redirect("/pacientes");
}
