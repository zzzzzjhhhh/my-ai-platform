"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Square } from 'lucide-react';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isMessageLoading?: boolean;
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
  onStopMessage?: () => void;
}

export type ChatWindowRef = {
  addAiMessage: (text: string) => void;
  addStreamingAiMessage: () => string;
  updateStreamingMessage: (messageId: string, content: string) => void;
  finalizeStreamingMessage: (messageId: string) => void;
};

export const ChatWindow = forwardRef<ChatWindowRef, ChatWindowProps>(
  ({ selectedAgent, onSendMessage, isLoading = false, onStopMessage }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
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
        id: crypto.randomUUID(),
        sender: 'user',
        text: inputValue.trim(),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      const messageText = inputValue.trim();
      setInputValue('');

      try {
        if (onSendMessage) {
          await onSendMessage(messageText);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const addAiMessage = (text: string) => {
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    };

    const addStreamingAiMessage = (): string => {
      const messageId = crypto.randomUUID();
      const aiMessage: Message = {
        id: messageId,
        sender: 'ai',
        text: '',
        timestamp: new Date(),
        isMessageLoading: true,
      };
      setMessages(prev => [...prev, aiMessage]);
      return messageId;
    };

    const updateStreamingMessage = (messageId: string, content: string) => {
      setMessages(prev => {
        const updated = prev.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, text: msg.text + content };
          }
          return msg;
        });
        return updated;
      });
    };

    const finalizeStreamingMessage = (messageId: string) => {
      setMessages(prev => 
        prev
          .map(msg => 
            msg.id === messageId 
              ? { ...msg, isMessageLoading: false }
              : msg
          )
          .filter(msg => 
            msg.id === messageId 
              ? msg.text !== ''
              : true
          )
      );
    };

    useImperativeHandle(ref, () => ({
      addAiMessage,
      addStreamingAiMessage,
      updateStreamingMessage,
      finalizeStreamingMessage,
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
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground' :
                          'bg-muted text-muted-foreground'}
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.text}
                        {message.sender === 'ai' && message.text === '' && message.isMessageLoading && (
                          <span className="inline-flex items-center">
                            <span className="animate-pulse">●</span>
                            <span className="animate-pulse animation-delay-200">●</span>
                            <span className="animate-pulse animation-delay-400">●</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
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
            {isLoading ? (
              <Button 
                onClick={onStopMessage}
                disabled={!isLoading}
                size="icon"
                variant="destructive"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

ChatWindow.displayName = 'ChatWindow';