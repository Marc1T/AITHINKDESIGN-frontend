// =============================================================================
// lib/genai/replicate-models.ts
// Configuration des modèles Replicate pour la génération d'images
// =============================================================================

export const REPLICATE_MODELS = {
  // Modèle principal pour la génération 2D
  FLUX_SCHNELL: "black-forest-labs/flux-schnell" as `${string}/${string}`,
  
  // Modèle alternatif SDXL
  SDXL: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b" as `${string}/${string}:${string}`,
  
  // ControlNet pour les sketches
  CONTROLNET_SCRIBBLE:
    "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117" as `${string}/${string}:${string}`,
};
