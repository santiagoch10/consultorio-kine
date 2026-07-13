import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Defensa extra: sin sesión, al login.
  if (!user) redirect("/login");

  return (
    // h-dvh: el layout ocupa SIEMPRE el alto completo de la pantalla
    // (sidebar de punta a punta); solo el contenido central scrollea.
    <div className="flex h-dvh overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
