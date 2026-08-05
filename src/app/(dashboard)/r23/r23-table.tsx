"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusSelect } from "@/components/status-select";
import { updateLigneR23Statut } from "@/lib/actions/r23";

type Ligne = {
  id: string;
  periode: string;
  collaborateur: string | null;
  typeOperation: string | null;
  saisieStatut: string;
  rapprochementBancaire: string;
  situationStatut: string;
  tvaStatut: string;
  bilanStatut: string;
  remarques: string | null;
  updatedAt: Date;
  client: { id: string; nom: string };
};

const TYPE_OPERATION_LABELS: Record<string, string> = {
  tenue: "Tenue",
  revision: "Révision",
  bilan: "Bilan",
};

export function R23Table({ lignes }: { lignes: Ligne[] }) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [collaborateurFilter, setCollaborateurFilter] = useState("");
  const [periodeFilter, setPeriodeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");

  const clients = useMemo(
    () => Array.from(new Map(lignes.map((l) => [l.client.id, l.client])).values()).sort((a, b) => a.nom.localeCompare(b.nom)),
    [lignes],
  );
  const collaborateurs = useMemo(
    () => Array.from(new Set(lignes.map((l) => l.collaborateur).filter(Boolean))) as string[],
    [lignes],
  );
  const periodes = useMemo(() => Array.from(new Set(lignes.map((l) => l.periode))).sort().reverse(), [lignes]);
  const types = useMemo(() => Array.from(new Set(lignes.map((l) => l.typeOperation).filter(Boolean))) as string[], [lignes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lignes.filter((l) => {
      if (clientFilter && l.client.id !== clientFilter) return false;
      if (collaborateurFilter && l.collaborateur !== collaborateurFilter) return false;
      if (periodeFilter && l.periode !== periodeFilter) return false;
      if (typeFilter && l.typeOperation !== typeFilter) return false;
      if (statutFilter) {
        const statuts = [l.saisieStatut, l.rapprochementBancaire, l.situationStatut, l.tvaStatut, l.bilanStatut];
        if (!statuts.includes(statutFilter)) return false;
      }
      if (term) {
        const haystack = `${l.client.nom} ${l.collaborateur ?? ""} ${l.remarques ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [lignes, search, clientFilter, collaborateurFilter, periodeFilter, typeFilter, statutFilter]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client, un collaborateur, une remarque..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Tous les clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <select value={collaborateurFilter} onChange={(e) => setCollaborateurFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Tous les collaborateurs</option>
          {collaborateurs.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={periodeFilter} onChange={(e) => setPeriodeFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Toutes les périodes</option>
          {periodes.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Tous les types</option>
          {types.map((t) => (
            <option key={t} value={t}>{TYPE_OPERATION_LABELS[t] ?? t}</option>
          ))}
        </select>
        <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">Tous les statuts</option>
          <option value="a_faire">À faire</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} ligne{filtered.length > 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Période</th>
              <th className="px-4 py-3 font-medium">Collaborateur</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Saisie</th>
              <th className="px-4 py-3 font-medium">Rapprochement</th>
              <th className="px-4 py-3 font-medium">Situation</th>
              <th className="px-4 py-3 font-medium">TVA</th>
              <th className="px-4 py-3 font-medium">Bilan</th>
              <th className="px-4 py-3 font-medium">Remarques</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{l.client.nom}</td>
                <td className="px-4 py-3 text-slate-600">{l.periode}</td>
                <td className="px-4 py-3 text-slate-600">{l.collaborateur ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{TYPE_OPERATION_LABELS[l.typeOperation ?? ""] ?? l.typeOperation ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusSelect value={l.saisieStatut} onChange={(v) => updateLigneR23Statut(l.id, "saisieStatut", v)} />
                </td>
                <td className="px-4 py-3">
                  <StatusSelect value={l.rapprochementBancaire} onChange={(v) => updateLigneR23Statut(l.id, "rapprochementBancaire", v)} />
                </td>
                <td className="px-4 py-3">
                  <StatusSelect value={l.situationStatut} onChange={(v) => updateLigneR23Statut(l.id, "situationStatut", v)} />
                </td>
                <td className="px-4 py-3">
                  <StatusSelect value={l.tvaStatut} onChange={(v) => updateLigneR23Statut(l.id, "tvaStatut", v)} />
                </td>
                <td className="px-4 py-3">
                  <StatusSelect value={l.bilanStatut} onChange={(v) => updateLigneR23Statut(l.id, "bilanStatut", v)} />
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-500" title={l.remarques ?? undefined}>
                  {l.remarques ?? "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aucune ligne ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
        Dernière mise à jour affichée par ligne disponible dans l&apos;historique du dossier client. Toute modification de
        statut est journalisée automatiquement.
      </div>
    </div>
  );
}
