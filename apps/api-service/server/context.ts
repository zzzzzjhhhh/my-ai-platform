import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createTRPCContext({ req }: FetchCreateContextFnOptions) {
  const cookieStore = cookies(); // This is ReadonlyRequestCookies, not a Promise

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name, options);
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session in TRPC context:", error);
  }

  return {
    headers: req.headers, // Pass along original request headers
    session,
    supabase, // Expose Supabase client if needed in procedures
  };
} 