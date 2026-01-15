"use client";

// =============================================================================
// Page Assistant Chat pour le prototypage
// Chat avec contexte des prototypes générés
// =============================================================================

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  User,
  ImageIcon,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@kit/ui/button";
import { Input } from "@kit/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@kit/ui/card";
import { ScrollArea } from "@kit/ui/scroll-area";
import { Checkbox } from "@kit/ui/checkbox";
import type { PrototypeData, PrototypingSession } from "../../types";

const STORAGE_KEY_PREFIX = "prototyping_session_";
const CHAT_STORAGE_PREFIX = "prototyping_chat_";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function PrototypingAssistantPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.workshopId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Session state
  const [session, setSession] = useState<PrototypingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  // Prototype selection
  const [selectedPrototypes, setSelectedPrototypes] = useState<number[]>([]);

  // Load session and chat history
  useEffect(() => {
    const sessionKey = STORAGE_KEY_PREFIX + workshopId;
    const chatKey = CHAT_STORAGE_PREFIX + workshopId;

    // Load session
    const storedSession = sessionStorage.getItem(sessionKey);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession) as PrototypingSession;
        setSession(parsed);
        // Select all prototypes by default
        setSelectedPrototypes(parsed.prototypes.map((p: PrototypeData) => p.index));
      } catch (e) {
        console.error("Failed to parse session:", e);
        setError("Session invalide");
      }
    } else {
      setError("Aucune session trouvée. Générez d'abord des prototypes.");
    }

    // Load chat history
    const storedChat = localStorage.getItem(chatKey);
    if (storedChat) {
      try {
        const parsed = JSON.parse(storedChat) as ChatMessage[];
        setMessages(parsed);
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    }

    setLoading(false);
  }, [workshopId]);

  // Save chat history
  const saveChat = useCallback(
    (newMessages: ChatMessage[]) => {
      const chatKey = CHAT_STORAGE_PREFIX + workshopId;
      localStorage.setItem(chatKey, JSON.stringify(newMessages));
      setMessages(newMessages);
    },
    [workshopId]
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle prototype selection
  const togglePrototype = (index: number) => {
    setSelectedPrototypes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() || sending || !session) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    saveChat(newMessages);
    setInputValue("");
    setSending(true);

    try {
      // Prepare prototypes context
      const prototypesContext = session.prototypes
        .filter((p: PrototypeData) => selectedPrototypes.includes(p.index))
        .map((p: PrototypeData) => ({
          index: p.index,
          prompt: p.finalPrompt,
          imageUrl: p.imageUrl,
          nomenclature: p.nomenclature,
        }));

      // Prepare message history for API
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/prototyping/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          workshopId,
          prototypes: prototypesContext,
          selectedPrototypeIds: selectedPrototypes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Échec de la réponse");
      }

      const json = await res.json();

      if (json.status !== "succeeded" || !json.outputs?.message) {
        throw new Error("Réponse invalide");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: json.outputs.message,
        timestamp: new Date().toISOString(),
      };

      saveChat([...newMessages, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Désolé, une erreur s'est produite. Veuillez réessayer.",
        timestamp: new Date().toISOString(),
      };
      saveChat([...newMessages, errorMessage]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Clear chat history
  const clearChat = () => {
    const chatKey = CHAT_STORAGE_PREFIX + workshopId;
    localStorage.removeItem(chatKey);
    setMessages([]);
  };

  // Go back to results
  const goBack = () => {
    router.push(`/home/designer/prototyping/${workshopId}/results`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {error || "Session non trouvée"}
            </p>
            <Button onClick={() => router.push(`/home/designer/prototyping/${workshopId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la génération
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Assistant Prototypage
              </h1>
              <p className="text-sm text-muted-foreground">
                Discutez de vos prototypes avec l'IA
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="mr-2 h-4 w-4" />
            Effacer
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Prototype Selection */}
        <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto hidden md:block">
          <h2 className="text-sm font-semibold mb-3">Prototypes sélectionnés</h2>
          <p className="text-xs text-muted-foreground mb-4">
            L'assistant aura accès aux prototypes cochés.
          </p>
          <div className="space-y-3">
            {session.prototypes.map((proto: PrototypeData) => (
              <label
                key={proto.index}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedPrototypes.includes(proto.index)}
                  onCheckedChange={() => togglePrototype(proto.index)}
                />
                <div className="flex-1 min-w-0">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md mb-1">
                    <Image
                      src={proto.imageUrl}
                      alt={`Prototype ${proto.index}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {proto.finalPrompt.slice(0, 40)}...
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="container mx-auto max-w-2xl space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Bienvenue dans l'assistant prototypage
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Posez des questions sur vos prototypes, demandez des
                    améliorations, ou discutez des aspects techniques de votre
                    conception.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "assistant" ? "" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] rounded-lg p-3 ${
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t bg-background p-4">
            <div className="container mx-auto max-w-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Posez une question sur vos prototypes..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={!inputValue.trim() || sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
