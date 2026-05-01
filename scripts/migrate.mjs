import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL;

if (!url) {
  console.error("Set DATABASE_URL (e.g. postgres://user:pass@localhost:5432/hamaandish)");
  process.exit(1);
}

const sql = postgres(url);

try {
  const schema = readFileSync(join(__dirname, "..", "db", "schema.sql"), "utf8");
  await sql.unsafe(schema);
  console.log("Migration finished: users table ready.");
} finally {
  await sql.end();
}
