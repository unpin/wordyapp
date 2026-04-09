import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var pgPool: Pool | undefined;
}

console.log(
  "DATABASE_URL host:",
  process.env.DATABASE_URL?.split("@")[1]?.split("/")[0],
);

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });
}

export const db = drizzle(global.pgPool, { schema });
