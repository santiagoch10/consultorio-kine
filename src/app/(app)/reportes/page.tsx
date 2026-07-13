import PagePlaceholder from "@/components/PagePlaceholder";
import { FileText } from "lucide-react";

export default function ReportesPage() {
  return (
    <PagePlaceholder
      title="Reportes"
      description="Reporte mensual descargable en PDF (consolidado e individual) con el resumen económico."
      icon={FileText}
    />
  );
}
