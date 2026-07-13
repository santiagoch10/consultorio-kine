"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createPrestacion,
  type PrestacionState,
} from "@/app/(app)/configuracion/actions";

const initialState: PrestacionState = { error: "", ok: false };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function PrestacionForm() {
  const [state, formAction, pending] = useActionState(
    createPrestacion,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Nombre de la prestación
          </label>
          <input
            name="nombre"
            type="text"
            required
            className={inputClass}
            placeholder="Ej: Sesión de kinesiología"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Precio por sesión ($)
          </label>
          <input
            name="precio"
            type="number"
            min="0"
            step="1"
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Sesiones sugeridas
          </label>
          <input
            name="sesiones_sugeridas"
            type="number"
            min="1"
            step="1"
            defaultValue={1}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Duración (minutos)
          </label>
          <input
            name="duracion_min"
            type="number"
            min="5"
            step="5"
            defaultValue={60}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">
            Casi siempre 60. Excepciones: 40-45.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Costo variable ($)
          </label>
          <input
            name="costo_variable"
            type="number"
            min="0"
            step="1"
            defaultValue={0}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">
            Insumos descartables de esta sesión.
          </p>
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✅ Prestación agregada.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Agregando…" : "Agregar prestación"}
      </button>
    </form>
  );
}
