"use client";

import { useMemo, useState } from "react";
import { deletePlayer } from "@/lib/actions";
import type { PlayerStats } from "@/lib/types";

type Key = "dorsal" | "nombre" | "partidos" | "titularidades" | "minutos" | "goles";
type Dir = "asc" | "desc";

const columns: { key: Key; label: string; title?: string; align: "left" | "right" }[] = [
  { key: "dorsal", label: "#", title: "Dorsal", align: "left" },
  { key: "nombre", label: "Nombre", align: "left" },
  { key: "partidos", label: "PJ", title: "Partidos jugados", align: "right" },
  { key: "titularidades", label: "Tit.", title: "Titularidades", align: "right" },
  { key: "minutos", label: "Min.", title: "Minutos", align: "right" },
  { key: "goles", label: "Goles", align: "right" },
];

// Las estadísticas se ordenan de mayor a menor la primera vez; dorsal y nombre de menor a mayor.
const defaultDir = (key: Key): Dir => (key === "dorsal" || key === "nombre" ? "asc" : "desc");

export default function PlayersTable({ players }: { players: PlayerStats[] }) {
  const [key, setKey] = useState<Key>("dorsal");
  const [dir, setDir] = useState<Dir>("asc");

  const sorted = useMemo(() => {
    const factor = dir === "asc" ? 1 : -1;
    return [...players].sort((a, b) => {
      if (key === "nombre") return factor * a.nombre.localeCompare(b.nombre, "es");
      if (key === "dorsal") {
        // Sin dorsal siempre al final, en cualquier sentido.
        if (a.dorsal === null && b.dorsal === null) return a.nombre.localeCompare(b.nombre, "es");
        if (a.dorsal === null) return 1;
        if (b.dorsal === null) return -1;
        return factor * (a.dorsal - b.dorsal);
      }
      const diff = factor * (a[key] - b[key]);
      return diff || a.nombre.localeCompare(b.nombre, "es");
    });
  }, [players, key, dir]);

  function sortBy(next: Key) {
    if (next === key) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setKey(next);
      setDir(defaultDir(next));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <label htmlFor="orden" className="text-gray-600">Ordenar por</label>
        <select
          id="orden"
          value={key}
          onChange={(e) => {
            const next = e.target.value as Key;
            setKey(next);
            setDir(defaultDir(next));
          }}
          className="border border-gray-300 rounded-md px-2 py-1.5 bg-white"
        >
          {columns.map((c) => (
            <option key={c.key} value={c.key}>{c.title ?? c.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setDir(dir === "asc" ? "desc" : "asc")}
          className="border border-gray-300 rounded-md px-2.5 py-1.5 bg-white hover:bg-gray-50"
          aria-label="Invertir el orden"
        >
          {dir === "asc" ? "↑ Ascendente" : "↓ Descendente"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  title={c.title}
                  aria-sort={key === c.key ? (dir === "asc" ? "ascending" : "descending") : "none"}
                  className={`${i === 0 ? "px-4" : "px-2"} py-2 ${c.align === "right" ? "text-right" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => sortBy(c.key)}
                    className={`hover:text-emerald-800 ${key === c.key ? "font-semibold text-emerald-800" : ""}`}
                  >
                    {c.label}
                    {key === c.key ? (dir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
              <th className="px-4" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-4 py-2 text-gray-400">{s.dorsal ?? "–"}</td>
                <td className="px-2">
                  {s.nombre}
                  {s.posicion && <span className="text-xs text-gray-400 ml-2">{s.posicion}</span>}
                </td>
                <td className="px-2 text-right">{s.partidos}</td>
                <td className="px-2 text-right">{s.titularidades}</td>
                <td className="px-2 text-right">{s.minutos}</td>
                <td className="px-2 text-right font-semibold">{s.goles}</td>
                <td className="px-4 text-right">
                  <form action={deletePlayer.bind(null, s.id)}>
                    <button className="text-xs text-red-600 hover:underline">Borrar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
