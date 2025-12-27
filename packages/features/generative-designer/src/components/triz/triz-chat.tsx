// =============================================================================
// packages/features/generative-designer/src/components/triz/triz-chat.tsx
// Interface conversationnelle TRIZ avec quick replies
// =============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Badge } from '@kit/ui/badge';
import { Card } from '@kit/ui/card';
import { Loader2, Send, Bot, User, Lightbulb, ArrowLeft } from 'lucide-react';
import { useTRIZ } from '../../hooks/use-triz';
import { cn } from '../../lib/utils';

interface TRIZChatProps {
  ideationId: string;
  onComplete: (enrichedBrief: string) => void;
  onBack: () => void;
}

export function TRIZChat({ ideationId, onComplete, onBack }: TRIZChatProps) {
  const { messages, state, loading, error, initializeTRIZ, sendTRIZMessage } = useTRIZ(ideationId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize TRIZ chat with welcome message
    initializeTRIZ();
  }, [initializeTRIZ]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if TRIZ is complete
  useEffect(() => {
    if (state?.is_complete && state.enriched_brief) {
      // Show completion for 2 seconds, then redirect
      setTimeout(() => {
        onComplete(state.enriched_brief!);
      }, 2000);
    }
  }, [state, onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');

    try {
      await sendTRIZMessage(message);
    } catch (err) {
      console.error('Error sending TRIZ message:', err);
    }
  };

  const handleQuickReply = async (value: string) => {
    try {
      await sendTRIZMessage(value);
    } catch (err) {
      console.error('Error sending quick reply:', err);
    }
  };

  // Stage indicator
  const stageLabels: Record<string, string> = {
    initial: 'Introduction',
    identifying_contradictions: 'Identification des contradictions',
    selecting_principles: 'Sélection des principes',
    applying: 'Application des principes',
    complete: 'Analyse terminée',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        {state && (
          <Badge variant="secondary" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {stageLabels[state.conversation_state?.stage || 'initial']}
          </Badge>
        )}
      </div>

      {/* Chat Container */}
      <Card className="p-0 overflow-hidden">
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[70%] rounded-lg p-4',
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              </div>
            </div>
          )}

          {/* Completion Message */}
          {state?.is_complete && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Analyse TRIZ terminée ! Brief enrichi généré avec succès.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {state?.quick_replies && state.quick_replies.length > 0 && !state.is_complete && (
          <div className="p-4 bg-white border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Suggestions rapides :</p>
            <div className="flex flex-wrap gap-2">
              {state.quick_replies.map((reply) => (
                <Button
                  key={reply.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply.value)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {reply.icon && <span>{reply.icon}</span>}
                  {reply.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border-t border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Input Form */}
        {!state?.is_complete && (
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-white border-t border-gray-200 flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre réponse..."
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
        )}
      </Card>
    </div>
  );
}
