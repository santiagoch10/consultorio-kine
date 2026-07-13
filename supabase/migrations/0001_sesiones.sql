-- ============================================================
--  Kinexus - Módulo de Sesiones (Prestaciones + Tratamientos + Sesiones)
--  Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

-- 1) PRESTACIONES: catálogo de servicios del consultorio (se cargan en Configuración)
create table if not exists public.prestaciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  precio numeric(12, 2) not null default 0,
  sesiones_sugeridas int not null default 1,
  activo boolean not null default true
);

-- 2) TRATAMIENTOS: el "plan" de sesiones de un paciente
create table if not exists public.tratamientos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  paciente_nombre text not null,
  prestacion_nombre text not null,
  precio_sesion numeric(12, 2) not null default 0,
  sesiones_planificadas int not null default 1,
  estado text not null default 'activo', -- activo | completado | abandonado
  observaciones text,
  profesional_id uuid not null default auth.uid(),
  profesional_nombre text not null,
  fecha_inicio date not null default current_date
);

-- 3) SESIONES: cada sesión realizada (se acumulan sobre el tratamiento)
create table if not exists public.sesiones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tratamiento_id uuid not null references public.tratamientos (id) on delete cascade,
  fecha date not null default current_date,
  monto numeric(12, 2) not null default 0,
  medio_pago text,
  observaciones text,
  profesional_id uuid not null default auth.uid()
);

create index if not exists idx_sesiones_tratamiento on public.sesiones (tratamiento_id);

-- ============================================================
--  Seguridad (RLS): los 3 usuarios del equipo ven y gestionan todo.
-- ============================================================
alter table public.prestaciones enable row level security;
alter table public.tratamientos enable row level security;
alter table public.sesiones enable row level security;

drop policy if exists "auth_all_prestaciones" on public.prestaciones;
create policy "auth_all_prestaciones" on public.prestaciones
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_tratamientos" on public.tratamientos;
create policy "auth_all_tratamientos" on public.tratamientos
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_sesiones" on public.sesiones;
create policy "auth_all_sesiones" on public.sesiones
  for all to authenticated using (true) with check (true);
