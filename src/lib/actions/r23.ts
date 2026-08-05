"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const STATUT_FIELDS = [
  "saisieStatut",
  "rapprochementBancaire",
  "situationStatut",
  "tvaStatut",
  "bilanStatut",
] as const;

type StatutField = (typeof STATUT_FIELDS)[number];

const FIELD_LABELS: Record<StatutField, string> = {
  saisieStatut: "Saisie comptable",
  rapprochementBancaire: "Rapprochement bancaire",
  situationStatut: "Situation",
  tvaStatut: "TVA",
  bilanStatut: "Bilan",
};

export async function updateLigneR23Statut(id: string, field: StatutField, value: string) {
  if (!STATUT_FIELDS.includes(field)) throw new Error("Champ invalide");
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const ligne = await prisma.ligneR23.update({
    where: { id },
    data: { [field]: value },
    include: { client: { select: { nom: true } } },
  });

  await logAudit({
    userId: user.id,
    action: "MISE_A_JOUR_STATUT",
    entityType: "LIGNE_R23",
    entityId: id,
    details: `${FIELD_LABELS[field]} mis à jour vers "${value}" pour ${ligne.client.nom} (${ligne.periode})`,
  });

  revalidatePath("/r23");
}
