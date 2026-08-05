"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const VALID_STATUTS = ["a_faire", "en_cours", "termine"];

export async function updateEcheanceStatut(id: string, statut: string) {
  if (!VALID_STATUTS.includes(statut)) throw new Error("Statut invalide");
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const echeance = await prisma.echeance.update({
    where: { id },
    data: { statut },
  });

  await logAudit({
    userId: user.id,
    action: "MISE_A_JOUR_STATUT",
    entityType: "ECHEANCE",
    entityId: id,
    details: `Statut mis à jour vers "${statut}" (${echeance.libelle})`,
  });

  revalidatePath("/calendrier");
  revalidatePath("/");
}

export async function toggleAlerteConfig(id: string, actif: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  await prisma.alerteConfig.update({ where: { id }, data: { actif } });

  await logAudit({
    userId: user.id,
    action: "MISE_A_JOUR",
    entityType: "ALERTE_CONFIG",
    entityId: id,
    details: `Alerte ${actif ? "activée" : "désactivée"}`,
  });

  revalidatePath("/calendrier");
  revalidatePath("/");
}
