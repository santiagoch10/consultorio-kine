"use client";

import { useActionState, useState } from "react";
import {
  updateObjetivo,
  type CosteoState,
} from "@/app/(app)/configuracion/actions";
import type { ConfiguracionCosteo } from "@/lib/types";

const initialState: CosteoState = { error: "", ok: false };

export default function ObjetivoForm({
  config,
}: {
  config: ConfiguracionCosteo;
}) {
  const [state, formAction, pending] = useActionState(
    updateObjetivo,
    initialState,
  );
  const [activo, setActivo] = useState(config.objetivo_activo);

  return (
    <form action={formAction} className="space-y-4">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="objetivo_activo"
          defaultChecked={config.objetivo_activo}
          onChange={(e) => setActivo(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand"
        />
        <span className="text-sm font-medium text-slate-700">
          Activar objetivo de facturación mensual
        </span>
      </label>

      {activo && (
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Objetivo mensual ($)
          </label>
          <input
            name="objetivo_monto"
            type="number"
            min="0"
            step="1000"
            defaultValue={config.objetivo_monto}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✅ Objetivo guardado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar objetivo"}
      </button>
    </form>
  );
}
