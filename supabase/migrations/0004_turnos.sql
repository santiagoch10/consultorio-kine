-- ============================================================
--  Kinexus - Módulo Agenda (Turnos)
--  Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

create table if not exists public.turnos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha date not null,
  hora time not null,
  duracion_min int not null default 30,
  paciente_id uuid references public.pacientes (id) on delete set null,
  paciente_nombre text not null,
  profesional_id uuid,
  profesional_nombre text not null,
  estado text not null default 'pendiente', -- pendiente|confirmado|asistio|ausente|cancelado
  notas text
);

create index if not exists idx_turnos_fecha on public.turnos (fecha);

alter table public.turnos enable row level security;

drop policy if exists "auth_all_turnos" on public.turnos;
create policy "auth_all_turnos" on public.turnos
  for all to authenticated using (true) with check (true);
