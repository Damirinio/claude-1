"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function updateProcedureContenu(id: string, contenu: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  if (!contenu.trim()) throw new Error("Le contenu ne peut pas être vide.");

  const procedure = await prisma.procedure.update({
    where: { id },
    data: { contenu },
  });

  await prisma.procedureVersion.create({
    data: { procedureId: id, contenu, updatedById: user.id },
  });

  await logAudit({
    userId: user.id,
    action: "MISE_A_JOUR",
    entityType: "PROCEDURE",
    entityId: id,
    details: `Mise à jour de la procédure "${procedure.titre}"`,
  });

  revalidatePath(`/procedures/${id}`);
  revalidatePath("/procedures");
}

export async function createProcedure(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const categorie = String(formData.get("categorie") ?? "").trim();
  const titre = String(formData.get("titre") ?? "").trim();
  const contenu = String(formData.get("contenu") ?? "").trim();

  if (!categorie || !titre || !contenu) {
    throw new Error("Merci de renseigner la catégorie, le titre et le contenu.");
  }

  const maxOrdre = await prisma.procedure.aggregate({ where: { categorie }, _max: { ordre: true } });

  const procedure = await prisma.procedure.create({
    data: { categorie, titre, contenu, ordre: (maxOrdre._max.ordre ?? 0) + 1 },
  });

  await prisma.procedureVersion.create({
    data: { procedureId: procedure.id, contenu, updatedById: user.id },
  });

  await logAudit({
    userId: user.id,
    action: "CREATION",
    entityType: "PROCEDURE",
    entityId: procedure.id,
    details: `Création de la procédure "${titre}" (${categorie})`,
  });

  revalidatePath("/procedures");
  redirect(`/procedures/${procedure.id}`);
}
