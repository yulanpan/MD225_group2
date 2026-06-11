import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as START } from "./start/route";
import { POST as TURN, splitNaturalTextChunks } from "./turn/route";
import { POST as REPLIES } from "./replies/route";
import { POST as RESOLVE } from "./resolve/route";
import { POST as SILENCE } from "./silence/route";
import { initialState } from "@/lib/game-data";
import { fallbackDialogueEvent } from "@/lib/dialogue";

const state = {
  ...initialState,
  history: [
    { actionTitle: "Publish the Tailors' Claim" },
    { actionTitle: "Inspect the Looms" }
  ]
};

describe("dialogue API routes", () => {
  const previousKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = previousKey;
    vi.restoreAllMocks();
  });

  it("splits streamed dialogue into natural smaller chunks without changing text", () => {
    const text = "Signal received. Hold the procession line, but do not let doubt gather in one place.";
    const chunks = splitNaturalTextChunks(text);

    expect(chunks.length).toBeGreaterThan(3);
    expect(chunks.join("")).toBe(text);
    expect(chunks.some((chunk) => chunk.endsWith("."))).toBe(true);
    expect(Math.max(...chunks.map((chunk) => chunk.length))).toBeLessThanOrEqual(18);
  });

  it("starts a fallback dialogue event without an API key", async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await START(new Request("http://localhost/api/dialogue/start", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        state,
        latestActionId: "inspectLooms",
        history: ["Publish the Tailors' Claim", "Inspect the Looms"],
        completedDialogueEventIds: []
      })
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      id: "minister-challenge-2",
      archetype: "ministerChallenge",
      turnLimit: 3
    });
  });

  it("starts the public witness fallback after the fourth action", async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await START(new Request("http://localhost/api/dialogue/start", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        state,
        latestActionId: "requestPrivateNote",
        history: ["a", "b", "c", "d"],
        completedDialogueEventIds: ["minister-challenge-2"]
      })
    }));

    await expect(response.json()).resolves.toMatchObject({
      id: "public-witness-4",
      archetype: "publicWitness"
    });
  });

  it("starts a live dialogue event and pins the server-selected trigger", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        id: "model-id",
        archetype: "engineAudit",
        speakerName: "Minister Voss",
        speakerRole: "Palace pressure envoy",
        openingLine: "Why is the feed encouraging people to inspect the fabric?",
        stakes: "Authority is checking whether the editor remains reliable.",
        mood: { trust: 2, agitation: 6, openness: 2, leverage: 8 },
        quickReplies: [
          { id: "stabilize", label: "I will stabilize it.", playerLine: "I will stabilize it.", intent: "stabilize", moodDelta: { trust: 1, agitation: -1, openness: -1, leverage: 1 } },
          { id: "public", label: "The public should know.", playerLine: "The public should know.", intent: "challenge", moodDelta: { trust: -1, agitation: 1, openness: 1, leverage: -1 } }
        ],
        promptPatch: {
          angle: "ministerial pressure",
          speakerAgenda: "challenge the editor",
          forbiddenFrame: "do not admit fraud",
          pressureLine: "confidence must stay repeatable"
        },
        turnLimit: 3
      }) } }]
    }), { status: 200 })));

    const response = await START(new Request("http://localhost/api/dialogue/start", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        state,
        latestActionId: "inspectLooms",
        history: ["Publish the Tailors' Claim", "Inspect the Looms"],
        completedDialogueEventIds: []
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("live");
    await expect(response.json()).resolves.toMatchObject({
      id: "minister-challenge-2",
      archetype: "ministerChallenge",
      speakerName: "Minister Voss"
    });
  });

  it("falls back when live dialogue start fails", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("provider down", { status: 500 })));
    const response = await START(new Request("http://localhost/api/dialogue/start", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        state,
        latestActionId: "inspectLooms",
        history: ["Publish the Tailors' Claim", "Inspect the Looms"],
        completedDialogueEventIds: []
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({ id: "minister-challenge-2" });
  });

  it("rejects unsafe long player messages", async () => {
    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const response = await TURN(new Request("http://localhost/api/dialogue/turn", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [{ role: "speaker", content: event.openingLine, createdAt: "now" }],
        playerMessage: "x".repeat(281)
      })
    }));

    expect(response.status).toBe(400);
  });

  it("streams a fallback dialogue turn as SSE", async () => {
    delete process.env.OPENAI_API_KEY;
    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const response = await TURN(new Request("http://localhost/api/dialogue/turn", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [{ role: "speaker", content: event.openingLine, createdAt: "now" }],
        playerMessage: "I will stabilize it."
      })
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    const text = await response.text();
    expect(text.match(/event: token/g)?.length).toBeGreaterThan(1);
    expect(text).toContain("event: done");
  });

  it("streams provider dialogue tokens as SSE", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const providerStream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode("data: {\"type\":\"response.output_text.delta\",\"delta\":\"Signal\"}\n\n"));
        controller.enqueue(enc.encode("data: {\"type\":\"response.output_text.delta\",\"delta\":\" received.\"}\n\n"));
        controller.enqueue(enc.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(providerStream, { status: 200 })));
    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const response = await TURN(new Request("http://localhost/api/dialogue/turn", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [{ role: "speaker", content: event.openingLine, createdAt: "now" }],
        playerMessage: "I will stabilize it."
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("live");
    const fetchBody = JSON.parse((vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}") as string);
    expect(fetchBody.temperature).toBe(0.42);
    expect(fetchBody.input[1].content).toContain("Do not invent new scenes, witnesses, inspections, direct observations, garment details, or facts");
    const text = await response.text();
    expect(text).toContain("Signal");
    expect(text).toContain("received.");
    expect(text).toContain("event: done");
  });

  it("generates fallback quick replies without an API key", async () => {
    delete process.env.OPENAI_API_KEY;
    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const transcript = [
      { role: "speaker" as const, content: event.openingLine, createdAt: "now" },
      { role: "player" as const, content: "The public should know.", createdAt: "now" },
      { role: "speaker" as const, content: "The palace needs repeatable confidence.", createdAt: "now" }
    ];
    const response = await REPLIES(new Request("http://localhost/api/dialogue/replies", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript,
        lastSpeakerMessage: transcript.at(-1)?.content
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    const data = await response.json();
    expect(data.quickReplies.map((reply: { label: string }) => reply.label)).toEqual(expect.arrayContaining(["What exactly do you fear?"]));
  });

  it("sanitizes live quick replies and sends hallucination guardrails", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      output_text: JSON.stringify({
        quickReplies: [
          { id: "specifics", label: "Give me specifics.", playerLine: "Give me specifics.", intent: "clarify", moodDelta: { trust: 0, agitation: 0, openness: 1, leverage: -1 } },
          { id: "preserve", label: "<b>I will preserve the record.</b>", playerLine: "I will preserve the record.", intent: "protect", moodDelta: { trust: 1, agitation: -1, openness: 1, leverage: 0 } },
          { id: "specifics-copy", label: "Give me specifics.", playerLine: "Give me specifics.", intent: "clarify", moodDelta: { trust: 0, agitation: 0, openness: 1, leverage: -1 } }
        ]
      })
    }), { status: 200 })));
    const event = fallbackDialogueEvent("engine-audit-risk", "engineAudit", "en");
    const transcript = [
      { role: "speaker" as const, content: event.openingLine, createdAt: "now" }
    ];
    const response = await REPLIES(new Request("http://localhost/api/dialogue/replies", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript,
        lastSpeakerMessage: event.openingLine
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("live");
    const fetchBody = JSON.parse((vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}") as string);
    expect(fetchBody.input[1].content).toContain("Do not invent new evidence");
    const data = await response.json();
    expect(data.quickReplies.map((reply: { label: string }) => reply.label)).toEqual(["Give me specifics.", "I will preserve the record."]);
  });

  it("falls back when provider streaming fails before tokens", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("provider down", { status: 500 })));
    const event = fallbackDialogueEvent("engine-audit-risk", "engineAudit", "en");
    const response = await TURN(new Request("http://localhost/api/dialogue/turn", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [{ role: "speaker", content: event.openingLine, createdAt: "now" }],
        playerMessage: "Keep the evidence visible."
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.text()).resolves.toContain("event: token");
  });

  it("resolves fallback outcomes without an API key", async () => {
    delete process.env.OPENAI_API_KEY;
    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const response = await RESOLVE(new Request("http://localhost/api/dialogue/resolve", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [
          { role: "speaker", content: event.openingLine, createdAt: "now" },
          { role: "player", content: "I will stabilize it.", createdAt: "now" }
        ]
      })
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      outcomeTag: "reassureAuthority",
      summary: expect.any(String)
    });
  });

  it("resolves live dialogue and falls back from invalid outcome tags", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        outcomeTag: "inventedOutcome",
        summary: "The exchange was recorded.",
        feedTitle: "Transmission",
        feedText: "The feed registered the exchange."
      }) } }]
    }), { status: 200 })));
    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const response = await RESOLVE(new Request("http://localhost/api/dialogue/resolve", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [
          { role: "speaker", content: event.openingLine, createdAt: "now" },
          { role: "player", content: "I will stabilize it.", createdAt: "now" }
        ]
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("live");
    await expect(response.json()).resolves.toMatchObject({
      outcomeTag: "reassureAuthority",
      summary: "The exchange was recorded."
    });
  });

  it("does not let live child-guardian resolution suppress a protected original quote", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        outcomeTag: "containNarrative",
        summary: "The guardian accepted anonymity while the spoken fact stayed public.",
        feedTitle: "Incoming Transmission",
        feedText: "The child's name stayed protected, but the record kept the sentence."
      }) } }]
    }), { status: 200 })));
    const event = fallbackDialogueEvent("child-guardian-signal", "childGuardian", "en");
    const response = await RESOLVE(new Request("http://localhost/api/dialogue/resolve", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: { ...initialState, childAmplified: true },
        transcript: [
          { role: "speaker", content: event.openingLine, createdAt: "now" },
          { role: "player", content: "I will protect the name, but keep the fact he spoke.", createdAt: "now" }
        ]
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("live");
    await expect(response.json()).resolves.toMatchObject({
      outcomeTag: "surfaceDoubt",
      summary: "The guardian accepted anonymity while the spoken fact stayed public."
    });
  });

  it("falls back when live dialogue resolve fails", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("provider down", { status: 500 })));
    const event = fallbackDialogueEvent("engine-audit-risk", "engineAudit", "en");
    const response = await RESOLVE(new Request("http://localhost/api/dialogue/resolve", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [
          { role: "speaker", content: event.openingLine, createdAt: "now" },
          { role: "player", content: "Keep the evidence visible.", createdAt: "now" }
        ]
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({ outcomeTag: "increaseSuspicion" });
  });

  it("generates a fallback silence response without fixed copy", async () => {
    delete process.env.OPENAI_API_KEY;
    const event = fallbackDialogueEvent("public-witness-4", "publicWitness", "en");
    const response = await SILENCE(new Request("http://localhost/api/dialogue/silence", {
      method: "POST",
      body: JSON.stringify({
        language: "en",
        event,
        state: initialState,
        transcript: [{ role: "speaker", content: event.openingLine, createdAt: "now" }],
        currentMood: event.mood
      })
    }));

    expect(response.headers.get("X-PNE-AI-Source")).toBe("fallback");
    await expect(response.json()).resolves.toMatchObject({
      speakerMessage: expect.stringContaining("private"),
      moodDelta: expect.objectContaining({ leverage: 2 })
    });
  });
});
