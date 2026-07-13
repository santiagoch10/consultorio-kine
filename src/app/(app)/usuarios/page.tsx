import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";
import { getCurrentUser, type UserRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import CreateUserForm from "@/components/CreateUserForm";

export default async function UsuariosPage() {
  const me = await getCurrentUser();

  // Solo el admin accede a esta sección.
  if (!me || me.role !== "admin") redirect("/inicio");

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  const users = data?.users ?? [];

  return (
    <div>
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <UserCog className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500">
            Creá perfiles del equipo y asigná su rol.
          </p>
        </div>
      </header>

      {/* Crear usuario */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-700">Crear nuevo usuario</h2>
        <CreateUserForm />
      </section>

      {/* Lista de usuarios */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-medium text-slate-700">
            Usuarios registrados ({users.length})
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {users.map((u) => {
            const name =
              (u.user_metadata?.full_name as string | undefined) ?? "—";
            const role =
              (u.app_metadata?.role as UserRole | undefined) ?? "profesional";
            const roleLabel =
              role === "admin" ? "Administrador" : "Profesional";
            return (
              <li
                key={u.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    role === "admin"
                      ? "bg-brand-soft text-brand"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {roleLabel}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
