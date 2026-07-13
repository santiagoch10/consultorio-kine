export type Prestacion = {
  id: string;
  created_at: string;
  nombre: string;
  precio: number;
  sesiones_sugeridas: number;
  duracion_min: number;
  costo_variable: number;
  activo: boolean;
};

export type ConfiguracionCosteo = {
  horas_por_dia: number;
  dias_por_semana: number;
  ocupacion_pct: number;
  margen_default_pct: number;
  objetivo_activo: boolean;
  objetivo_monto: number;
  objetivo_ganancia: number;
};

export const CONFIGURACION_COSTEO_DEFAULT: ConfiguracionCosteo = {
  horas_por_dia: 6,
  dias_por_semana: 5,
  ocupacion_pct: 60,
  margen_default_pct: 30,
  objetivo_activo: false,
  objetivo_monto: 0,
  objetivo_ganancia: 0,
};

export type EstadoTratamiento = "activo" | "completado" | "abandonado";

export type Tratamiento = {
  id: string;
  created_at: string;
  paciente_id: string | null;
  paciente_nombre: string;
  prestacion_nombre: string;
  precio_sesion: number;
  sesiones_planificadas: number;
  estado: EstadoTratamiento;
  observaciones: string | null;
  profesional_id: string;
  profesional_nombre: string;
  fecha_inicio: string;
};

export type Sesion = {
  id: string;
  created_at: string;
  tratamiento_id: string;
  fecha: string;
  monto: number;
  medio_pago: string | null;
  observaciones: string | null;
  profesional_id: string;
};

export const MEDIOS_PAGO = [
  "Efectivo",
  "Transferencia",
  "Tarjeta de débito",
  "Tarjeta de crédito",
  "Obra social",
  "Otro",
] as const;

// Un tratamiento "activo" sin sesiones nuevas en este período se considera
// inactivo (candidato a re-contactar desde el CRM).
export const DIAS_INACTIVIDAD = 21;

// ---- Costos ----
export type TipoCosto = "fijo" | "variable";
export type AlcanceCosto = "compartido" | "individual";

export type Costo = {
  id: string;
  created_at: string;
  fecha: string;
  concepto: string;
  categoria: string;
  tipo: TipoCosto;
  alcance: AlcanceCosto;
  profesional_id: string | null;
  profesional_nombre: string | null;
  monto: number;
};

// ---- Pacientes (CRM) ----
export type Paciente = {
  id: string;
  created_at: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  fecha_nacimiento: string | null;
  obra_social: string | null;
  notas: string | null;
  activo: boolean;
};

// ---- Turnos (Agenda) ----
export type EstadoTurno =
  | "pendiente"
  | "confirmado"
  | "asistio"
  | "ausente"
  | "cancelado";

export type Turno = {
  id: string;
  created_at: string;
  fecha: string;
  hora: string;
  duracion_min: number;
  paciente_id: string | null;
  paciente_nombre: string;
  profesional_id: string | null;
  profesional_nombre: string;
  estado: EstadoTurno;
  notas: string | null;
};

// Metadatos de cada estado: etiqueta y colores (punto y badge).
export const ESTADOS_TURNO: {
  value: EstadoTurno;
  label: string;
  dot: string;
  badge: string;
}[] = [
  { value: "pendiente", label: "Pendiente", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  { value: "confirmado", label: "Confirmado", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  { value: "asistio", label: "Asistió", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  { value: "ausente", label: "Ausente", dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  { value: "cancelado", label: "Cancelado", dot: "bg-slate-400", badge: "bg-slate-200 text-slate-500" },
];

export const CATEGORIAS_COSTO = [
  "Alquiler",
  "Servicios",
  "Insumos",
  "Sueldos",
  "Equipamiento",
  "Marketing",
  "Impuestos",
  "Otros",
] as const;
