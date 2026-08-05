import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * En local, la base est un fichier SQLite (simple, aucun service externe).
 * En production, définissez TURSO_DATABASE_URL (et TURSO_AUTH_TOKEN) pour
 * utiliser une base Turso (libSQL) hébergée gratuitement — indispensable sur
 * un hébergeur au système de fichiers non persistant (ex. Render free tier).
 */
export function createPrismaAdapter() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    return new PrismaLibSql({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  return new PrismaBetterSqlite3({ url });
}
