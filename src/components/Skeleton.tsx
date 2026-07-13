// Bloques reutilizables para las pantallas de carga (loading.tsx) de cada módulo.
// Se muestran al instante al navegar, mientras el servidor todavía está
// trayendo los datos — evita la pantalla en blanco congelada.

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

export function SkeletonHeader() {
  return (
    <header className="mb-8 flex items-center gap-4">
      <Pulse className="h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <Pulse className="h-6 w-48" />
        <Pulse className="h-4 w-64" />
      </div>
    </header>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-5 w-5 rounded-full" />
          </div>
          <Pulse className="mt-4 h-7 w-16" />
          <Pulse className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-6 py-4">
            <Pulse className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-1/3" />
              <Pulse className="h-3 w-1/4" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkeletonCalendar() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="px-2 py-2">
            <Pulse className="mx-auto h-3 w-6" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-24 border-b border-r border-slate-100 p-1.5">
            <Pulse className="h-5 w-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <Pulse className="mb-4 h-5 w-40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Pulse className="h-10" />
        <Pulse className="h-10" />
      </div>
    </div>
  );
}
