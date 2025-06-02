"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChatWindow, ChatWindowRef, ChatWindowProps, Message } from './ChatWindow';
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
  const currentMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (currentMessageIdRef.current && chatRef.current) {
         chatRef.current.finalizeStreamingMessage(currentMessageIdRef.current);
         currentMessageIdRef.current = null;
      }
    };
  }, [chatRef]);

  const handleStopMessage = () => {
    if (eventSourceRef.current) {
      console.log('Stopping SSE stream...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsLoading(false);
    if (chatRef.current && currentMessageIdRef.current) {
      chatRef.current.finalizeStreamingMessage(currentMessageIdRef.current);
      chatRef.current.addAiMessage('Stream stopped by user.');
      currentMessageIdRef.current = null;
    } else if (chatRef.current) {
      chatRef.current.addAiMessage('Stream stopped by user.');
    }
     currentMessageIdRef.current = null;
  };

  const handleSendMessage = (message: string, messageHistory: Message[]) => {
    if (!message.trim() || !selectedAgent?.instructions) return;
    
    if (eventSourceRef.current) {
      handleStopMessage();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (chatRef.current) {
        const newMessageId = chatRef.current.addStreamingAiMessage();
        currentMessageIdRef.current = newMessageId;
      }

      const conversationHistory = messageHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const requestBody = {
        messages: conversationHistory,
        agentInstructions: selectedAgent.instructions,
        model: selectedModel
      };

      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                if (chatRef.current && currentMessageIdRef.current) {
                  chatRef.current.finalizeStreamingMessage(currentMessageIdRef.current);
                }
                currentMessageIdRef.current = null;
                setIsLoading(false);
                break;
              }

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  if (data === '{}' || data.includes('event: done')) {
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    
                    if (parsed.error) {
                      throw new Error(parsed.error);
                    }

                    if (parsed.content && chatRef.current && currentMessageIdRef.current) {
                      chatRef.current.updateStreamingMessage(currentMessageIdRef.current, parsed.content);
                    }
                  } catch (parseError) {
                    // Skip invalid JSON chunks
                    continue;
                  }
                }
              }
            }
          } catch (streamError) {
            console.error('Stream reading error:', streamError);
            setError('Error reading response stream. Please try again.');
            
            if (chatRef.current && currentMessageIdRef.current) {
              chatRef.current.finalizeStreamingMessage(currentMessageIdRef.current);
              chatRef.current.addAiMessage(
                'Sorry, I encountered an error while reading the response. Please try again.'
              );
            }
            
            currentMessageIdRef.current = null;
            setIsLoading(false);
          }
        };

        readStream();
      }).catch(fetchError => {
        console.error('Fetch error:', fetchError);
        setError('Connection error. Please try again.');
        
        if (chatRef.current && currentMessageIdRef.current) {
          chatRef.current.finalizeStreamingMessage(currentMessageIdRef.current);
          chatRef.current.addAiMessage(
            'Sorry, I encountered a connection error. Please try again.'
          );
        } else if (chatRef.current) {
          chatRef.current.addAiMessage(
            'Sorry, I encountered a connection error. Please try again.'
          );
        }
        
        currentMessageIdRef.current = null;
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      if (chatRef.current) {
        chatRef.current.addAiMessage(
          `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
        );
      }
      
      currentMessageIdRef.current = null;
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
        onStopMessage={handleStopMessage}
      />
      
      <div className="text-center text-sm text-muted-foreground mt-4 p-4 border rounded-md bg-blue-50">
        <p className="font-semibold">🤖 Powered by OpenRouter</p>
        <p>This chat is powered by AI models from OpenRouter. Your agent's instructions guide the AI's responses.</p>
        <p className="text-xs mt-1">Current model: {selectedModel}</p>
      </div>
    </div>
  );
} 