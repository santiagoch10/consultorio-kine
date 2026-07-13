import {
  Home,
  CalendarDays,
  Activity,
  Users,
  Wallet,
  Calculator,
  FileText,
  UserCog,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavSection = "principal" | "inferior";

export type NavItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  section: NavSection;
  adminOnly?: boolean;
};

// Todos los módulos del menú lateral.
// "principal" = grupo de arriba (día a día). "inferior" = grupo de abajo, separado por una línea.
export const navItems: NavItem[] = [
  {
    label: "Inicio",
    href: "/inicio",
    description: "Resumen del día y accesos rápidos.",
    icon: Home,
    section: "principal",
  },
  {
    label: "Agenda",
    href: "/agenda",
    description: "Calendario de turnos del consultorio.",
    icon: CalendarDays,
    section: "principal",
  },
  {
    label: "Sesiones",
    href: "/sesiones",
    description: "Tratamientos y sesiones de pacientes atendidos.",
    icon: Activity,
    section: "principal",
  },
  {
    label: "Pacientes",
    href: "/pacientes",
    description: "CRM: fichas y seguimiento de pacientes.",
    icon: Users,
    section: "principal",
  },
  {
    label: "Costos",
    href: "/costos",
    description: "Gastos fijos y variables del consultorio.",
    icon: Wallet,
    section: "principal",
  },
  {
    label: "Calculadora",
    href: "/calculadora",
    description: "Cálculo de precios según costos y margen.",
    icon: Calculator,
    section: "principal",
  },
  {
    label: "Reportes",
    href: "/reportes",
    description: "Reportes mensuales descargables en PDF.",
    icon: FileText,
    section: "principal",
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    description: "Crear perfiles y asignar roles.",
    icon: UserCog,
    section: "principal",
    adminOnly: true,
  },
  {
    label: "Números de Kinexus",
    href: "/numeros",
    description: "Análisis económico-financiero: KPIs y gráficos.",
    icon: BarChart3,
    section: "inferior",
  },
  {
    label: "Configuración",
    href: "/configuracion",
    description: "Prestaciones, objetivos y datos del consultorio.",
    icon: Settings,
    section: "inferior",
  },
];
