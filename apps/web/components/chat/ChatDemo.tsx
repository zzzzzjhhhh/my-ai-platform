"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChatWindow, ChatWindowRef, ChatWindowProps } from './ChatWindow';
import { ModelSelector } from './ModelSelector';

interface ChatDemoProps {
  selectedAgent: ChatWindowProps['selectedAgent']; 
}

export function ChatDemo({ selectedAgent }: ChatDemoProps) {
  const chatRef = useRef<ChatWindowRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-r1-0528:free');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !selectedAgent?.instructions) return;
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    setIsLoading(true);
    setError(null);
    
    let currentMessageId: string | null = null;
    
    try {
      if (chatRef.current) {
        currentMessageId = chatRef.current.addStreamingAiMessage();
      }
      const params = new URLSearchParams({
        message: message.trim(),
        agentInstructions: selectedAgent.instructions,
        model: selectedModel
      });

      const eventSource = new EventSource(`/api/chat?${params}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            throw new Error(data.error);
          }

          if (data.content && chatRef.current && currentMessageId) {
            chatRef.current.updateStreamingMessage(currentMessageId, data.content);
          }
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
        }
      };

      eventSource.addEventListener('done', () => {
        if (chatRef.current && currentMessageId) {
          chatRef.current.finalizeStreamingMessage(currentMessageId);
        }
        eventSource.close();
        eventSourceRef.current = null;
        setIsLoading(false);
      });

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setError('Connection error. Please try again.');
        
        if (chatRef.current) {
          chatRef.current.addAiMessage(
            'Sorry, I encountered a connection error. Please try again.'
          );
        }
        
        eventSource.close();
        eventSourceRef.current = null;
        setIsLoading(false);
      };

      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      if (chatRef.current) {
        chatRef.current.addAiMessage(
          `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
        );
      }
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Agent Chat</h1>
        <p className="text-muted-foreground">
          Chatting with: <span className="font-semibold">{selectedAgent?.name || 'Loading...'}</span>
        </p>
        {!selectedAgent?.instructions && (
          <p className="text-sm text-destructive">
            Agent instructions not available. Please select an agent from the AI Agents page.
          </p>
        )}
        {error && (
          <div className="text-sm text-destructive bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          AI Model
        </label>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
        />
      </div>

      <ChatWindow
        ref={chatRef}
        selectedAgent={selectedAgent}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
      
      <div className="text-center text-sm text-muted-foreground mt-4 p-4 border rounded-md bg-blue-50">
        <p className="font-semibold">🤖 Powered by OpenRouter</p>
        <p>This chat is powered by AI models from OpenRouter. Your agent's instructions guide the AI's responses.</p>
        <p className="text-xs mt-1">Current model: {selectedModel}</p>
      </div>
    </div>
  );
} 