import { drizzle } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema/users';

// Setup connection string from environment variable
const connectionString = process.env.DATABASE_URL || '';

// Create connection
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Re-export schemas
export * from './schema/users'; 