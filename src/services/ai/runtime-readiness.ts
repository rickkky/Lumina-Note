import type { LLMConfig, LLMProviderType } from "@/services/llm";
import { PROVIDER_MODELS } from "@/services/llm/providers/models";
import { getCurrentTranslations } from "@/stores/useLocaleStore";

export type RuntimeSelectionLike = Pick<
  LLMConfig,
  "provider" | "model" | "customModelId" | "baseUrl"
> &
  Partial<Pick<LLMConfig, "apiKey" | "apiKeyConfigured">>;

export type RuntimeReadinessIssue =
  | { type: "missing_api_key"; provider: LLMProviderType }
  | { type: "missing_base_url"; provider: "openai-compatible" }
  | { type: "missing_model"; provider: LLMProviderType }
  | { type: "unsupported_provider"; provider: string };

export type RuntimeReadiness =
  | { ok: true; selection: RuntimeSelectionLike; modelId: string }
  | { ok: false; issues: RuntimeReadinessIssue[] };

export function resolveRuntimeModelId(
  selection: Pick<RuntimeSelectionLike, "model" | "customModelId">,
): string {
  return selection.model === "custom"
    ? (selection.customModelId ?? "").trim()
    : (selection.model ?? "").trim();
}

export function runtimeProviderRequiresApiKey(
  provider: LLMProviderType,
): boolean {
  return provider !== "ollama" && provider !== "openai-compatible";
}

export function hasRuntimeApiKey(
  selection: Partial<Pick<LLMConfig, "apiKey" | "apiKeyConfigured">>,
): boolean {
  return !!selection.apiKey?.trim() || !!selection.apiKeyConfigured;
}

export function validateRuntimeReadiness(
  selection: RuntimeSelectionLike,
): RuntimeReadiness {
  const issues: RuntimeReadinessIssue[] = [];
  const provider = selection.provider;

  if (!PROVIDER_MODELS[provider]) {
    issues.push({ type: "unsupported_provider", provider });
  }

  const modelId = resolveRuntimeModelId(selection);
  if (!modelId) {
    issues.push({ type: "missing_model", provider });
  }

  if (provider === "openai-compatible" && !selection.baseUrl?.trim()) {
    issues.push({ type: "missing_base_url", provider });
  }

  if (runtimeProviderRequiresApiKey(provider) && !hasRuntimeApiKey(selection)) {
    issues.push({ type: "missing_api_key", provider });
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, selection, modelId };
}

export function runtimeProviderLabel(provider: string): string {
  return PROVIDER_MODELS[provider]?.label ?? provider;
}

export function formatRuntimeReadinessIssue(
  issue: RuntimeReadinessIssue,
): string {
  const errors = getCurrentTranslations().agentMessage.errors;
  const provider = runtimeProviderLabel(issue.provider);
  switch (issue.type) {
    case "missing_api_key":
      return errors.runtimeMissingApiKey.replace("{provider}", provider);
    case "missing_base_url":
      return errors.runtimeMissingBaseUrl;
    case "missing_model":
      return errors.runtimeMissingModel.replace("{provider}", provider);
    case "unsupported_provider":
      return errors.runtimeUnsupportedProvider.replace("{provider}", provider);
  }
}

