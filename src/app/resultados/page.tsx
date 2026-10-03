import Link from "next/link";
import { redirect } from "next/navigation";
import JornadaPicker from "@/components/JornadaPicker";
import ResultsForm from "@/components/ResultsForm";
import { supabase } from "@/lib/supabase";
import type { Match, MatchPlayer, Player } from "@/lib/types";

export const dynamic = "force-dynamic";

const titulo = (m: Match) => {
  const rival = m.rival || "por definir";
  return m.es_local ? `Getxo C vs ${rival}` : `${rival} vs Getxo C`;
};

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ jornada?: string }>;
}) {
  const { jornada } = await searchParams;

  const { data, error } = await supabase.from("matches").select("*").order("jornada");
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  // Solo se pueden anotar datos de partidos que ya tienen rival.
  const matches = ((data ?? []) as Match[]).filter((m) => m.rival);
  if (matches.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Datos del partido</h1>
        <p className="text-gray-600">
          Aún no hay partidos con rival. Regístralos primero en la pestaña{" "}
          <Link href="/registrar" className="text-emerald-800 underline">Registrar</Link>.
        </p>
      </div>
    );
  }

  // Por defecto: el primer partido todavía sin jugar (o el último si ya están todos).
  const pedido = matches.find((m) => m.jornada === Number(jornada));
  const match = pedido ?? matches.find((m) => !m.jugado) ?? matches[matches.length - 1];

  // Se fija la jornada en la dirección: si no, al guardar el partido (que pasa a "jugado")
  // la página saltaría sola al siguiente sin jugar y no se vería el mensaje de guardado.
  if (!pedido) redirect(`/resultados?jornada=${match.jornada}`);

  const [p, mp] = await Promise.all([
    supabase.from("players").select("*").eq("activo", true),
    supabase.from("match_players").select("*").eq("match_id", match.id),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Datos del partido</h1>
      <JornadaPicker
        current={match.jornada}
        options={matches.map((m) => ({
          jornada: m.jornada,
          label: `Jornada ${m.jornada} · ${titulo(m)}${m.jugado ? " ✓" : ""}`,
        }))}
      />
      <ResultsForm
        key={match.id}
        match={match}
        players={((p.data ?? []) as Player[]).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))}
        participaciones={(mp.data ?? []) as MatchPlayer[]}
      />
    </div>
  );
}
