import { Trash2 } from "lucide-react";
import { horaCorta } from "@/lib/format";
import { ESTADOS_TURNO, type EstadoTurno, type Turno } from "@/lib/types";
import { setEstadoTurno, deleteTurno } from "@/app/(app)/agenda/actions";

const meta = Object.fromEntries(ESTADOS_TURNO.map((e) => [e.value, e]));

const acciones: { estado: EstadoTurno; label: string }[] = [
  { estado: "confirmado", label: "Confirmar" },
  { estado: "asistio", label: "Asistió" },
  { estado: "ausente", label: "Ausente" },
  { estado: "cancelado", label: "Cancelar" },
];

export default function TurnoRow({ turno }: { turno: Turno }) {
  const m = meta[turno.estado];

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="w-12 shrink-0 text-sm font-semibold text-slate-700">
        {horaCorta(turno.hora)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {turno.paciente_nombre}
        </p>
        <p className="truncate text-xs text-slate-500">
          {turno.profesional_nombre}
        </p>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.badge}`}>
        {m.label}
      </span>
      <div className="flex items-center gap-1">
        {acciones
          .filter((a) => a.estado !== turno.estado)
          .map((a) => (
            <form action={setEstadoTurno} key={a.estado}>
              <input type="hidden" name="id" value={turno.id} />
              <input type="hidden" name="estado" value={a.estado} />
              <button
                type="submit"
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
              >
                {a.label}
              </button>
            </form>
          ))}
        <form action={deleteTurno}>
          <input type="hidden" name="id" value={turno.id} />
          <button
            type="submit"
            title="Eliminar turno"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>
    </li>
  );
}
