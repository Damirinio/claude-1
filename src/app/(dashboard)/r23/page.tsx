import { getR23Lignes } from "@/lib/queries/r23";
import { R23Table } from "./r23-table";

export default async function R23Page() {
  const lignes = await getR23Lignes();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tableau R23 — Suivi comptable</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reprise numérique du tableau de suivi Excel R23 : avancement de la saisie, du rapprochement bancaire, de la
          situation, de la TVA et du bilan pour chaque client et chaque période.
        </p>
      </div>

      <R23Table lignes={lignes} />
    </div>
  );
}
