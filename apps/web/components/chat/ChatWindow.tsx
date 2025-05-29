"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User } from 'lucide-react';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface ChatWindowProps {
  selectedAgent?: {
    id: string;
    name: string;
    avatar?: string;
    instructions?: string;
  };
  onSendMessage?: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export type ChatWindowRef = {
  addAiMessage: (text: string) => void;
};

export const ChatWindow = forwardRef<ChatWindowRef, ChatWindowProps>(
  ({ selectedAgent, onSendMessage, isLoading = false }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    console.log(messages, 'messages')
    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, [messages]);

    const handleSendMessage = async () => {
      if (!inputValue.trim() || isLoading) return;

      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: inputValue.trim(),
        timestamp: new Date(),
      };

      // Add user message immediately
      setMessages(prev => [...prev, newMessage]);
      const messageText = inputValue.trim();
      setInputValue('');

      try {
        // Call the onSendMessage callback if provided
        if (onSendMessage) {
          await onSendMessage(messageText);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        // You could add error handling UI here
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    // Function to add AI response (will be called from parent component)
    const addAiMessage = (text: string) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    };

    // Expose addAiMessage through ref
    useImperativeHandle(ref, () => ({
      addAiMessage,
    }));

    return (
      <Card className="flex flex-col h-[600px] w-full max-w-4xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedAgent?.avatar} alt={selectedAgent?.name} />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>Chat with {selectedAgent?.name || 'AI Agent'}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-4 h-full" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your AI agent!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={selectedAgent?.avatar} alt={selectedAgent?.name} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-12'
                          : 'bg-muted mr-12'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {message.sender === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={selectedAgent?.avatar} alt={selectedAgent?.name} />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2 mr-12">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150" />
                    </div>
                    <span className="text-xs opacity-70 mt-1 block">AI is typing...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }
);

ChatWindow.displayName = 'ChatWindow'; 