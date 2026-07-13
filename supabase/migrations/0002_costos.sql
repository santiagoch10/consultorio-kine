-- ============================================================
--  Kinexus - Módulo de Costos
--  Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

create table if not exists public.costos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha date not null default current_date,
  concepto text not null,
  categoria text not null default 'Otros',
  tipo text not null default 'fijo',          -- fijo | variable
  alcance text not null default 'compartido',  -- compartido | individual
  profesional_id uuid,        -- solo si alcance = individual
  profesional_nombre text,    -- nombre del profesional (si es individual)
  monto numeric(12, 2) not null default 0,
  registrado_por uuid not null default auth.uid()
);

create index if not exists idx_costos_fecha on public.costos (fecha);

-- Seguridad: los 3 usuarios del equipo ven y gestionan todos los costos.
alter table public.costos enable row level security;

drop policy if exists "auth_all_costos" on public.costos;
create policy "auth_all_costos" on public.costos
  for all to authenticated using (true) with check (true);
