// =============================================================================
// lib/genai/types.ts
// Types pour la génération d'images IA
// =============================================================================

export type GenAiRunStatus = "queued" | "running" | "succeeded" | "failed";

export type GenAiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type GenAiImageExport = {
  url: string;
  downloadUrl?: string;
  filename?: string;
  format?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  prompt?: string;
  metadata?: Record<string, unknown>;
};

export type GenAiModelExport = {
  url: string;
  downloadUrl?: string;
  filename?: string;
  format?: string;
  mimeType?: string;
  thumbnailUrl?: string;
  sizeBytes?: number;
  metadata?: Record<string, unknown>;
};

export type GenAiExports = {
  images?: GenAiImageExport[];
  models?: GenAiModelExport[];
  files?: GenAiImageExport[];
};

export type GenAiRunResponse<TOutputs = unknown> = {
  moduleKey: string;
  runId: string;
  status: GenAiRunStatus;
  outputs?: TOutputs;
  exports?: GenAiExports;
  inputs?: Record<string, unknown>;
  error?: GenAiError;
};

export type GenAiRunOutputs = Record<string, unknown>;
