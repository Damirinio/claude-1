import { NextResponse } from "next/server";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "documents");

export async function GET(_request: Request, { params }: RouteContext<"/api/documents/[id]">) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || !document.filePath) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  const resolved = path.join(STORAGE_ROOT, document.filePath);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  try {
    const buffer = await readFile(resolved);
    await logAudit({
      userId: user.id,
      action: "TELECHARGEMENT",
      entityType: "DOCUMENT",
      entityId: document.id,
      details: document.nom,
    });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.nom)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable sur le serveur" }, { status: 404 });
  }
}
