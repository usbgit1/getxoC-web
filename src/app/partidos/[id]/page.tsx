import Link from "next/link";
import { notFound } from "next/navigation";
import MatchForm from "@/components/MatchForm";
import { supabase } from "@/lib/supabase";
import type { Match, MatchPlayer, Player } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PartidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [m, p, mp] = await Promise.all([
    supabase.from("matches").select("*").eq("id", id).maybeSingle(),
    supabase.from("players").select("*").eq("activo", true).order("dorsal", { nullsFirst: false }),
    supabase.from("match_players").select("*").eq("match_id", id),
  ]);
  if (m.error) return <p className="text-red-600">Error: {m.error.message}</p>;
  if (!m.data) notFound();

  const match = m.data as Match;
  return (
    <div className="space-y-4">
      <Link href="/partidos" className="text-sm text-emerald-800 hover:underline">
        ← Partidos
      </Link>
      <h1 className="text-2xl font-bold">
        Jornada {match.jornada}
        {match.rival ? ` · ${match.rival}` : ""}
      </h1>
      <MatchForm
        match={match}
        players={(p.data ?? []) as Player[]}
        participaciones={(mp.data ?? []) as MatchPlayer[]}
      />
    </div>
  );
}
