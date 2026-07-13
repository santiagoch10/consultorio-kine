"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createPaciente,
  updatePaciente,
  type PacienteState,
} from "@/app/(app)/pacientes/actions";
import type { Paciente } from "@/lib/types";

const initialState: PacienteState = { error: "", ok: false };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function PacienteForm({ paciente }: { paciente?: Paciente }) {
  const isEdit = Boolean(paciente);
  const [state, formAction, pending] = useActionState(
    isEdit ? updatePaciente : createPaciente,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && !isEdit) formRef.current?.reset();
  }, [state.ok, isEdit]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={paciente!.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Nombre y apellido
          </label>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={paciente?.nombre ?? ""}
            className={inputClass}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Teléfono
          </label>
          <input
            name="telefono"
            type="tel"
            defaultValue={paciente?.telefono ?? ""}
            className={inputClass}
            placeholder="Ej: 11 2345 6789"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={paciente?.email ?? ""}
            className={inputClass}
            placeholder="opcional"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Fecha de nacimiento
          </label>
          <input
            name="fecha_nacimiento"
            type="date"
            defaultValue={paciente?.fecha_nacimiento ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Obra social
          </label>
          <input
            name="obra_social"
            type="text"
            defaultValue={paciente?.obra_social ?? ""}
            className={inputClass}
            placeholder="opcional"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Notas
          </label>
          <input
            name="notas"
            type="text"
            defaultValue={paciente?.notas ?? ""}
            className={inputClass}
            placeholder="Observaciones generales"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✅ {isEdit ? "Ficha actualizada." : "Paciente creado."}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending
          ? "Guardando…"
          : isEdit
            ? "Guardar cambios"
            : "Crear paciente"}
      </button>
    </form>
  );
}
