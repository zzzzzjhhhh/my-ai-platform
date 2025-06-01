'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import OAuthLoginButtons from '@/components/auth/OAuthLoginButtons';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { session } = useAuth();
  const router = useRouter();
console.log('isRegisterMode', isRegisterMode);
  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  // Don't render the login page if user is already authenticated
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home link */}
        <div className="flex justify-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            AI Agent Platform
          </h1>
          <p className="text-muted-foreground">
            {isRegisterMode 
              ? 'Create your account to get started' 
              : 'Welcome back! Please sign in to continue'
            }
          </p>
        </div>

        {/* OAuth Login Buttons */}
        <div className="space-y-4">
          <OAuthLoginButtons />
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-br from-blue-50 to-indigo-100 px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        {/* Email/Password Login Form */}
        <LoginForm 
          onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
          isRegisterMode={isRegisterMode}
        />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 