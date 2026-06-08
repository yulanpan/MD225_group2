import { describe, expect, it } from "vitest";
import { aiSourceLabel, combinedAiSourceLabel, normalizeAiSource } from "./ai-source";

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

  it("summarizes multiple dialogue source labels into one badge", () => {
    expect(combinedAiSourceLabel(["fallback", "fallback"], "zh")).toBe("离线回应");
    expect(combinedAiSourceLabel(["live", "live"], "zh")).toBe("AI 在线");
    expect(combinedAiSourceLabel(["live", "fallback"], "zh")).toBe("AI 在线");
    expect(combinedAiSourceLabel(["fallback", "unavailable"], "en")).toBe("RULE MODE");
    expect(combinedAiSourceLabel(["unavailable", "unavailable"], "zh")).toBe("AI 未连接");
  });
});
