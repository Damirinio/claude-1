import { createProcedure } from "@/lib/actions/procedures";

export default function NouvelleProcedurePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nouvelle procédure</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ajoutez une nouvelle fiche à la base de connaissances du cabinet.
        </p>
      </div>

      <form action={createProcedure} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Catégorie</label>
          <input
            name="categorie"
            required
            placeholder="Ex : Production comptable"
            list="categories-existantes"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Titre</label>
          <input name="titre" required placeholder="Ex : Contrôle des immobilisations" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Contenu (Markdown simplifié : ## titres, listes -, 1.)</label>
          <textarea
            name="contenu"
            required
            rows={14}
            placeholder={"## Objectif\n...\n\n## Étapes\n1. ...\n2. ..."}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
          />
        </div>
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          Publier la procédure
        </button>
      </form>
    </div>
  );
}
