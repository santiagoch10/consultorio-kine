import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, listUsers } from "@/lib/auth";
import { isMissingTable } from "@/lib/supabase/errors";
import { formatDate, horaCorta } from "@/lib/format";
import {
  ESTADOS_TURNO,
  type EstadoTurno,
  type Paciente,
  type Turno,
} from "@/lib/types";
import {
  DIAS_SEMANA,
  diaLabel,
  gridMes,
  hoyISO,
  mesAdyacente,
  mesLabel,
  semanaDe,
  sumarDias,
  ymDeDia,
} from "@/lib/fecha";
import TurnoForm from "@/components/TurnoForm";
import TurnoRow from "@/components/TurnoRow";
import SetupBanner from "@/components/SetupBanner";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

const dotDe = Object.fromEntries(
  ESTADOS_TURNO.map((e) => [e.value, e.dot]),
) as Record<EstadoTurno, string>;

type Vista = "mes" | "semana" | "dia";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; mes?: string; dia?: string }>;
}) {
  const sp = await searchParams;
  const vista: Vista = (["mes", "semana", "dia"].includes(sp.vista ?? "")
    ? sp.vista
    : "mes") as Vista;
  const dia =
    sp.dia && /^\d{4}-\d{2}-\d{2}$/.test(sp.dia) ? sp.dia : hoyISO();
  const mes = sp.mes && /^\d{4}-\d{2}$/.test(sp.mes) ? sp.mes : ymDeDia(dia);
  const hoy = hoyISO();

  // Rango a traer según la vista.
  let inicio = dia;
  let fin = dia;
  const weeks = gridMes(mes);
  if (vista === "mes") {
    inicio = weeks[0][0].date;
    fin = weeks[weeks.length - 1][6].date;
  } else if (vista === "semana") {
    const s = semanaDe(dia);
    inicio = s[0];
    fin = s[6];
  }

  const supabase = await createClient();
  const [{ data: turnosData, error: turnosError }, { data: pacData }, me, users] =
    await Promise.all([
      supabase
        .from("turnos")
        .select("*")
        .gte("fecha", inicio)
        .lte("fecha", fin)
        .order("hora"),
      supabase.from("pacientes").select("*").order("nombre"),
      getCurrentUser(),
      listUsers(),
    ]);

  const needsSetup = isMissingTable(turnosError);
  const turnos = (turnosData ?? []) as Turno[];
  const pacientes = (pacData ?? []) as Paciente[];
  const profesionales = users.map((u) => ({ id: u.id, name: u.name }));

  // Turnos por día.
  const porDia = new Map<string, Turno[]>();
  for (const t of turnos) {
    const arr = porDia.get(t.fecha) ?? [];
    arr.push(t);
    porDia.set(t.fecha, arr);
  }

  // Navegación de período.
  const nav =
    vista === "mes"
      ? {
          label: mesLabel(mes),
          prev: `/agenda?vista=mes&mes=${mesAdyacente(mes, -1)}`,
          next: `/agenda?vista=mes&mes=${mesAdyacente(mes, 1)}`,
        }
      : vista === "semana"
        ? {
            label: `${formatDate(semanaDe(dia)[0])} – ${formatDate(semanaDe(dia)[6])}`,
            prev: `/agenda?vista=semana&dia=${sumarDias(dia, -7)}`,
            next: `/agenda?vista=semana&dia=${sumarDias(dia, 7)}`,
          }
        : {
            label:
              diaLabel(dia).charAt(0).toUpperCase() + diaLabel(dia).slice(1),
            prev: `/agenda?vista=dia&dia=${sumarDias(dia, -1)}`,
            next: `/agenda?vista=dia&dia=${sumarDias(dia, 1)}`,
          };

  const tabs: { v: Vista; label: string; href: string }[] = [
    { v: "mes", label: "Mes", href: `/agenda?vista=mes&mes=${mes}` },
    { v: "semana", label: "Semana", href: `/agenda?vista=semana&dia=${dia}` },
    { v: "dia", label: "Día", href: `/agenda?vista=dia&dia=${dia}` },
  ];

  return (
    <div>
      <PageHeader
        icon={CalendarDays}
        title="Agenda"
        subtitle="Turnos del consultorio."
      />

      {needsSetup && <SetupBanner />}

      {/* Barra de herramientas: navegación + vista */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={nav.prev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-40 text-center text-sm font-semibold text-slate-800">
            {nav.label}
          </span>
          <Link
            href={nav.next}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex rounded-lg border border-slate-200 p-0.5">
          {tabs.map((t) => (
            <Link
              key={t.v}
              href={t.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                vista === t.v
                  ? "bg-brand text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Vista MES */}
      {vista === "mes" && (
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-300 bg-slate-100">
            {DIAS_SEMANA.map((d) => (
              <div
                key={d}
                className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weeks.flat().map((cell) => {
              const dts = porDia.get(cell.date) ?? [];
              const esHoy = cell.date === hoy;
              return (
                <Link
                  key={cell.date}
                  href={`/agenda?vista=dia&dia=${cell.date}`}
                  prefetch={false}
                  className={`min-h-28 border-b border-r border-slate-200 p-2 transition-colors hover:bg-brand-soft/50 ${
                    cell.inMonth ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <div className="mb-1.5 flex">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                        esHoy
                          ? "bg-brand font-semibold text-white"
                          : cell.inMonth
                            ? "font-semibold text-slate-700"
                            : "font-medium text-slate-400"
                      }`}
                    >
                      {Number(cell.date.slice(8))}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dts.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-1.5 truncate rounded bg-slate-100 px-1.5 py-1 text-[11px] font-medium text-slate-700"
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotDe[t.estado]}`}
                        />
                        <span className="truncate">
                          {horaCorta(t.hora)} {t.paciente_nombre}
                        </span>
                      </div>
                    ))}
                    {dts.length > 3 && (
                      <div className="pl-1 text-[11px] font-medium text-slate-400">
                        +{dts.length - 3} más
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista SEMANA */}
      {vista === "semana" && (
        <div className="mb-8 space-y-3">
          {semanaDe(dia).map((d) => {
            const dts = porDia.get(d) ?? [];
            return (
              <div
                key={d}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                  <span className="text-sm font-medium capitalize text-slate-700">
                    {diaLabel(d)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {dts.length} turno{dts.length === 1 ? "" : "s"}
                  </span>
                </div>
                {dts.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">Sin turnos.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {dts.map((t) => (
                      <TurnoRow key={t.id} turno={t} />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vista DÍA */}
      {vista === "dia" && (
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium capitalize text-slate-700">
              {diaLabel(dia)}
            </span>
          </div>
          {(porDia.get(dia) ?? []).length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sin turnos este día"
              description="Agendá uno con el formulario de abajo."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {(porDia.get(dia) ?? []).map((t) => (
                <TurnoRow key={t.id} turno={t} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Nuevo turno */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">Nuevo turno</h2>
        <TurnoForm
          pacientes={pacientes}
          profesionales={profesionales}
          fecha={vista === "mes" ? hoy : dia}
          profesionalId={me?.id ?? ""}
        />
      </section>
    </div>
  );
}
