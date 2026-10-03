"use client";

import { useMemo, useState } from "react";
import { deletePlayer } from "@/lib/actions";
import type { PlayerStats } from "@/lib/types";

type Key = "dorsal" | "nombre" | "partidos" | "titularidades" | "minutos" | "goles";
type Dir = "asc" | "desc";

const columns: { key: Key; label: string; title: string; align: "left" | "right" }[] = [
  { key: "dorsal", label: "#", title: "Dorsal", align: "left" },
  { key: "nombre", label: "Nombre", title: "Nombre", align: "left" },
  { key: "partidos", label: "PJ", title: "Partidos jugados", align: "right" },
  { key: "titularidades", label: "Tit.", title: "Titularidades", align: "right" },
  { key: "minutos", label: "Min.", title: "Minutos", align: "right" },
  { key: "goles", label: "Goles", title: "Goles", align: "right" },
];

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const control = "border border-gray-300 rounded px-1.5 py-1 text-xs bg-white font-normal text-gray-800";

export default function PlayersTable({ players }: { players: PlayerStats[] }) {
  const [key, setKey] = useState<Key>("dorsal");
  const [dir, setDir] = useState<Dir>("asc");
  const [filtros, setFiltros] = useState<Record<Key, string>>({
    dorsal: "",
    nombre: "",
    partidos: "",
    titularidades: "",
    minutos: "",
    goles: "",
  });

  const visibles = useMemo(() => {
    const factor = dir === "asc" ? 1 : -1;
    const texto = sinAcentos(filtros.nombre.trim());

    return players
      .filter((p) => {
        if (texto && !sinAcentos(p.nombre).includes(texto)) return false;
        for (const k of ["dorsal", "partidos", "titularidades", "minutos", "goles"] as const) {
          if (filtros[k] === "") continue;
          const valor = p[k];
          if (valor === null || valor < Number(filtros[k])) return false;
        }
        return true;
      })
      .sort((a, b) => {
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
  }, [players, key, dir, filtros]);

  const hayFiltros = Object.values(filtros).some((v) => v !== "");

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {/* Fila de controles: ordenar y filtrar cada columna */}
          <tr className="align-bottom">
            {columns.map((c, i) => (
              <th key={c.key} className={`${i === 0 ? "pl-3" : ""} px-1.5 sm:px-2 pt-3 pb-1 font-normal`}>
                <div className={`flex flex-col gap-1 ${c.align === "right" ? "items-end" : "items-start"}`}>
                  {c.key === "nombre" ? (
                    <input
                      type="search"
                      value={filtros.nombre}
                      onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                      placeholder="Buscar…"
                      aria-label="Filtrar por nombre"
                      className={`${control} w-20 sm:w-40`}
                    />
                  ) : (
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={filtros[c.key]}
                      onChange={(e) => setFiltros({ ...filtros, [c.key]: e.target.value })}
                      placeholder="mín."
                      aria-label={`${c.title}: valor mínimo`}
                      className={`${control} w-11 sm:w-14 text-right px-1`}
                    />
                  )}
                  <div className="flex gap-0.5">
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
                </div>
              </th>
            ))}
            <th className="px-2 sm:px-4 pb-1 text-right">
              {hayFiltros && (
                <button
                  type="button"
                  onClick={() =>
                    setFiltros({ dorsal: "", nombre: "", partidos: "", titularidades: "", minutos: "", goles: "" })
                  }
                  className="text-xs text-emerald-800 hover:underline font-normal"
                >
                  Limpiar
                </button>
              )}
            </th>
          </tr>
          <tr className="text-left text-gray-500 border-b">
            {columns.map((c, i) => (
              <th
                key={c.key}
                title={c.title}
                aria-sort={key === c.key ? (dir === "asc" ? "ascending" : "descending") : "none"}
                className={`${i === 0 ? "pl-3" : ""} px-1.5 sm:px-2 py-2 ${c.align === "right" ? "text-right" : ""} ${
                  key === c.key ? "text-emerald-800 font-semibold" : "font-medium"
                }`}
              >
                {c.label}
              </th>
            ))}
            <th className="px-2 sm:px-4" />
          </tr>
        </thead>
        <tbody>
          {visibles.map((s) => (
            <tr key={s.id} className="border-b last:border-0">
              <td className="pl-3 px-1.5 sm:px-2 py-2 text-gray-400">{s.dorsal ?? "–"}</td>
              <td className="px-1.5 sm:px-2">
                {s.nombre}
                {s.posicion && <span className="hidden sm:inline text-xs text-gray-400 ml-2">{s.posicion}</span>}
              </td>
              <td className="px-1.5 sm:px-2 text-right">{s.partidos}</td>
              <td className="px-1.5 sm:px-2 text-right">{s.titularidades}</td>
              <td className="px-1.5 sm:px-2 text-right">{s.minutos}</td>
              <td className="px-1.5 sm:px-2 text-right font-semibold">{s.goles}</td>
              <td className="px-2 sm:px-4 text-right">
                <form action={deletePlayer.bind(null, s.id)}>
                  <button className="text-xs text-red-600 hover:underline" aria-label={`Borrar a ${s.nombre}`} title="Borrar"><span className="sm:hidden">✕</span><span className="hidden sm:inline">Borrar</span></button>
                </form>
              </td>
            </tr>
          ))}
          {visibles.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                Ningún jugador coincide con los filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
