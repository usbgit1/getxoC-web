// Histórico de versiones de la web, la más reciente primero.
// Con cada cambio: añadir una entrada arriba con la versión siguiente (v0.101, v0.102…).
export interface Version {
  version: string;
  fecha: string;
  cambios: string[];
}

export const versiones: Version[] = [
  {
    version: "v0.101",
    fecha: "2026-10-19",
    cambios: [
      "Se elimina la pestaña General y General2 pasa a llamarse Portada (es la primera pestaña y la de inicio).",
      "Las direcciones antiguas /general y /general2 redirigen a Portada.",
    ],
  },
  {
    version: "v0.100",
    fecha: "2026-10-19",
    cambios: [
      "Versión visible al pie de General y General2, con este histórico de cambios.",
      "Estado de partida: pestañas General, General2, Jugadores, Resultados, Partidos y Registrar.",
      "Jugadores: minigráfico de los últimos 5 partidos (verde con T titular, amarillo suplente, rojo sin minutos, negro no convocado).",
      "Resultados: respeta el orden local-visitante y avisa si los minutos no suman 990.",
      "General2: balance del equipo, próximo partido, goles por jornada y tops.",
    ],
  },
];

export const versionActual = versiones[0].version;
