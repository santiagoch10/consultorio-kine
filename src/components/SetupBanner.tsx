import { AlertTriangle } from "lucide-react";

// Aviso que aparece cuando las tablas todavía no existen en Supabase.
export default function SetupBanner() {
  return (
    <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
      <div className="text-sm text-amber-800">
        <p className="font-medium">Falta preparar la base de datos</p>
        <p className="mt-1">
          Ejecutá el script SQL en Supabase (SQL Editor) para crear las tablas.
          Una vez hecho, esta sección funciona sola.
        </p>
      </div>
    </div>
  );
}
