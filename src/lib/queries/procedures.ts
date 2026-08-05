import "server-only";
import { prisma } from "@/lib/db";

export async function getProcedures() {
  return prisma.procedure.findMany({ orderBy: [{ categorie: "asc" }, { ordre: "asc" }] });
}

export async function getProceduresGroupedByCategory() {
  const procedures = await getProcedures();
  const groups = new Map<string, typeof procedures>();
  for (const p of procedures) {
    if (!groups.has(p.categorie)) groups.set(p.categorie, []);
    groups.get(p.categorie)!.push(p);
  }
  return Array.from(groups.entries()).map(([categorie, items]) => ({ categorie, items }));
}

export async function getProcedureDetail(id: string) {
  return prisma.procedure.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        include: { updatedBy: { select: { name: true } } },
      },
    },
  });
}
