"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function uploadDocument(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const clientId = String(formData.get("clientId") ?? "");
  const exercice = String(formData.get("exercice") ?? "").trim();
  const categorie = String(formData.get("categorie") ?? "");
  const nom = String(formData.get("nom") ?? "").trim();
  const file = formData.get("file");

  if (!clientId || !exercice || !categorie || !nom) {
    throw new Error("Merci de renseigner le client, l'exercice, la catégorie et le nom du document.");
  }

  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true, nom: true } });
  if (!client) throw new Error("Client introuvable");

  const previousVersion = await prisma.document.findFirst({
    where: { clientId, exercice, categorie, nom },
    orderBy: { version: "desc" },
  });
  const version = (previousVersion?.version ?? 0) + 1;

  let content: Uint8Array<ArrayBuffer> | null = null;
  let mimeType: string | null = null;
  if (file instanceof File && file.size > 0) {
    // File.arrayBuffer() always yields a real ArrayBuffer (never SharedArrayBuffer).
    content = new Uint8Array(await file.arrayBuffer()) as Uint8Array<ArrayBuffer>;
    mimeType = file.type || "application/octet-stream";
  }

  const document = await prisma.document.create({
    data: {
      clientId,
      exercice,
      categorie,
      nom,
      version,
      content,
      mimeType,
      uploadedById: user.id,
    },
  });

  await logAudit({
    userId: user.id,
    action: version > 1 ? "NOUVELLE_VERSION" : "AJOUT_DOCUMENT",
    entityType: "DOCUMENT",
    entityId: document.id,
    details: `${nom} (${categorie}, exercice ${exercice}) — version ${version} — client ${client.nom}`,
  });

  revalidatePath("/documents");
}
