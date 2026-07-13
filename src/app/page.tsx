import { redirect } from "next/navigation";

export default function Home() {
  // La pantalla raíz lleva directo a Inicio
  redirect("/inicio");
}
