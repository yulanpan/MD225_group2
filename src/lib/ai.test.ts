import { afterEach, describe, expect, it, vi } from "vitest";
import {
  callStructuredOutput,
  callStructuredOutputWithRetry,
  fallbackCommentsForLanguage,
  fallbackFinalReportForEnding,
  fallbackFinalReportForLanguage,
  fallbackReactionForLanguage,
  fallbackRewriteForLanguage,
  hasOpenAiKey,
  listOpenAiModels,
  openAiChatStreamWithRetry
} from "./ai";

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

describe("AI helper", () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousBaseUrl = process.env.OPENAI_BASE_URL;
  const previousMode = process.env.OPENAI_PROVIDER_MODE;
  const previousModel = process.env.OPENAI_MODEL;
  const previousMaxOutputTokens = process.env.OPENAI_MAX_OUTPUT_TOKENS;

  afterEach(() => {
    restoreEnv("OPENAI_API_KEY", previousKey);
    restoreEnv("OPENAI_BASE_URL", previousBaseUrl);
    restoreEnv("OPENAI_PROVIDER_MODE", previousMode);
    restoreEnv("OPENAI_MODEL", previousModel);
    restoreEnv("OPENAI_MAX_OUTPUT_TOKENS", previousMaxOutputTokens);
    vi.restoreAllMocks();
  });

  it("detects whether an OpenAI key is configured", () => {
    delete process.env.OPENAI_API_KEY;
    expect(hasOpenAiKey()).toBe(false);
    process.env.OPENAI_API_KEY = "sk-test";
    expect(hasOpenAiKey()).toBe(true);
  });

  it("parses structured output text from a successful response", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({ ok: true })
    }), { status: 200 })));

    await expect(callStructuredOutput<{ ok: boolean }>("test_schema", {
      type: "object",
      properties: { ok: { type: "boolean" } },
      required: ["ok"],
      additionalProperties: false
    }, "Return ok.")).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith("https://ai.exit0.link/v1/responses", expect.any(Object));
  });

  it("repairs simple JSON-like structured output from compatible providers", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: '{message: "宫廷 AI 建议维持官方叙事。"}'
    }), { status: 200 })));

    await expect(callStructuredOutput<{ message: string }>("test_schema", {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
      additionalProperties: false
    }, "Return message.")).resolves.toEqual({ message: "宫廷 AI 建议维持官方叙事。" });
  });

  it("supports custom OpenAI-compatible base URLs and response mode", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPENAI_BASE_URL = "https://ai.example.test";
    process.env.OPENAI_PROVIDER_MODE = "responses";
    process.env.OPENAI_MODEL = "test-model";
    process.env.OPENAI_MAX_OUTPUT_TOKENS = "900";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({ ok: true })
    }), { status: 200 })));

    await expect(callStructuredOutput<{ ok: boolean }>("test_schema", {
      type: "object",
      properties: { ok: { type: "boolean" } },
      required: ["ok"],
      additionalProperties: false
    }, "Return ok.")).resolves.toEqual({ ok: true });

    expect(fetch).toHaveBeenCalledWith("https://ai.example.test/v1/responses", expect.objectContaining({
      body: expect.stringContaining("\"max_output_tokens\":900")
    }));
  });

  it("passes response token limits when configured", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPENAI_MAX_OUTPUT_TOKENS = "800";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({ ok: true })
    }), { status: 200 })));

    await callStructuredOutput<{ ok: boolean }>("test_schema", {
      type: "object",
      properties: { ok: { type: "boolean" } },
      required: ["ok"],
      additionalProperties: false
    }, "Return ok.");

    expect(fetch).toHaveBeenCalledWith("https://ai.exit0.link/v1/responses", expect.objectContaining({
      body: expect.stringContaining("\"max_output_tokens\":800")
    }));
  });

  it("supports chat mode overrides", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPENAI_PROVIDER_MODE = "chat";
    process.env.OPENAI_MAX_OUTPUT_TOKENS = "800";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ ok: true }) } }]
    }), { status: 200 })));

    await callStructuredOutput<{ ok: boolean }>("test_schema", {
      type: "object",
      properties: { ok: { type: "boolean" } },
      required: ["ok"],
      additionalProperties: false
    }, "Return ok.");

    expect(fetch).toHaveBeenCalledWith("https://ai.exit0.link/v1/chat/completions", expect.objectContaining({
      body: expect.stringContaining("\"max_completion_tokens\":800")
    }));
  });

  it("throws a safe error when the provider response fails", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("provider error", { status: 500 })));

    await expect(callStructuredOutput("test_schema", {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    }, "Return JSON.")).rejects.toThrow("OpenAI request failed");
  });

  it("retries transient structured output failures", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response("rate limit", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        output_text: JSON.stringify({ ok: true })
      }), { status: 200 })));

    await expect(callStructuredOutputWithRetry<{ ok: boolean }>("test_schema", {
      type: "object",
      properties: { ok: { type: "boolean" } },
      required: ["ok"],
      additionalProperties: false
    }, "Return ok.", { baseDelayMs: 1 })).resolves.toEqual({ data: { ok: true }, retries: 1 });
  });

  it("opens streaming responses with retry metadata", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      }
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(stream, { status: 200 })));

    const result = await openAiChatStreamWithRetry("Speak.", { baseDelayMs: 1 });
    expect(result.retries).toBe(0);
    expect(result.response.body).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith("https://ai.exit0.link/v1/responses", expect.objectContaining({
      body: expect.stringContaining("\"stream\":true")
    }));
  });

  it("lists models from the configured provider", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPENAI_BASE_URL = "https://ai.example.test/v1";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      data: [{ id: "model-a" }, { id: "model-b" }, {}]
    }), { status: 200 })));

    await expect(listOpenAiModels()).resolves.toEqual(["model-a", "model-b"]);
    expect(fetch).toHaveBeenCalledWith("https://ai.example.test/v1/models", expect.objectContaining({
      headers: { Authorization: "Bearer sk-test" }
    }));
  });

  it("returns localized fallback payloads", () => {
    expect(fallbackReactionForLanguage("zh").engineMessage).toContain("直接证据");
    expect(fallbackRewriteForLanguage("zh").strategy).toContain("宫廷警戒");
    expect(fallbackCommentsForLanguage("zh").comments).toHaveLength(6);
    expect(fallbackFinalReportForLanguage("zh").report).toContain("这一局收在游行前的混乱里");
    expect(fallbackFinalReportForEnding("narrativeLiberation", "zh").report).toContain("这份记录没有再被宫廷收回");
    expect(fallbackFinalReportForEnding("narrativeLiberation", "en").report).toContain("the child's plain sentence remained public");
    expect(fallbackFinalReportForEnding("unstableFeed", "zh")).toEqual(fallbackFinalReportForLanguage("zh"));
  });
});
