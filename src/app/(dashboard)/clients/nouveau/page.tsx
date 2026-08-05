import { getCollaborateurs } from "@/lib/queries/clients";
import { createClient } from "@/lib/actions/clients";

export default async function NouveauClientPage() {
  const collaborateurs = await getCollaborateurs();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nouveau client</h1>
        <p className="mt-1 text-sm text-slate-500">Créer un nouveau dossier client dans le cabinet.</p>
      </div>

      <form action={createClient} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Raison sociale</label>
          <input name="nom" required placeholder="SARL Exemple" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">SIREN</label>
          <input name="siren" placeholder="123 456 789" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Forme juridique</label>
          <input name="formeJuridique" placeholder="SARL, SAS, EURL..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Régime fiscal</label>
          <select name="regimeFiscal" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="IS">Impôt sur les sociétés (IS)</option>
            <option value="IR">Impôt sur le revenu (IR)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Régime de TVA</label>
          <select name="regimeTVA" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="reel_normal">Réel normal</option>
            <option value="reel_simplifie">Réel simplifié</option>
            <option value="franchise">Franchise en base</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Date de clôture d&apos;exercice</label>
          <select name="dateClotureExercice" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="12-31">31 décembre</option>
            <option value="06-30">30 juin</option>
            <option value="03-31">31 mars</option>
            <option value="09-30">30 septembre</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Collaborateur référent</label>
          <select name="collaborateurId" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">Non assigné</option>
            {collaborateurs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Créer le dossier
          </button>
        </div>
      </form>
    </div>
  );
}
