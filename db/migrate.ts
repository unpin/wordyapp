import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
// import 'dotenv/config' // uses .env by default

config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool);

async function main() {
    console.log('Starting migration...');
    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('Migration ended...');
}

main().catch((error) => {
    console.error(error);
    process.exit(0);
});
