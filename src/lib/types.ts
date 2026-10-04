export interface Player {
  id: string;
  dorsal: number | null;
  nombre: string;
  posicion: string | null;
  activo: boolean;
}

export interface Match {
  id: string;
  jornada: number;
  fecha: string | null;
  hora: string | null;
  rival: string | null;
  es_local: boolean;
  goles_getxo: number | null;
  goles_rival: number | null;
  jugado: boolean;
}

export interface Team {
  id: string;
  nombre: string;
}

export interface MatchPlayer {
  match_id: string;
  player_id: string;
  convocado: boolean;
  titular: boolean;
  minutos: number;
  goles: number;
}

export interface PlayerStats extends Player {
  convocatorias: number;
  partidos: number;
  titularidades: number;
  minutos: number;
  goles: number;
  // Últimos partidos jugados, del más antiguo al más reciente (titular o no).
  racha: { jornada: number; titular: boolean }[];
}
