import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __onecorelab_pg_client: postgres.Sql | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at your Postgres instance."
    );
  }
  return postgres(connectionString, { max: 10 });
}

// Reuse the client across hot reloads in dev so we don't exhaust connections.
const client = globalThis.__onecorelab_pg_client ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__onecorelab_pg_client = client;
}

export const db = drizzle(client, { schema });
