"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { createTurno, type TurnoState } from "@/app/(app)/agenda/actions";
import type { Paciente } from "@/lib/types";

const initialState: TurnoState = { error: "", ok: false };

type Prof = { id: string; name: string };

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function TurnoForm({
  pacientes,
  profesionales,
  fecha,
  profesionalId,
}: {
  pacientes: Paciente[];
  profesionales: Prof[];
  fecha: string;
  profesionalId: string;
}) {
  const [state, formAction, pending] = useActionState(createTurno, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (pacientes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Para agendar un turno necesitás al menos un paciente en{" "}
        <Link href="/pacientes" className="font-medium text-brand underline">
          Pacientes
        </Link>
        .
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Fecha
          </label>
          <input
            name="fecha"
            type="date"
            required
            defaultValue={fecha}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Hora
          </label>
          <input name="hora" type="time" required className={inputClass} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Duración (min)
          </label>
          <input
            name="duracion_min"
            type="number"
            min="5"
            step="5"
            defaultValue={30}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Paciente
          </label>
          <select name="paciente_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Elegí un paciente…
            </option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Profesional
          </label>
          <select
            name="profesional_id"
            defaultValue={profesionalId}
            className={inputClass}
          >
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Notas (opcional)
          </label>
          <input
            name="notas"
            type="text"
            className={inputClass}
            placeholder="Ej: primera sesión"
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
          ✅ Turno agendado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Agendando…" : "Agendar turno"}
      </button>
    </form>
  );
}
