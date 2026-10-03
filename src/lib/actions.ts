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
  revalidatePath("/resultados");
}

const EQUIPO = "Getxo C";

export async function addTeam(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  const { error } = await supabase.from("teams").upsert({ nombre }, { onConflict: "nombre" });
  if (error) throw new Error(`No se pudo añadir el equipo: ${error.message}`);
  revalidatePath("/registrar");
}

export async function registerMatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const jornada = Number(formData.get("jornada"));
  const local = String(formData.get("local") ?? "");
  const visitante = String(formData.get("visitante") ?? "");
  const fecha = String(formData.get("fecha") ?? "");

  if (!Number.isInteger(jornada) || jornada < 1) {
    return { success: false, message: "Elige el número de jornada." };
  }
  if (!local || !visitante) {
    return { success: false, message: "Elige el equipo local y el visitante." };
  }
  if (local === visitante) {
    return { success: false, message: "El local y el visitante no pueden ser el mismo equipo." };
  }
  if (local !== EQUIPO && visitante !== EQUIPO) {
    return { success: false, message: `Uno de los dos equipos debe ser ${EQUIPO}.` };
  }

  const esLocal = local === EQUIPO;
  // La fecha solo se incluye si se rellena, para no borrar la ya guardada.
  const row: Record<string, unknown> = {
    jornada,
    es_local: esLocal,
    rival: esLocal ? visitante : local,
  };
  if (fecha) row.fecha = fecha;

  const { error } = await supabase.from("matches").upsert(row, { onConflict: "jornada" });
  if (error) return { success: false, message: `Error al guardar: ${error.message}` };

  revalidatePath("/partidos", "layout");
  revalidatePath("/resultados");
  return { success: true, message: `Jornada ${jornada} registrada: ${local} vs ${visitante}.` };
}

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : Number(s);
};

// Guarda el resultado y los datos de cada jugador de un partido.
// Un jugador "juega" (PJ) si tiene minutos; ser titular o marcar exige minutos.
export async function saveResults(
  matchId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const golesGetxo = num(formData.get("goles_getxo"));
  const golesRival = num(formData.get("goles_rival"));

  if ((golesGetxo === null) !== (golesRival === null)) {
    return { success: false, message: "Rellena el resultado de los dos equipos, o deja ambos vacíos." };
  }
  if ([golesGetxo, golesRival].some((g) => g !== null && (!Number.isInteger(g) || g < 0))) {
    return { success: false, message: "El resultado debe ser un número entero positivo." };
  }

  const participaciones = [];
  for (const pid of formData.getAll("player_id").map(String)) {
    const nombre = String(formData.get(`nombre_${pid}`) ?? "Un jugador");
    const titular = formData.get(`titular_${pid}`) === "on";
    const minutos = num(formData.get(`minutos_${pid}`)) ?? 0;
    const goles = num(formData.get(`goles_${pid}`)) ?? 0;

    if (!Number.isInteger(minutos) || minutos < 0 || minutos > 150) {
      return { success: false, message: `${nombre}: los minutos deben estar entre 0 y 150.` };
    }
    if (!Number.isInteger(goles) || goles < 0) {
      return { success: false, message: `${nombre}: los goles deben ser un número entero positivo.` };
    }
    if (minutos === 0 && (titular || goles > 0)) {
      return {
        success: false,
        message: `${nombre}: si es titular o marca, tiene que tener minutos jugados.`,
      };
    }
    if (minutos > 0) {
      participaciones.push({ match_id: matchId, player_id: pid, titular, minutos, goles });
    }
  }

  const golesJugadores = participaciones.reduce((s, p) => s + p.goles, 0);
  if (golesGetxo !== null && golesJugadores > golesGetxo) {
    return {
      success: false,
      message: `Los goleadores suman ${golesJugadores}, más que el resultado del Getxo C (${golesGetxo}).`,
    };
  }

  const { error: errPartido } = await supabase
    .from("matches")
    .update({ goles_getxo: golesGetxo, goles_rival: golesRival, jugado: golesGetxo !== null })
    .eq("id", matchId);
  if (errPartido) {
    return { success: false, message: `Error al guardar el resultado: ${errPartido.message}` };
  }

  // Primero se guardan los jugadores nuevos y después se borran los que sobran,
  // para no perder datos si algo falla a mitad.
  if (participaciones.length) {
    const { error } = await supabase
      .from("match_players")
      .upsert(participaciones, { onConflict: "match_id,player_id" });
    if (error) return { success: false, message: `Error al guardar jugadores: ${error.message}` };
  }
  const ids = participaciones.map((p) => p.player_id);
  const sobrantes = supabase.from("match_players").delete().eq("match_id", matchId);
  const { error: errBorrado } = await (ids.length
    ? sobrantes.not("player_id", "in", `(${ids.join(",")})`)
    : sobrantes);
  if (errBorrado) {
    return { success: false, message: `Error al actualizar jugadores: ${errBorrado.message}` };
  }

  revalidatePath("/partidos");
  revalidatePath("/jugadores");
  revalidatePath("/resultados");
  return { success: true, message: "Datos del partido guardados." };
}
