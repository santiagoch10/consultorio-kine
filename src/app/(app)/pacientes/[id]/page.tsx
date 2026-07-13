import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Trash2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, soloDigitos } from "@/lib/format";
import type { Paciente, Tratamiento } from "@/lib/types";
import PacienteForm from "@/components/PacienteForm";
import EstadoBadge from "@/components/EstadoBadge";
import { deletePaciente } from "../actions";

export default async function PacienteDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pacData } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!pacData) notFound();
  const paciente = pacData as Paciente;

  const { data: tratData } = await supabase
    .from("tratamientos")
    .select("*")
    .eq("paciente_id", id)
    .order("created_at", { ascending: false });

  const tratamientos = (tratData ?? []) as Tratamiento[];

  // Cantidad de sesiones por tratamiento (para el progreso).
  const ids = tratamientos.map((t) => t.id);
  const conteo = new Map<string, number>();
  if (ids.length > 0) {
    const { data: sesData } = await supabase
      .from("sesiones")
      .select("tratamiento_id")
      .in("tratamiento_id", ids);
    for (const s of sesData ?? []) {
      conteo.set(s.tratamiento_id, (conteo.get(s.tratamiento_id) ?? 0) + 1);
    }
  }

  const dato = (v: string | null) => (v && v.trim() ? v : "—");

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/pacientes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Pacientes
      </Link>

      {/* Encabezado */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">
          {paciente.nombre}
        </h1>
        {paciente.telefono && (
          <a
            href={`https://wa.me/${soloDigitos(paciente.telefono)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
      </div>

      {/* Datos rápidos */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Teléfono", value: dato(paciente.telefono) },
          { label: "Email", value: dato(paciente.email) },
          { label: "Obra social", value: dato(paciente.obra_social) },
        ].map((d) => (
          <div
            key={d.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-xs text-slate-500">{d.label}</p>
            <p className="mt-1 truncate text-sm font-medium text-slate-800">
              {d.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tratamientos del paciente */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-medium text-slate-700">
            Tratamientos ({tratamientos.length})
          </h2>
        </div>
        {tratamientos.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            Este paciente no tiene tratamientos. Creá uno desde{" "}
            <Link href="/sesiones" className="font-medium text-brand underline">
              Sesiones
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tratamientos.map((t) => {
              const hechas = conteo.get(t.id) ?? 0;
              return (
                <li key={t.id}>
                  <Link
                    href={`/sesiones/${t.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {t.prestacion_nombre}
                        </p>
                        <EstadoBadge estado={t.estado} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {hechas}/{t.sesiones_planificadas} sesiones · desde{" "}
                        {formatDate(t.fecha_inicio)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Editar ficha */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">Editar ficha</h2>
        <PacienteForm paciente={paciente} />
      </section>

      {/* Eliminar */}
      <form action={deletePaciente} className="flex justify-end">
        <input type="hidden" name="id" value={paciente.id} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar paciente
        </button>
      </form>
    </div>
  );
}
