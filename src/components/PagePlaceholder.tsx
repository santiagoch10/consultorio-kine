import type { LucideIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

// Encabezado + estado "en construcción" reutilizable para cada módulo.
export default function PagePlaceholder({ title, description, icon }: Props) {
  return (
    <div>
      <PageHeader icon={icon} title={title} subtitle={description} />

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-400">
          Este módulo se construirá en las próximas fases.
        </p>
      </div>
    </div>
  );
}
