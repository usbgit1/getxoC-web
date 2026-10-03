import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

function resultado(m: Match) {
  if (!m.jugado || m.goles_getxo === null || m.goles_rival === null) return null;
  const [a, b] = m.es_local ? [m.goles_getxo, m.goles_rival] : [m.goles_rival, m.goles_getxo];
  const tipo = m.goles_getxo > m.goles_rival ? "G" : m.goles_getxo < m.goles_rival ? "P" : "E";
  return { texto: `${a} - ${b}`, tipo };
}

const color = { G: "bg-emerald-600", E: "bg-amber-500", P: "bg-red-600" } as const;

export default async function PartidosPage() {
  const { data, error } = await supabase.from("matches").select("*").order("jornada");
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  const matches = (data ?? []) as Match[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Partidos</h1>
      {matches.length === 0 && (
        <p className="text-gray-500">No hay partidos. Ejecuta <code>npm run importar</code>.</p>
      )}
      <ul className="bg-white rounded-lg shadow-sm divide-y">
        {matches.map((m) => {
          const r = resultado(m);
          const nombre = m.rival || "Por definir";
          return (
            <li key={m.id}>
              <Link href={`/partidos/${m.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <span className="w-8 text-gray-400 text-sm">J{m.jornada}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium truncate">
                    {m.es_local ? `Getxo C vs ${nombre}` : `${nombre} vs Getxo C`}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {m.fecha ? new Date(m.fecha).toLocaleDateString("es-ES") : "Sin fecha"}
                    {m.hora ? ` · ${m.hora}` : ""}
                  </span>
                </span>
                {r ? (
                  <span className={`text-white text-sm font-semibold px-2.5 py-1 rounded ${color[r.tipo as "G" | "E" | "P"]}`}>
                    {r.texto}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Pendiente</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
