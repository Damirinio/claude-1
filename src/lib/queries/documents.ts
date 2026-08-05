import "server-only";
import { prisma } from "@/lib/db";

export async function getDocuments() {
  return prisma.document.findMany({
    include: {
      client: { select: { id: true, nom: true } },
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
