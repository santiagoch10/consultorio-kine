import {
  Users,
  TrendingUp,
  Wallet,
  Percent,
  Receipt,
  Target,
  Scale,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { puntoEquilibrio } from "@/lib/costeo";
import {
  CONFIGURACION_COSTEO_DEFAULT,
  type ConfiguracionCosteo,
  type Costo,
} from "@/lib/types";
import MiniBarChart from "@/components/MiniBarChart";

function ymHaceMeses(n: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7);
}

function mesCorto(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-AR", { month: "short" }).format(
    new Date(y, m - 1, 1),
  );
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
}

export default async function NumerosPage() {
  const mesActual = ymHaceMeses(0);
  const seisMesesAtras = ymHaceMeses(5);
  const ultimos6 = Array.from({ length: 6 }, (_, i) => ymHaceMeses(5 - i));

  const supabase = await createClient();
  const [
    { data: sesData },
    { data: costosData },
    { data: tratData },
    { data: costeoData },
  ] = await Promise.all([
    supabase
      .from("sesiones")
      .select("tratamiento_id, monto, fecha")
      .gte("fecha", `${seisMesesAtras}-01`),
    supabase.from("costos").select("*").gte("fecha", `${seisMesesAtras}-01`),
    supabase.from("tratamientos").select("id, paciente_id"),
    supabase.from("configuracion_costeo").select("*").eq("id", 1).maybeSingle(),
  ]);

  const sesiones = sesData ?? [];
  const costos = (costosData ?? []) as Costo[];
  const tratamientos = tratData ?? [];
  const config: ConfiguracionCosteo = costeoData ?? CONFIGURACION_COSTEO_DEFAULT;

  const pacienteDeTratamiento = new Map(
    tratamientos.map((t) => [t.id, t.paciente_id]),
  );

  const sesionesMes = sesiones.filter((s) => s.fecha.startsWith(mesActual));
  const costosMesArr = costos.filter((c) => c.fecha.startsWith(mesActual));

  const ingresosMes = sesionesMes.reduce((a, s) => a + (Number(s.monto) || 0), 0);
  const costosMes = costosMesArr.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const fijosMes = costosMesArr
    .filter((c) => c.tipo === "fijo")
    .reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const variablesMes = costosMesArr
    .filter((c) => c.tipo === "variable")
    .reduce((a, c) => a + (Number(c.monto) || 0), 0);

  const margenPct = ingresosMes > 0 ? ((ingresosMes - costosMes) / ingresosMes) * 100 : 0;
  const markupPct = costosMes > 0 ? ((ingresosMes - costosMes) / costosMes) * 100 : 0;
  const ticketPromedio = sesionesMes.length > 0 ? ingresosMes / sesionesMes.length : 0;

  const pacientesAtendidos = new Set(
    sesionesMes
      .map((s) => pacienteDeTratamiento.get(s.tratamiento_id))
      .filter(Boolean),
  ).size;

  const pe = puntoEquilibrio(fijosMes, ingresosMes, variablesMes);
  const peConGanancia =
    config.objetivo_ganancia > 0
      ? puntoEquilibrio(fijosMes, ingresosMes, variablesMes, config.objetivo_ganancia)
      : null;
  const pacientesNecesarios =
    peConGanancia !== null && ticketPromedio > 0
      ? Math.ceil(peConGanancia / ticketPromedio)
      : null;

  const pctObjetivo =
    config.objetivo_activo && config.objetivo_monto > 0
      ? Math.min(100, (ingresosMes / config.objetivo_monto) * 100)
      : null;

  // Evolución mensual: ingresos vs costos, últimos 6 meses.
  const ingresosPorMes = ultimos6.map((ym) =>
    sesiones
      .filter((s) => s.fecha.startsWith(ym))
      .reduce((a, s) => a + (Number(s.monto) || 0), 0),
  );
  const costosPorMes = ultimos6.map((ym) =>
    costos
      .filter((c) => c.fecha.startsWith(ym))
      .reduce((a, c) => a + (Number(c.monto) || 0), 0),
  );

  const kpis = [
    { label: "Pacientes atendidos", value: String(pacientesAtendidos), hint: "Este mes", icon: Users },
    { label: "Ingresos", value: formatCurrency(ingresosMes), hint: "Este mes", icon: TrendingUp },
    { label: "Costos", value: formatCurrency(costosMes), hint: "Este mes", icon: Wallet },
    { label: "Margen", value: `${margenPct.toFixed(1)}%`, hint: "Ingresos vs costos", icon: Percent },
    { label: "Ticket promedio", value: formatCurrency(ticketPromedio), hint: "Por atención", icon: Receipt },
    { label: "Markup promedio", value: `${markupPct.toFixed(1)}%`, hint: "Precio vs costo", icon: Scale },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">
          Números de Kinexus
        </h1>
        <p className="text-sm text-slate-500">
          Análisis económico-financiero consolidado del consultorio.
        </p>
      </header>

      {/* Tarjetas de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{kpi.label}</span>
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-800">{kpi.value}</p>
              <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Objetivo mensual + Punto de equilibrio */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand" />
            <h2 className="font-medium text-slate-700">
              Objetivo de facturación mensual
            </h2>
          </div>
          {pctObjetivo === null ? (
            <p className="mt-4 text-sm text-slate-400">
              Desactivado. Se activa desde Configuración.
            </p>
          ) : (
            <>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${pctObjetivo}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {pctObjetivo.toFixed(0)}% de {formatCurrency(config.objetivo_monto)} (
                {formatCurrency(ingresosMes)} facturados)
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand" />
            <h2 className="font-medium text-slate-700">Punto de equilibrio</h2>
          </div>
          <p className="mt-4 text-2xl font-semibold text-slate-800">
            {pe === null ? "—" : formatCurrency(pe)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {pe === null
              ? "Necesita ingresos y costos cargados este mes."
              : "Facturación mínima para cubrir costos"}
          </p>

          {config.objetivo_ganancia > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                + Ganancia objetivo ({formatCurrency(config.objetivo_ganancia)})
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-800">
                {peConGanancia === null ? "—" : formatCurrency(peConGanancia)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {pacientesNecesarios === null
                  ? "Necesita ticket promedio del mes."
                  : `≈ ${pacientesNecesarios} pacientes al ticket promedio (${formatCurrency(ticketPromedio)})`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand" />
            <h2 className="font-medium text-slate-700">
              Ingresos vs. Costos (6 meses)
            </h2>
          </div>
          <div className="mt-4">
            <MiniBarChart
              categorias={ultimos6.map(mesCorto)}
              series={[
                { label: "Ingresos", color: "#065e53", values: ingresosPorMes },
                { label: "Costos", color: "#eb6834", values: costosPorMes },
              ]}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand" />
            <h2 className="font-medium text-slate-700">Margen mensual</h2>
          </div>
          <div className="mt-4">
            <MiniBarChart
              categorias={ultimos6.map(mesCorto)}
              series={[
                {
                  label: "Margen",
                  color: "#065e53",
                  values: ultimos6.map((ym, i) => {
                    const ing = ingresosPorMes[i];
                    const cos = costosPorMes[i];
                    return ing > 0 ? Math.max(0, ((ing - cos) / ing) * 100) : 0;
                  }),
                },
              ]}
              formatValue={(n) => `${n.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
