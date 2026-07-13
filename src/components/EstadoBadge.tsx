import type { EstadoTratamiento } from "@/lib/types";

const styles: Record<EstadoTratamiento, string> = {
  activo: "bg-brand-soft text-brand",
  completado: "bg-emerald-100 text-emerald-700",
  abandonado: "bg-slate-200 text-slate-600",
};

const labels: Record<EstadoTratamiento, string> = {
  activo: "Activo",
  completado: "Completado",
  abandonado: "Abandonado",
};

export default function EstadoBadge({
  estado,
}: {
  estado: EstadoTratamiento;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[estado]}`}
    >
      {labels[estado]}
    </span>
  );
}
