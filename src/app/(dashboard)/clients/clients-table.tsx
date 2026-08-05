"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { REGIME_TVA_LABELS } from "@/lib/constants";

type Client = {
  id: string;
  nom: string;
  siren: string | null;
  formeJuridique: string | null;
  regimeFiscal: string;
  regimeTVA: string;
  actif: boolean;
  collaborateur: { id: string; name: string } | null;
  _count: { echeances: number; documents: number };
};

export function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const [collaborateurFilter, setCollaborateurFilter] = useState("");
  const [regimeFilter, setRegimeFilter] = useState("");
  const [actifOnly, setActifOnly] = useState(true);

  const collaborateurs = useMemo(
    () => Array.from(new Map(clients.filter((c) => c.collaborateur).map((c) => [c.collaborateur!.id, c.collaborateur!])).values()),
    [clients],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (actifOnly && !c.actif) return false;
      if (collaborateurFilter && c.collaborateur?.id !== collaborateurFilter) return false;
      if (regimeFilter && c.regimeFiscal !== regimeFilter) return false;
      if (term && !`${c.nom} ${c.siren ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [clients, search, collaborateurFilter, regimeFilter, actifOnly]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client, un SIREN..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select value={collaborateurFilter} onChange={(e) => setCollaborateurFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Tous les collaborateurs</option>
          {collaborateurs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={regimeFilter} onChange={(e) => setRegimeFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">IS / IR</option>
          <option value="IS">IS</option>
          <option value="IR">IR</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={actifOnly} onChange={(e) => setActifOnly(e.target.checked)} />
          Actifs uniquement
        </label>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} client{filtered.length > 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Forme</th>
              <th className="px-4 py-3 font-medium">Régime fiscal</th>
              <th className="px-4 py-3 font-medium">Régime TVA</th>
              <th className="px-4 py-3 font-medium">Collaborateur</th>
              <th className="px-4 py-3 font-medium">Échéances</th>
              <th className="px-4 py-3 font-medium">Documents</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {c.nom}
                  {!c.actif && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Inactif</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.formeJuridique ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.regimeFiscal}</td>
                <td className="px-4 py-3 text-slate-600">{REGIME_TVA_LABELS[c.regimeTVA] ?? c.regimeTVA}</td>
                <td className="px-4 py-3 text-slate-600">{c.collaborateur?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c._count.echeances}</td>
                <td className="px-4 py-3 text-slate-600">{c._count.documents}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/clients/${c.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                    Détail <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aucun client ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
