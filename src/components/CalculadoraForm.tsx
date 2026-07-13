"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { costoSesion } from "@/lib/costeo";
import type { Prestacion } from "@/lib/types";
import { aplicarPrecioPrestacion } from "@/app/(app)/calculadora/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

type Modo = "markup" | "mercado";

export default function CalculadoraForm({
  prestaciones,
  costoHora,
  margenDefault,
}: {
  prestaciones: Prestacion[];
  costoHora: number;
  margenDefault: number;
}) {
  const [prestacionId, setPrestacionId] = useState<string>("manual");
  const [duracionMin, setDuracionMin] = useState(60);
  const [costoVariable, setCostoVariable] = useState(0);
  const [modo, setModo] = useState<Modo>("markup");
  const [markupPct, setMarkupPct] = useState(margenDefault);
  const [precioMercado, setPrecioMercado] = useState(0);

  const prestacionSeleccionada = prestaciones.find((p) => p.id === prestacionId);

  function elegirPrestacion(id: string) {
    setPrestacionId(id);
    const p = prestaciones.find((x) => x.id === id);
    if (p) {
      setDuracionMin(p.duracion_min);
      setCostoVariable(p.costo_variable);
    }
  }

  const costo = useMemo(
    () => costoSesion(costoHora, duracionMin, costoVariable),
    [costoHora, duracionMin, costoVariable],
  );

  // Modo 1: por margen de marcación (markup sobre el costo).
  const precioSugerido = costo * (1 + markupPct / 100);
  const gananciaSugerida = precioSugerido - costo;
  const margenSugerido =
    precioSugerido > 0 ? (gananciaSugerida / precioSugerido) * 100 : 0;

  // Modo 2: a partir de un precio de mercado, ¿qué margen/markup resulta?
  const gananciaMercado = precioMercado - costo;
  const margenMercado =
    precioMercado > 0 ? (gananciaMercado / precioMercado) * 100 : 0;
  const markupMercado = costo > 0 ? (gananciaMercado / costo) * 100 : 0;

  const precioFinal = modo === "markup" ? precioSugerido : precioMercado;
  const gananciaFinal = modo === "markup" ? gananciaSugerida : gananciaMercado;
  const margenFinal = modo === "markup" ? margenSugerido : margenMercado;

  let semaforo: { icon: typeof CheckCircle2; color: string; texto: string };
  if (modo === "mercado" && precioMercado <= 0) {
    semaforo = { icon: AlertTriangle, color: "text-slate-400", texto: "Ingresá un precio de mercado." };
  } else if (gananciaFinal < 0) {
    semaforo = { icon: XCircle, color: "text-red-500", texto: "Estás perdiendo dinero con este precio." };
  } else if (margenFinal < margenDefault) {
    semaforo = {
      icon: AlertTriangle,
      color: "text-amber-500",
      texto: `Margen por debajo del objetivo (${margenDefault}%).`,
    };
  } else {
    semaforo = { icon: CheckCircle2, color: "text-emerald-500", texto: "Precio saludable." };
  }
  const SemaforoIcon = semaforo.icon;

  return (
    <div className="space-y-6">
      {/* Selección de sesión a costear */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">1. Sesión a costear</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Prestación
            </label>
            <select
              value={prestacionId}
              onChange={(e) => elegirPrestacion(e.target.value)}
              className={inputClass}
            >
              <option value="manual">Manual (sin prestación)</option>
              {prestaciones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Duración (minutos)
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={duracionMin}
              onChange={(e) => setDuracionMin(parseInt(e.target.value || "0", 10))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Costo variable / insumos ($)
            </label>
            <input
              type="number"
              min={0}
              value={costoVariable}
              onChange={(e) => setCostoVariable(parseFloat(e.target.value || "0"))}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>
            Costo por hora de consultorio:{" "}
            <strong className="text-slate-800">{formatCurrency(costoHora)}</strong>
          </span>
          <span>
            Costo de esta sesión ({duracionMin} min):{" "}
            <strong className="text-slate-800">{formatCurrency(costo)}</strong>
          </span>
        </div>
      </div>

      {/* Modo de cálculo */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium text-slate-700">2. Calcular el precio</h2>
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setModo("markup")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                modo === "markup" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Por margen de marcación
            </button>
            <button
              type="button"
              onClick={() => setModo("mercado")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                modo === "mercado" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Por precio de mercado
            </button>
          </div>
        </div>

        {modo === "markup" ? (
          <div className="max-w-xs">
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Margen de marcación sobre el costo (%)
            </label>
            <input
              type="number"
              min={0}
              step={5}
              value={markupPct}
              onChange={(e) => setMarkupPct(parseFloat(e.target.value || "0"))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">
              Por defecto {margenDefault}% (configurable en Configuración).
            </p>
          </div>
        ) : (
          <div className="max-w-xs">
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Precio que cobra la competencia ($)
            </label>
            <input
              type="number"
              min={0}
              value={precioMercado || ""}
              onChange={(e) => setPrecioMercado(parseFloat(e.target.value || "0"))}
              className={inputClass}
              placeholder="Ej: 20000"
            />
          </div>
        )}
      </div>

      {/* Resultado */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">3. Resultado</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Precio</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">
              {formatCurrency(precioFinal)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Ganancia por sesión</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">
              {formatCurrency(gananciaFinal)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">
              {modo === "markup" ? "Margen resultante" : "Margen / Markup"}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">
              {margenFinal.toFixed(1)}%
              {modo === "mercado" && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  (markup {markupMercado.toFixed(1)}%)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className={`mt-4 flex items-center gap-2 text-sm ${semaforo.color}`}>
          <SemaforoIcon className="h-4 w-4 shrink-0" />
          {semaforo.texto}
        </div>

        {prestacionSeleccionada && precioFinal > 0 && (
          <form action={aplicarPrecioPrestacion} className="mt-4">
            <input type="hidden" name="prestacion_id" value={prestacionSeleccionada.id} />
            <input type="hidden" name="precio" value={precioFinal.toFixed(2)} />
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Aplicar {formatCurrency(precioFinal)} como precio de &quot;
              {prestacionSeleccionada.nombre}&quot;
            </button>
            <p className="mt-2 text-xs text-slate-400">
              Solo afecta tratamientos nuevos. Los ya creados conservan su precio.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
