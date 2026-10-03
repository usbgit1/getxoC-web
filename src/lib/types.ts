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

export interface MatchPlayer {
  match_id: string;
  player_id: string;
  titular: boolean;
  minutos: number;
  goles: number;
}

export interface PlayerStats extends Player {
  partidos: number;
  titularidades: number;
  minutos: number;
  goles: number;
}
