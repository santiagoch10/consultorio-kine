import type { LucideIcon } from "lucide-react";

// Tonos semánticos: el color comunica el significado del dato de un vistazo.
// - brand:    dato neutro-positivo (marca)
// - positive: algo bueno / ingreso (verde)
// - warning:  requiere atención (ámbar)
// - danger:   alerta / negativo (rojo)
// - neutral:  sin carga (gris)
export type StatTone = "brand" | "positive" | "warning" | "danger" | "neutral";

const toneStyles: Record<StatTone, { icon: string; value: string }> = {
  brand: { icon: "bg-brand-soft text-brand", value: "text-slate-800" },
  positive: { icon: "bg-emerald-50 text-emerald-600", value: "text-emerald-600" },
  warning: { icon: "bg-amber-50 text-amber-600", value: "text-amber-600" },
  danger: { icon: "bg-red-50 text-red-600", value: "text-red-600" },
  neutral: { icon: "bg-slate-100 text-slate-500", value: "text-slate-800" },
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
}) {
  const s = toneStyles[tone];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.icon}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-semibold tabular-nums ${s.value}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
