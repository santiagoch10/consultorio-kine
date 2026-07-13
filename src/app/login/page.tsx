import { Stethoscope } from "lucide-react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Kinexus</h1>
          <p className="text-sm text-slate-500">Gestión del consultorio</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
