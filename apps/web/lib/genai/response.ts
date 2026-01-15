// =============================================================================
// lib/genai/response.ts
// Helpers pour construire les réponses GenAI
// =============================================================================

import type {
  GenAiError,
  GenAiExports,
  GenAiRunResponse,
  GenAiRunStatus,
} from "./types";

function generateRunId(runId?: string): string {
  if (runId) return runId;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `run_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type SuccessArgs<TOutputs> = {
  moduleKey: string;
  runId?: string;
  status?: Exclude<GenAiRunStatus, "failed">;
  outputs?: TOutputs;
  exports?: GenAiExports;
  inputs?: Record<string, unknown>;
};

type ErrorArgs = {
  moduleKey: string;
  runId?: string;
  message: string;
  code?: string;
  details?: unknown;
  status?: Extract<GenAiRunStatus, "failed" | "running" | "queued" | "succeeded">;
};

export function buildGenAiSuccessResponse<TOutputs = unknown>(
  args: SuccessArgs<TOutputs>,
): GenAiRunResponse<TOutputs> {
  const runId = generateRunId(args.runId);
  return {
    moduleKey: args.moduleKey,
    runId,
    status: args.status ?? "succeeded",
    outputs: args.outputs,
    exports: args.exports,
    inputs: args.inputs,
  };
}

export function buildGenAiErrorResponse<TOutputs = unknown>(
  args: ErrorArgs,
): GenAiRunResponse<TOutputs> {
  const runId = generateRunId(args.runId);
  const error: GenAiError = {
    message: args.message,
    ...(args.code ? { code: args.code } : {}),
    ...(typeof args.details !== "undefined" ? { details: args.details } : {}),
  };

  return {
    moduleKey: args.moduleKey,
    runId,
    status: args.status ?? "failed",
    error,
  };
}
