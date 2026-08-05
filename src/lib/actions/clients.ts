"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const clientSchema = z.object({
  nom: z.string().min(2),
  siren: z.string().optional(),
  formeJuridique: z.string().optional(),
  regimeFiscal: z.enum(["IS", "IR"]),
  regimeTVA: z.enum(["reel_normal", "reel_simplifie", "franchise"]),
  dateClotureExercice: z.string().regex(/^\d{2}-\d{2}$/),
  collaborateurId: z.string().optional(),
});

export async function createClient(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const parsed = clientSchema.parse({
    nom: formData.get("nom"),
    siren: formData.get("siren") || undefined,
    formeJuridique: formData.get("formeJuridique") || undefined,
    regimeFiscal: formData.get("regimeFiscal"),
    regimeTVA: formData.get("regimeTVA"),
    dateClotureExercice: formData.get("dateClotureExercice"),
    collaborateurId: formData.get("collaborateurId") || undefined,
  });

  const client = await prisma.client.create({ data: parsed });

  await logAudit({
    userId: user.id,
    action: "CREATION",
    entityType: "CLIENT",
    entityId: client.id,
    details: `Création du dossier client ${client.nom}`,
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function toggleClientActif(id: string, actif: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const client = await prisma.client.update({ where: { id }, data: { actif } });

  await logAudit({
    userId: user.id,
    action: "MISE_A_JOUR",
    entityType: "CLIENT",
    entityId: id,
    details: `Dossier ${client.nom} marqué comme ${actif ? "actif" : "inactif"}`,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}
