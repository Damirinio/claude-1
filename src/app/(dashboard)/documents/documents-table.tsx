"use client";

import { useMemo, useState } from "react";
import { Download, FileText, History } from "lucide-react";
import { DOCUMENT_CATEGORY_LABELS, formatDateFr } from "@/lib/constants";

type Doc = {
  id: string;
  exercice: string;
  categorie: string;
  nom: string;
  version: number;
  filePath: string | null;
  createdAt: Date;
  client: { id: string; nom: string };
  uploadedBy: { id: string; name: string } | null;
};

export function DocumentsTable({ documents }: { documents: Doc[] }) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [exerciceFilter, setExerciceFilter] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("");
  const [latestOnly, setLatestOnly] = useState(true);

  const clients = useMemo(
    () => Array.from(new Map(documents.map((d) => [d.client.id, d.client])).values()).sort((a, b) => a.nom.localeCompare(b.nom)),
    [documents],
  );
  const exercices = useMemo(() => Array.from(new Set(documents.map((d) => d.exercice))).sort().reverse(), [documents]);

  const latestVersionIds = useMemo(() => {
    const byKey = new Map<string, Doc>();
    for (const d of documents) {
      const key = `${d.client.id}|${d.exercice}|${d.categorie}|${d.nom}`;
      const current = byKey.get(key);
      if (!current || d.version > current.version) byKey.set(key, d);
    }
    return new Set(Array.from(byKey.values()).map((d) => d.id));
  }, [documents]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return documents.filter((d) => {
      if (latestOnly && !latestVersionIds.has(d.id)) return false;
      if (clientFilter && d.client.id !== clientFilter) return false;
      if (exerciceFilter && d.exercice !== exerciceFilter) return false;
      if (categorieFilter && d.categorie !== categorieFilter) return false;
      if (term && !`${d.client.nom} ${d.nom}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [documents, search, clientFilter, exerciceFilter, categorieFilter, latestOnly, latestVersionIds]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="relative min-w-[220px] flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client ou un document..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Tous les clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <select value={exerciceFilter} onChange={(e) => setExerciceFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Tous les exercices</option>
          {exercices.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={categorieFilter} onChange={(e) => setCategorieFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Toutes les catégories</option>
          {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={latestOnly} onChange={(e) => setLatestOnly(e.target.checked)} />
          Dernière version uniquement
        </label>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} document{filtered.length > 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Exercice</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Version</th>
              <th className="px-4 py-3 font-medium">Ajouté par</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="shrink-0 text-slate-400" />
                    {d.nom}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.client.nom}</td>
                <td className="px-4 py-3 text-slate-600">{d.exercice}</td>
                <td className="px-4 py-3 text-slate-600">{DOCUMENT_CATEGORY_LABELS[d.categorie] ?? d.categorie}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    <History size={11} /> v{d.version}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.uploadedBy?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateFr(d.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {d.filePath ? (
                    <a
                      href={`/api/documents/${d.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Download size={12} /> Télécharger
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300">Métadonnées seules</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aucun document ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
