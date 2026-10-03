"use client";

import { startTransition, useActionState } from "react";
import { registerMatch, type ActionState } from "@/lib/actions";
import type { Match, Team } from "@/lib/types";

const field = "border border-gray-300 rounded-md px-2 py-2 text-sm bg-white w-full";
const TOTAL_JORNADAS = 30;

export default function RegisterForm({ teams, matches }: { teams: Team[]; matches: Match[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(registerMatch, {
    success: false,
    message: "",
  });
  const existentes = new Map(matches.map((m) => [m.jornada, m]));
  const maxJornada = Math.max(TOTAL_JORNADAS, ...matches.map((m) => m.jornada));

  return (
    // Envío con onSubmit para que un error no vacíe el formulario (ver ResultsForm).
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="bg-white rounded-lg shadow-sm p-4 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-sm">
          Jornada
          <select name="jornada" defaultValue="" required className={field}>
            <option value="" disabled>Elige…</option>
            {Array.from({ length: maxJornada }, (_, i) => i + 1).map((n) => {
              const m = existentes.get(n);
              const ocupada = m?.rival ? ` — ya registrada: vs ${m.rival}` : "";
              return (
                <option key={n} value={n}>
                  Jornada {n}{ocupada}
                </option>
              );
            })}
          </select>
        </label>
        <label className="text-sm">
          Local
          <select name="local" defaultValue="" required className={field}>
            <option value="" disabled>Elige…</option>
            {teams.map((t) => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Visitante
          <select name="visitante" defaultValue="" required className={field}>
            <option value="" disabled>Elige…</option>
            {teams.map((t) => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Fecha (opcional)
          <input type="date" name="fecha" className={field} />
        </label>
      </div>
      <p className="text-xs text-gray-500">
        Si eliges una jornada ya registrada, se actualiza su rival y su campo sin perder el resultado.
      </p>
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="bg-emerald-800 text-white px-5 py-2 rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Registrar partido"}
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
