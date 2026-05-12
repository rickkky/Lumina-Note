import { describe, expect, it, vi } from "vitest";

vi.mock("@/stores/useLocaleStore", () => ({
  getCurrentTranslations: () => ({
    agentMessage: {
      errors: {
        runtimeMissingApiKey: "{provider} needs an API key",
        runtimeMissingBaseUrl: "OpenAI Compatible needs a Base URL",
        runtimeMissingModel: "{provider} needs a model",
        runtimeUnsupportedProvider: "Unsupported provider: {provider}",
      },
    },
  }),
}));

import {
  formatRuntimeReadinessIssue,
  validateRuntimeReadiness,
} from "./runtime-readiness";

describe("runtime readiness", () => {
  it("requires API keys for first-party hosted providers", () => {
    expect(
      validateRuntimeReadiness({
        provider: "openai",
        model: "gpt-5.5",
        apiKey: "",
        apiKeyConfigured: false,
      }),
    ).toEqual({
      ok: false,
      issues: [{ type: "missing_api_key", provider: "openai" }],
    });
  });

  it("allows OpenAI Compatible without an API key when base URL and model are present", () => {
    expect(
      validateRuntimeReadiness({
        provider: "openai-compatible",
        model: "custom",
        customModelId: "local-model",
        baseUrl: "http://localhost:1234/v1",
        apiKey: "",
        apiKeyConfigured: false,
      }),
    ).toMatchObject({ ok: true, modelId: "local-model" });
  });

  it("requires OpenAI Compatible base URL separately from API key", () => {
    expect(
      validateRuntimeReadiness({
        provider: "openai-compatible",
        model: "custom",
        customModelId: "local-model",
        apiKey: "",
        apiKeyConfigured: false,
      }),
    ).toEqual({
      ok: false,
      issues: [{ type: "missing_base_url", provider: "openai-compatible" }],
    });
  });

  it("formats readiness issues with provider labels", () => {
    expect(
      formatRuntimeReadinessIssue({
        type: "missing_api_key",
        provider: "openai",
      }),
    ).toBe("OpenAI needs an API key");
  });
});

