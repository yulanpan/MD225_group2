import { describe, expect, it } from "vitest";
import { aiSourceLabel, normalizeAiSource, pairedAiSourceLabel } from "./ai-source";

describe("AI source labels", () => {
  it("normalizes provider source headers", () => {
    expect(normalizeAiSource("live")).toBe("live");
    expect(normalizeAiSource("fallback")).toBe("fallback");
    expect(normalizeAiSource("unavailable")).toBe("unavailable");
    expect(normalizeAiSource("bad-value")).toBe("fallback");
    expect(normalizeAiSource(null, "live")).toBe("live");
  });

  it("localizes single source labels", () => {
    expect(aiSourceLabel("live", "zh")).toBe("AI 在线");
    expect(aiSourceLabel("fallback", "zh")).toBe("离线回应");
    expect(aiSourceLabel("unavailable", "en")).toBe("NO MODEL");
  });

  it("collapses repeated paired source labels", () => {
    expect(pairedAiSourceLabel("fallback", "fallback", "zh")).toBe("离线回应");
    expect(pairedAiSourceLabel("live", "live", "zh")).toBe("AI 在线");
    expect(pairedAiSourceLabel("live", "fallback", "zh")).toBe("开场：AI 在线 / 回复：离线回应");
    expect(pairedAiSourceLabel("live", "fallback", "en")).toBe("opening: LIVE MODEL / replies: RULE MODE");
  });
});
