"use client";

import { ToggleSwitch } from "@/components/toggle-switch";
import { toggleClientActif } from "@/lib/actions/clients";

export function ClientActifToggle({ clientId, actif }: { clientId: string; actif: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
      <span className="text-xs font-medium text-slate-600">Dossier actif</span>
      <ToggleSwitch checked={actif} onChange={(checked) => toggleClientActif(clientId, checked)} />
    </div>
  );
}
