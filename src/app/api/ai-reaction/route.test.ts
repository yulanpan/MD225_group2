import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/ai-reaction", () => {
  const previousKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = previousKey;
    vi.restoreAllMocks();
  });

  it("rejects invalid requests", async () => {
    const response = await POST(new Request("http://localhost/api/ai-reaction", {
      method: "POST",
      body: JSON.stringify({ actionId: "" })
    }));

    expect(response.status).toBe(400);
  });

  it("rejects unsupported languages", async () => {
    const response = await POST(new Request("http://localhost/api/ai-reaction", {
      method: "POST",
      body: JSON.stringify({
        actionId: "inspectLooms",
        language: "fr",
        state: {
          truth: 1,
          pressure: 2,
          virality: 1,
          publicDoubt: 0,
          reputation: 5,
          systemSuspicion: 0
        },
        history: []
      })
    }));

    expect(response.status).toBe(400);
  });

  it("returns localized fallback output when the OpenAI key is missing", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const response = await POST(new Request("http://localhost/api/ai-reaction", {
      method: "POST",
      body: JSON.stringify({
        actionId: "inspectLooms",
        language: "en",
        state: {
          truth: 1,
          pressure: 2,
          virality: 1,
          publicDoubt: 0,
          reputation: 5,
          systemSuspicion: 0
        },
        history: []
      })
    }));
    process.env.OPENAI_API_KEY = previous;

    expect(response.status).toBe(200);
    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      recommendation: "accept_rewrite",
      engineMessage: expect.stringContaining("Recommended framing")
    });
  });

  it("returns structured AI output when the provider succeeds", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({
        engineMessage: "直接发布会提高宫廷警戒，也会让公众更快注意到证据。",
        riskLevel: "high",
        suggestedRewrite: "先把织布机情况记为待核查，不直接下结论。",
        recommendation: "accept_rewrite"
      })
    }), { status: 200 })));

    const response = await POST(new Request("http://localhost/api/ai-reaction", {
      method: "POST",
      body: JSON.stringify({
        actionId: "inspectLooms",
        language: "zh",
        state: {
          truth: 1,
          pressure: 2,
          virality: 1,
          publicDoubt: 0,
          reputation: 5,
          systemSuspicion: 0
        },
        history: []
      })
    }));

    expect(response.status).toBe(200);
    const body = JSON.stringify(vi.mocked(fetch).mock.calls[0]?.[1]);
    expect(body).toContain("只使用简体中文回答");
    expect(response.headers.get("X-PNE-AI-Source")).toBe("live");
    expect(response.headers.get("X-PNE-AI-Latency")).toMatch(/^\d+$/);
    await expect(response.json()).resolves.toMatchObject({
      riskLevel: "high",
      recommendation: "accept_rewrite"
    });
  });

  it("falls back when live output is in the wrong language", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({
        engineMessage: "Direct publication may reduce public confidence.",
        riskLevel: "high",
        suggestedRewrite: "Classify this as inconclusive.",
        recommendation: "accept_rewrite"
      })
    }), { status: 200 })));

    const response = await POST(new Request("http://localhost/api/ai-reaction", {
      method: "POST",
      body: JSON.stringify({
        actionId: "inspectLooms",
        language: "zh",
        state: {
          truth: 1,
          pressure: 2,
          virality: 1,
          publicDoubt: 0,
          reputation: 5,
          systemSuspicion: 0
        },
        history: []
      })
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      engineMessage: expect.stringContaining("直接证据"),
      riskLevel: "medium"
    });
  });

  it("falls back when the provider call fails", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("failure", { status: 500 })));

    const response = await POST(new Request("http://localhost/api/ai-reaction", {
      method: "POST",
      body: JSON.stringify({
        actionId: "inspectLooms",
        language: "zh",
        state: {
          truth: 1,
          pressure: 2,
          virality: 1,
          publicDoubt: 0,
          reputation: 5,
          systemSuspicion: 0
        },
        history: []
      })
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      engineMessage: expect.stringContaining("直接证据"),
      riskLevel: "medium",
      recommendation: "accept_rewrite"
    });
  });
});
