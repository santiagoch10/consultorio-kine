"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser, type CreateUserState } from "@/app/(app)/usuarios/actions";

const initialState: CreateUserState = { error: "", ok: false };

export default function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Al crear con éxito, limpiar el formulario.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Nombre
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="Nombre y apellido"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="usuario@email.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Contraseña
          </label>
          <input
            name="password"
            type="text"
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Rol
          </label>
          <select
            name="role"
            defaultValue="profesional"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="profesional">Profesional (kinesiólogo)</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✅ Usuario creado correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
