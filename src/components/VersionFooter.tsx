import Link from "next/link";
import { versionActual } from "@/lib/versiones";

export default function VersionFooter() {
  return (
    <footer className="pt-2 text-center text-xs text-gray-400">
      <Link href="/versiones" className="hover:text-emerald-800 hover:underline" title="Ver histórico de versiones">
        {versionActual}
      </Link>
    </footer>
  );
}
