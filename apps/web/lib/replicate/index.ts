// =============================================================================
// lib/replicate/index.ts
// Client Replicate pour la génération d'images et Gemini AI
// =============================================================================

import Replicate from "replicate";

let replicateClient: Replicate | null = null;

export function getReplicateClient(): Replicate {
  if (!replicateClient) {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error("REPLICATE_API_TOKEN manquant dans les variables d'environnement");
    }
    replicateClient = new Replicate({ auth: token });
  }
  return replicateClient;
}

export type ReplicateClient = Replicate;

// Gemini model for text/chat generation
export const GEMINI_MODEL = "google/gemini-2.5-flash";

export type ReplicateMessage = {
  role: "user" | "assistant";
  content: string;
};

type ReplicateGeminiInput = {
  prompt: string;
  images?: string[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
};

/**
 * Extract image URL from Replicate output
 */
export function extractImageUrl(output: unknown): string | null {
  if (typeof output === "string") {
    return output;
  }
  
  if (Array.isArray(output) && output.length > 0) {
    return typeof output[0] === "string" ? output[0] : null;
  }
  
  if (output && typeof output === "object" && "url" in output) {
    return (output as { url: string }).url;
  }
  
  return null;
}

/**
 * Extract multiple image URLs from Replicate output
 */
export function extractImageUrls(output: unknown): string[] {
  if (typeof output === "string") {
    return [output];
  }
  
  if (Array.isArray(output)) {
    return output.filter((item): item is string => typeof item === "string");
  }
  
  return [];
}

/**
 * Generate a completion with Gemini 2.5 Flash via Replicate
 * Supports images for visual analysis
 */
export async function generateGeminiCompletion(params: {
  prompt: string;
  images?: string[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const replicate = getReplicateClient();
  
  const input: ReplicateGeminiInput = {
    prompt: params.prompt,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens ?? 4096,
    top_p: 0.95,
  };

  if (params.images && params.images.length > 0) {
    input.images = params.images;
  }

  let fullResponse = "";

  for await (const event of replicate.stream(GEMINI_MODEL, { input })) {
    fullResponse += event;
  }

  return fullResponse.trim();
}

/**
 * Generate a JSON completion with Gemini 2.5 Flash
 * Adds instructions to force JSON format
 */
export async function generateGeminiJSON(params: {
  systemPrompt: string;
  userPrompt: string;
  images?: string[];
  temperature?: number;
}): Promise<string> {
  const fullPrompt = `${params.systemPrompt}

IMPORTANT: You MUST respond ONLY with valid JSON, no markdown, no code blocks, no explanatory text.

${params.userPrompt}`;

  return generateGeminiCompletion({
    prompt: fullPrompt,
    images: params.images,
    temperature: params.temperature ?? 0.2,
  });
}

/**
 * Generate a conversation with history
 */
export async function generateGeminiChat(params: {
  messages: ReplicateMessage[];
  images?: string[];
  temperature?: number;
}): Promise<string> {
  // Convert history to a single prompt
  const conversationPrompt = params.messages
    .map((msg) => {
      if (msg.role === "user") {
        return `User: ${msg.content}`;
      }
      return `Assistant: ${msg.content}`;
    })
    .join("\n\n");

  return generateGeminiCompletion({
    prompt: conversationPrompt,
    images: params.images,
    temperature: params.temperature ?? 0.7,
  });
}
