import Link from "next/link";
import {
  CalendarClock,
  Users,
  XCircle,
  DollarSign,
  Activity,
  UserPlus,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { horaCorta } from "@/lib/format";
import { hoyISO } from "@/lib/fecha";
import { ESTADOS_TURNO, type EstadoTurno, type Turno } from "@/lib/types";

const badgeDe = Object.fromEntries(
  ESTADOS_TURNO.map((e) => [e.value, e]),
) as Record<EstadoTurno, (typeof ESTADOS_TURNO)[number]>;

function Card({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export default async function InicioPage() {
  const hoy = hoyISO();
  const mes = hoy.slice(0, 7);

  const supabase = await createClient();
  const [me, { data: turnosData }, { data: sesData }, { data: tratData }, { data: pacData }] =
    await Promise.all([
      getCurrentUser(),
      supabase.from("turnos").select("*").eq("fecha", hoy).order("hora"),
      supabase.from("sesiones").select("monto"),
      supabase.from("tratamientos").select("paciente_id, estado"),
      supabase.from("pacientes").select("id, created_at"),
    ]);

  const turnosHoy = (turnosData ?? []) as Turno[];
  const sesiones = sesData ?? [];
  const tratamientos = tratData ?? [];
  const pacientes = pacData ?? [];

  const nombre = (me?.name ?? "").split(" ")[0] || "kinesiólogo/a";

  // Operativos del día.
  const activosHoy = turnosHoy.filter((t) => t.estado !== "cancelado");
  const pacientesDelDia = new Set(activosHoy.map((t) => t.paciente_nombre)).size;
  const proximos = turnosHoy.filter(
    (t) => t.estado === "pendiente" || t.estado === "confirmado",
  ).length;
  const cancelados = turnosHoy.filter((t) => t.estado === "cancelado").length;
  const sinCobrar = sesiones.filter((s) => (Number(s.monto) || 0) === 0).length;

  // Indicadores rápidos.
  const pacientesActivos = new Set(
    tratamientos
      .filter((t) => t.estado === "activo" && t.paciente_id)
      .map((t) => t.paciente_id),
  ).size;
  const nuevosDelMes = pacientes.filter((p) =>
    (p.created_at ?? "").startsWith(mes),
  ).length;

  const fechaRaw = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const fechaLarga = fechaRaw.charAt(0).toUpperCase() + fechaRaw.slice(1);

  return (
    <div>
      {/* Saludo */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">
          ¡Hola, {nombre}! 👋
        </h1>
        <p className="text-sm text-slate-500">{fechaLarga}</p>
      </header>

      {/* Resumen del día */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          label="Pacientes del día"
          value={pacientesDelDia}
          hint="Con turno hoy"
          icon={Users}
        />
        <Card
          label="Próximos turnos"
          value={proximos}
          hint="Pendientes / confirmados hoy"
          icon={CalendarClock}
        />
        <Card
          label="Turnos cancelados"
          value={cancelados}
          hint="Hoy"
          icon={XCircle}
        />
        <Card
          label="Sesiones sin cobrar"
          value={sinCobrar}
          hint="Registradas con monto $0"
          icon={DollarSign}
        />
      </div>

      {/* Indicadores rápidos */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card
          label="Pacientes activos"
          value={pacientesActivos}
          hint="Con tratamiento en curso"
          icon={Activity}
        />
        <Card
          label="Pacientes nuevos"
          value={nuevosDelMes}
          hint="Este mes"
          icon={UserPlus}
        />
        <Card
          label="Turnos de hoy"
          value={turnosHoy.length}
          hint="Total agendados"
          icon={CalendarCheck}
        />
      </div>

      {/* Agenda de hoy */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-medium text-slate-700">Agenda de hoy</h2>
          <Link
            href="/agenda"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Ver agenda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {turnosHoy.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            No hay turnos agendados para hoy.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {turnosHoy.map((t) => {
              const b = badgeDe[t.estado];
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <span className="w-12 shrink-0 text-sm font-semibold text-slate-700">
                    {horaCorta(t.hora)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {t.paciente_nombre}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {t.profesional_nombre}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.badge}`}
                  >
                    {b.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
