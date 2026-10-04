"use client";

import { Fragment, useMemo, useState } from "react";
import { deletePlayer } from "@/lib/actions";
import type { PlayerStats } from "@/lib/types";

type Key = "dorsal" | "nombre" | "convocatorias" | "partidos" | "titularidades" | "minutos" | "goles";
type Dir = "asc" | "desc";

const columns: { key: Key; label: string; title: string; align: "left" | "right" }[] = [
  { key: "dorsal", label: "#", title: "Dorsal", align: "left" },
  { key: "nombre", label: "Nombre", title: "Nombre", align: "left" },
  { key: "convocatorias", label: "Conv.", title: "Convocatorias", align: "right" },
  { key: "partidos", label: "PJ", title: "Partidos jugados", align: "right" },
  { key: "titularidades", label: "Tit.", title: "Titularidades", align: "right" },
  { key: "minutos", label: "Min.", title: "Minutos", align: "right" },
  { key: "goles", label: "Goles", title: "Goles", align: "right" },
];

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
      return factor * (a[key] - b[key]) || a.nombre.localeCompare(b.nombre, "es");
    });
  }, [players, key, dir]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {/* Fila de controles: ordenar cada columna */}
          <tr>
            {columns.map((c, i) => (
              <Fragment key={c.key}>
              <th className={`${i === 0 ? "pl-3" : ""} px-1.5 sm:px-2 pt-3 pb-1 font-normal`}>
                <div className={`flex gap-0.5 ${c.align === "right" ? "justify-end" : "justify-start"}`}>
                  {(["asc", "desc"] as const).map((d) => {
                    const activo = key === c.key && dir === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setKey(c.key);
                          setDir(d);
                        }}
                        aria-label={`Ordenar ${c.title} de forma ${d === "asc" ? "ascendente" : "descendente"}`}
                        aria-pressed={activo}
                        className={`w-5 sm:w-6 h-5 text-[9px] sm:text-[10px] leading-none rounded border ${
                          activo
                            ? "bg-emerald-800 border-emerald-800 text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {d === "asc" ? "▲" : "▼"}
                      </button>
                    );
                  })}
                </div>
              </th>
              {c.key === "nombre" && <th />}
              </Fragment>
            ))}
            <th />
          </tr>
          <tr className="text-left text-gray-500 border-b">
            {columns.map((c, i) => (
              <Fragment key={c.key}>
              <th
                title={c.title}
                aria-sort={key === c.key ? (dir === "asc" ? "ascending" : "descending") : "none"}
                className={`${i === 0 ? "pl-3" : ""} px-1.5 sm:px-2 py-2 ${c.align === "right" ? "text-right" : ""} ${
                  key === c.key ? "text-emerald-800 font-semibold" : "font-medium"
                }`}
              >
                {c.label}
              </th>
              {c.key === "nombre" && (
                <th className="px-1.5 sm:px-2 py-2 font-medium" title="Titular en los últimos 5 partidos jugados (antiguo → reciente)">
                  Últ. 5
                </th>
              )}
              </Fragment>
            ))}
            <th className="px-2 sm:px-4" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.id} className="border-b last:border-0">
              <td className="pl-3 px-1.5 sm:px-2 py-2 text-gray-400">{s.dorsal ?? "–"}</td>
              <td className="px-1.5 sm:px-2">
                {s.nombre}
                {s.posicion && <span className="hidden sm:inline text-xs text-gray-400 ml-2">{s.posicion}</span>}
              </td>
              <td className="px-1.5 sm:px-2">
                <div className="flex gap-0.5">
                  {s.racha.map((r) => (
                    <span
                      key={r.jornada}
                      title={`J${r.jornada}: ${r.titular ? "titular" : "no titular"}`}
                      className={`w-5 h-5 rounded-sm text-[10px] font-bold text-white flex items-center justify-center ${
                        r.titular ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      T
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-1.5 sm:px-2 text-right">{s.convocatorias}</td>
              <td className="px-1.5 sm:px-2 text-right">{s.partidos}</td>
              <td className="px-1.5 sm:px-2 text-right">{s.titularidades}</td>
              <td className="px-1.5 sm:px-2 text-right">{s.minutos}</td>
              <td className="px-1.5 sm:px-2 text-right font-semibold">{s.goles}</td>
              <td className="px-2 sm:px-4 text-right">
                <form action={deletePlayer.bind(null, s.id)}>
                  <button
                    className="text-xs text-red-600 hover:underline"
                    aria-label={`Borrar a ${s.nombre}`}
                    title="Borrar"
                  >
                    <span className="sm:hidden">✕</span>
                    <span className="hidden sm:inline">Borrar</span>
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
