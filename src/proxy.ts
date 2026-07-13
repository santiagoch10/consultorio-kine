import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Proxy (antes "middleware" en versiones anteriores de Next.js).
// Se ejecuta antes de cada request para refrescar la sesión y proteger rutas.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Corre en todas las rutas excepto archivos estáticos e imágenes.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
