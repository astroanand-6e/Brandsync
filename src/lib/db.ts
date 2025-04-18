import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema'; // We'll create this next
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Configure Postgres with more robust connection options
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds to keep an unused connection
  connect_timeout: 30, // Timeout in seconds for establishing a connection
  max_lifetime: 60 * 30, // Max lifetime of a connection in seconds
  ssl: true, // Enable SSL for Neon database
  debug: process.env.NODE_ENV === 'development', // Print debug info in development
});

export const db = drizzle(queryClient, { schema });

// If needed separately for migrations (which often run in Node)
// export const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
// export const migrationDb = drizzle(migrationClient, { schema });


