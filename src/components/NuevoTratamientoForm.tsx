"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createTratamiento, type FormResult } from "@/app/(app)/sesiones/actions";
import { formatCurrency } from "@/lib/format";
import type { Prestacion, Paciente } from "@/lib/types";

const initialState: FormResult = { error: "", ok: false };

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function NuevoTratamientoForm({
  prestaciones,
  pacientes,
}: {
  prestaciones: Prestacion[];
  pacientes: Paciente[];
}) {
  const [state, formAction, pending] = useActionState(
    createTratamiento,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [sesiones, setSesiones] = useState(1);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setSesiones(1);
    }
  }, [state.ok]);

  if (prestaciones.length === 0 || pacientes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Para crear un tratamiento necesitás{" "}
        {pacientes.length === 0 && (
          <>
            al menos un paciente en{" "}
            <Link href="/pacientes" className="font-medium text-brand underline">
              Pacientes
            </Link>
          </>
        )}
        {pacientes.length === 0 && prestaciones.length === 0 && " y "}
        {prestaciones.length === 0 && (
          <>
            una prestación en{" "}
            <Link
              href="/configuracion"
              className="font-medium text-brand underline"
            >
              Configuración
            </Link>
          </>
        )}
        .
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            Prestación
          </label>
          <select
            name="prestacion_id"
            required
            defaultValue=""
            onChange={(e) => {
              const p = prestaciones.find((x) => x.id === e.target.value);
              if (p) setSesiones(p.sesiones_sugeridas);
            }}
            className={inputClass}
          >
            <option value="" disabled>
              Elegí una prestación…
            </option>
            {prestaciones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {formatCurrency(p.precio)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Cantidad de sesiones
          </label>
          <input
            name="sesiones_planificadas"
            type="number"
            min="1"
            step="1"
            value={sesiones}
            onChange={(e) => setSesiones(parseInt(e.target.value || "1", 10))}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">
            Se completa sola según la prestación. Podés cambiarla.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Observaciones (opcional)
          </label>
          <input
            name="observaciones"
            type="text"
            className={inputClass}
            placeholder="Ej: lesión de rodilla derecha"
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
          ✅ Tratamiento creado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear tratamiento"}
      </button>
    </form>
  );
}
