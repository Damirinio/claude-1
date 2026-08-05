import Link from "next/link";
import { Plus } from "lucide-react";
import { getProceduresGroupedByCategory } from "@/lib/queries/procedures";
import { ProceduresList } from "./procedures-list";

export default async function ProceduresPage() {
  const groups = await getProceduresGroupedByCategory();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Procédures internes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Base de connaissances du service comptabilité : méthodes de travail harmonisées, de l&apos;intégration
            d&apos;un client jusqu&apos;à la clôture annuelle du dossier.
          </p>
        </div>
        <Link
          href="/procedures/nouveau"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus size={16} /> Nouvelle procédure
        </Link>
      </div>

      <ProceduresList groups={groups} />
    </div>
  );
}
