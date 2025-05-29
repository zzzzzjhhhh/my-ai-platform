"use client";

import React, { useRef, useState } from 'react';
import { ChatWindow, ChatWindowRef, ChatWindowProps } from './ChatWindow';

// Define props for ChatDemo
interface ChatDemoProps {
  selectedAgent: ChatWindowProps['selectedAgent']; // Use type from ChatWindowProps
}

export function ChatDemo({ selectedAgent }: ChatDemoProps) {
  const chatRef = useRef<ChatWindowRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to simulate sending a message to AI
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !selectedAgent?.instructions) return; // Ensure instructions are available
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Construct the mock prompt using agent instructions and user message
    const fullPrompt = `Agent Instructions:\n${selectedAgent.instructions}\n\nUser Message:\n${message}`;
    
    // In a real implementation, this fullPrompt would be sent to the backend API
    // and the backend would call the Gemini LLM.
    
    // For this demo, display the constructed prompt as the AI response
    if (chatRef.current) {
      chatRef.current.addAiMessage(`(Mock AI Response - Constructed Prompt):\n${fullPrompt}`);
    }
    
    setIsLoading(false);
  };

  // Function to add a demo message for testing (keep for now, could be useful)
  // const addDemoMessage = () => {
  //   if (chatRef.current) {
  //     chatRef.current.addAiMessage("This is a demo AI message to test the chat interface!");
  //   }
  // };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Agent Chat Demo</h1>
        <p className="text-muted-foreground">
          Chatting with: <span className="font-semibold">{selectedAgent?.name || 'Loading...'}</span>
        </p>
         {!selectedAgent?.instructions && (
          <p className="text-sm text-destructive">Agent instructions not available. Please select an agent from the AI Agents page.</p>
         )}
      </div>

      {/* Chat Interface */}
      {/* Pass selectedAgent prop to ChatWindow */}
      <ChatWindow
        ref={chatRef}
        selectedAgent={selectedAgent}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
      
      <div className="text-center text-sm text-muted-foreground mt-4 p-4 border rounded-md bg-yellow-50">
        <p className="font-semibold">Note:</p>
        <p>This is a UI demo. The AI responses are currently simulated and show the constructed prompt (Agent Instructions + User Message) instead of a real LLM response.</p>
        <p>Actual LLM integration will be done in a future task.</p>
      </div>
    </div>
  );
} 