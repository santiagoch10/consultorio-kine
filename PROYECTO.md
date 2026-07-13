# Kinexus — Sistema de gestión del consultorio de kinesiología

SaaS a medida. Stack: Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + Supabase (Postgres + Auth). Color de marca: `#065e53`. Moneda: ARS. Hosting: en proceso de migrar a **Render** (antes Vercel).

## Usuarios
3 usuarios: Santi (admin/IT) + 2 kinesiólogos socios 50/50. **Los 3 ven TODO** (facturación global incluida) — es un único negocio con ganancias compartidas, sin división por profesional. Login: Supabase Auth, rol en `app_metadata.role` ('admin'|'profesional').

## Módulos hechos y verificados
- **Inicio** (`/inicio`): home, saludo personalizado, resumen del día (turnos, pacientes, sesiones sin cobrar).
- **Agenda** (`/agenda`): calendario mensual/semanal/diario, turnos con 5 estados (pendiente/confirmado/asistio/ausente/cancelado), cambio de estado con 1 clic.
- **Sesiones** (`/sesiones`): tratamientos por sesiones (paciente + prestación + N sesiones planificadas), progreso acumulado, cobro por sesión.
- **Pacientes / CRM** (`/pacientes`): fichas, alertas de re-contacto (21 días sin actividad), WhatsApp directo.
- **Costos** (`/costos`): fijo/variable, compartido/individual por profesional (solo para trazabilidad de gasto, NO reparte ganancias), resumen segmentado por categoría.
- **Configuración** (`/configuracion`): prestaciones (precio, duración, costo variable/insumos, editable inline), parámetros de costeo (horas/día, días/semana, % ocupación), objetivo de facturación mensual (on/off), objetivo de ganancia (se suma al punto de equilibrio).
- **Calculadora de precios** (`/calculadora`): método "costo por hora de consultorio" (costos fijos ÷ horas efectivas). Dos modos: por margen de marcación (markup %) o por precio de mercado (calcula margen/markup resultante). Botón para aplicar el precio a la prestación.
- **Números de Kinexus** (`/numeros`): dashboard económico consolidado — KPIs (ingresos, costos, margen, ticket promedio, markup), objetivo de facturación con barra de progreso, punto de equilibrio (+ ganancia si está cargada), gráficos de 6 meses (Ingresos vs Costos, Margen mensual).

## Pendiente
- Reportes PDF (mensual, consolidado).
- Deploy en Render (repo ya en GitHub: `santiagoch10/consultorio-kine`).
- Futuro: Google Calendar, Obras Sociales, costeo por sueldos de kinesiólogos, historial clínico.

## Notas técnicas importantes
- Cada migración SQL nueva vive en `supabase/migrations/*.sql` — el usuario las corre a mano en el SQL Editor de Supabase (no hay automatización de migraciones todavía).
- Cambiar parámetros de costeo/precios en Configuración **nunca** recalcula sesiones o tratamientos ya guardados (cada uno guarda su propio precio al crearse) — esto fue un requisito explícito del usuario.
- `.env.local` con las llaves de Supabase NO se sube a git — hay que recrearlo a mano en cada computadora (Project Settings → API en Supabase).
- Santi es principiante en despliegue: explicar todo paso a paso, en español, sin dar por sentado conocimiento técnico.
