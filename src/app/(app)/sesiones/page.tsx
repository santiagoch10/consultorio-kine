import Link from "next/link";
import { Activity, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, diasDesde } from "@/lib/format";
import {
  DIAS_INACTIVIDAD,
  type Prestacion,
  type Tratamiento,
  type Paciente,
} from "@/lib/types";
import NuevoTratamientoForm from "@/components/NuevoTratamientoForm";
import SetupBanner from "@/components/SetupBanner";
import EstadoBadge from "@/components/EstadoBadge";
import { isMissingTable } from "@/lib/supabase/errors";

export default async function SesionesPage() {
  const supabase = await createClient();

  const [
    { data: prestData },
    { data: pacData },
    { data: tratData, error: tratError },
    { data: sesData },
  ] = await Promise.all([
    supabase.from("prestaciones").select("*").eq("activo", true).order("nombre"),
    supabase.from("pacientes").select("*").order("nombre"),
    supabase.from("tratamientos").select("*").order("created_at", { ascending: false }),
    supabase.from("sesiones").select("tratamiento_id, fecha, monto"),
  ]);

  const needsSetup = isMissingTable(tratError);
  const prestaciones = (prestData ?? []) as Prestacion[];
  const pacientes = (pacData ?? []) as Paciente[];
  const tratamientos = (tratData ?? []) as Tratamiento[];
  const sesiones = sesData ?? [];

  // Resumen de sesiones por tratamiento: cantidad, última fecha, total cobrado.
  const resumen = new Map<
    string,
    { hechas: number; ultima: string | null; total: number }
  >();
  for (const s of sesiones) {
    const r = resumen.get(s.tratamiento_id) ?? {
      hechas: 0,
      ultima: null,
      total: 0,
    };
    r.hechas += 1;
    r.total += Number(s.monto) || 0;
    if (!r.ultima || s.fecha > r.ultima) r.ultima = s.fecha;
    resumen.set(s.tratamiento_id, r);
  }

  return (
    <div>
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Sesiones</h1>
          <p className="text-sm text-slate-500">
            Tratamientos por sesiones y su avance.
          </p>
        </div>
      </header>

      {needsSetup && <SetupBanner />}

      {/* Nuevo tratamiento */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">Nuevo tratamiento</h2>
        <NuevoTratamientoForm prestaciones={prestaciones} pacientes={pacientes} />
      </section>

      {/* Lista de tratamientos */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-medium text-slate-700">
            Tratamientos ({tratamientos.length})
          </h2>
        </div>

        {tratamientos.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            Todavía no hay tratamientos. Creá el primero arriba.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tratamientos.map((t) => {
              const r = resumen.get(t.id) ?? {
                hechas: 0,
                ultima: null,
                total: 0,
              };
              const pct = Math.min(
                100,
                Math.round((r.hechas / t.sesiones_planificadas) * 100),
              );
              const inactivo =
                t.estado === "activo" &&
                r.hechas < t.sesiones_planificadas &&
                (r.ultima
                  ? diasDesde(r.ultima) >= DIAS_INACTIVIDAD
                  : diasDesde(t.fecha_inicio) >= DIAS_INACTIVIDAD);

              return (
                <li key={t.id}>
                  <Link
                    href={`/sesiones/${t.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {t.paciente_nombre}
                        </p>
                        <EstadoBadge estado={t.estado} />
                        {inactivo && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Sin actividad
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {t.prestacion_nombre} · {t.profesional_nombre}
                      </p>
                      {/* Barra de progreso */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {r.hechas}/{t.sesiones_planificadas} sesiones
                        </span>
                      </div>
                    </div>
                    <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                      {formatCurrency(r.total)}
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
