// Utilidades de fechas para la Agenda (calendario mensual/semanal).

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// La app siempre razona sobre la fecha en hora de Argentina, sin importar
// dónde corra el servidor (Render usa UTC). Usar toISOString() daba la fecha
// en UTC: entre las 21 y las 24 hs de Argentina "hoy" saltaba al día
// siguiente y los turnos/sesiones quedaban mal fechados.
const TZ_AR = "America/Argentina/Buenos_Aires";
const fmtDiaAR = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ_AR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// 'YYYY-MM-DD' de una fecha (por defecto ahora) en hora de Argentina.
export function fechaAR(date: Date = new Date()): string {
  return fmtDiaAR.format(date);
}

// 'YYYY-MM' del mes actual (hora de Argentina).
export function mesActualYM(): string {
  return fechaAR().slice(0, 7);
}

// 'YYYY-MM-DD' de hoy (hora de Argentina).
export function hoyISO(): string {
  return fechaAR();
}

// "Julio 2026" a partir de 'YYYY-MM'.
export function mesLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const nombre = MESES[m - 1] ?? "";
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${y}`;
}

// Mes adyacente (delta = -1 anterior, +1 siguiente).
export function mesAdyacente(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// 'YYYY-MM' que contiene a un día.
export function ymDeDia(dia: string): string {
  return dia.slice(0, 7);
}

// Grilla del mes (semanas de lunes a domingo). Cada celda: { date, inMonth }.
export function gridMes(ym: string): { date: string; inMonth: boolean }[][] {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7; // días desde el lunes
  const cur = new Date(y, m - 1, 1 - offset);
  const weeks: { date: string; inMonth: boolean }[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: { date: string; inMonth: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({ date: iso(cur), inMonth: cur.getMonth() === m - 1 });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  // Sacar una 6ta semana que quede toda fuera del mes.
  if (weeks[5].every((c) => !c.inMonth)) weeks.pop();
  return weeks;
}

// Los 7 días (lunes a domingo) de la semana que contiene a 'dia'.
export function semanaDe(dia: string): string[] {
  const [y, m, d] = dia.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const offset = (base.getDay() + 6) % 7;
  const monday = new Date(y, m - 1, d - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const c = new Date(monday);
    c.setDate(monday.getDate() + i);
    return iso(c);
  });
}

// Suma (o resta) días a una fecha 'YYYY-MM-DD'.
export function sumarDias(dia: string, n: number): string {
  const [y, m, d] = dia.split("-").map(Number);
  const date = new Date(y, m - 1, d + n);
  return iso(date);
}

export const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// "lunes 7" para encabezados de día.
export function diaLabel(dia: string): string {
  const [y, m, d] = dia.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const nombres = [
    "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
  ];
  return `${nombres[date.getDay()]} ${d}`;
}
