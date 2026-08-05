import "server-only";
import { prisma } from "@/lib/db";

// Le contenu binaire (`content`) n'est volontairement pas sélectionné ici :
// la liste n'a besoin que de savoir si un fichier existe (via `mimeType`,
// renseigné exactement quand un fichier a été téléversé), pas de charger
// chaque blob en mémoire pour afficher le tableau.
export async function getDocuments() {
  const documents = await prisma.document.findMany({
    select: {
      id: true,
      exercice: true,
      categorie: true,
      nom: true,
      version: true,
      mimeType: true,
      createdAt: true,
      client: { select: { id: true, nom: true } },
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return documents.map(({ mimeType, ...doc }) => ({ ...doc, hasFile: mimeType !== null }));
}
