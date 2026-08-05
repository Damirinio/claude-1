import { prisma } from "@/lib/db";
import { getAllEcheances, getAlertesConfig } from "@/lib/queries/echeances";
import { CalendarTable } from "./calendar-table";
import { AlertConfigPanel } from "./alert-config-panel";

export default async function CalendrierPage() {
  const [echeances, alertes, clients] = await Promise.all([
    getAllEcheances(),
    getAlertesConfig(),
    prisma.client.findMany({ where: { actif: true }, select: { id: true, nom: true }, orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Calendrier fiscal 2026</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ensemble des échéances fiscales du portefeuille clients — TVA, IS, CFE, CVAE, liasse fiscale, dépôt des
          comptes annuels et autres obligations. Les dates indiquées sont les échéances de référence du cabinet ;
          vérifiez systématiquement le calendrier officiel de la DGFiP en cas de doute pour un dossier particulier.
        </p>
      </div>

      <AlertConfigPanel alertes={alertes} />

      <CalendarTable echeances={echeances} clients={clients} />
    </div>
  );
}
