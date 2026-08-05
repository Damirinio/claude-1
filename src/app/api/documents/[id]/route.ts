import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(_request: Request, { params }: RouteContext<"/api/documents/[id]">) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || !document.content) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  await logAudit({
    userId: user.id,
    action: "TELECHARGEMENT",
    entityType: "DOCUMENT",
    entityId: document.id,
    details: document.nom,
  });

  return new NextResponse(new Uint8Array(document.content), {
    headers: {
      "Content-Type": document.mimeType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(document.nom)}"`,
    },
  });
}
