"use client";

import { useActionState, useEffect, useRef } from "react";
import { registrarSesion, type FormResult } from "@/app/(app)/sesiones/actions";
import { MEDIOS_PAGO } from "@/lib/types";
import { today } from "@/lib/format";

const initialState: FormResult = { error: "", ok: false };

export default function RegistrarSesionForm({
  tratamientoId,
  precioSesion,
}: {
  tratamientoId: string;
  precioSesion: number;
}) {
  const [state, formAction, pending] = useActionState(
    registrarSesion,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="tratamiento_id" value={tratamientoId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Monto cobrado ($)
          </label>
          <input
            name="monto"
            type="number"
            min="0"
            step="1"
            defaultValue={precioSesion}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Medio de pago
          </label>
          <select
            name="medio_pago"
            defaultValue="Efectivo"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {MEDIOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Observaciones (opcional)
          </label>
          <input
            name="observaciones"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="Ej: buena evolución"
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
          ✅ Sesión registrada.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar sesión"}
      </button>
    </form>
  );
}
