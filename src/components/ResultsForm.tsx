"use client";

import { startTransition, useActionState } from "react";
import { saveResults, type ActionState } from "@/lib/actions";
import type { Match, MatchPlayer, Player } from "@/lib/types";

const input = "border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white w-full";

export default function ResultsForm({
  match,
  players,
  participaciones,
}: {
  match: Match;
  players: Player[];
  participaciones: MatchPlayer[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveResults.bind(null, match.id),
    { success: false, message: "" }
  );
  const byPlayer = new Map(participaciones.map((p) => [p.player_id, p]));
  const rival = match.rival || "Rival";

  return (
    // Se envía con onSubmit (y no con action=) para que React no vacíe el formulario
    // tras un error de validación y no se pierda lo ya rellenado.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4"
    >
      <section className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-3">Resultado</h2>
        <div className="flex items-end gap-3">
          <label className="text-sm w-28">
            Getxo C
            <input type="number" min={0} name="goles_getxo" defaultValue={match.goles_getxo ?? ""} className={input} />
          </label>
          <span className="pb-2">-</span>
          <label className="text-sm w-28">
            {rival}
            <input type="number" min={0} name="goles_rival" defaultValue={match.goles_rival ?? ""} className={input} />
          </label>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-1">Jugadores</h2>
        <p className="text-xs text-gray-500 mb-3">
          Solo hay que rellenar a quienes han jugado. Con minutos jugados cuenta como partido jugado (PJ).
        </p>
        {players.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay jugadores. Añádelos en la pestaña Estadística.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2">Jugador</th>
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
                        <input type="hidden" name={`nombre_${p.id}`} value={p.nombre} />
                        <span className="text-gray-400 mr-1">{p.dorsal ?? "–"}</span>
                        {p.nombre}
                      </td>
                      <td className="px-2 text-center">
                        <input
                          type="checkbox"
                          name={`titular_${p.id}`}
                          defaultChecked={mp?.titular ?? false}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-2 w-24">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={150}
                          name={`minutos_${p.id}`}
                          defaultValue={mp?.minutos ?? ""}
                          className={input}
                        />
                      </td>
                      <td className="px-2 w-20">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          name={`goles_${p.id}`}
                          defaultValue={mp?.goles ?? ""}
                          className={input}
                        />
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
          {pending ? "Guardando…" : "Guardar datos del partido"}
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
