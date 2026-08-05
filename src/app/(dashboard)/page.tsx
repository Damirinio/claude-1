import Link from "next/link";
import {
  Users,
  Gauge,
  CalendarClock,
  AlertTriangle,
  FileWarning,
  ClipboardList,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getDashboardData } from "@/lib/queries/dashboard";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { ECHEANCE_TYPE_LABELS, formatDateFr } from "@/lib/constants";

export default async function PilotagePage() {
  const data = await getDashboardData();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pilotage du cabinet</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vision consolidée de l&apos;activité comptable et fiscale — {formatDateFr(data.now)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Clients suivis" value={data.totalClients} icon={Users} />
        <KpiCard
          label="Avancement des travaux"
          value={`${data.avancementTravaux}%`}
          icon={Gauge}
          tone={data.avancementTravaux >= 70 ? "success" : data.avancementTravaux >= 40 ? "warning" : "danger"}
          hint="Période en cours"
        />
        <KpiCard
          label="Échéances à venir (30j)"
          value={data.echeancesAVenirCount}
          icon={CalendarClock}
          tone="warning"
        />
        <KpiCard
          label="Dossiers en retard"
          value={data.dossiersEnRetardCount}
          icon={AlertTriangle}
          tone={data.dossiersEnRetardCount > 0 ? "danger" : "success"}
          hint={`${data.echeancesEnRetardCount} échéance(s) concernée(s)`}
        />
        <KpiCard
          label="Documents manquants signalés"
          value={data.documentsManquantsCount}
          icon={FileWarning}
          tone={data.documentsManquantsCount > 0 ? "warning" : "success"}
        />
        <KpiCard
          label="Déclarations en attente"
          value={data.declarationsEnAttenteCount}
          icon={ClipboardList}
          tone={data.declarationsEnAttenteCount > 0 ? "warning" : "success"}
          hint="TVA (tableau R10)"
        />
        <KpiCard
          label="Situations particulières"
          value={data.situationsParticulieresCount}
          icon={Sparkles}
        />
        <KpiCard
          label="Actions prioritaires"
          value={data.actionsPrioritaires.length}
          icon={AlertTriangle}
          tone={data.actionsPrioritaires.length > 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Actions prioritaires</h2>
            <Link href="/calendrier" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
              Voir le calendrier fiscal <ArrowRight size={14} />
            </Link>
          </div>
          {data.actionsPrioritaires.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Aucune action prioritaire — tout est sous contrôle.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.actionsPrioritaires.map((action) => (
                <li key={action.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{action.client.nom}</p>
                    <p className="truncate text-xs text-slate-500">
                      {ECHEANCE_TYPE_LABELS[action.type] ?? action.type} — {action.libelle}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-500">{formatDateFr(action.dateEcheance)}</span>
                    <StatusBadge statut={action.statutEffectif} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Prochaines échéances</h2>
          {data.prochainesEcheances.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Aucune échéance dans les 30 prochains jours.</p>
          ) : (
            <ul className="space-y-3">
              {data.prochainesEcheances.map((e) => (
                <li key={e.id} className="text-sm">
                  <p className="font-medium text-slate-900">{e.client.nom}</p>
                  <p className="text-xs text-slate-500">
                    {ECHEANCE_TYPE_LABELS[e.type] ?? e.type} · {formatDateFr(e.dateEcheance)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/calendrier"
            className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Voir le calendrier fiscal complet <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Situations particulières (TVA)</h2>
          {data.situationsParticulieres.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Aucune situation particulière signalée.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.situationsParticulieres.slice(0, 6).map((s) => (
                <li key={s.id} className="py-2.5">
                  <p className="text-sm font-medium text-slate-900">{s.client.nom}</p>
                  <p className="text-xs text-slate-500">
                    {s.mois.toString().padStart(2, "0")}/{s.annee} — {s.situationParticuliere}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/r10" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
            Voir le tableau R10 <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Alertes automatiques configurées</h2>
          <p className="mb-3 text-xs text-slate-500">
            Les collaborateurs sont alertés avant chaque échéance selon les délais suivants.
          </p>
          <div className="flex flex-wrap gap-2">
            {data.alertesConfig.map((alerte) => (
              <span
                key={alerte.id}
                className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                J-{alerte.joursAvant} {alerte.actif ? "" : "(inactif)"}
              </span>
            ))}
          </div>
          <Link
            href="/calendrier"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            Configurer les alertes <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
