-- ============================================================
--  Kinexus - Objetivo de facturación mensual (Números de Kinexus)
--  Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

alter table public.configuracion_costeo
  add column if not exists objetivo_activo boolean not null default false,
  add column if not exists objetivo_monto numeric(12, 2) not null default 0;
