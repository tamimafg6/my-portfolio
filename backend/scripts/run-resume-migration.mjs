#!/usr/bin/env node
/** Run resume locale columns migration using DATABASE_URL from .env */
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env from backend/ then project root (so backend/.env takes precedence)
dotenv.config({ path: join(__dirname, "..", ".env") });
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to backend/.env or project root .env (see backend/.env.example).");
  process.exit(1);
}

const sql = postgres(connectionString);

async function run() {
  try {
    await sql.unsafe(`
      ALTER TABLE resume
        ADD COLUMN IF NOT EXISTS file_url_en TEXT,
        ADD COLUMN IF NOT EXISTS file_url_ar TEXT
    `);
    console.log("Added columns file_url_en, file_url_ar (if not exists).");

    await sql.unsafe(`
      ALTER TABLE resume
        ALTER COLUMN file_url DROP NOT NULL
    `);
    console.log("Made file_url nullable.");

    console.log("Resume migration completed.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
