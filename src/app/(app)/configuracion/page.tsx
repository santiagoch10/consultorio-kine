import { Settings, Sliders, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isMissingTable } from "@/lib/supabase/errors";
import { CONFIGURACION_COSTEO_DEFAULT, type ConfiguracionCosteo, type Prestacion } from "@/lib/types";
import PrestacionForm from "@/components/PrestacionForm";
import PrestacionRow from "@/components/PrestacionRow";
import ParametrosCosteoForm from "@/components/ParametrosCosteoForm";
import ObjetivoForm from "@/components/ObjetivoForm";
import SetupBanner from "@/components/SetupBanner";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const [{ data, error }, { data: costeoData }] = await Promise.all([
    supabase.from("prestaciones").select("*").order("nombre"),
    supabase.from("configuracion_costeo").select("*").eq("id", 1).maybeSingle(),
  ]);

  const needsSetup = isMissingTable(error);
  const prestaciones = (data ?? []) as Prestacion[];
  const config: ConfiguracionCosteo = costeoData ?? CONFIGURACION_COSTEO_DEFAULT;

  return (
    <div>
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Configuración
          </h1>
          <p className="text-sm text-slate-500">
            Prestaciones, parámetros de costeo y ajustes del consultorio.
          </p>
        </div>
      </header>

      {needsSetup && <SetupBanner />}

      {/* Parámetros de costeo */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-1 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-brand" />
          <h2 className="font-medium text-slate-700">
            Parámetros de costeo del consultorio
          </h2>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Se usan para calcular el costo por hora de consultorio en la
          Calculadora de precios. Cambiarlos no afecta las sesiones ya
          registradas.
        </p>
        <ParametrosCosteoForm config={config} />
      </section>

      {/* Objetivo de facturación */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-1 flex items-center gap-2">
          <Target className="h-4 w-4 text-brand" />
          <h2 className="font-medium text-slate-700">
            Objetivo de facturación mensual
          </h2>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Se muestra como barra de progreso en Números de Kinexus. Podés
          activarlo o desactivarlo cuando quieras.
        </p>
        <ObjetivoForm config={config} />
      </section>

      {/* Alta de prestación */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 font-medium text-slate-700">Prestaciones</h2>
        <p className="mb-4 text-sm text-slate-500">
          Cargá los servicios del consultorio con su precio, duración y costo
          variable (insumos).
        </p>
        <PrestacionForm />
      </section>

      {/* Lista de prestaciones */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-medium text-slate-700">
            Prestaciones cargadas ({prestaciones.length})
          </h2>
        </div>

        {prestaciones.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            Todavía no hay prestaciones. Agregá la primera arriba.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {prestaciones.map((p) => (
              <PrestacionRow key={p.id} prestacion={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
