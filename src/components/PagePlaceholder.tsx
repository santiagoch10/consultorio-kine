import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

// Encabezado + estado "en construcción" reutilizable para cada módulo.
export default function PagePlaceholder({ title, description, icon: Icon }: Props) {
  return (
    <div>
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </header>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-400">
          Este módulo se construirá en las próximas fases.
        </p>
      </div>
    </div>
  );
}
