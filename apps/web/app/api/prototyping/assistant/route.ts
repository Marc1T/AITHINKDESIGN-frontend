// =============================================================================
// API Route: /api/prototyping/assistant
// Assistant chat avec contexte des prototypes via Gemini
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { generateGeminiChat, type ReplicateMessage } from "~/lib/replicate";
import {
  buildGenAiSuccessResponse,
  buildGenAiErrorResponse,
} from "~/lib/genai/response";
import type { NomenclatureItem } from "../bom/route";

export const runtime = "nodejs";
export const maxDuration = 120;

interface PrototypeContext {
  index: number;
  prompt: string;
  imageUrl?: string;
  nomenclature?: NomenclatureItem[];
}

interface AssistantRequestBody {
  messages?: ReplicateMessage[];
  workshopId?: string;
  prototypes?: PrototypeContext[];
  selectedPrototypeIds?: number[];
}

function formatPrototypesContext(
  prototypes: PrototypeContext[],
  selectedIds?: number[]
): string {
  if (!prototypes || prototypes.length === 0) {
    return "Aucun prototype disponible.";
  }

  const selected = selectedIds?.length
    ? prototypes.filter((p) => selectedIds.includes(p.index))
    : prototypes;

  return selected
    .map((proto) => {
      let context = `## Prototype ${proto.index}\n`;
      context += `**Description**: ${proto.prompt}\n`;

      if (proto.nomenclature && proto.nomenclature.length > 0) {
        context += `**Nomenclature (${proto.nomenclature.length} composants)**:\n`;
        proto.nomenclature.forEach((item) => {
          context += `- ${item.reference}: ${item.designation} (${item.quantity}x, ${item.material})\n`;
        });
      }

      return context;
    })
    .join("\n\n");
}

const SYSTEM_CONTEXT = `Vous êtes un assistant expert en conception de produits et prototypage industriel.

Vous aidez les utilisateurs à :
- Analyser et améliorer leurs prototypes
- Suggérer des modifications de conception
- Expliquer les choix de matériaux et de composants
- Répondre aux questions techniques sur la fabrication
- Proposer des alternatives et optimisations

Vous avez accès au contexte des prototypes générés par l'utilisateur.
Répondez de manière concise et professionnelle en français.`;

export async function POST(req: NextRequest) {
  const runId = crypto.randomUUID();

  let body: AssistantRequestBody;
  try {
    body = (await req.json()) as AssistantRequestBody;
  } catch (err) {
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:assistant",
        runId,
        message: "Corps JSON invalide",
        details: { error: String(err) },
      }),
      { status: 400 }
    );
  }

  const messages = body?.messages || [];
  const prototypes = body?.prototypes || [];
  const selectedPrototypeIds = body?.selectedPrototypeIds;

  if (messages.length === 0) {
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:assistant",
        runId,
        message: "Au moins un message est requis",
        details: {},
      }),
      { status: 400 }
    );
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:assistant",
        runId,
        message: "REPLICATE_API_TOKEN manquant",
        details: {},
      }),
      { status: 500 }
    );
  }

  try {
    const startTime = Date.now();

    // Build context-enriched messages
    const prototypeContext = formatPrototypesContext(prototypes, selectedPrototypeIds);
    
    const contextMessage: ReplicateMessage = {
      role: "user",
      content: `${SYSTEM_CONTEXT}

# CONTEXTE DES PROTOTYPES
${prototypeContext}

---

Maintenant, répondez à la conversation suivante :`,
    };

    const enrichedMessages: ReplicateMessage[] = [contextMessage, ...messages];

    // Collect image URLs from selected prototypes for visual context
    const imageUrls = prototypes
      .filter((p) => !selectedPrototypeIds?.length || selectedPrototypeIds.includes(p.index))
      .map((p) => p.imageUrl)
      .filter((url): url is string => !!url)
      .slice(0, 4); // Limit to 4 images

    const response = await generateGeminiChat({
      messages: enrichedMessages,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      temperature: 0.7,
    });

    const durationMs = Date.now() - startTime;

    return NextResponse.json(
      buildGenAiSuccessResponse({
        moduleKey: "prototyping:assistant",
        runId,
        outputs: {
          message: response,
          role: "assistant" as const,
        },
        exports: {},
      })
    );
  } catch (error) {
    console.error("[prototyping:assistant] Error:", error);
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:assistant",
        runId,
        message: "Erreur lors de la génération de la réponse",
        details: { error: String(error) },
      }),
      { status: 500 }
    );
  }
}
