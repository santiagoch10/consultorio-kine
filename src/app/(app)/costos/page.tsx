import { Wallet, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listUsers } from "@/lib/auth";
import { isMissingTable } from "@/lib/supabase/errors";
import { formatCurrency, formatDate } from "@/lib/format";
import { mesActualYM } from "@/lib/fecha";
import type { Costo } from "@/lib/types";
import CostoForm from "@/components/CostoForm";
import SetupBanner from "@/components/SetupBanner";
import ResumenCostos from "@/components/ResumenCostos";
import { deleteCosto } from "./actions";

export default async function CostosPage() {
  const supabase = await createClient();
  const [{ data, error }, users] = await Promise.all([
    supabase.from("costos").select("*").order("fecha", { ascending: false }),
    listUsers(),
  ]);

  const needsSetup = isMissingTable(error);
  const costos = (data ?? []) as Costo[];
  const profesionales = users.map((u) => ({ id: u.id, name: u.name }));

  // Resumen del mes actual.
  const mesActual = mesActualYM();
  const delMes = costos.filter((c) => c.fecha.startsWith(mesActual));
  const totalMes = delMes.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const fijosMes = delMes
    .filter((c) => c.tipo === "fijo")
    .reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const variablesMes = delMes
    .filter((c) => c.tipo === "variable")
    .reduce((a, c) => a + (Number(c.monto) || 0), 0);

  return (
    <div>
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Costos</h1>
          <p className="text-sm text-slate-500">
            Gastos fijos y variables del consultorio.
          </p>
        </div>
      </header>

      {needsSetup && <SetupBanner />}

      {/* Resumen del mes */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Costos este mes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatCurrency(totalMes)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Fijos</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatCurrency(fijosMes)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Variables</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatCurrency(variablesMes)}
          </p>
        </div>
      </div>

      <ResumenCostos costos={delMes} />

      {/* Alta de costo */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">Registrar costo</h2>
        <CostoForm profesionales={profesionales} />
      </section>

      {/* Listado */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-medium text-slate-700">
            Todos los costos ({costos.length})
          </h2>
        </div>

        {costos.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            Todavía no hay costos cargados.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {costos.map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-6 py-4">
                <span className="hidden w-24 shrink-0 text-sm text-slate-500 sm:block">
                  {formatDate(c.fecha)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {c.concepto}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {c.categoria}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.tipo === "fijo"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {c.tipo === "fijo" ? "Fijo" : "Variable"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {c.alcance === "individual"
                        ? `Individual · ${c.profesional_nombre ?? "—"}`
                        : "Compartido"}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {formatCurrency(Number(c.monto) || 0)}
                </span>
                <form action={deleteCosto}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    title="Eliminar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-[18px] w-[18px]" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
