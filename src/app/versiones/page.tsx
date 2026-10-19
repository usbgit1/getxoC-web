import Link from "next/link";
import { versiones } from "@/lib/versiones";

export default function VersionesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold">Versiones</h1>
        <Link href="/general" className="text-sm text-emerald-800 hover:underline">
          Volver a General
        </Link>
      </div>
      <ol className="space-y-3">
        {versiones.map((v, i) => (
          <li key={v.version} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-baseline gap-3">
              <h2 className="font-semibold">{v.version}</h2>
              {i === 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-900 rounded-full px-2 py-0.5">actual</span>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(v.fecha).toLocaleDateString("es-ES")}
              </span>
            </div>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-700">
              {v.cambios.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
