import "server-only";
import { prisma } from "@/lib/db";

export async function getClients() {
  return prisma.client.findMany({
    include: {
      collaborateur: { select: { id: true, name: true } },
      _count: { select: { echeances: true, documents: true } },
    },
    orderBy: { nom: "asc" },
  });
}

export async function getClientDetail(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      collaborateur: { select: { id: true, name: true } },
      echeances: { orderBy: { dateEcheance: "asc" } },
      ligneR23s: { orderBy: { periode: "desc" } },
      ligneR10s: { orderBy: [{ annee: "desc" }, { mois: "desc" }] },
      documents: { orderBy: { createdAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
    },
  });
}

export async function getCollaborateurs() {
  return prisma.user.findMany({ where: { actif: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
}
