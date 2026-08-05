"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusSelect } from "@/components/status-select";
import { EditableAmount } from "@/components/editable-amount";
import { updateLigneR10Statut, updateLigneR10Montants } from "@/lib/actions/r10";
import { MOIS_LABELS, formatEuro } from "@/lib/constants";

type Ligne = {
  id: string;
  mois: number;
  annee: number;
  collaborateur: string | null;
  tvaCollectee: number;
  tvaDeductible: number;
  statutDeclaration: string;
  situationParticuliere: string | null;
  client: { id: string; nom: string };
};

export function R10Table({ lignes }: { lignes: Ligne[] }) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [collaborateurFilter, setCollaborateurFilter] = useState("");
  const [moisFilter, setMoisFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [situationOnly, setSituationOnly] = useState(false);

  const clients = useMemo(
    () => Array.from(new Map(lignes.map((l) => [l.client.id, l.client])).values()).sort((a, b) => a.nom.localeCompare(b.nom)),
    [lignes],
  );
  const collaborateurs = useMemo(
    () => Array.from(new Set(lignes.map((l) => l.collaborateur).filter(Boolean))) as string[],
    [lignes],
  );
  const moisOptions = useMemo(
    () => Array.from(new Set(lignes.map((l) => `${l.annee}-${String(l.mois).padStart(2, "0")}`))).sort().reverse(),
    [lignes],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lignes.filter((l) => {
      if (clientFilter && l.client.id !== clientFilter) return false;
      if (collaborateurFilter && l.collaborateur !== collaborateurFilter) return false;
      if (moisFilter && `${l.annee}-${String(l.mois).padStart(2, "0")}` !== moisFilter) return false;
      if (statutFilter && l.statutDeclaration !== statutFilter) return false;
      if (situationOnly && !l.situationParticuliere) return false;
      if (term) {
        const haystack = `${l.client.nom} ${l.collaborateur ?? ""} ${l.situationParticuliere ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [lignes, search, clientFilter, collaborateurFilter, moisFilter, statutFilter, situationOnly]);

  const synth = useMemo(() => {
    const termine = filtered.filter((l) => l.statutDeclaration === "termine").length;
    const enAttente = filtered.length - termine;
    const totalAPayer = filtered.reduce((sum, l) => sum + Math.max(0, l.tvaCollectee - l.tvaDeductible), 0);
    const totalCredit = filtered.reduce((sum, l) => sum + Math.max(0, l.tvaDeductible - l.tvaCollectee), 0);
    return { termine, enAttente, totalAPayer, totalCredit, anomalies: filtered.filter((l) => l.situationParticuliere).length };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <SynthCard label="Dossiers traités" value={synth.termine} tone="success" />
        <SynthCard label="Dossiers en attente" value={synth.enAttente} tone="warning" />
        <SynthCard label="TVA à payer (cumul)" value={formatEuro(synth.totalAPayer)} />
        <SynthCard label="Crédit de TVA (cumul)" value={formatEuro(synth.totalCredit)} />
        <SynthCard label="Situations particulières" value={synth.anomalies} tone={synth.anomalies > 0 ? "warning" : "success"} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un client, un collaborateur..."
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
          <select value={moisFilter} onChange={(e) => setMoisFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">Tous les mois</option>
            {moisOptions.map((m) => {
              const [year, month] = m.split("-");
              return (
                <option key={m} value={m}>
                  {MOIS_LABELS[Number(month) - 1]} {year}
                </option>
              );
            })}
          </select>
          <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">Tous les statuts</option>
            <option value="a_faire">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={situationOnly} onChange={(e) => setSituationOnly(e.target.checked)} />
            Situations particulières uniquement
          </label>
          <span className="ml-auto text-xs text-slate-500">{filtered.length} ligne{filtered.length > 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium">Collaborateur</th>
                <th className="px-4 py-3 font-medium">TVA collectée</th>
                <th className="px-4 py-3 font-medium">TVA déductible</th>
                <th className="px-4 py-3 font-medium">TVA à payer / crédit</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Situation particulière</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((l) => {
                const solde = l.tvaCollectee - l.tvaDeductible;
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{l.client.nom}</td>
                    <td className="px-4 py-3 text-slate-600">{MOIS_LABELS[l.mois - 1]} {l.annee}</td>
                    <td className="px-4 py-3 text-slate-600">{l.collaborateur ?? "—"}</td>
                    <td className="px-4 py-3">
                      <EditableAmount value={l.tvaCollectee} onCommit={(v) => updateLigneR10Montants(l.id, v, l.tvaDeductible)} />
                    </td>
                    <td className="px-4 py-3">
                      <EditableAmount value={l.tvaDeductible} onCommit={(v) => updateLigneR10Montants(l.id, l.tvaCollectee, v)} />
                    </td>
                    <td className={`px-4 py-3 font-medium ${solde >= 0 ? "text-slate-900" : "text-emerald-600"}`}>
                      {solde >= 0 ? formatEuro(solde) : `Crédit ${formatEuro(Math.abs(solde))}`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect value={l.statutDeclaration} onChange={(v) => updateLigneR10Statut(l.id, v)} />
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-500" title={l.situationParticuliere ?? undefined}>
                      {l.situationParticuliere ?? "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                    Aucune ligne ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SynthCard({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "success" | "warning" }) {
  const toneClasses: Record<string, string> = {
    default: "text-slate-900",
    success: "text-emerald-600",
    warning: "text-amber-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}
