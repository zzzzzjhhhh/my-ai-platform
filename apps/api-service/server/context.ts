import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

export async function createTRPCContext({ req }: FetchCreateContextFnOptions) {
  const cookieStore = await cookies();
  
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll();
          console.log('Supabase requesting all cookies:', allCookies);
          return allCookies;
        },
        setAll(cookiesToSet) {
          console.log('Supabase trying to set cookies:', cookiesToSet);
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log(`Cookie set - ${name}:`, value);
            cookieStore.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error getting session in TRPC context:", error);
  }

  // If user is authenticated, ensure they exist in our User table
  if (session?.user) {
    
    try {
      // Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (!existingUser) {
        // Create user record in our database
        await prisma.user.create({
          data: {
            id: session.user.id,
            name: session.user.user_metadata?.preferred_username || 
                  session.user.user_metadata?.user_name || 
                  session.user.user_metadata?.name || 
                  'Anonymous User',
          }
        });
      } 
    } catch (dbError) {
      console.error('❌ Error managing user in database:', dbError);
      // Don't throw here - we still want to allow the user to authenticate
      // even if there's a database issue
    }
  } 

  return {
    headers: req.headers,
    session,
    supabase,
    prisma,
  };
} 