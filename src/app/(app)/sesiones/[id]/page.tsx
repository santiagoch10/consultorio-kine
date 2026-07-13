import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Sesion, Tratamiento } from "@/lib/types";
import EstadoBadge from "@/components/EstadoBadge";
import EmptyState from "@/components/EmptyState";
import RegistrarSesionForm from "@/components/RegistrarSesionForm";
import { updateEstado, agregarSesiones } from "../actions";

export default async function TratamientoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tratData } = await supabase
    .from("tratamientos")
    .select("*")
    .eq("id", id)
    .single();

  if (!tratData) notFound();
  const t = tratData as Tratamiento;

  const { data: sesData } = await supabase
    .from("sesiones")
    .select("*")
    .eq("tratamiento_id", id)
    .order("fecha", { ascending: false });

  const sesiones = (sesData ?? []) as Sesion[];
  const hechas = sesiones.length;
  const total = sesiones.reduce((acc, s) => acc + (Number(s.monto) || 0), 0);
  const pct = Math.min(
    100,
    Math.round((hechas / t.sesiones_planificadas) * 100),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/sesiones"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Sesiones
      </Link>

      {/* Encabezado */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-800">
              {t.paciente_nombre}
            </h1>
            <EstadoBadge estado={t.estado} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t.prestacion_nombre} · {t.profesional_nombre} · desde{" "}
            {formatDate(t.fecha_inicio)}
          </p>
          {t.observaciones && (
            <p className="mt-2 text-sm text-slate-600">{t.observaciones}</p>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Progreso</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {hechas}/{t.sesiones_planificadas}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total cobrado</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Precio por sesión</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatCurrency(t.precio_sesion)}
          </p>
        </div>
      </div>

      {/* Acciones sobre el tratamiento */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form action={agregarSesiones} className="flex items-center gap-2">
          <input type="hidden" name="tratamiento_id" value={t.id} />
          <input
            type="number"
            name="cantidad"
            min="1"
            defaultValue={1}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Agregar sesiones
          </button>
        </form>

        {t.estado !== "abandonado" ? (
          <form action={updateEstado}>
            <input type="hidden" name="tratamiento_id" value={t.id} />
            <button
              type="submit"
              name="estado"
              value="abandonado"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              Marcar como abandonado
            </button>
          </form>
        ) : (
          <form action={updateEstado}>
            <input type="hidden" name="tratamiento_id" value={t.id} />
            <button
              type="submit"
              name="estado"
              value="activo"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Reactivar tratamiento
            </button>
          </form>
        )}
      </div>

      {/* Registrar sesión */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">Registrar sesión</h2>
        <RegistrarSesionForm
          tratamientoId={t.id}
          precioSesion={t.precio_sesion}
        />
      </section>

      {/* Historial de sesiones */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-medium text-slate-700">
            Sesiones realizadas ({hechas})
          </h2>
        </div>
        {sesiones.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Sin sesiones registradas"
            description="Registrá la primera con el formulario de arriba."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {sesiones.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-6 py-3">
                <span className="w-24 text-sm text-slate-600">
                  {formatDate(s.fecha)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">
                    {s.medio_pago ?? "—"}
                  </p>
                  {s.observaciones && (
                    <p className="truncate text-xs text-slate-400">
                      {s.observaciones}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {formatCurrency(Number(s.monto) || 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
