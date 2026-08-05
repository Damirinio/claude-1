// `prisma migrate deploy` only works against a real database connection
// string (local SQLite file, Postgres, etc.) — it is not supported against
// Turso/libSQL. When TURSO_DATABASE_URL is set we run our own libSQL-based
// migration runner instead (scripts/apply-turso-migrations.mjs), which is
// idempotent, so it's safe to run automatically on every boot — no manual
// Shell step needed (Shell requires a paid Render plan).
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.TURSO_DATABASE_URL) {
  run("node", ["scripts/apply-turso-migrations.mjs"]);
} else {
  run("npx", ["prisma", "migrate", "deploy"]);
}

run("npx", ["next", "start"]);
