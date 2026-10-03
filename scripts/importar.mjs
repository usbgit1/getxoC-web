// Importa getxoC/jugadores.xlsx y getxoC/partidos.xlsx a Supabase.
// Uso: npm run importar   (requiere .env.local con URL y clave anon)
// Se puede repetir: actualiza por dorsal (jugadores) y por jornada (partidos)
// sin tocar resultados ni minutos ya registrados.
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import path from "node:path";

const dir = process.argv[2] ?? path.resolve("..", "getxoC");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function rows(file) {
  const wb = XLSX.readFile(path.join(dir, file), { cellDates: true });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const m = String(v).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}/.test(String(v)) ? String(v).slice(0, 10) : null;
}

const isGetxo = (s) => /^getxo/i.test(String(s).trim());

const players = rows("jugadores.xlsx")
  .filter((r) => String(r.Nombre).trim())
  .map((r) => ({
    dorsal: r.Dorsal === "" ? null : Number(r.Dorsal),
    nombre: String(r.Nombre).trim(),
  }));

const matches = rows("partidos.xlsx")
  .filter((r) => r["Numero pardio"] !== "" || r["Numero partido"] !== "")
  .map((r) => {
    const local = String(r.Local).trim();
    const visitante = String(r.Visitante).trim();
    const esLocal = !local || isGetxo(local);
    const rival = (esLocal ? visitante : local) || null;
    return {
      jornada: Number(r["Numero partido"] ?? r["Numero pardio"]),
      fecha: toDate(r.Fecha),
      es_local: esLocal,
      rival,
    };
  });

if (players.length) {
  const { error } = await supabase.from("players").upsert(players, { onConflict: "dorsal" });
  if (error) throw error;
}
const { error } = await supabase.from("matches").upsert(matches, { onConflict: "jornada" });
if (error) throw error;

console.log(`Importados ${players.length} jugadores y ${matches.length} partidos.`);
