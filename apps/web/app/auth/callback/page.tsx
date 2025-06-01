'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setStatus('Authentication successful! Redirecting...');
        // Redirect to home or a desired page after successful sign-in
        setTimeout(() => router.push('/'), 1000);
      } else if (event === 'SIGNED_OUT') {
        setStatus('Signed out. Redirecting...');
        setTimeout(() => router.push('/login'), 1000);
      } else if (event === 'PASSWORD_RECOVERY') {
        setStatus('Password recovery initiated. Redirecting...');
        setTimeout(() => router.push('/reset-password'), 1000);
      } else if (event === 'USER_UPDATED') {
        setStatus('Profile updated. Redirecting...');
        setTimeout(() => router.push('/'), 1000);
      }
    });

    // Additional check in case the event was missed or for direct navigation
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setStatus('Authentication error. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else if (session) {
        setStatus('Authentication successful! Redirecting...');
        setTimeout(() => router.push('/'), 1000);
      } else {
        setStatus('No active session. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4 p-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-lg font-medium">{status}</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
} 