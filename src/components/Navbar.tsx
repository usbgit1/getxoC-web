"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/jugadores", label: "Jugadores" },
  { href: "/partidos", label: "Partidos" },
  { href: "/registrar", label: "Registrar" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-emerald-900 text-white sticky top-0 z-10 shadow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <span className="text-lg font-bold tracking-wide">⚽ Getxo C</span>
        <nav className="flex gap-1">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  active ? "bg-white text-emerald-900" : "text-white/80 hover:bg-emerald-800"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
