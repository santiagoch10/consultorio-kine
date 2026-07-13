-- ============================================================
--  Kinexus - Módulo CRM de Pacientes
--  Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  telefono text,
  email text,
  fecha_nacimiento date,
  obra_social text,       -- campo base; el módulo completo de obras sociales es a futuro
  notas text,
  activo boolean not null default true
);

-- Vincula cada tratamiento con la ficha del paciente (CRM).
alter table public.tratamientos
  add column if not exists paciente_id uuid references public.pacientes (id) on delete set null;

-- Seguridad: los 3 usuarios del equipo ven y gestionan todos los pacientes.
alter table public.pacientes enable row level security;

drop policy if exists "auth_all_pacientes" on public.pacientes;
create policy "auth_all_pacientes" on public.pacientes
  for all to authenticated using (true) with check (true);
