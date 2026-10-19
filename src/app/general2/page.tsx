import Link from "next/link";
import VersionFooter from "@/components/VersionFooter";
import { supabase } from "@/lib/supabase";
import type { Match, MatchPlayer, Player } from "@/lib/types";

export const dynamic = "force-dynamic";

const VERDE = "bg-green-600";
const GRIS = "bg-gray-400";
const ROJO = "bg-red-600";

const etiqueta = "text-xs font-semibold uppercase tracking-wider text-gray-500";

interface Fila {
  nombre: string;
  valor: number;
}

function Top({ titulo, unidad, filas }: { titulo: string; unidad: string; filas: Fila[] }) {
  const [lider, ...resto] = filas;
  return (
    <section className="bg-white rounded-xl shadow-sm p-5 min-w-0">
      <h2 className={etiqueta}>{titulo}</h2>
      {!lider ? (
        <p className="text-sm text-gray-500 mt-3">Aún no hay datos.</p>
      ) : (
        <>
          <div className="mt-3 rounded-lg bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-900">Líder</p>
            <p className="flex items-baseline justify-between gap-2 mt-0.5">
              <span className="text-xl font-bold truncate">{lider.nombre}</span>
              <span className="text-xl font-bold shrink-0">
                {lider.valor} <span className="text-xs font-semibold text-gray-500">{unidad}</span>
              </span>
            </p>
          </div>
          <ol className="mt-3 space-y-2.5">
            {resto.map((f, i) => (
              <li key={f.nombre} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="truncate">
                    <span className="text-gray-400 mr-2">{i + 2}</span>
                    {f.nombre}
                  </span>
                  <span className="font-semibold">{f.valor}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded mt-1">
                  <div
                    className="h-1.5 bg-gray-800 rounded"
                    style={{ width: `${(f.valor / lider.valor) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

export default async function General2Page() {
  const [p, mp, m] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("match_players").select("*"),
    supabase.from("matches").select("*").order("jornada"),
  ]);
  if (p.error) return <p className="text-red-600">Error: {p.error.message}</p>;

  const partidos = (m.data ?? []) as Match[];
  const jugados = partidos.filter((x) => x.goles_getxo !== null && x.goles_rival !== null);
  const proximo = partidos.find((x) => x.rival && (x.goles_getxo === null || x.goles_rival === null));

  const resultado = (x: Match) =>
    x.goles_getxo! > x.goles_rival! ? "G" : x.goles_getxo! < x.goles_rival! ? "P" : "E";
  const fondo = { G: VERDE, E: GRIS, P: ROJO } as const;

  const g = jugados.filter((x) => resultado(x) === "G").length;
  const e = jugados.filter((x) => resultado(x) === "E").length;
  const per = jugados.length - g - e;
  const favor = jugados.reduce((s, x) => s + x.goles_getxo!, 0);
  const contra = jugados.reduce((s, x) => s + x.goles_rival!, 0);
  const puntos = g * 3 + e;
  const n = jugados.length;
  const pct = (v: number) => (n ? (v / n) * 100 : 0);
  const dif = favor - contra;

  const marcador = (x: Match) =>
    x.es_local ? `${x.goles_getxo}-${x.goles_rival}` : `${x.goles_rival}-${x.goles_getxo}`;
  const ultimos = jugados.slice(-5);
  const resto = jugados.slice(0, -5);

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

  const maxGoles = Math.max(4, ...jugados.flatMap((x) => [x.goles_getxo!, x.goles_rival!]));
  // 72 px de barra más 18 px para el número que va junto a ella.
  const unidad = 72 / maxGoles;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">General</h1>

      <div className="flex flex-wrap gap-5">
        <section className="flex-[2_1_420px] min-w-0 bg-white rounded-xl shadow-sm p-5 sm:p-6">
          <h2 className={etiqueta}>Balance del equipo</h2>
          <div className="flex flex-wrap items-end gap-x-9 gap-y-3 mt-2">
            <div>
              <div className="text-7xl font-bold leading-none">{puntos}</div>
              <div className="text-sm text-gray-500 mt-1">
                puntos en {n} {n === 1 ? "partido" : "partidos"}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 pb-1">
              {[
                { v: n ? `${Math.round(pct(g))}%` : "–", l: "victorias" },
                { v: n ? `${dif > 0 ? "+" : ""}${dif}` : "–", l: "dif. de goles" },
              ].map((d) => (
                <div key={d.l}>
                  <div className="text-3xl font-bold leading-none">{d.v}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-4 rounded overflow-hidden mt-6 bg-gray-100">
            <div className={VERDE} style={{ width: `${pct(g)}%` }} />
            <div className={GRIS} style={{ width: `${pct(e)}%` }} />
            <div className={ROJO} style={{ width: `${pct(per)}%` }} />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 text-sm">
            <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${VERDE}`} />{g} ganados</span>
            <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${GRIS}`} />{e} empatados</span>
            <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${ROJO}`} />{per} perdidos</span>
            <span className="ml-auto text-gray-500">{favor} GF · {contra} GC</span>
          </div>

          <div className="border-t mt-5 pt-4">
            <h3 className={etiqueta}>Forma · últimos 5</h3>
            {n === 0 ? (
              <p className="text-sm text-gray-500 mt-3">Aún no hay resultados.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {ultimos.map((x) => (
                    <div key={x.id} className="flex flex-col items-center gap-1.5">
                      <div
                        title={`J${x.jornada} vs ${x.rival ?? "?"}`}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${fondo[resultado(x)]}`}
                      >
                        {marcador(x)}
                      </div>
                      <span className="text-xs text-gray-500">J{x.jornada}</span>
                    </div>
                  ))}
                </div>
                {resto.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mt-4">Resto de la temporada</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {resto.map((x) => (
                        <span
                          key={x.id}
                          title={`J${x.jornada} vs ${x.rival ?? "?"}: ${marcador(x)}`}
                          className={`w-5 h-5 rounded-sm ${fondo[resultado(x)]}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        <section className="flex-[1_1_260px] min-w-0 bg-gray-900 text-white rounded-xl shadow-sm p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Próximo partido</h2>
            {proximo ? (
              <p className="text-5xl font-bold mt-2 text-emerald-400">J{proximo.jornada}</p>
            ) : (
              <p className="text-sm text-gray-400 mt-3">No hay ningún partido pendiente con rival.</p>
            )}
          </div>
          {proximo && (
            <>
              <div>
                <p className="text-2xl font-bold leading-tight">
                  {proximo.es_local ? "Getxo C" : proximo.rival}
                  <span className="text-sm font-normal text-gray-400"> vs </span>
                  {proximo.es_local ? proximo.rival : "Getxo C"}
                </p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-400 text-gray-900 text-xs font-semibold">
                  {proximo.es_local ? "Juega en casa" : "Juega fuera"}
                </span>
              </div>
              <Link
                href={`/resultados?jornada=${proximo.jornada}`}
                className="block text-center py-2.5 rounded-lg border border-gray-600 text-sm font-semibold hover:bg-gray-800"
              >
                Registrar datos del partido
              </Link>
            </>
          )}
        </section>
      </div>

      <section className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <h2 className={etiqueta}>Goles por jornada</h2>
        <div className="flex gap-4 text-sm text-gray-500 mt-1">
          <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${VERDE}`} />A favor</span>
          <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${ROJO}`} />En contra</span>
        </div>
        {n === 0 ? (
          <p className="text-sm text-gray-500 mt-3">Aún no hay resultados.</p>
        ) : (
          <div className="flex gap-1.5 mt-4">
            {jugados.map((x) => (
              <div
                key={x.id}
                title={`J${x.jornada}: ${x.goles_getxo} a favor, ${x.goles_rival} en contra`}
                className="flex-1 min-w-0 flex flex-col items-center"
              >
                <div className="w-full h-[90px] flex flex-col justify-end items-center">
                  <span className="text-xs font-semibold leading-[18px]">{x.goles_getxo}</span>
                  <div
                    className={`w-full max-w-[22px] rounded-t-sm ${VERDE}`}
                    style={{ height: x.goles_getxo! * unidad }}
                  />
                </div>
                <div className="w-full h-px bg-gray-300" />
                <div className="w-full h-[90px] flex flex-col justify-start items-center">
                  <div
                    className={`w-full max-w-[22px] rounded-b-sm ${ROJO}`}
                    style={{ height: x.goles_rival! * unidad }}
                  />
                  <span className="text-xs font-semibold leading-[18px]">{x.goles_rival}</span>
                </div>
                <span className="text-[11px] text-gray-500 mt-1">{x.jornada}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        <Top titulo="Más minutos" unidad="min" filas={top("minutos")} />
        <Top titulo="Más titularidades" unidad="tit." filas={top("titularidades")} />
        <Top titulo="Más goles" unidad="goles" filas={top("goles")} />
        <Top titulo="Más partidos jugados" unidad="PJ" filas={top("partidos")} />
      </div>
      <VersionFooter />
    </div>
  );
}
