import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Cachea en el navegador los módulos ya visitados: volver a Agenda,
    // Pacientes, etc. dentro de los 30s es instantáneo, sin ir al servidor.
    // Las Server Actions hacen revalidatePath, así que cualquier alta o
    // edición sigue reflejándose al instante.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
