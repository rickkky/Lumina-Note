import { describe, expect, it } from "vitest";

import { classifyProviderRuntimeError } from "./provider-runtime-error";

describe("classifyProviderRuntimeError", () => {
  it("classifies invalid API keys", () => {
    expect(
      classifyProviderRuntimeError({
        response: { status: 401 },
        data: { message: "Incorrect API key provided" },
      }),
    ).toEqual({ type: "auth_failed" });
  });

  it("classifies quota exhaustion separately from rate limits", () => {
    expect(
      classifyProviderRuntimeError(
        "insufficient_quota: You exceeded your current quota",
      ),
    ).toEqual({ type: "quota_exhausted" });
  });

  it("keeps retry-after seconds for rate limits", () => {
    expect(
      classifyProviderRuntimeError({
        response: {
          status: 429,
          headers: { "retry-after": "12" },
        },
      }),
    ).toEqual({ type: "rate_limited", retryAfterSeconds: 12 });
  });

  it("classifies missing models", () => {
    expect(
      classifyProviderRuntimeError(
        "HTTP 404 error: model 'gpt-unknown' does not exist",
      ),
    ).toEqual({ type: "model_not_found" });
  });

  it("classifies context length failures", () => {
    expect(
      classifyProviderRuntimeError("context_length_exceeded: too many tokens"),
    ).toEqual({ type: "context_too_large" });
  });
});

