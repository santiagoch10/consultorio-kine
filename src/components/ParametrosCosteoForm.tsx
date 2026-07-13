"use client";

import { useActionState } from "react";
import {
  updateConfiguracionCosteo,
  type CosteoState,
} from "@/app/(app)/configuracion/actions";
import type { ConfiguracionCosteo } from "@/lib/types";

const initialState: CosteoState = { error: "", ok: false };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function ParametrosCosteoForm({
  config,
}: {
  config: ConfiguracionCosteo;
}) {
  const [state, formAction, pending] = useActionState(
    updateConfiguracionCosteo,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Días de atención por semana
          </label>
          <input
            name="dias_por_semana"
            type="number"
            min="1"
            max="7"
            defaultValue={config.dias_por_semana}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Horas por día
          </label>
          <input
            name="horas_por_dia"
            type="number"
            min="1"
            max="16"
            step="0.5"
            defaultValue={config.horas_por_dia}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            % de ocupación estimado
          </label>
          <input
            name="ocupacion_pct"
            type="number"
            min="5"
            max="100"
            step="5"
            defaultValue={config.ocupacion_pct}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">
            Colchón por baches en la agenda.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Margen de ganancia por defecto (%)
          </label>
          <input
            name="margen_default_pct"
            type="number"
            min="0"
            max="200"
            step="5"
            defaultValue={config.margen_default_pct}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">
            Para reinversión/crecimiento.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Objetivo de ganancia mensual ($)
          </label>
          <input
            name="objetivo_ganancia"
            type="number"
            min="0"
            step="1000"
            defaultValue={config.objetivo_ganancia}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">
            Se suma a los costos fijos en &quot;Punto de equilibrio + Ganancia&quot;.
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
          ✅ Parámetros guardados. Esto no modifica sesiones ya registradas.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar parámetros"}
      </button>
    </form>
  );
}
