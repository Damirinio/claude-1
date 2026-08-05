import "server-only";
import path from "node:path";

/**
 * Racine de stockage des documents téléversés. En production, pointez
 * DOCUMENTS_STORAGE_DIR vers le volume persistant monté par l'hébergeur
 * (ex. /data/documents sur Railway/Render) afin que les fichiers survivent
 * aux redéploiements.
 */
export const DOCUMENTS_STORAGE_ROOT =
  process.env.DOCUMENTS_STORAGE_DIR ?? path.join(process.cwd(), "storage", "documents");
