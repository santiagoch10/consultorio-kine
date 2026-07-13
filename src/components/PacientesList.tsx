"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import type { Paciente } from "@/lib/types";
import EmptyState from "@/components/EmptyState";

export default function PacientesList({
  pacientes,
}: {
  pacientes: Paciente[];
}) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const filtrados = term
    ? pacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          (p.telefono ?? "").toLowerCase().includes(term) ||
          (p.email ?? "").toLowerCase().includes(term),
      )
    : pacientes;

  return (
    <div>
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 font-medium text-slate-700">
            Pacientes ({pacientes.length})
          </h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar…"
              className="rounded-lg border border-slate-300 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      {filtrados.length === 0 ? (
        pacientes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Todavía no hay pacientes"
            description="Creá el primero con el formulario de arriba."
          />
        ) : (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            No se encontraron pacientes con ese criterio.
          </p>
        )
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtrados.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pacientes/${p.id}`}
                prefetch={false}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {p.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {p.nombre}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {p.telefono ?? p.email ?? "Sin contacto"}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
