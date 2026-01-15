// =============================================================================
// API Route: /api/prototyping/edit
// Édition d'image avec Qwen Image Edit Plus via Replicate
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getReplicateClient, extractImageUrl } from "~/lib/replicate";
import {
  buildGenAiSuccessResponse,
  buildGenAiErrorResponse,
} from "~/lib/genai/response";
import type { GenAiImageExport } from "~/lib/genai/types";

export const runtime = "nodejs";
export const maxDuration = 120;

// Qwen Image Edit model on Replicate
const QWEN_EDIT_MODEL = "qwen/qwen-image-edit-plus:latest";

interface EditRequestBody {
  imageUrl?: string;
  prompt?: string;
}

export async function POST(req: NextRequest) {
  const runId = crypto.randomUUID();

  let body: EditRequestBody;
  try {
    body = (await req.json()) as EditRequestBody;
  } catch (err) {
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:edit",
        runId,
        message: "Corps JSON invalide",
        details: { error: String(err) },
      }),
      { status: 400 }
    );
  }

  const imageUrl = body?.imageUrl?.trim();
  const prompt = body?.prompt?.trim();

  if (!imageUrl || !prompt) {
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:edit",
        runId,
        message: "imageUrl et prompt sont requis",
        details: { imageUrl, prompt },
      }),
      { status: 400 }
    );
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:edit",
        runId,
        message: "REPLICATE_API_TOKEN manquant",
        details: {},
      }),
      { status: 500 }
    );
  }

  try {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    // Run Qwen image edit model
    const output = await replicate.run(QWEN_EDIT_MODEL, {
      input: {
        image: imageUrl,
        prompt: prompt,
      },
    });

    const editedImageUrl = extractImageUrl(output);

    if (!editedImageUrl) {
      return NextResponse.json(
        buildGenAiErrorResponse({
          moduleKey: "prototyping:edit",
          runId,
          message: "Qwen n'a pas pu générer une image éditée",
          details: { output },
        }),
        { status: 500 }
      );
    }

    const durationMs = Date.now() - startTime;

    const imageExport: GenAiImageExport = {
      url: editedImageUrl,
      format: "png",
      width: 1024,
      height: 1024,
    };

    return NextResponse.json(
      buildGenAiSuccessResponse({
        moduleKey: "prototyping:edit",
        runId,
        outputs: {
          editedImage: imageExport,
        },
        exports: {
          images: [imageExport],
        },
      })
    );
  } catch (error) {
    console.error("[prototyping:edit] Error:", error);
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:edit",
        runId,
        message: "Erreur lors de l'édition de l'image",
        details: { error: String(error) },
      }),
      { status: 500 }
    );
  }
}
