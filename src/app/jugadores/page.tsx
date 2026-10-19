import PlayersTable from "@/components/PlayersTable";
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
      racha: ultimos.map((u) => {
        const fila = all.find((x) => x.match_id === u.id);
        const estado = !fila
          ? ("no_convocado" as const)
          : fila.minutos === 0
            ? fila.convocado
              ? ("convocado" as const)
              : ("no_convocado" as const)
            : fila.titular
              ? ("titular" as const)
              : ("suplente" as const);
        return { jornada: u.jornada, estado };
      }),
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Jugadores</h1>

      {stats.length === 0 ? (
        <p className="text-gray-500">Aún no hay jugadores.</p>
      ) : (
        <PlayersTable players={stats} />
      )}
    </div>
  );
}
