"use server";

import { revalidatePath } from "next/cache";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "documents");

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

  let filePath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const clientDir = path.join(STORAGE_ROOT, clientId);
    await mkdir(clientDir, { recursive: true });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${Date.now()}-v${version}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(clientDir, storedName), buffer);
    filePath = path.join(clientId, storedName);
  }

  const document = await prisma.document.create({
    data: {
      clientId,
      exercice,
      categorie,
      nom,
      version,
      filePath,
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
