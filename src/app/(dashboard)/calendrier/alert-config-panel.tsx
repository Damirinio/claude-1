"use client";

import { BellRing } from "lucide-react";
import { ToggleSwitch } from "@/components/toggle-switch";
import { toggleAlerteConfig } from "@/lib/actions/echeances";

type Alerte = { id: string; joursAvant: number; actif: boolean };

export function AlertConfigPanel({ alertes }: { alertes: Alerte[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <BellRing size={16} className="text-blue-600" />
        <h2 className="text-base font-semibold text-slate-900">Alertes automatiques</h2>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Une alerte est déclenchée pour chaque échéance non terminée au nombre de jours restants configuré ci-dessous.
      </p>
      <div className="flex flex-wrap gap-4">
        {alertes.map((a) => (
          <div key={a.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <span className="text-sm font-medium text-slate-700">J-{a.joursAvant}</span>
            <ToggleSwitch checked={a.actif} onChange={(checked) => toggleAlerteConfig(a.id, checked)} />
          </div>
        ))}
      </div>
    </div>
  );
}
