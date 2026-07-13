-- ============================================================
--  Kinexus - Objetivo de ganancia (Punto de equilibrio + Ganancia)
--  Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

alter table public.configuracion_costeo
  add column if not exists objetivo_ganancia numeric(12, 2) not null default 0;
