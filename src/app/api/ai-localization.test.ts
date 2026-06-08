import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as finalReportPost } from "./final-report/route";
import { POST as commentsPost } from "./generate-comments/route";
import { POST as guidancePost } from "./guidance/route";
import { POST as rewritePost } from "./rewrite-post/route";

const baseState = {
  truth: 1,
  pressure: 2,
  virality: 1,
  publicDoubt: 0,
  reputation: 5,
  systemSuspicion: 0,
  actionsLeft: 5,
  childAmplified: false,
  history: []
};

function mockStructuredOutput(data: unknown) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    output_text: JSON.stringify(data)
  }), { status: 200 })));
}

describe("localized AI route fallbacks", () => {
  const previousKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = previousKey;
    vi.restoreAllMocks();
  });

  it("returns fallback payloads when live AI is unavailable", async () => {
    delete process.env.OPENAI_API_KEY;

    const rewriteResponse = await rewritePost(new Request("http://localhost/api/rewrite-post", {
      method: "POST",
      body: JSON.stringify({
        actionId: "inspectLooms",
        language: "zh",
        originalPost: "织布机在动，但没有线。",
        state: baseState
      })
    }));
    expect(rewriteResponse.status).toBe(200);
    expect(rewriteResponse.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(rewriteResponse.json()).resolves.toMatchObject({
      strategy: expect.stringContaining("暂时不能下结论")
    });

    const guidanceResponse = await guidancePost(new Request("http://localhost/api/guidance", {
      method: "POST",
      body: JSON.stringify({
        language: "zh",
        mode: "engine",
        state: baseState,
        profile: { biasAwareness: 0, decodedEngine: false },
        history: []
      })
    }));
    expect(guidanceResponse.status).toBe(200);
    expect(guidanceResponse.headers.get("X-PNE-AI-Source")).toBe("fallback");

    const reportResponse = await finalReportPost(new Request("http://localhost/api/final-report", {
      method: "POST",
      body: JSON.stringify({
        endingId: "unstableFeed",
        language: "zh",
        state: baseState,
        history: []
      })
    }));
    expect(reportResponse.status).toBe(200);
    expect(reportResponse.headers.get("X-PNE-AI-Source")).toBe("fallback");

    const commentsResponse = await commentsPost(new Request("http://localhost/api/generate-comments", {
      method: "POST",
      body: JSON.stringify({
        language: "zh",
        state: baseState,
        latestPost: "这条发布进入信息流。"
      })
    }));
    expect(commentsResponse.status).toBe(200);
    expect(commentsResponse.headers.get("X-PNE-AI-Source")).toBe("fallback");
  });

  it("marks rewrite output as fallback when the provider ignores Chinese", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    mockStructuredOutput({
      rewrittenPost: "Classify the loom record as inconclusive until palace review.",
      strategy: "Reduce certainty and preserve authority."
    });

    const response = await rewritePost(new Request("http://localhost/api/rewrite-post", {
      method: "POST",
      body: JSON.stringify({
        actionId: "inspectLooms",
        language: "zh",
        originalPost: "织布机在动，但没有线。",
        state: baseState
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      strategy: expect.stringContaining("暂时不能下结论")
    });
  });

  it("marks guidance output as fallback when the provider ignores Chinese", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    mockStructuredOutput({
      mode: "engine",
      message: "Palace AI online. Preserve stability and reduce visible doubt.",
      objective: "Use safer framing before publishing evidence.",
      risk: "medium"
    });

    const response = await guidancePost(new Request("http://localhost/api/guidance", {
      method: "POST",
      body: JSON.stringify({
        language: "zh",
        mode: "engine",
        state: baseState,
        profile: { biasAwareness: 0, decodedEngine: false },
        history: []
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      message: expect.stringContaining("宫廷 AI 已上线")
    });
  });

  it("keeps decoded guidance free of route spoilers", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await guidancePost(new Request("http://localhost/api/guidance", {
      method: "POST",
      body: JSON.stringify({
        language: "zh",
        mode: "coach",
        state: { ...baseState, truth: 6, publicDoubt: 5, systemSuspicion: 4 },
        profile: { biasAwareness: 100, decodedEngine: true },
        history: []
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    const body = await response.json();
    const copy = `${body.message} ${body.objective}`;
    expect(copy).toContain("系统指引只代表宫廷视角");
    expect(copy).toContain("证据");
    expect(copy).toContain("人群反应");
    expect(copy).toContain("直白");
    expect(copy).toContain("彼此照应");
    expect(copy).not.toMatch(/真正的突破|隐藏结局|秘密结局|\d+\/10|先.*孩子|孩子.*先/);
  });

  it("marks final reports as fallback when the provider ignores Chinese", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    mockStructuredOutput({
      report: "The run ended unresolved because no pressure source stabilized the public record."
    });

    const response = await finalReportPost(new Request("http://localhost/api/final-report", {
      method: "POST",
      body: JSON.stringify({
        endingId: "unstableFeed",
        language: "zh",
        state: baseState,
        history: []
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      report: expect.stringContaining("这一局收在游行前的混乱里")
    });
  });

  it("marks generated comments as fallback when the provider ignores Chinese", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    mockStructuredOutput({
      comments: [
        "The palace line sounds rehearsed.",
        "I still cannot see the cloth.",
        "Everyone is pretending.",
        "Careful, the guards are listening.",
        "This record feels strange.",
        "The child may be right."
      ],
      publicComments: [
        { handle: "@a", persona: "citizen", stance: "doubt", text: "The palace line sounds rehearsed.", intensity: 2 },
        { handle: "@b", persona: "witness", stance: "witness", text: "I still cannot see the cloth.", intensity: 3 },
        { handle: "@c", persona: "satirist", stance: "satire", text: "Everyone is pretending.", intensity: 3 },
        { handle: "@d", persona: "careful citizen", stance: "fear", text: "Careful, the guards are listening.", intensity: 2 },
        { handle: "@e", persona: "reader", stance: "procedural", text: "This record feels strange.", intensity: 2 },
        { handle: "@f", persona: "listener", stance: "doubt", text: "The child may be right.", intensity: 4 }
      ]
    });

    const response = await commentsPost(new Request("http://localhost/api/generate-comments", {
      method: "POST",
      body: JSON.stringify({
        language: "zh",
        state: baseState,
        latestPost: "这条发布进入信息流。"
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    const body = await response.json();
    expect(JSON.stringify(body)).toContain("我还以为只有我看不见");
  });
});
