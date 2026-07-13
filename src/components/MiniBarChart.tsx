import { formatCurrency } from "@/lib/format";

type Serie = { label: string; color: string; values: number[] };

// Gráfico de barras simple (una o dos series), mismo eje, sin librerías externas.
export default function MiniBarChart({
  categorias,
  series,
  formatValue = formatCurrency,
}: {
  categorias: string[];
  series: Serie[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex h-40 items-end gap-3 border-b border-slate-100">
        {categorias.map((cat, i) => (
          <div key={cat} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-32 w-full items-end justify-center gap-1">
              {series.map((s) => {
                const v = s.values[i] ?? 0;
                const alturaPct = Math.max(2, (v / max) * 100);
                return (
                  <div
                    key={s.label}
                    title={`${s.label}: ${formatValue(v)}`}
                    className="w-full rounded-t-[4px]"
                    style={{
                      height: `${alturaPct}%`,
                      backgroundColor: s.color,
                      maxWidth: series.length > 1 ? "18px" : "28px",
                    }}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
