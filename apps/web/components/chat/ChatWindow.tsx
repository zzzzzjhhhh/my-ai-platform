'use client';

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Send,
  Bot,
  User,
  Square,
  RotateCcw,
  Edit,
  X,
  Check,
} from 'lucide-react';

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
  onSendMessage?: (message: string) => void;
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
    const [lastUserMessage, setLastUserMessage] = useState<string>('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(
      null
    );
    const [editingText, setEditingText] = useState<string>('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, [messages]);

    const handleSendMessage = () => {
      if (!inputValue.trim() || isLoading) return;

      const newMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'user',
        text: inputValue.trim(),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      const messageText = inputValue.trim();
      setLastUserMessage(messageText);
      setInputValue('');
      onSendMessage?.(messageText);
    };

    const handleResendMessage = async () => {
      if (!lastUserMessage.trim() || isLoading) return;

      const newMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'user',
        text: lastUserMessage,
        timestamp: new Date(),
      };
      setMessages(prev => prev.slice(0, -2));
      setMessages(prev => [...prev, newMessage]);
      onSendMessage?.(lastUserMessage);
    };

    const handleEditMessage = (messageId: string, currentText: string) => {
      setEditingMessageId(messageId);
      setEditingText(currentText);
    };

    const handleCancelEdit = () => {
      setEditingMessageId(null);
      setEditingText('');
    };

    const handleUpdateMessage = async () => {
      if (!editingText.trim() || !editingMessageId || isLoading) return;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessageId
            ? { ...msg, text: editingText.trim() }
            : msg
        )
      );

      setEditingMessageId(null);
      setEditingText('');

      setMessages(prev =>
        prev.filter((msg, index) => index !== prev.length - 1)
      );
      setLastUserMessage(editingText.trim());
      onSendMessage?.(editingText.trim());
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUpdateMessage();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
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
            msg.id === messageId ? { ...msg, isMessageLoading: false } : msg
          )
          .filter(msg => (msg.id === messageId ? msg.text !== '' : true))
      );
    };

    useImperativeHandle(ref, () => ({
      addAiMessage,
      addStreamingAiMessage,
      updateStreamingMessage,
      finalizeStreamingMessage,
    }));
    const userMessagesList = messages.filter(msg => msg.sender === 'user');
    return (
      <Card className='flex flex-col h-[600px] w-full max-w-4xl mx-auto'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={selectedAgent?.avatar}
                alt={selectedAgent?.name}
              />
              <AvatarFallback>
                <Bot className='h-4 w-4' />
              </AvatarFallback>
            </Avatar>
            <span>Chat with {selectedAgent?.name || 'AI Agent'}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className='flex-1 p-0 flex flex-col overflow-hidden'>
          <ScrollArea className='flex-1 px-4 h-full' ref={scrollAreaRef}>
            <div className='space-y-4 py-4'>
              {messages.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>
                  <Bot className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Start a conversation with your AI agent!</p>
                </div>
              ) : (
                messages.map(message => {
                  const lastUserMessageId =
                    userMessagesList[userMessagesList.length - 1]?.id;
                  const isLastUserMessage =
                    message.sender === 'user' &&
                    message.id === lastUserMessageId;
                  return (
                    <div key={message.id} className='space-y-2'>
                      <div
                        className={`flex group ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'ai' && (
                          <Avatar className='h-8 w-8 mt-1'>
                            <AvatarImage
                              src={selectedAgent?.avatar}
                              alt={selectedAgent?.name}
                            />
                            <AvatarFallback>
                              <Bot className='h-4 w-4' />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className='flex items-start gap-2 max-w-[80%]'>
                          {message.sender === 'user' &&
                            isLastUserMessage &&
                            !isLoading && (
                              <Button
                                onClick={() =>
                                  handleEditMessage(message.id, message.text)
                                }
                                size='sm'
                                variant='ghost'
                                className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity'
                              >
                                <Edit className='h-3 w-3' />
                              </Button>
                            )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }
          }`}
                          >
                            {editingMessageId === message.id ? (
                              <div className='space-y-2'>
                                <Input
                                  value={editingText}
                                  onChange={e => setEditingText(e.target.value)}
                                  onKeyPress={handleEditKeyPress}
                                  className='min-w-[200px] bg-background text-foreground'
                                  autoFocus
                                />
                                <div className='flex gap-1 justify-end'>
                                  <Button
                                    onClick={handleCancelEdit}
                                    size='sm'
                                    variant='ghost'
                                    className='h-6 px-2'
                                  >
                                    <X className='h-3 w-3' />
                                  </Button>
                                  <Button
                                    onClick={handleUpdateMessage}
                                    size='sm'
                                    variant='ghost'
                                    className='h-6 px-2'
                                    disabled={!editingText.trim() || isLoading}
                                  >
                                    <Check className='h-3 w-3' />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className='whitespace-pre-wrap break-words'>
                                  {message.text}
                                  {message.sender === 'ai' &&
                                    message.text === '' &&
                                    message.isMessageLoading && (
                                      <span className='inline-flex items-center'>
                                        <span className='animate-pulse'>●</span>
                                        <span className='animate-pulse animation-delay-200'>
                                          ●
                                        </span>
                                        <span className='animate-pulse animation-delay-400'>
                                          ●
                                        </span>
                                      </span>
                                    )}
                                </div>
                                <div className='text-xs opacity-70 mt-1'>
                                  {message.timestamp.toLocaleTimeString()}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {message.sender === 'user' && (
                          <Avatar className='h-8 w-8 mt-1'>
                            <AvatarFallback>
                              <User className='h-4 w-4' />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      {message.sender === 'ai' &&
                        !message.isMessageLoading &&
                        lastUserMessage &&
                        !isLoading && (
                          <div className='flex justify-start ml-10'>
                            <Button
                              onClick={handleResendMessage}
                              variant='ghost'
                              size='sm'
                              className='text-xs text-muted-foreground hover:text-foreground'
                            >
                              <RotateCcw className='h-3 w-3 mr-1' />
                              Resend last message
                            </Button>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className='border-t p-4'>
          <div className='flex gap-2'>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type your message...'
              disabled={isLoading}
              className='flex-1'
            />
            {isLoading ? (
              <Button
                onClick={onStopMessage}
                disabled={!isLoading}
                size='icon'
                variant='destructive'
              >
                <Square className='h-4 w-4' />
              </Button>
            ) : (
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size='icon'
              >
                <Send className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

ChatWindow.displayName = 'ChatWindow';