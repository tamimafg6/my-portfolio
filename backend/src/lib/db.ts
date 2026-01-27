import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema/index.js";

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Ensure UTF-8 encoding in connection string
// Add client_encoding=UTF8 if not already present
if (!connectionString.includes("client_encoding")) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}client_encoding=UTF8`;
}

// Create postgres client with UTF-8 encoding
const client = postgres(connectionString, { 
  max: 10,
  connection: {
    application_name: "portfolio-backend",
  },
  // Ensure UTF-8 encoding
  prepare: false,
  // Explicitly set encoding
  transform: {
    undefined: null,
  },
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export a function to close the connection
export const closeConnection = async () => {
  await client.end();
};
