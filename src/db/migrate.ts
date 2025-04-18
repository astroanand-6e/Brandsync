import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const runMigrate = async () => {
  // Use a separate client for migrations to avoid potential connection pool issues
  const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
   try {
     console.log('Starting migration...');
     // Point migrate to the drizzle instance and the migrations folder
     await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });
     console.log('Migrations applied successfully!');
   } catch (error) {
     console.error('Migration failed:', error);
     process.exit(1); // Exit with error code if migration fails
   } finally {
     await migrationClient.end(); // Ensure the client connection is closed
     console.log('Migration client closed.');
   }
};

runMigrate();
