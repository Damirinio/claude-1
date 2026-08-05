import { notFound } from "next/navigation";
import { getClientDetail } from "@/lib/queries/clients";
import { StatusBadge } from "@/components/status-badge";
import { ClientActifToggle } from "./client-actif-toggle";
import {
  DOCUMENT_CATEGORY_LABELS,
  ECHEANCE_TYPE_LABELS,
  MOIS_LABELS,
  REGIME_TVA_LABELS,
  effectiveEcheanceStatut,
  formatDateFr,
  formatEuro,
} from "@/lib/constants";

export default async function ClientDetailPage({ params }: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const client = await getClientDetail(id);
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{client.nom}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {client.formeJuridique ?? "—"} · SIREN {client.siren ?? "—"} · Clôture {client.dateClotureExercice.replace("-", "/")}
            </p>
          </div>
          <ClientActifToggle clientId={client.id} actif={client.actif} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 md:grid-cols-4">
          <Info label="Régime fiscal" value={client.regimeFiscal} />
          <Info label="Régime de TVA" value={REGIME_TVA_LABELS[client.regimeTVA] ?? client.regimeTVA} />
          <Info label="Collaborateur référent" value={client.collaborateur?.name ?? "Non assigné"} />
          <Info label="Statut du dossier" value={client.statutDossier} />
        </div>
      </div>

      <Section title="Échéances fiscales">
        {client.echeances.length === 0 ? (
          <EmptyState message="Aucune échéance enregistrée pour ce client." />
        ) : (
          <Table
            head={["Type", "Échéance", "Date limite", "Statut"]}
            rows={client.echeances.map((e) => [
              ECHEANCE_TYPE_LABELS[e.type] ?? e.type,
              e.libelle,
              formatDateFr(e.dateEcheance),
              <StatusBadge key={e.id} statut={effectiveEcheanceStatut(e.statut, e.dateEcheance)} />,
            ])}
          />
        )}
      </Section>

      <Section title="Suivi comptable (R23)">
        {client.ligneR23s.length === 0 ? (
          <EmptyState message="Aucune ligne R23 enregistrée pour ce client." />
        ) : (
          <Table
            head={["Période", "Saisie", "Rapprochement", "Situation", "TVA", "Bilan"]}
            rows={client.ligneR23s.map((l) => [
              l.periode,
              <StatusBadge key={`${l.id}-s`} statut={l.saisieStatut} />,
              <StatusBadge key={`${l.id}-r`} statut={l.rapprochementBancaire} />,
              <StatusBadge key={`${l.id}-si`} statut={l.situationStatut} />,
              <StatusBadge key={`${l.id}-t`} statut={l.tvaStatut} />,
              <StatusBadge key={`${l.id}-b`} statut={l.bilanStatut} />,
            ])}
          />
        )}
      </Section>

      <Section title="Suivi TVA (R10)">
        {client.ligneR10s.length === 0 ? (
          <EmptyState message="Ce client est en franchise en base de TVA ou n'a pas encore de ligne de suivi." />
        ) : (
          <Table
            head={["Période", "TVA collectée", "TVA déductible", "Solde", "Statut"]}
            rows={client.ligneR10s.map((l) => {
              const solde = l.tvaCollectee - l.tvaDeductible;
              return [
                `${MOIS_LABELS[l.mois - 1]} ${l.annee}`,
                formatEuro(l.tvaCollectee),
                formatEuro(l.tvaDeductible),
                solde >= 0 ? formatEuro(solde) : `Crédit ${formatEuro(Math.abs(solde))}`,
                <StatusBadge key={l.id} statut={l.statutDeclaration} />,
              ];
            })}
          />
        )}
      </Section>

      <Section title="Documents">
        {client.documents.length === 0 ? (
          <EmptyState message="Aucun document classé pour ce client." />
        ) : (
          <Table
            head={["Document", "Exercice", "Catégorie", "Version", "Ajouté par", "Date"]}
            rows={client.documents.map((d) => [
              d.nom,
              d.exercice,
              DOCUMENT_CATEGORY_LABELS[d.categorie] ?? d.categorie,
              `v${d.version}`,
              d.uploadedBy?.name ?? "—",
              formatDateFr(d.createdAt),
            ])}
          />
        )}
      </Section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">{title}</h2>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-slate-400">{message}</p>;
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
