import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, History } from "lucide-react";
import { getProcedureDetail } from "@/lib/queries/procedures";
import { formatDateFr } from "@/lib/constants";
import { ProcedureEditor } from "./procedure-editor";

export default async function ProcedureDetailPage({ params }: PageProps<"/procedures/[id]">) {
  const { id } = await params;
  const procedure = await getProcedureDetail(id);
  if (!procedure) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/procedures" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ChevronLeft size={16} /> Retour aux procédures
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">{procedure.categorie}</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{procedure.titre}</h1>
        <p className="mt-1 text-xs text-slate-400">Dernière mise à jour le {formatDateFr(procedure.updatedAt)}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProcedureEditor id={procedure.id} contenu={procedure.contenu} />
      </div>

      {procedure.versions.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History size={15} /> Historique des versions
          </h2>
          <ul className="space-y-2">
            {procedure.versions.map((v, i) => (
              <li key={v.id} className="flex items-center justify-between text-xs text-slate-500">
                <span>Version {procedure.versions.length - i}</span>
                <span>
                  {formatDateFr(v.createdAt)} — {v.updatedBy?.name ?? "Système"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
