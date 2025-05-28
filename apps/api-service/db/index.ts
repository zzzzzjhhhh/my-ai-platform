import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema/users';

// Validate environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please check your .env.local file.'
  );
}

// Create Neon connection
const sql = neon(connectionString);

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });

// Re-export schemas for convenience
export * from './schema/users';

// Export connection for direct SQL queries if needed
export { sql }; 