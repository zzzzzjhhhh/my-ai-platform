'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Redirect to home or a desired page after successful sign-in
        router.push('/');
      } else if (event === 'SIGNED_OUT') {
        router.push('/'); // Or a login page
      } else if (event === 'PASSWORD_RECOVERY'){
        //Handle password recovery if needed
        router.push('/reset-password');
      } else if (event === 'USER_UPDATED'){
        //Handle user update if needed
        router.push('/');
      }
    });

    // Additional check in case the event was missed or for direct navigation
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing authentication...</p>
      {/* You can add a loading spinner here */}
    </div>
  );
} 