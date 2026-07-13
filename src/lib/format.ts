// Los formateadores Intl son costosos de crear, así que se instancian una
// sola vez a nivel módulo y se reutilizan (importa al renderizar listas largas).

const currencyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

// Formatea un número como pesos argentinos (sin decimales).
export function formatCurrency(n: number): string {
  return currencyFmt.format(n || 0);
}

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// Formatea una fecha ('YYYY-MM-DD' o ISO) al formato DD/MM/AAAA.
export function formatDate(d: string): string {
  const s = d.length === 10 ? d + "T00:00:00" : d;
  return dateFmt.format(new Date(s));
}

// Fecha de hoy en formato 'YYYY-MM-DD' (para inputs type="date").
// Reutiliza el helper centralizado en hora de Argentina.
export { hoyISO as today } from "@/lib/fecha";

// 'HH:MM:SS' o 'HH:MM' -> 'HH:MM'.
export function horaCorta(t: string): string {
  return t.slice(0, 5);
}

// Deja solo los dígitos de un texto (para armar links de WhatsApp).
export function soloDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

// Días transcurridos desde una fecha ('YYYY-MM-DD' o ISO) hasta hoy.
export function diasDesde(fecha: string): number {
  const s = fecha.length === 10 ? fecha + "T00:00:00" : fecha;
  return Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
}
