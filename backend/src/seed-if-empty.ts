/**
 * Run migrations then this at startup: seed DB only if empty (e.g. first deploy).
 * Uses skills table as proxy for "already seeded".
 */
import "dotenv/config";
import { db, closeConnection } from "./lib/db.js";
import * as schema from "./db/schema/index.js";
import { runSeed } from "./db/seed.js";

async function main() {
  const count = await db.select().from(schema.skills).then((rows) => rows.length);
  if (count === 0) {
    console.log("[seed-if-empty] Database empty, running seed...");
    await runSeed();
  } else {
    console.log("[seed-if-empty] Database already seeded, skipping.");
  }
}

main()
  .then(() => closeConnection())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed-if-empty] Error:", err);
    process.exit(1);
  });
