import { describe, expect, it } from "vitest";
import { initialState } from "./game-data";
import {
  actionText,
  aiLanguageInstruction,
  choiceText,
  commonText,
  commentsForToneText,
  endingText,
  engineStatusText,
  fallbackCommentsText,
  fallbackFinalReportText,
  fallbackReactionText,
  fallbackRewriteText,
  initialCommentsText,
  initialFeedEventText,
  isLanguageCode,
  languageName,
  lockReasonText,
  metricLabel,
  normalizeLanguage,
  phaseCopy,
  pollResultText,
  riskBandText,
  stanceText,
  zoneText
} from "./i18n";

describe("i18n helpers", () => {
  it("validates and names supported languages", () => {
    expect(isLanguageCode("en")).toBe(true);
    expect(isLanguageCode("zh")).toBe(true);
    expect(isLanguageCode("fr")).toBe(false);
    expect(languageName("en")).toBe("EN");
    expect(languageName("zh")).toBe("中文");
    expect(normalizeLanguage("zh")).toBe("zh");
    expect(normalizeLanguage("bad")).toBe("en");
  });

  it("returns localized action, zone, metric, and common UI text", () => {
    expect(actionText("publishTailorsClaim", "en").title).toBe("Publish the Tailors' Claim");
    expect(actionText("publishTailorsClaim", "zh").title).toBe("发布裁缝声明");
    expect(zoneText("child", "zh").title).toBe("孩子的声音");
    expect(metricLabel("truth", "zh")).toBe("证据");
    expect(metricLabel("pressure", "zh")).toBe("宫廷压力");
    expect(metricLabel("publicDoubt", "zh")).toBe("人群起疑");
    expect(metricLabel("reputation", "zh")).toBe("你的安全");
    expect(metricLabel("systemSuspicion", "zh")).toBe("被盯上");
    expect(commonText("startShift", "zh")).toBe("开始值班");
    expect(commonText("aiFallback", "en")).toBe("RULE MODE");
    expect(commonText("aiFallback", "zh")).toBe("离线回应");
    expect(phaseCopy("scanning", "zh").label).toBe("先看后果");
    expect(choiceText("direct", "zh")).toBe("直接发布");
    expect(choiceText("rewrite", "zh")).toBe("接受改写");
    expect(choiceText("original", "zh")).toBe("发布原文");
    expect(lockReasonText("requiresLooms", "zh")).toContain("检查织布机");
    expect(pollResultText("safe", "zh")).toContain("82%");
  });

  it("localizes UI enum labels used by dashboard, archive, and ending screens", () => {
    expect(riskBandText("low", "zh")).toBe("低");
    expect(riskBandText("medium", "zh")).toBe("中");
    expect(riskBandText("high", "zh")).toBe("高");
    expect(riskBandText("severe", "zh")).toBe("极高");
    expect(stanceText("procedural", "zh")).toBe("观望");
    expect(stanceText("witness", "zh")).toBe("目击");
    expect(engineStatusText("idle", "zh")).toBe("就绪");
    expect(engineStatusText("rewriting", "zh")).toBe("改写中");
    expect(engineStatusText("commenting", "zh")).toBe("生成评论");
  });

  it("returns localized ending copy without changing state", () => {
    const copy = endingText("viralCollapse", "zh");
    expect(copy.title).toBe("真话失控传播");
    expect(initialState.actionsLeft).toBe(6);
  });

  it("covers AI language instructions, fallbacks, and comment tone variants", () => {
    expect(aiLanguageInstruction("en")).toContain("English");
    expect(aiLanguageInstruction("zh")).toContain("简体中文");
    expect(fallbackReactionText("zh").engineMessage).toContain("直接证据");
    expect(fallbackRewriteText("zh").strategy).toContain("暂时不能下结论");
    expect(fallbackCommentsText("zh")).toHaveLength(4);
    expect(fallbackFinalReportText("zh")).toContain("本局没有形成单一结果");
    expect(initialCommentsText("zh")).toHaveLength(4);
    expect(initialFeedEventText("zh").title).toBe("值班已开启");
    expect(commentsForToneText("praise", "zh")[0]).toContain("愚人");
    expect(commentsForToneText("child", "zh")[0]).toContain("没穿");
    expect(commentsForToneText("conflicted", "zh")[0]).toContain("华丽");
    expect(commentsForToneText(undefined, "zh")[0]).toContain("等等");
  });

  it("throws when action copy is missing", () => {
    expect(() => actionText("missing", "en")).toThrow("Missing action copy");
  });
});
