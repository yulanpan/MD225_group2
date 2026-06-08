import { describe, expect, it } from "vitest";
import { hasWrongLanguageText, sourceForLocalizedPayload } from "./language-guard";

describe("language guard", () => {
  it("allows short technical terms in Chinese UI copy", () => {
    expect(hasWrongLanguageText("宫廷 AI 已上线。PNE 正在读取风险。", "zh")).toBe(false);
  });

  it("detects English sentences in Chinese payloads", () => {
    expect(hasWrongLanguageText("Direct publication may reduce public confidence.", "zh")).toBe(true);
    expect(sourceForLocalizedPayload({ report: "The final record stayed unresolved." }, "zh")).toBe("fallback");
  });

  it("detects Chinese sentences in English payloads", () => {
    expect(hasWrongLanguageText({ message: "宫廷 AI 建议你换成更安全的说法。" }, "en")).toBe(true);
  });
});
