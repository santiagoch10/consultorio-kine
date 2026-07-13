"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, LogOut } from "lucide-react";
import { navItems, type NavItem } from "@/lib/nav";
import { logout } from "@/lib/auth-actions";
import type { AppUser } from "@/lib/auth";

export default function Sidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();

  // Los módulos marcados como adminOnly solo se muestran al admin.
  const visibles = navItems.filter(
    (item) => !item.adminOnly || user.role === "admin",
  );
  const principal = visibles.filter((i) => i.section === "principal");
  const inferior = visibles.filter((i) => i.section === "inferior");

  const initial = user.name.charAt(0).toUpperCase();
  const roleLabel = user.role === "admin" ? "Administrador" : "Profesional";

  const renderItem = (item: NavItem) => {
    const active =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          active
            ? "bg-white/15 font-semibold text-white"
            : "font-medium text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white" />
        )}
        <Icon className="h-[18px] w-[18px]" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-brand text-white">
      {/* Encabezado / marca */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-wide">Kinexus</p>
          <p className="text-xs text-white/60">Kinesiología</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">{principal.map(renderItem)}</div>
        {inferior.length > 0 && (
          <>
            <div className="my-2 border-t border-white/10" />
            <div className="space-y-1">{inferior.map(renderItem)}</div>
          </>
        )}
      </nav>

      {/* Usuario + cerrar sesión */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-white/60">{roleLabel}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
