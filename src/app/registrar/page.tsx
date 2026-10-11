import RegisterForm from "@/components/RegisterForm";
import { addPlayer } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import type { Match, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

const field = "border border-gray-300 rounded-md px-2 py-2 text-sm bg-white w-full";

export default async function RegistrarPage() {
  const [t, m] = await Promise.all([
    supabase.from("teams").select("*").order("nombre"),
    supabase.from("matches").select("*").order("jornada"),
  ]);

  if (t.error) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Registrar</h1>
        <p className="text-red-600">No se pudo leer la lista de equipos: {t.error.message}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registrar</h1>
      <RegisterForm teams={(t.data ?? []) as Team[]} matches={(m.data ?? []) as Match[]} />

      <form action={addPlayer} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <h2 className="font-semibold">Registrar jugador</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-sm">
            Nombre
            <input name="nombre" required className={field} />
          </label>
          <label className="text-sm">
            Dorsal (opcional)
            <input name="dorsal" type="number" min={0} className={field} />
          </label>
          <label className="text-sm">
            Posición (opcional)
            <input name="posicion" className={field} />
          </label>
        </div>
        <button className="bg-emerald-800 text-white px-5 py-2 rounded-md font-medium hover:bg-emerald-700">
          Registrar jugador
        </button>
      </form>
    </div>
  );
}
