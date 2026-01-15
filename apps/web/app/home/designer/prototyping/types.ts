// =============================================================================
// Types pour le prototypage
// =============================================================================

export interface NomenclatureItem {
  reference: string;
  designation: string;
  quantity: number;
  material: string;
  type: string;
  comment: string;
}

export interface PrototypeData {
  index: number;
  imageUrl: string;
  finalPrompt: string;
  branch?: "original" | "edit";
  referenceType?: "generate" | "edit";
  nomenclature?: NomenclatureItem[];
}

export interface PrototypingSession {
  workshopId: string;
  runId: string;
  style: "realistic" | "sketch";
  prototypes: PrototypeData[];
  createdAt: string;
}

export interface GenerationConfig {
  prompt: string;
  style: "realistic" | "sketch";
  views: string[];
  count: number;
}
