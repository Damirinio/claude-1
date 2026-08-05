import Link from "next/link";
import { Plus } from "lucide-react";
import { getClients } from "@/lib/queries/clients";
import { ClientsTable } from "./clients-table";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Portefeuille de dossiers du cabinet — accédez au détail de chaque client pour retrouver ses échéances,
            son suivi comptable et ses documents.
          </p>
        </div>
        <Link
          href="/clients/nouveau"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus size={16} /> Nouveau client
        </Link>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
