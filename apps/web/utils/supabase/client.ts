import { createBrowserClient } from '@supabase/ssr';

// Ensure your Next.js environment variables are prefixed with NEXT_PUBLIC_
// and are available in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key for client-side client. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
); 