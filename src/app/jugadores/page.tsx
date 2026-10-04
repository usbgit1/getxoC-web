import PlayersTable from "@/components/PlayersTable";
import { addPlayer } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import type { MatchPlayer, Player, PlayerStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JugadoresPage() {
  const [p, mp, m] = await Promise.all([
    supabase.from("players").select("*").order("dorsal", { nullsFirst: false }),
    supabase.from("match_players").select("*"),
    supabase.from("matches").select("id,jornada").order("jornada", { ascending: false }),
  ]);
  if (p.error) return <p className="text-red-600">Error: {p.error.message}</p>;

  const parts = (mp.data ?? []) as MatchPlayer[];
  // Últimos cinco partidos con datos de jugadores, del más antiguo al más reciente.
  const conDatos = new Set(parts.map((x) => x.match_id));
  const ultimos = ((m.data ?? []) as { id: string; jornada: number }[])
    .filter((x) => conDatos.has(x.id))
    .slice(0, 5)
    .reverse();
  const stats: PlayerStats[] = ((p.data ?? []) as Player[]).map((pl) => {
    const all = parts.filter((x) => x.player_id === pl.id);
    // Ha jugado el partido (PJ) quien tiene minutos; quien juega siempre cuenta como convocado.
    const mine = all.filter((x) => x.minutos > 0);
    return {
      ...pl,
      convocatorias: all.filter((x) => x.convocado || x.minutos > 0).length,
      partidos: mine.length,
      titularidades: mine.filter((x) => x.titular).length,
      minutos: mine.reduce((s, x) => s + x.minutos, 0),
      goles: mine.reduce((s, x) => s + x.goles, 0),
      racha: ultimos.map((u) => ({
        jornada: u.jornada,
        titular: mine.some((x) => x.match_id === u.id && x.titular),
      })),
    };
  });

  const field = "border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estadística</h1>

      <form action={addPlayer} className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-2 items-end">
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

      {stats.length === 0 ? (
        <p className="text-gray-500">Aún no hay jugadores.</p>
      ) : (
        <PlayersTable players={stats} />
      )}
    </div>
  );
}
