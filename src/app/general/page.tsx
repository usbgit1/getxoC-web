import { supabase } from "@/lib/supabase";
import type { Match, MatchPlayer, Player } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Fila {
  nombre: string;
  valor: number;
}

function Top({ titulo, unidad, filas }: { titulo: string; unidad: string; filas: Fila[] }) {
  const max = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <section className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="font-semibold mb-3">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="text-sm text-gray-500">Aún no hay datos.</p>
      ) : (
        <ol className="space-y-2">
          {filas.map((f, i) => (
            <li key={f.nombre} className="text-sm">
              <div className="flex justify-between">
                <span>
                  <span className="text-gray-400 mr-2">{i + 1}.</span>
                  {f.nombre}
                </span>
                <span className="font-semibold">
                  {f.valor} <span className="font-normal text-gray-400 text-xs">{unidad}</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded mt-1">
                <div className="h-1.5 bg-emerald-700 rounded" style={{ width: `${(f.valor / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function GeneralPage() {
  const [p, mp, m] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("match_players").select("*"),
    supabase.from("matches").select("*"),
  ]);
  if (p.error) return <p className="text-red-600">Error: {p.error.message}</p>;

  const parts = ((mp.data ?? []) as MatchPlayer[]).filter((x) => x.minutos > 0);
  const stats = ((p.data ?? []) as Player[]).map((pl) => {
    const mine = parts.filter((x) => x.player_id === pl.id);
    return {
      nombre: pl.nombre,
      partidos: mine.length,
      titularidades: mine.filter((x) => x.titular).length,
      minutos: mine.reduce((s, x) => s + x.minutos, 0),
      goles: mine.reduce((s, x) => s + x.goles, 0),
    };
  });

  const top = (campo: "minutos" | "titularidades" | "goles" | "partidos"): Fila[] =>
    stats
      .filter((s) => s[campo] > 0)
      .sort((a, b) => b[campo] - a[campo] || a.nombre.localeCompare(b.nombre, "es"))
      .slice(0, 5)
      .map((s) => ({ nombre: s.nombre, valor: s[campo] }));

  const jugados = ((m.data ?? []) as Match[]).filter((x) => x.goles_getxo !== null && x.goles_rival !== null);
  const g = jugados.filter((x) => x.goles_getxo! > x.goles_rival!).length;
  const e = jugados.filter((x) => x.goles_getxo === x.goles_rival).length;
  const per = jugados.length - g - e;
  const favor = jugados.reduce((s, x) => s + x.goles_getxo!, 0);
  const contra = jugados.reduce((s, x) => s + x.goles_rival!, 0);

  const media = (n: number) => (jugados.length ? (n / jugados.length).toFixed(2) : "–");

  const resumen = [
    { label: "Jugados", valor: jugados.length },
    { label: "Ganados", valor: g },
    { label: "Empatados", valor: e },
    { label: "Perdidos", valor: per },
  ];
  const goles = [
    { label: "Goles a favor", valor: favor },
    { label: "Goles en contra", valor: contra },
    { label: "Media a favor / partido", valor: media(favor) },
    { label: "Media en contra / partido", valor: media(contra) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">General</h1>

      {[resumen, goles].map((grupo, i) => (
        <section key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {grupo.map((r) => (
            <div key={r.label} className="bg-white rounded-lg shadow-sm p-3 text-center">
              <div className="text-2xl font-bold text-emerald-900">{r.valor}</div>
              <div className="text-xs text-gray-500">{r.label}</div>
            </div>
          ))}
        </section>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <Top titulo="Top 5 · Más minutos" unidad="min" filas={top("minutos")} />
        <Top titulo="Top 5 · Más titularidades" unidad="tit." filas={top("titularidades")} />
        <Top titulo="Top 5 · Más goles" unidad="goles" filas={top("goles")} />
        <Top titulo="Top 5 · Más partidos jugados" unidad="PJ" filas={top("partidos")} />
      </div>
    </div>
  );
}
