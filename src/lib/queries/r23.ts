import "server-only";
import { prisma } from "@/lib/db";

export async function getR23Lignes() {
  return prisma.ligneR23.findMany({
    include: { client: { select: { id: true, nom: true } } },
    orderBy: [{ periode: "desc" }, { client: { nom: "asc" } }],
  });
}
