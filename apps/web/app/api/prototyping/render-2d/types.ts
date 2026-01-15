// =============================================================================
// app/api/prototyping/render-2d/types.ts
// Types pour la génération de prototypes 2D
// =============================================================================

export type RenderStyle = "realistic" | "sketch";
export type ReferenceType = "none" | "realistic" | "sketch";

export type Render2DPrototypeStatus = "ok" | "fallback" | "failed";

export interface Render2DPrototype {
  id?: number | string;
  index: number;
  finalPrompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  renderStyle: RenderStyle;
  referenceType: ReferenceType;
  referenceImageUrl?: string;
  views: string[];
  status: Render2DPrototypeStatus;
  source?: string;
}

export interface Render2DRequest {
  renderStyle: RenderStyle;
  userPrompt: string;
  numPrototypes: number;
  views?: string[];
  referenceType: ReferenceType;
  referenceImageUrl?: string | null;
  workshopId?: string;
  ideaId?: string;
  ideaTitle?: string;
  ideaDescription?: string;
}

export interface Render2DResponse {
  prototypes: Render2DPrototype[];
}
