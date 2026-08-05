import { getR10Lignes } from "@/lib/queries/r10";
import { R10Table } from "./r10-table";

export default async function R10Page() {
  const lignes = await getR10Lignes();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tableau R10 — Suivi de la TVA</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reprise numérique du tableau Excel R10 : TVA collectée, TVA déductible, TVA à payer ou crédit et statut de
          traitement pour chaque client et chaque mois.
        </p>
      </div>

      <R10Table lignes={lignes} />
    </div>
  );
}
