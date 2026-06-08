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

async function requestGuidance(body: Record<string, unknown>) {
  const response = await guidancePost(new Request("http://localhost/api/guidance", {
    method: "POST",
    body: JSON.stringify({
      language: "zh",
      mode: "engine",
      state: baseState,
      profile: { biasAwareness: 0, decodedEngine: false },
      history: [],
      ...body
    })
  }));
  const payload = await response.json();
  return { response, payload, copy: `${payload.message} ${payload.objective}` };
}

function expectGuidanceCopyConcrete(copy: string) {
  expect(copy).not.toMatch(/系统建议与实际反馈|稳定口径|stable frame|actual feedback|stable narratives/i);
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
      strategy: expect.stringContaining("宫廷警戒")
    });

    const { response: guidanceResponse, copy: guidanceCopy } = await requestGuidance({});
    expect(guidanceResponse.status).toBe(200);
    expect(guidanceResponse.headers.get("X-PNE-AI-Source")).toBe("fallback");
    expect(guidanceCopy).toContain("宫廷警戒");
    expect(guidanceCopy).toContain("你的安全");
    expectGuidanceCopyConcrete(guidanceCopy);

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
      strategy: expect.stringContaining("宫廷警戒")
    });
  });

  it("marks guidance output as fallback when the provider ignores Chinese", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    mockStructuredOutput({
      mode: "engine",
      message: "Palace AI online. Preserve stability and reduce visible doubt.",
      objective: "Use cautious wording before publishing evidence.",
      risk: "medium"
    });

    const { response, payload, copy } = await requestGuidance({});

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    expect(payload).toMatchObject({ message: expect.stringContaining("宫廷 AI 已上线") });
    expect(copy).toContain("宫廷警戒");
    expectGuidanceCopyConcrete(copy);
  });

  it("normalizes single-field guidance output from compatible providers", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    mockStructuredOutput({
      guidance: "宫廷 AI 建议维持官方叙事，避免引入未经认证的细节。"
    });

    const { response, payload, copy } = await requestGuidance({});

    expect(response.headers.get("X-PNE-AI-Source")).toBe("live");
    expect(payload).toMatchObject({
      mode: "engine",
      message: expect.stringContaining("宫廷 AI 建议维持官方叙事"),
      objective: expect.stringContaining("你的安全"),
      risk: "low"
    });
    expect(payload).not.toHaveProperty("guidance");
    expectGuidanceCopyConcrete(copy);
  });

  it("uses concrete palace metric language across guidance fallback modes", async () => {
    delete process.env.OPENAI_API_KEY;

    const defaultGuidance = await requestGuidance({});
    expect(defaultGuidance.copy).toContain("宫廷警戒");
    expect(defaultGuidance.copy).toContain("你的安全");
    expectGuidanceCopyConcrete(defaultGuidance.copy);

    const coachGuidance = await requestGuidance({ mode: "coach" });
    expect(coachGuidance.copy).toContain("证据");
    expect(coachGuidance.copy).toContain("怀疑");
    expect(coachGuidance.copy).toContain("宫廷警戒");
    expectGuidanceCopyConcrete(coachGuidance.copy);

    const biasGuidance = await requestGuidance({ profile: { biasAwareness: 60, decodedEngine: false } });
    expect(biasGuidance.copy).toContain("证据");
    expect(biasGuidance.copy).toContain("群众怀疑");
    expect(biasGuidance.copy).toContain("宫廷警戒");
    expectGuidanceCopyConcrete(biasGuidance.copy);
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
    expect(copy).toContain("宫廷指引带着宫廷视角");
    expect(copy).toContain("证据");
    expect(copy).toContain("人群反应");
    expect(copy).toContain("直白");
    expect(copy).toContain("互相照应");
    expectGuidanceCopyConcrete(copy);
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
