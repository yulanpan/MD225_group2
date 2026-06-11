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
  fallbackFinalReportTextForEnding,
  fallbackFinalReportText,
  fallbackReactionText,
  fallbackRewriteText,
  initialCommentsText,
  initialFeedEventText,
  isLanguageCode,
  languageName,
  localizedActionTitle,
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
    expect(localizedActionTitle("publishTailorsClaim", "en", "发布裁缝声明")).toBe("Publish the Tailors' Claim");
    expect(localizedActionTitle("missing-action", "zh", "旧标题")).toBe("旧标题");
    expect(zoneText("child", "zh").title).toBe("孩子的声音");
    expect(metricLabel("truth", "zh")).toBe("证据");
    expect(metricLabel("pressure", "zh")).toBe("宫廷压力");
    expect(metricLabel("publicDoubt", "zh")).toBe("群众怀疑");
    expect(metricLabel("reputation", "zh")).toBe("你的安全");
    expect(metricLabel("systemSuspicion", "zh")).toBe("宫廷警戒");
    expect(commonText("startShift", "zh")).toBe("开始游戏");
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
    expect(copy.title).toBe("真话传开");
    expect(copy.headline).toBe("游行开始前，真话已经传开。");
    expect(endingText("unstableFeed", "en").headline).toBe("The parade begins with no stable story.");
    expect(commonText("archiveHeading", "zh")).not.toContain("界面成为历史");
    expect(initialState.actionsLeft).toBe(6);
  });

  it("covers AI language instructions, fallbacks, and comment tone variants", () => {
    expect(aiLanguageInstruction("en")).toContain("English");
    expect(aiLanguageInstruction("zh")).toContain("简体中文");
    expect(fallbackReactionText("zh").engineMessage).toContain("直接证据");
    expect(fallbackRewriteText("zh").strategy).toContain("宫廷允许");
    expect(fallbackRewriteText("zh").strategy).toContain("宫廷警戒");
    expect(fallbackCommentsText("zh")).toHaveLength(6);
    expect(fallbackFinalReportText("zh")).toContain("这一局收在游行前的混乱里");
    expect(fallbackFinalReportTextForEnding("narrativeLiberation", "zh")).toContain("证据留在页面上");
    expect(fallbackFinalReportTextForEnding("unstableFeed", "zh")).toBe(fallbackFinalReportText("zh"));
    expect(initialCommentsText("zh")).toHaveLength(6);
    expect(initialFeedEventText("zh").title).toBe("游戏已开始");
    expect(commentsForToneText("praise", "zh")[0]).toContain("愚人");
    expect(commentsForToneText("child", "zh")[0]).toContain("没穿");
    expect(commentsForToneText("conflicted", "zh")[0]).toContain("华丽");
    expect(commentsForToneText(undefined, "zh")[0]).toContain("等等");
  });

  it("throws when action copy is missing", () => {
    expect(() => actionText("missing", "en")).toThrow("Missing action copy");
  });
});
