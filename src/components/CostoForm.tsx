"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCosto, type CostoState } from "@/app/(app)/costos/actions";
import { CATEGORIAS_COSTO } from "@/lib/types";
import { today } from "@/lib/format";

const initialState: CostoState = { error: "", ok: false };

type Prof = { id: string; name: string };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function CostoForm({ profesionales }: { profesionales: Prof[] }) {
  const [state, formAction, pending] = useActionState(createCosto, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [alcance, setAlcance] = useState("compartido");

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setAlcance("compartido");
    }
  }, [state.ok]);

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
            defaultValue={today()}
            suppressHydrationWarning
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Concepto
          </label>
          <input
            name="concepto"
            type="text"
            required
            className={inputClass}
            placeholder="Ej: Alquiler del consultorio"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Categoría
          </label>
          <select name="categoria" defaultValue="Otros" className={inputClass}>
            {CATEGORIAS_COSTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Monto ($)
          </label>
          <input
            name="monto"
            type="number"
            min="0"
            step="1"
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Tipo
          </label>
          <select name="tipo" defaultValue="fijo" className={inputClass}>
            <option value="fijo">Fijo</option>
            <option value="variable">Variable</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Alcance
          </label>
          <select
            name="alcance"
            value={alcance}
            onChange={(e) => setAlcance(e.target.value)}
            className={inputClass}
          >
            <option value="compartido">Compartido</option>
            <option value="individual">Individual</option>
          </select>
        </div>

        {alcance === "individual" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Profesional
            </label>
            <select name="profesional_id" defaultValue="" className={inputClass}>
              <option value="" disabled>
                Elegí un profesional…
              </option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✅ Costo registrado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar costo"}
      </button>
    </form>
  );
}
