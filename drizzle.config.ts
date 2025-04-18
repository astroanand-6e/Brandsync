import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // Ensure dotenv is loaded

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

export default defineConfig({
  schema: './src/db/schema.ts', // Path to our schema file (we'll create this next)
  out: './drizzle', // Directory for migration files
  dialect: 'postgresql', // Specify PostgreSQL dialect
  dbCredentials: {
    url: process.env.DATABASE_URL, // Get URL from environment
  },
  verbose: true, // Optional: for detailed logs during generation
  strict: true, // Optional: for stricter checks
});
