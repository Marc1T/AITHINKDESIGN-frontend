// =============================================================================
// API Route: /api/prototyping/bom
// Génération de nomenclature (Bill of Materials) avec Gemini via Replicate
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { generateGeminiJSON } from "~/lib/replicate";
import {
  buildGenAiSuccessResponse,
  buildGenAiErrorResponse,
} from "~/lib/genai/response";

export const runtime = "nodejs";
export const maxDuration = 120;

export interface NomenclatureItem {
  reference: string;
  designation: string;
  quantity: number;
  material: string;
  type: string;
  comment: string;
}

interface BomRequestBody {
  imageUrl?: string;
  prompt?: string;
}

const SYSTEM_PROMPT = `# RÔLE ET CONTEXTE
Vous êtes un ingénieur industriel senior spécialisé en conception mécanique, analyse fonctionnelle et structuration de nomenclatures (BOM) pour objets réels et prototypes industriels.

Ce prompt est utilisé dans une application GenAI généraliste : l'objet analysé peut être de N'IMPORTE QUEL TYPE
(mobilier, pièce mécanique, boîtier électronique, outil, mécanisme, robot, structure, prototype, objet monobloc, etc.).

# OBJECTIF GLOBAL
Produire une BOM **fonctionnelle / conceptuelle / système**, suffisamment complète pour permettre la fabrication et l'assemblage réel de l'objet analysé, **sans se focaliser sur les coûts**, et **sans inventer de complexité inutile**.

La BOM doit :
- inclure TOUS les composants nécessaires (visibles et non visibles)
- inclure des composants internes UNIQUEMENT s'ils sont justifiés fonctionnellement
- rester logique pour des objets simples (ex: table, pièce pleine, mobilier)

# RÈGLES FONDAMENTALES

## 1. Hiérarchie BOM stricte
- Level 1 : Sous-ensembles fonctionnels (si pertinents)
- Level 2 : Pièces (custom ou standards)
- Level 3 : Fixations / quincaillerie standard
- Level 4 : Consommables (joints, colles, graisse, ruban, etc.)

## 2. Cohérence logique obligatoire
- Ne pas inventer de complexité inutile pour les objets simples
- Adapter le niveau de détail à la complexité réelle de l'objet

# FORMAT DE SORTIE
Répondez UNIQUEMENT avec un JSON valide contenant un tableau "nomenclature" avec les objets suivants :
{
  "nomenclature": [
    {
      "reference": "string - identifiant unique (ex: P001, ASS-01)",
      "designation": "string - nom descriptif de la pièce",
      "quantity": number - quantité requise,
      "material": "string - matériau principal",
      "type": "string - catégorie: 'structure', 'assembly', 'standard', 'consumable'",
      "comment": "string - remarques optionnelles"
    }
  ]
}`;

export async function POST(req: NextRequest) {
  const runId = crypto.randomUUID();

  let body: BomRequestBody;
  try {
    body = (await req.json()) as BomRequestBody;
  } catch (err) {
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:bom",
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
        moduleKey: "prototyping:bom",
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
        moduleKey: "prototyping:bom",
        runId,
        message: "REPLICATE_API_TOKEN manquant",
        details: {},
      }),
      { status: 500 }
    );
  }

  try {
    const startTime = Date.now();

    const userPrompt = `Analysez l'image du prototype suivant et générez une nomenclature (BOM) complète.

Description du prototype: ${prompt}

Analysez l'image attentivement et identifiez tous les composants nécessaires à la fabrication de cet objet.`;

    const response = await generateGeminiJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      images: [imageUrl],
      temperature: 0.2,
    });

    // Parse the JSON response
    let nomenclature: NomenclatureItem[] = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { nomenclature?: NomenclatureItem[] };
        nomenclature = parsed.nomenclature || [];
      }
    } catch (parseError) {
      console.error("[prototyping:bom] JSON parse error:", parseError);
      // Try to extract array directly
      const arrayMatch = response.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        nomenclature = JSON.parse(arrayMatch[0]) as NomenclatureItem[];
      }
    }

    if (!nomenclature || !Array.isArray(nomenclature) || nomenclature.length === 0) {
      return NextResponse.json(
        buildGenAiErrorResponse({
          moduleKey: "prototyping:bom",
          runId,
          message: "Impossible de générer une nomenclature valide",
          details: { response },
        }),
        { status: 500 }
      );
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json(
      buildGenAiSuccessResponse({
        moduleKey: "prototyping:bom",
        runId,
        outputs: {
          nomenclature,
          itemCount: nomenclature.length,
        },
        exports: {},
      })
    );
  } catch (error) {
    console.error("[prototyping:bom] Error:", error);
    return NextResponse.json(
      buildGenAiErrorResponse({
        moduleKey: "prototyping:bom",
        runId,
        message: "Erreur lors de la génération de la nomenclature",
        details: { error: String(error) },
      }),
      { status: 500 }
    );
  }
}
