"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function updateLigneR10Statut(id: string, statut: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const ligne = await prisma.ligneR10.update({
    where: { id },
    data: {
      statutDeclaration: statut,
      dateDeclaration: statut === "termine" ? new Date() : null,
    },
    include: { client: { select: { nom: true } } },
  });

  await logAudit({
    userId: user.id,
    action: "MISE_A_JOUR_STATUT",
    entityType: "LIGNE_R10",
    entityId: id,
    details: `Statut de déclaration TVA mis à jour vers "${statut}" pour ${ligne.client.nom} (${ligne.mois}/${ligne.annee})`,
  });

  revalidatePath("/r10");
  revalidatePath("/");
}

export async function updateLigneR10Montants(id: string, tvaCollectee: number, tvaDeductible: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  if (!Number.isFinite(tvaCollectee) || !Number.isFinite(tvaDeductible)) throw new Error("Montant invalide");

  const ligne = await prisma.ligneR10.update({
    where: { id },
    data: { tvaCollectee, tvaDeductible },
    include: { client: { select: { nom: true } } },
  });

  await logAudit({
    userId: user.id,
    action: "MISE_A_JOUR",
    entityType: "LIGNE_R10",
    entityId: id,
    details: `Montants TVA mis à jour pour ${ligne.client.nom} (${ligne.mois}/${ligne.annee}) : collectée ${tvaCollectee} € / déductible ${tvaDeductible} €`,
  });

  revalidatePath("/r10");
  revalidatePath("/");
}
