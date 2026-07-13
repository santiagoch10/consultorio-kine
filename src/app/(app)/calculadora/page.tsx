import Link from "next/link";
import { Calculator, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isMissingTable } from "@/lib/supabase/errors";
import { formatCurrency } from "@/lib/format";
import {
  costoPorHora,
  horasEfectivasMes,
  horasProductivasMes,
} from "@/lib/costeo";
import {
  CONFIGURACION_COSTEO_DEFAULT,
  type ConfiguracionCosteo,
  type Costo,
  type Prestacion,
} from "@/lib/types";
import CalculadoraForm from "@/components/CalculadoraForm";
import SetupBanner from "@/components/SetupBanner";

export default async function CalculadoraPage() {
  const supabase = await createClient();
  const mesActual = new Date().toISOString().slice(0, 7);

  const [
    { data: prestData },
    { data: costeoData },
    { data: costosData, error: costosError },
  ] = await Promise.all([
    supabase.from("prestaciones").select("*").eq("activo", true).order("nombre"),
    supabase.from("configuracion_costeo").select("*").eq("id", 1).maybeSingle(),
    supabase.from("costos").select("*"),
  ]);

  const needsSetup = isMissingTable(costosError);
  const prestaciones = (prestData ?? []) as Prestacion[];
  const config: ConfiguracionCosteo = costeoData ?? CONFIGURACION_COSTEO_DEFAULT;
  const costos = (costosData ?? []) as Costo[];

  const costoFijoMensual = costos
    .filter((c) => c.tipo === "fijo" && c.fecha.startsWith(mesActual))
    .reduce((a, c) => a + (Number(c.monto) || 0), 0);

  const hProductivas = horasProductivasMes(
    config.dias_por_semana,
    config.horas_por_dia,
  );
  const hEfectivas = horasEfectivasMes(hProductivas, config.ocupacion_pct);
  const cHora = costoPorHora(costoFijoMensual, hEfectivas);

  return (
    <div>
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Calculadora de precios
          </h1>
          <p className="text-sm text-slate-500">
            Costeo por hora de consultorio, según tus costos fijos reales.
          </p>
        </div>
      </header>

      {needsSetup && <SetupBanner />}

      {/* Cómo se llegó al costo por hora */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-brand" />
          <h2 className="font-medium text-slate-700">
            Costo por hora de consultorio (este mes)
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-slate-500">Costos fijos del mes</p>
            <p className="mt-1 font-semibold text-slate-800">
              {formatCurrency(costoFijoMensual)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Horas productivas</p>
            <p className="mt-1 font-semibold text-slate-800">
              {hProductivas.toFixed(0)} hs/mes
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              Horas efectivas ({config.ocupacion_pct}% ocupación)
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {hEfectivas.toFixed(0)} hs/mes
            </p>
          </div>
          <div>
            <p className="text-slate-500">Costo por hora</p>
            <p className="mt-1 font-semibold text-brand">
              {formatCurrency(cHora)}
            </p>
          </div>
        </div>
        {costoFijoMensual === 0 && (
          <p className="mt-3 text-xs text-amber-600">
            Todavía no cargaste costos fijos este mes en{" "}
            <Link href="/costos" className="underline">
              Costos
            </Link>
            , así que el costo por hora da $0.
          </p>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Parámetros (días/horas/ocupación) editables en{" "}
          <Link href="/configuracion" className="underline">
            Configuración
          </Link>
          . Cambiarlos no afecta sesiones ya registradas.
        </p>
      </div>

      <CalculadoraForm
        prestaciones={prestaciones}
        costoHora={cHora}
        margenDefault={config.margen_default_pct}
      />
    </div>
  );
}
