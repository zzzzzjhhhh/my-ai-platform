'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase/client';
import { Github, Chrome, Loader2 } from 'lucide-react';

interface OAuthLoginButtonsProps {
  className?: string;
}

export default function OAuthLoginButtons({ className = '' }: OAuthLoginButtonsProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Google login error:', error);
      setGoogleLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setGithubLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('GitHub login error:', error);
      setGithubLoading(false);
    }
  };

  const isLoading = googleLoading || githubLoading;

  return (
    <div className={`space-y-3 ${className}`}>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        {googleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Chrome className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleGitHubLogin}
        disabled={isLoading}
      >
        {githubLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Github className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  );
}