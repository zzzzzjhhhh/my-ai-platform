'use client';

import { ChatDemo } from "@/components/chat";
import { useSearchParams } from 'next/navigation';

export default function ChatDemoPage() {
  const searchParams = useSearchParams();

  const selectedAgent = {
    id: searchParams.get('id') || '',
    name: searchParams.get('name') || 'AI Agent',
    instructions: searchParams.get('instructions') || '',
  };

  // Check if agent data is available
  if (!selectedAgent.id) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Agent Not Selected</h1>
        <p className="text-muted-foreground">Please select an AI agent from the <a href="/ai-agents" className="underline">AI Agents page</a> to start chatting.</p>
      </div>
    );
  }

  return <ChatDemo selectedAgent={selectedAgent} />;
} 