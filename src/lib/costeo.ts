// Motor de cálculo del método "costo por hora de consultorio".
// Cambiar estos parámetros nunca recalcula sesiones/tratamientos ya guardados:
// esos registros conservan el precio que tenían al momento de crearse.

const SEMANAS_POR_MES = 4.33;

// Horas productivas totales del mes según el horario de atención cargado.
export function horasProductivasMes(
  diasPorSemana: number,
  horasPorDia: number,
): number {
  return diasPorSemana * horasPorDia * SEMANAS_POR_MES;
}

// Horas realmente ocupadas, aplicando el % de ocupación estimado (colchón por baches en la agenda).
export function horasEfectivasMes(
  horasProductivas: number,
  ocupacionPct: number,
): number {
  return horasProductivas * (ocupacionPct / 100);
}

// Costo de tener el consultorio abierto una hora (alquiler, servicios, sueldos fijos, etc. / horas efectivas).
export function costoPorHora(
  costoFijoMensual: number,
  horasEfectivas: number,
): number {
  if (horasEfectivas <= 0) return 0;
  return costoFijoMensual / horasEfectivas;
}

// Punto de equilibrio: facturación mínima para cubrir los costos fijos del mes,
// dado el margen de contribución observado (ingresos y costos variables reales).
// Si se pasa un objetivo de ganancia (>0), calcula "punto de equilibrio + ganancia":
// cuánto hay que facturar para cubrir costos Y además ganar ese monto extra.
export function puntoEquilibrio(
  costosFijos: number,
  ingresos: number,
  costosVariables: number,
  objetivoGanancia = 0,
): number | null {
  if (ingresos <= 0) return null;
  const margenContribucion = (ingresos - costosVariables) / ingresos;
  if (margenContribucion <= 0) return null;
  return (costosFijos + objetivoGanancia) / margenContribucion;
}

// Costo total de una sesión: proporcional a su duración + sus insumos (costo variable).
export function costoSesion(
  costoHora: number,
  duracionMin: number,
  costoVariable: number,
): number {
  return costoHora * (duracionMin / 60) + costoVariable;
}
