// `prisma migrate deploy` only works against a real database connection
// string (local SQLite file, Postgres, etc.) — it is not supported against
// Turso/libSQL. When TURSO_DATABASE_URL is set we skip it: the schema must
// already have been applied once via scripts/apply-turso-migrations.mjs.
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.TURSO_DATABASE_URL) {
  console.log(
    "TURSO_DATABASE_URL détecté : `prisma migrate deploy` est ignoré (non supporté par Turso). " +
      "Assurez-vous d'avoir appliqué le schéma une fois via `node scripts/apply-turso-migrations.mjs`.",
  );
} else {
  run("npx", ["prisma", "migrate", "deploy"]);
}

run("npx", ["next", "start"]);
