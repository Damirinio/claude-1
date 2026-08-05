import { prisma } from "@/lib/db";
import { getDocuments } from "@/lib/queries/documents";
import { UploadPanel } from "./upload-panel";
import { DocumentsTable } from "./documents-table";

export default async function DocumentsPage() {
  const [documents, clients] = await Promise.all([
    getDocuments(),
    prisma.client.findMany({ where: { actif: true }, select: { id: true, nom: true }, orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Gestion documentaire</h1>
        <p className="mt-1 text-sm text-slate-500">
          Classement des documents par client, exercice et catégorie, avec suivi des versions. Chaque ajout ou
          modification est enregistré dans le journal d&apos;audit.
        </p>
      </div>

      <UploadPanel clients={clients} />
      <DocumentsTable documents={documents} />
    </div>
  );
}
