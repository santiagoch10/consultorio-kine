import { PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Costo } from "@/lib/types";

export default function ResumenCostos({ costos }: { costos: Costo[] }) {
  const total = costos.reduce((a, c) => a + (Number(c.monto) || 0), 0);

  // Por categoría, de mayor a menor.
  const porCategoria = new Map<string, number>();
  for (const c of costos) {
    porCategoria.set(
      c.categoria,
      (porCategoria.get(c.categoria) ?? 0) + (Number(c.monto) || 0),
    );
  }
  const categorias = [...porCategoria.entries()].sort((a, b) => b[1] - a[1]);

  // Compartido vs. individual por profesional.
  const compartido = costos
    .filter((c) => c.alcance === "compartido")
    .reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const porProfesional = new Map<string, number>();
  for (const c of costos) {
    if (c.alcance === "individual") {
      const nombre = c.profesional_nombre ?? "Sin asignar";
      porProfesional.set(
        nombre,
        (porProfesional.get(nombre) ?? 0) + (Number(c.monto) || 0),
      );
    }
  }

  if (total === 0) return null;

  return (
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-4 w-4 text-brand" />
        <h2 className="font-medium text-slate-700">
          Resumen segmentado (este mes)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Por categoría */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Por categoría
          </p>
          <div className="space-y-2">
            {categorias.map(([cat, monto]) => (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{cat}</span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(monto)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(monto / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compartido vs individual */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Compartido vs. individual
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-600">Compartido (socios)</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(compartido)}
              </span>
            </div>
            {[...porProfesional.entries()].map(([nombre, monto]) => (
              <div
                key={nombre}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-600">{nombre}</span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(monto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
