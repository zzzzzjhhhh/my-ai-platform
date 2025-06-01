'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, signOut, session } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to login page
  useEffect(() => {
    if (session === null) {
      router.push('/login');
    }
  }, [session, router]);

  // Show loading state while checking authentication
  if (session === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 mt-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              AI Agent Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Manage your AI agents and streamline meeting processes with intelligent automation.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-lg">
              Welcome back, {user?.user_metadata?.full_name || user?.user_metadata?.preferred_username || user?.email || 'User'}!
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/ai-agents">
                <Button size="lg">Manage AI Agents</Button>
              </Link>
              <Button size="lg" variant="outline">View Meetings</Button>
              <Button size="lg" variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">AI Agents</h3>
              <p className="text-muted-foreground">
                Create and configure intelligent AI agents to handle your meeting workflows.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Meeting Management</h3>
              <p className="text-muted-foreground">
                Schedule, record, and get AI-powered summaries of your meetings.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Event Processing</h3>
              <p className="text-muted-foreground">
                Automated event handling with Inngest for reliable background processing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
