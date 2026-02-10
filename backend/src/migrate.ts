/**
 * Run Drizzle migrations against DATABASE_URL.
 * Used at container startup so the production DB has the schema.
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Skipping migrations.");
    process.exit(0);
  }
  if (!connectionString.includes("client_encoding")) {
    const sep = connectionString.includes("?") ? "&" : "?";
    connectionString = `${connectionString}${sep}client_encoding=UTF8`;
  }

  const client = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(client);

  // Path to drizzle folder: from dist/migrate.js, one level up is app root
  const migrationsFolder = path.join(__dirname, "..", "drizzle");
  console.log("[migrate] Running migrations from", migrationsFolder);

  try {
    await migrate(db, { migrationsFolder });
    console.log("[migrate] Migrations completed.");
  } catch (err: unknown) {
    const cause = err && typeof err === "object" && "cause" in err ? (err as { cause?: { code?: string; message?: string } }).cause : null;
    const alreadyExists = cause?.code === "42P07" || (cause?.message && String(cause.message).includes("already exists"));
    if (alreadyExists) {
      console.log("[migrate] Tables already exist (schema up to date), continuing.");
    } else {
      console.error("[migrate] Migration failed:", err);
      await client.end();
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

runMigrations();
