import { prisma } from './prisma'
import { supabase, supabaseAdmin } from './supabase'

export async function testDatabaseConnection() {
  try {
    console.log('🔧 Testing database connections...')
    
    // Test Prisma connection
    console.log('1. Testing Prisma connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Prisma connection successful')
    
    // Test Supabase client
    console.log('2. Testing Supabase client...')
    const { data, error } = await supabase.from('users').select('id').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected initially
      throw error
    }
    console.log('✅ Supabase client connection successful')
    
    // Test Supabase admin
    console.log('3. Testing Supabase admin client...')
    const { data: adminData, error: adminError } = await supabaseAdmin.from('users').select('id').limit(1)
    if (adminError && adminError.code !== 'PGRST116') {
      throw adminError
    }
    console.log('✅ Supabase admin client connection successful')
    
    console.log('🎉 All database connections working!')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
} 