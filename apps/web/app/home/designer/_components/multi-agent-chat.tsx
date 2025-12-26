/**
 * Composant Multi-Agent Chat
 * Affiche les messages des agents et utilisateur dans un format conversationnel
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Textarea } from '@kit/ui/textarea';
import { Card, CardContent } from '@kit/ui/card';
import { agentPersonalities } from './workshop-theme';

interface Message {
  id: string;
  type: 'agent' | 'user' | 'system';
  agent_name?: string;
  agent_personality?: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface MultiAgentChatProps {
  messages: Message[];
  isLoading?: boolean;
  onSendMessage?: (content: string) => void;
  placeholder?: string;
  maxHeight?: string;
}

export const MultiAgentChat: React.FC<MultiAgentChatProps> = ({
  messages = [],
  isLoading = false,
  onSendMessage,
  placeholder = 'Votre message...',
  maxHeight = 'h-96',
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage?.(input);
      setInput('');
    }
  };

  const getAgentColor = (personality?: string) => {
    if (!personality) return '#3b82f6';
    const agent = agentPersonalities[personality as keyof typeof agentPersonalities];
    return agent?.color || '#3b82f6';
  };

  const getAgentInfo = (personality?: string) => {
    if (!personality) return { name: 'Système', emoji: '⚙️' };
    return agentPersonalities[personality as keyof typeof agentPersonalities] || {
      name: 'Inconnu',
      emoji: '🤖',
    };
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className={`${maxHeight} overflow-y-auto p-4 space-y-4 flex-1`}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Aucun message pour le moment</p>
          </div>
        ) : (
          messages.map((message) => {
            const agentInfo = getAgentInfo(message.agent_personality);
            const agentColor = getAgentColor(message.agent_personality);
            const isUser = message.type === 'user';
            const isSystem = message.type === 'system';

            if (isSystem) {
              return (
                <div
                  key={message.id}
                  className="flex justify-center py-2"
                >
                  <div className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-1 text-xs font-medium text-muted-foreground">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex-shrink-0">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: agentColor + '20',
                        color: agentColor,
                      }}
                    >
                      {agentInfo.emoji}
                    </div>
                  </div>
                )}

                <div className={`flex-1 max-w-sm ${isUser ? 'text-right' : ''}`}>
                  {!isUser && (
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {message.agent_name || agentInfo.name}
                    </p>
                  )}

                  <div
                    className={`
                      inline-block rounded-lg px-4 py-2 text-sm
                      ${
                        isUser
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none'
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {isUser && (
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-semibold">
                      👤
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600">
                💭
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 space-y-3 bg-muted/30">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSend();
              }
            }}
            placeholder={placeholder}
            rows={2}
            className="resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="self-end gap-2"
            size="sm"
          >
            Envoyer 📤
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Astuce: Appuyez sur Ctrl+Entrée pour envoyer rapidement
        </p>
      </div>
    </div>
  );
};
