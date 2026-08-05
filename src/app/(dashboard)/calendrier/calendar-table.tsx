"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusSelect } from "@/components/status-select";
import { StatusBadge } from "@/components/status-badge";
import { ECHEANCE_TYPE_LABELS, formatDateFr } from "@/lib/constants";
import { updateEcheanceStatut } from "@/lib/actions/echeances";

type Echeance = {
  id: string;
  type: string;
  libelle: string;
  dateEcheance: Date;
  statut: string;
  statutEffectif: string;
  commentaire: string | null;
  client: { id: string; nom: string };
};

export function CalendarTable({ echeances, clients }: { echeances: Echeance[]; clients: { id: string; nom: string }[] }) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");

  const types = useMemo(() => Array.from(new Set(echeances.map((e) => e.type))).sort(), [echeances]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return echeances.filter((e) => {
      if (clientFilter && e.client.id !== clientFilter) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      if (statutFilter && e.statutEffectif !== statutFilter) return false;
      if (term && !e.client.nom.toLowerCase().includes(term) && !e.libelle.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [echeances, search, clientFilter, typeFilter, statutFilter]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client ou une échéance..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">Tous les clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">Tous les types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {ECHEANCE_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="a_faire">À faire</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="en_retard">En retard</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">
          {filtered.length} échéance{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Type d&apos;obligation</th>
              <th className="px-4 py-3 font-medium">Échéance</th>
              <th className="px-4 py-3 font-medium">Date limite</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{e.client.nom}</td>
                <td className="px-4 py-3 text-slate-600">{ECHEANCE_TYPE_LABELS[e.type] ?? e.type}</td>
                <td className="px-4 py-3 text-slate-600">{e.libelle}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateFr(e.dateEcheance)}</td>
                <td className="px-4 py-3">
                  {e.statutEffectif === "en_retard" ? (
                    <div className="flex items-center gap-2">
                      <StatusBadge statut="en_retard" />
                      <StatusSelect value={e.statut} onChange={(v) => updateEcheanceStatut(e.id, v)} />
                    </div>
                  ) : (
                    <StatusSelect value={e.statut} onChange={(v) => updateEcheanceStatut(e.id, v)} />
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aucune échéance ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
