import { Users, BellRing, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isMissingTable } from "@/lib/supabase/errors";
import { diasDesde, soloDigitos } from "@/lib/format";
import { DIAS_INACTIVIDAD, type Paciente } from "@/lib/types";
import PacienteForm from "@/components/PacienteForm";
import PacientesList from "@/components/PacientesList";
import SetupBanner from "@/components/SetupBanner";
import PageHeader from "@/components/PageHeader";

export default async function PacientesPage() {
  const supabase = await createClient();

  const [{ data: pacData, error: pacError }, { data: tratData }, { data: sesData }] =
    await Promise.all([
      supabase.from("pacientes").select("*").order("nombre"),
      supabase
        .from("tratamientos")
        .select("id, paciente_id, estado, sesiones_planificadas, fecha_inicio, prestacion_nombre"),
      supabase.from("sesiones").select("tratamiento_id, fecha"),
    ]);

  const needsSetup = isMissingTable(pacError);
  const pacientes = (pacData ?? []) as Paciente[];
  const tratamientos = tratData ?? [];
  const sesiones = sesData ?? [];

  // Última sesión y cantidad por tratamiento.
  const resumen = new Map<string, { hechas: number; ultima: string | null }>();
  for (const s of sesiones) {
    const r = resumen.get(s.tratamiento_id) ?? { hechas: 0, ultima: null };
    r.hechas += 1;
    if (!r.ultima || s.fecha > r.ultima) r.ultima = s.fecha;
    resumen.set(s.tratamiento_id, r);
  }

  // Pacientes a re-contactar: tratamiento activo, incompleto y sin actividad.
  const pacientesById = new Map(pacientes.map((p) => [p.id, p]));
  const recontactar: {
    paciente: Paciente;
    prestacion: string;
    hechas: number;
    planificadas: number;
    dias: number;
  }[] = [];

  for (const t of tratamientos) {
    if (t.estado !== "activo" || !t.paciente_id) continue;
    const r = resumen.get(t.id) ?? { hechas: 0, ultima: null };
    if (r.hechas >= t.sesiones_planificadas) continue;
    const dias = r.ultima ? diasDesde(r.ultima) : diasDesde(t.fecha_inicio);
    if (dias >= DIAS_INACTIVIDAD) {
      const p = pacientesById.get(t.paciente_id);
      if (p)
        recontactar.push({
          paciente: p,
          prestacion: t.prestacion_nombre,
          hechas: r.hechas,
          planificadas: t.sesiones_planificadas,
          dias,
        });
    }
  }

  return (
    <div>
      <PageHeader
        icon={Users}
        title="Pacientes"
        subtitle="Fichas, seguimiento y re-contacto de pacientes."
      />

      {needsSetup && <SetupBanner />}

      {/* Alertas: pacientes a re-contactar */}
      {recontactar.length > 0 && (
        <section className="mb-8 overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 border-b border-amber-200 px-6 py-4">
            <BellRing className="h-5 w-5 text-amber-500" />
            <h2 className="font-medium text-amber-800">
              Para re-contactar ({recontactar.length})
            </h2>
          </div>
          <ul className="divide-y divide-amber-200/60">
            {recontactar.map((r, i) => (
              <li key={i} className="flex items-center gap-4 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {r.paciente.nombre}
                  </p>
                  <p className="truncate text-xs text-slate-600">
                    {r.prestacion} · {r.hechas}/{r.planificadas} sesiones · hace{" "}
                    {r.dias} días sin venir
                  </p>
                </div>
                {r.paciente.telefono && (
                  <a
                    href={`https://wa.me/${soloDigitos(r.paciente.telefono)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Alta de paciente */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">Nuevo paciente</h2>
        <PacienteForm />
      </section>

      {/* Listado */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <PacientesList pacientes={pacientes} />
      </section>
    </div>
  );
}
