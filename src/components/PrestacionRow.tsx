"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Prestacion } from "@/lib/types";
import { updatePrestacion, deletePrestacion } from "@/app/(app)/configuracion/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function PrestacionRow({ prestacion: p }: { prestacion: Prestacion }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <li className="px-6 py-4">
        <form
          action={async (fd) => {
            await updatePrestacion(fd);
            setEditando(false);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="id" value={p.id} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {p.nombre}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Precio ($)</label>
            <input
              name="precio"
              type="number"
              min="0"
              defaultValue={p.precio}
              className={`${inputClass} w-28`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Duración (min)</label>
            <input
              name="duracion_min"
              type="number"
              min="5"
              step="5"
              defaultValue={p.duracion_min}
              className={`${inputClass} w-24`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Costo variable ($)</label>
            <input
              name="costo_variable"
              type="number"
              min="0"
              defaultValue={p.costo_variable}
              className={`${inputClass} w-28`}
            />
          </div>
          <button
            type="submit"
            title="Guardar"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            title="Cancelar"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition-colors hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {p.nombre}
        </p>
        <p className="text-xs text-slate-500">
          {p.sesiones_sugeridas} {p.sesiones_sugeridas === 1 ? "sesión" : "sesiones"}{" "}
          sugeridas · {p.duracion_min} min · insumos {formatCurrency(p.costo_variable)}
        </p>
      </div>
      <span className="text-sm font-semibold text-slate-700">
        {formatCurrency(p.precio)}
      </span>
      <button
        type="button"
        onClick={() => setEditando(true)}
        title="Editar"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <Pencil className="h-[18px] w-[18px]" />
      </button>
      <form action={deletePrestacion}>
        <input type="hidden" name="id" value={p.id} />
        <button
          type="submit"
          title="Eliminar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </button>
      </form>
    </li>
  );
}
