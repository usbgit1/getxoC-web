"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/portada", label: "Portada" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/resultados", label: "Resultados" },
  { href: "/partidos", label: "Partidos" },
  { href: "/registrar", label: "Registrar" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-emerald-900 text-white sticky top-0 z-10 shadow">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 h-14">
        <span className="flex items-center gap-2.5 text-lg font-bold tracking-wide whitespace-nowrap">
          <Image src="/escudo-getxo.webp" alt="Escudo del C.D. Getxo" width={26} height={36} priority />
          {/* En móvil solo el escudo, para que quepan las cuatro pestañas */}
          <span className="hidden sm:inline">Getxo C</span>
        </span>
        <nav className="flex gap-0.5 sm:gap-1 min-w-0 overflow-x-auto [scrollbar-width:none]">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-1.5 sm:px-3 py-2 rounded-md whitespace-nowrap text-[13px] sm:text-sm font-medium ${
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
