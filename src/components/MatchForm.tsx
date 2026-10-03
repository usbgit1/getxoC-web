"use client";

import { useActionState } from "react";
import { saveMatch, type ActionState } from "@/lib/actions";
import type { Match, MatchPlayer, Player } from "@/lib/types";

const input = "border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white w-full";

export default function MatchForm({
  match,
  players,
  participaciones,
}: {
  match: Match;
  players: Player[];
  participaciones: MatchPlayer[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveMatch.bind(null, match.id),
    { success: false, message: "" }
  );
  const byPlayer = new Map(participaciones.map((p) => [p.player_id, p]));

  return (
    <form action={action} className="space-y-6">
      <section className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h2 className="font-semibold">Datos del partido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="text-sm">
            Fecha
            <input type="date" name="fecha" defaultValue={match.fecha ?? ""} className={input} />
          </label>
          <label className="text-sm">
            Hora
            <input type="time" name="hora" defaultValue={match.hora ?? ""} className={input} />
          </label>
          <label className="text-sm col-span-2 sm:col-span-1">
            Rival
            <input name="rival" defaultValue={match.rival ?? ""} className={input} />
          </label>
          <label className="text-sm col-span-2 sm:col-span-1">
            Campo
            <select name="es_local" defaultValue={match.es_local ? "local" : "visitante"} className={input}>
              <option value="local">Local</option>
              <option value="visitante">Visitante</option>
            </select>
          </label>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h2 className="font-semibold">Resultado</h2>
        <div className="flex items-end gap-3">
          <label className="text-sm w-24">
            Getxo C
            <input type="number" min={0} name="goles_getxo" defaultValue={match.goles_getxo ?? ""} className={input} />
          </label>
          <span className="pb-2">-</span>
          <label className="text-sm w-24">
            {match.rival || "Rival"}
            <input type="number" min={0} name="goles_rival" defaultValue={match.goles_rival ?? ""} className={input} />
          </label>
          <label className="text-sm flex items-center gap-2 pb-2 ml-2">
            <input type="checkbox" name="jugado" defaultChecked={match.jugado} />
            Partido jugado
          </label>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-3">Jugadores</h2>
        {players.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay jugadores. Añádelos en la pestaña Jugadores.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2">Jugador</th>
                  <th className="px-2 text-center">Convoc.</th>
                  <th className="px-2 text-center">Titular</th>
                  <th className="px-2">Minutos</th>
                  <th className="px-2">Goles</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => {
                  const mp = byPlayer.get(p.id);
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 whitespace-nowrap">
                        <input type="hidden" name="player_id" value={p.id} />
                        <span className="text-gray-400 mr-1">{p.dorsal ?? "–"}</span>
                        {p.nombre}
                      </td>
                      <td className="px-2 text-center">
                        <input type="checkbox" name={`convocado_${p.id}`} defaultChecked={!!mp} />
                      </td>
                      <td className="px-2 text-center">
                        <input type="checkbox" name={`titular_${p.id}`} defaultChecked={mp?.titular ?? false} />
                      </td>
                      <td className="px-2 w-24">
                        <input type="number" min={0} max={150} name={`minutos_${p.id}`} defaultValue={mp?.minutos ?? ""} className={input} />
                      </td>
                      <td className="px-2 w-20">
                        <input type="number" min={0} name={`goles_${p.id}`} defaultValue={mp?.goles ?? ""} className={input} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-emerald-800 text-white px-5 py-2 rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar partido"}
        </button>
        {state.message && (
          <span className={`text-sm ${state.success ? "text-emerald-700" : "text-red-600"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
