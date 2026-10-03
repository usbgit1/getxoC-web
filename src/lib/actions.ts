"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface ActionState {
  success: boolean;
  message: string;
}

export async function addPlayer(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const dorsalRaw = String(formData.get("dorsal") ?? "").trim();
  const posicion = String(formData.get("posicion") ?? "").trim();
  if (!nombre) return;

  const { error } = await supabase.from("players").insert({
    nombre,
    dorsal: dorsalRaw ? Number(dorsalRaw) : null,
    posicion: posicion || null,
  });
  if (error) throw new Error(`No se pudo añadir el jugador: ${error.message}`);
  revalidatePath("/jugadores");
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar el jugador: ${error.message}`);
  revalidatePath("/jugadores");
  revalidatePath("/partidos", "layout");
}

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : Number(s);
};

export async function saveMatch(
  matchId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const jugado = formData.get("jugado") === "on";
  const golesGetxo = num(formData.get("goles_getxo"));
  const golesRival = num(formData.get("goles_rival"));

  if (jugado && (golesGetxo === null || golesRival === null)) {
    return { success: false, message: "Un partido jugado necesita el resultado de ambos equipos." };
  }

  const playerIds = formData.getAll("player_id").map(String);
  const participaciones = [];
  for (const pid of playerIds) {
    const titular = formData.get(`titular_${pid}`) === "on";
    const convocado = formData.get(`convocado_${pid}`) === "on";
    const minutos = num(formData.get(`minutos_${pid}`)) ?? 0;
    const goles = num(formData.get(`goles_${pid}`)) ?? 0;

    if (!Number.isInteger(minutos) || minutos < 0 || minutos > 150) {
      return { success: false, message: "Los minutos deben estar entre 0 y 150." };
    }
    if (!Number.isInteger(goles) || goles < 0) {
      return { success: false, message: "Los goles deben ser un número entero positivo." };
    }
    if (convocado || titular || minutos > 0 || goles > 0) {
      participaciones.push({ match_id: matchId, player_id: pid, titular, minutos, goles });
    }
  }

  const golesJugadores = participaciones.reduce((s, p) => s + p.goles, 0);
  if (golesGetxo !== null && golesJugadores > golesGetxo) {
    return {
      success: false,
      message: `Los goleadores suman ${golesJugadores}, más que el resultado (${golesGetxo}).`,
    };
  }

  const { error: e1 } = await supabase
    .from("matches")
    .update({
      fecha: String(formData.get("fecha") ?? "") || null,
      hora: String(formData.get("hora") ?? "").trim() || null,
      rival: String(formData.get("rival") ?? "").trim() || null,
      es_local: formData.get("es_local") === "local",
      goles_getxo: golesGetxo,
      goles_rival: golesRival,
      jugado,
    })
    .eq("id", matchId);
  if (e1) return { success: false, message: `Error al guardar el partido: ${e1.message}` };

  const { error: e2 } = await supabase.from("match_players").delete().eq("match_id", matchId);
  if (e2) return { success: false, message: `Error al actualizar jugadores: ${e2.message}` };

  if (participaciones.length) {
    const { error: e3 } = await supabase.from("match_players").insert(participaciones);
    if (e3) return { success: false, message: `Error al guardar jugadores: ${e3.message}` };
  }

  revalidatePath("/partidos", "layout");
  revalidatePath("/jugadores");
  return { success: true, message: "Partido guardado." };
}
