import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión en cada request y protege las rutas.
// (En Next.js 16 esto se ejecuta desde proxy.ts)
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims valida el token localmente (sin viaje de red a Supabase en
  // cada request, a diferencia de getUser) y refresca la sesión solo
  // cuando está por vencer.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const path = request.nextUrl.pathname;
  const isLogin = path === "/login";

  // Sin sesión y no está en el login -> mandar al login
  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Con sesión y entra al login -> mandar a Inicio
  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
