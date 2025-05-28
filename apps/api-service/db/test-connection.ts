import { sql } from './index';

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No');
    
    // Simple query to test connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    
    console.log('✅ Database connection successful!');
    console.log('Current time:', result[0].current_time);
    console.log('PostgreSQL version:', result[0].postgres_version);
    
    return { success: true, result: result[0] };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection();
} 