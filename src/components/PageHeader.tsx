import type { LucideIcon } from "lucide-react";

// Encabezado consistente para todos los módulos: ícono en cuadro de marca
// + título + subtítulo. Centralizarlo garantiza que todas las pantallas
// (y las futuras) se vean iguales.
export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-8 flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </header>
  );
}
