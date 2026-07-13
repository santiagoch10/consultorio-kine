-- ============================================================
--  Kinexus - Costeo por hora-consultorio (Calculadora de precios)
--  Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

-- Cada prestación ahora define su duración y su costo variable (insumos).
alter table public.prestaciones
  add column if not exists duracion_min int not null default 60,
  add column if not exists costo_variable numeric(12, 2) not null default 0;

-- Parámetros de costeo del consultorio (una sola fila, editable en Configuración).
-- Cambiarlos NO recalcula sesiones/tratamientos pasados: esos ya guardan su propio precio.
create table if not exists public.configuracion_costeo (
  id smallint primary key default 1,
  horas_por_dia numeric(5, 2) not null default 6,
  dias_por_semana int not null default 5,
  ocupacion_pct numeric(5, 2) not null default 60,
  margen_default_pct numeric(5, 2) not null default 30,
  constraint configuracion_costeo_singleton check (id = 1)
);

insert into public.configuracion_costeo (id)
values (1)
on conflict (id) do nothing;

alter table public.configuracion_costeo enable row level security;

drop policy if exists "auth_all_configuracion_costeo" on public.configuracion_costeo;
create policy "auth_all_configuracion_costeo" on public.configuracion_costeo
  for all to authenticated using (true) with check (true);
