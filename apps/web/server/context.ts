import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

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
          return allCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
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

  return {
    headers: req.headers,
    session,
    supabase,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>; 