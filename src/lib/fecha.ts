// Utilidades de fechas para la Agenda (calendario mensual/semanal).

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// 'YYYY-MM' del mes actual.
export function mesActualYM(): string {
  return new Date().toISOString().slice(0, 7);
}

// 'YYYY-MM-DD' de hoy.
export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
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
