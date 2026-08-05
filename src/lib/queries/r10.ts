import "server-only";
import { prisma } from "@/lib/db";

export async function getR10Lignes() {
  return prisma.ligneR10.findMany({
    include: { client: { select: { id: true, nom: true } } },
    orderBy: [{ annee: "desc" }, { mois: "desc" }, { client: { nom: "asc" } }],
  });
}
