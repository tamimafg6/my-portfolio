import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema/index.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres client
const client = postgres(connectionString, { max: 10 });

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export a function to close the connection
export const closeConnection = async () => {
  await client.end();
};
