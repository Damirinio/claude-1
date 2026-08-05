import "server-only";
import { prisma } from "@/lib/db";
import { effectiveEcheanceStatut } from "@/lib/constants";

export async function getAllEcheances() {
  const now = new Date();
  const echeances = await prisma.echeance.findMany({
    include: { client: { select: { id: true, nom: true } } },
    orderBy: { dateEcheance: "asc" },
  });

  return echeances.map((e) => ({
    ...e,
    statutEffectif: effectiveEcheanceStatut(e.statut, e.dateEcheance, now),
  }));
}

export async function getAlertesConfig() {
  return prisma.alerteConfig.findMany({ orderBy: { joursAvant: "desc" } });
}
