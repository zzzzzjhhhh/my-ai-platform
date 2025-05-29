'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase/client';
import { Github, Chrome } from 'lucide-react'; // Assuming you have lucide-react for icons

export default function OAuthLoginButtons() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
        <Chrome className="mr-2 h-4 w-4" /> Login with Google
      </Button>
      <Button variant="outline" className="w-full" onClick={handleGitHubLogin}>
        <Github className="mr-2 h-4 w-4" /> Login with GitHub
      </Button>
    </div>
  );
}