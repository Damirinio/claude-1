// `prisma migrate deploy` is not supported against Turso/libSQL databases
// (Prisma Migrate requires a raw connection the schema engine understands
// directly, which Turso's HTTP protocol doesn't provide). This script is the
// documented workaround: it applies each migration.sql file directly through
// the libSQL client, in the same order Prisma generated them, keeping its own
// bookkeeping table so it can be re-run safely as new migrations are added
// later (already-applied ones are skipped).
//
// Run this once against a fresh Turso database, before the app's first real
// use, then again after every future migration:
// `node scripts/apply-turso-migrations.mjs` (with TURSO_DATABASE_URL and
// TURSO_AUTH_TOKEN set in the environment — e.g. from Render's Shell tab).
import { createClient } from "@libsql/client";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    console.error("TURSO_DATABASE_URL n'est pas défini dans l'environnement.");
    process.exit(1);
  }

  const client = createClient({ url, authToken });
  await client.execute(
    "CREATE TABLE IF NOT EXISTS _turso_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))",
  );
  const applied = new Set(
    (await client.execute("SELECT name FROM _turso_migrations")).rows.map((row) => row.name),
  );

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  let appliedCount = 0;
  for (const dir of dirs) {
    if (applied.has(dir)) {
      console.log(`Déjà appliquée, ignorée : ${dir}`);
      continue;
    }
    const sql = await readFile(path.join(migrationsDir, dir, "migration.sql"), "utf8");
    console.log(`Application de la migration ${dir}...`);
    await client.executeMultiple(sql);
    await client.execute({ sql: "INSERT INTO _turso_migrations (name) VALUES (?)", args: [dir] });
    appliedCount++;
  }

  console.log(
    appliedCount > 0
      ? `${appliedCount} nouvelle(s) migration(s) appliquée(s) sur Turso.`
      : "Aucune nouvelle migration à appliquer, la base est à jour.",
  );
  client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
