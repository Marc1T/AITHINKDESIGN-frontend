// =============================================================================
// packages/features/generative-designer/src/components/ideation/chat-mode.tsx
// Version corrigée qui gère l'ideation_id optionnel
// =============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Loader2, Send, User, Bot } from 'lucide-react';
import { useChat } from '../../hooks/use-chat';
import type { IdeationResponse } from '../../types';
import { cn } from '../../lib/utils';

interface ChatModeProps {
  onSuccess: (ideation: IdeationResponse) => void;
}

export function ChatMode({ onSuccess }: ChatModeProps) {
  const { messages, conversationState, loading, error, initializeChat, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat with welcome message
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');

    try {
      const response = await sendMessage(message);
      
      // Check if ideation is ready and has an ID
      if (response.extracted_parameters && response.ideation_id) {
        // Convert chat result to IdeationResponse format
        const ideationResult: IdeationResponse = {
          status: 'success',
          ideation_id: response.ideation_id,
          detailed_brief: response.bot_message,
          parameters: response.extracted_parameters,
          processing_time_ms: 0,
        };
        onSuccess(ideationResult);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSuggestedAction = async (action: string) => {
    try {
      const response = await sendMessage(action);
      
      // Check if ideation is ready
      if (response.extracted_parameters && response.ideation_id) {
        const ideationResult: IdeationResponse = {
          status: 'success',
          ideation_id: response.ideation_id,
          detailed_brief: response.bot_message,
          parameters: response.extracted_parameters,
          processing_time_ms: 0,
        };
        onSuccess(ideationResult);
      }
    } catch (err) {
      console.error('Error with suggested action:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[600px]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg border border-gray-200">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            
            <div
              className={cn(
                'max-w-[70%] rounded-lg p-4',
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      {conversationState && conversationState.stage !== 'ready' && !conversationState.brief_ready && (
        <div className="p-4 bg-white border-x border-gray-200 space-y-2">
          <p className="text-sm text-gray-600 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {conversationState.suggested_actions?.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction(action)}
                disabled={loading}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Brief Ready Notice */}
      {conversationState?.brief_ready && (
        <div className="p-4 bg-green-50 border-x border-green-200">
          <p className="text-sm text-green-800 font-medium">
            ✅ Brief technique prêt ! Envoyez un dernier message pour finaliser.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-x border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white rounded-b-lg border border-gray-200 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          size="icon"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
