import RegisterForm from "@/components/RegisterForm";
import { addPlayer, addTeam } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import type { Match, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

const field = "border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white";

export default async function RegistrarPage() {
  const [t, m] = await Promise.all([
    supabase.from("teams").select("*").order("nombre"),
    supabase.from("matches").select("*").order("jornada"),
  ]);

  if (t.error) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Registrar partido</h1>
        <p className="text-red-600">
          No se pudo leer la lista de equipos: {t.error.message}. ¿Has ejecutado
          <code className="mx-1">supabase/migrations/001_teams.sql</code> en Supabase?
        </p>
      </div>
    );
  }

  const teams = (t.data ?? []) as Team[];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registrar partido</h1>
      <RegisterForm teams={teams} matches={(m.data ?? []) as Match[]} />

      <section className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h2 className="font-semibold">Añadir jugador</h2>
        <form action={addPlayer} className="flex flex-wrap gap-2 items-end">
          <label className="text-sm">
            Dorsal
            <input name="dorsal" type="number" min={0} className={`${field} w-20 block`} />
          </label>
          <label className="text-sm flex-1 min-w-40">
            Nombre
            <input name="nombre" required className={`${field} w-full block`} />
          </label>
          <label className="text-sm">
            Posición
            <input name="posicion" className={`${field} w-32 block`} />
          </label>
          <button className="bg-emerald-800 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-700">
            Añadir
          </button>
        </form>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h2 className="font-semibold">Equipos</h2>
        <p className="text-sm text-gray-600">{teams.map((x) => x.nombre).join(" · ")}</p>
        <form action={addTeam} className="flex gap-2">
          <input
            name="nombre"
            required
            placeholder="Nuevo equipo"
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white flex-1"
          />
          <button className="bg-emerald-800 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-700">
            Añadir equipo
          </button>
        </form>
      </section>
    </div>
  );
}
