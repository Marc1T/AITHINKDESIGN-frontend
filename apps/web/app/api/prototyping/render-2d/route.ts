// =============================================================================
// app/api/prototyping/render-2d/route.ts
// API Route pour la génération de prototypes 2D avec Replicate
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getReplicateClient } from "~/lib/replicate";
import {
  buildGenAiErrorResponse,
  buildGenAiSuccessResponse,
} from "~/lib/genai/response";
import { REPLICATE_MODELS } from "~/lib/genai/replicate-models";
import type { GenAiImageExport } from "~/lib/genai/types";
import type { Render2DPrototype, RenderStyle } from "./types";

export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes max pour les générations

const requestSchema = z.object({
  userPrompt: z.string().min(1, "Le prompt est requis"),
  renderStyle: z.enum(["sketch", "realistic"]).default("realistic"),
  numPrototypes: z.number().int().min(1).max(5).default(3),
  views: z.array(z.string()).optional(),
  referenceType: z.enum(["none", "sketch", "realistic"]).default("none"),
  referenceImageUrl: z.string().url().nullable().optional(),
  workshopId: z.string().optional(),
  ideaId: z.string().optional(),
  ideaTitle: z.string().optional(),
  ideaDescription: z.string().optional(),
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function extractImageUrl(output: unknown): string {
  if (!output) return "";

  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractImageUrl(item);
      if (url) return url;
    }
  }

  if (typeof output === "object") {
    const obj = output as Record<string, unknown>;
    
    if ("url" in obj && typeof obj.url === "function") {
      return (obj.url as () => URL)().toString();
    }

    if ("uri" in obj && typeof obj.uri === "string") {
      return obj.uri;
    }

    if ("output" in obj) {
      return extractImageUrl(obj.output);
    }
  }

  return "";
}

function buildViewsText(views: string[]): string {
  if (!views.length) return "";
  
  const labels = views.map((view) => `vue ${view}`);
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} et ${labels[1]}`;
  
  const head = labels.slice(0, -1).join(", ");
  const tail = labels[labels.length - 1];
  return `${head} et ${tail}`;
}

function buildFinalPrompt(params: {
  baseDescription: string;
  productLabel: string;
  renderStyle: RenderStyle;
  selectedViews: string[];
}): string {
  const { baseDescription, productLabel, renderStyle, selectedViews } = params;
  const viewsText = buildViewsText(selectedViews);

  if (selectedViews.length === 0) {
    if (renderStyle === "sketch") {
      return `A technical design sheet showing a modern prototype of ${productLabel} in a single perspective view. The ${productLabel} is shown alone without any other object on a clean white background. Minimalist and professional design, similar to architectural or engineering plans. Clean lines, no shadows, isometric-style presentation, technical drawing aesthetic. Design details: ${baseDescription}`;
    }

    return `A realistic product photograph of a modern ${productLabel} prototype shown in a single perspective view. Clean white studio background with soft lighting. The ${productLabel} is the only object presented, no other furniture or accessories. Photorealistic 3D rendering style, professional product design presentation with subtle shadows. High quality detailed textures on the ${productLabel} surface, commercial photography quality. Design details: ${baseDescription}`;
  }

  if (renderStyle === "sketch") {
    return `A technical design sheet showing a modern prototype of ${productLabel} displayed in ${viewsText}. Each view is clearly labeled and arranged in a grid on a clean white background. The ${productLabel} is shown alone without any other object. Minimalist and professional design, similar to architectural or engineering plans. Clean lines, no shadows, isometric-style presentation. Design details: ${baseDescription}`;
  }

  return `A realistic product photography board showing a modern ${productLabel} prototype in ${viewsText}. Each view is clearly labeled and organized in a professional grid. Clean white studio background with soft lighting. The ${productLabel} is the only object presented, no other furniture or accessories. Photorealistic 3D rendering style, professional product design presentation with subtle shadows under each view. High quality detailed textures on the ${productLabel} surface. Design details: ${baseDescription}`;
}

async function generatePrototypes(params: {
  prompts: string[];
  renderStyle: RenderStyle;
  views: string[];
}): Promise<Render2DPrototype[]> {
  const replicate = getReplicateClient();
  const prototypes: Render2DPrototype[] = [];

  console.log(`[render-2d] Starting generation of ${params.prompts.length} prototypes`);

  for (let i = 0; i < params.prompts.length; i++) {
    const prompt = params.prompts[i] ?? "";
    
    console.log(`[render-2d] Generating prototype ${i + 1}/${params.prompts.length}`);

    try {
      // Utiliser FLUX Schnell pour la génération
      const input = {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
      };

      const output = await replicate.run(REPLICATE_MODELS.FLUX_SCHNELL, { input });
      const imageUrl = extractImageUrl(output);

      console.log(`[render-2d] Prototype ${i + 1} generated:`, imageUrl ? "success" : "failed");

      prototypes.push({
        index: i + 1,
        finalPrompt: prompt,
        imageUrl,
        renderStyle: params.renderStyle,
        referenceType: "none",
        views: params.views,
        status: imageUrl ? "ok" : "failed",
        source: "flux-schnell",
      });

    } catch (error) {
      console.error(`[render-2d] Error generating prototype ${i + 1}:`, error);
      prototypes.push({
        index: i + 1,
        finalPrompt: prompt,
        imageUrl: "",
        renderStyle: params.renderStyle,
        referenceType: "none",
        views: params.views,
        status: "failed",
        source: "flux-schnell",
      });
    }

    // Délai entre les générations pour éviter le rate limiting
    if (i < params.prompts.length - 1) {
      await sleep(1000 + Math.random() * 1000);
    }
  }

  console.log(`[render-2d] Completed: ${prototypes.filter(p => p.status === "ok").length}/${prototypes.length} successful`);
  return prototypes;
}

export async function POST(req: NextRequest) {
  const runId = crypto.randomUUID();
  
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("; ");
      return NextResponse.json(
        buildGenAiErrorResponse({
          moduleKey: "render-2d",
          runId,
          message: message || "Requête invalide",
          details: { issues: parsed.error.issues },
        }),
        { status: 400 }
      );
    }

    const data = parsed.data;
    const prototypeCount = Math.min(Math.max(data.numPrototypes, 1), 5);
    const views = data.views || [];
    
    // Construire le label du produit à partir de l'idée ou du prompt
    const productLabel = data.ideaTitle || "product prototype";
    const baseDescription = data.ideaDescription 
      ? `${data.userPrompt}. ${data.ideaDescription}`
      : data.userPrompt;

    // Construire les prompts pour chaque prototype
    const prompts: string[] = [];
    for (let i = 0; i < prototypeCount; i++) {
      const finalPrompt = buildFinalPrompt({
        baseDescription,
        productLabel,
        renderStyle: data.renderStyle,
        selectedViews: views,
      });
      
      // Ajouter une variation pour chaque prototype
      const variation = i > 0 ? ` Variation ${i + 1}: slightly different design approach, alternative angles and proportions.` : "";
      prompts.push(finalPrompt + variation);
    }

    console.log("[render-2d] Request:", {
      prototypeCount,
      renderStyle: data.renderStyle,
      views,
      workshopId: data.workshopId,
      ideaId: data.ideaId,
    });

    // Générer les prototypes
    const prototypes = await generatePrototypes({
      prompts,
      renderStyle: data.renderStyle,
      views,
    });

    // Construire les exports d'images
    const images: GenAiImageExport[] = prototypes
      .filter((proto) => proto.imageUrl)
      .map((proto) => ({
        url: proto.imageUrl,
        filename: `prototype-${proto.index}.webp`,
        format: "webp",
        width: 1024,
        height: 1024,
        prompt: proto.finalPrompt,
      }));

    return NextResponse.json(
      buildGenAiSuccessResponse({
        moduleKey: "render-2d",
        runId,
        inputs: {
          prompt: data.userPrompt,
          renderStyle: data.renderStyle,
          referenceType: data.referenceType,
          views,
          numPrototypes: prototypeCount,
          workshopId: data.workshopId,
          ideaId: data.ideaId,
        },
        outputs: { prototypes },
        exports: { images },
      })
    );

  } catch (error) {
    console.error("[render-2d] Route error:", error);
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "render-2d",
        runId,
        message: "Erreur serveur lors de la génération des prototypes",
        details: { error: String(error) },
      }),
      { status: 500 }
    );
  }
}
