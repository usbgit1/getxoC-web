"use client";

import { useRouter } from "next/navigation";

export default function JornadaPicker({
  options,
  current,
}: {
  options: { jornada: number; label: string }[];
  current: number;
}) {
  const router = useRouter();

  return (
    <label className="text-sm block">
      Jornada
      <select
        value={current}
        onChange={(e) => router.push(`/resultados?jornada=${e.target.value}`)}
        className="mt-1 border border-gray-300 rounded-md px-2 py-2 text-sm bg-white w-full sm:w-96 block"
      >
        {options.map((o) => (
          <option key={o.jornada} value={o.jornada}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
