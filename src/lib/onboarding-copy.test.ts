import { describe, expect, it } from "vitest";
import {
  forbiddenFreshRunTerms,
  glossaryText,
  guidedStepCopy,
  onboardingTourSteps,
  tutorialSteps
} from "./onboarding-copy";
import { metricLabel } from "./i18n";

function expectFreshCopySafe(text: string) {
  for (const term of forbiddenFreshRunTerms) {
    expect(text.toLowerCase()).not.toContain(term.toLowerCase());
  }
}

describe("onboarding copy", () => {
  it("keeps fresh first-run guidance free of hidden objective spoilers", () => {
    for (const language of ["en", "zh"] as const) {
      for (const step of ["firstTurn", "publicSignals", "systemSuspicion", "fullControl"] as const) {
        const copy = guidedStepCopy(step, language, false);
        expectFreshCopySafe(`${copy.label} ${copy.title} ${copy.body} ${copy.action}`);
      }
    }
  });

  it("keeps broad tutorial and early engine glossary operational", () => {
    for (const language of ["en", "zh"] as const) {
      for (const step of tutorialSteps(language)) {
        expectFreshCopySafe(`${step.eyebrow} ${step.title} ${step.body}`);
      }
      expectFreshCopySafe(glossaryText("pne", language));
    }
  });

  it("uses precise spotlight targets without old proxy coach commands", () => {
    const removedProxyCopy = [
      "Highlight target area",
      "Continue the shift",
      "高亮目标区域",
      "继续完成本局",
      "arrow",
      "arrowed",
      "lit",
      "real control",
      "exact button",
      "target area",
      "tutorial continues",
      "箭头",
      "被照亮",
      "真实控件",
      "真正要点击",
      "目标区",
      "教程会继续"
    ];

    for (const language of ["en", "zh"] as const) {
      const steps = onboardingTourSteps(language);
      expect(steps).toHaveLength(12);
      expect(new Set(steps.map((step) => step.surface))).toEqual(new Set(["dashboard", "trace", "command", "dialogue"]));
      expect(steps.map((step) => step.spotlightTargetId)).toEqual([
        "role-card",
        "source-tailors",
        "card-publishTailorsClaim",
        "trace-panel",
        "card-publishTailorsClaim",
        "command-panel",
        "metrics-grid",
        "source-public",
        "card-showUnfilteredComments",
        "command-panel",
        "dialogue-panel",
        "dialogue-panel"
      ]);
      expect(steps.find((step) => step.id === "inspectTrace")).toMatchObject({
        spotlightTargetId: "card-publishTailorsClaim",
        actionTargetId: "action-publishTailorsClaim-inspect",
        advanceOn: "traceOpened"
      });
      expect(steps.find((step) => step.id === "commitFirstRecord")).toMatchObject({
        spotlightTargetId: "card-publishTailorsClaim",
        actionTargetId: "action-publishTailorsClaim-commit",
        advanceOn: "commandOpened"
      });
      expect(steps.find((step) => step.id === "dialogueOverview")).toMatchObject({
        surface: "dialogue",
        actionTargetId: "dialogue-reply",
        advanceOn: "dialogueReplySent"
      });
      expect(steps.find((step) => step.id === "metricSummary")).toMatchObject({
        spotlightTargetId: "metrics-grid",
        advanceOn: "next"
      });
      for (const step of steps) {
        const fullCopy = `${step.eyebrow} ${step.title} ${step.body} ${step.detail} ${step.why ?? ""} ${step.actionLabel ?? ""}`;
        expectFreshCopySafe(fullCopy);
        for (const proxyCopy of removedProxyCopy) {
          if (/^[a-z ]+$/i.test(proxyCopy)) {
            expect(fullCopy).not.toMatch(new RegExp(`\\b${proxyCopy.replaceAll(" ", "\\s+")}\\b`, "i"));
          } else {
            expect(fullCopy).not.toContain(proxyCopy);
          }
        }
      }
    }
  });

  it("keeps Chinese tutorial copy in player language without English UI labels", () => {
    const forbiddenChineseTutorialTerms = [
      "Requirement",
      "Available",
      "Risk",
      "Projected Output",
      "readout",
      "Selected Action",
      "System Response",
      "Stakes",
      "Metric focus",
      "Inspect Trace",
      "Commit Action",
      "Command Preview",
      "Commit Simulation"
    ];

    const steps = onboardingTourSteps("zh");
    for (const step of steps) {
      const fullCopy = `${step.eyebrow} ${step.title} ${step.body} ${step.detail} ${step.why ?? ""} ${step.actionLabel ?? ""}`;
      for (const term of forbiddenChineseTutorialTerms) {
        expect(fullCopy).not.toContain(term);
      }
    }
  });

  it("keeps metric names stable while explaining pressure and alert distinctly", () => {
    expect(metricLabel("pressure", "zh")).toBe("宫廷压力");
    expect(metricLabel("reputation", "zh")).toBe("你的安全");
    expect(metricLabel("systemSuspicion", "zh")).toBe("宫廷警戒");
    expect(metricLabel("pressure", "en")).toBe("Palace Pressure");
    expect(metricLabel("reputation", "en")).toBe("Safety");
    expect(metricLabel("systemSuspicion", "en")).toBe("Palace Alert");

    const zhGuide = guidedStepCopy("systemSuspicion", "zh", false).body;
    expect(zhGuide).toContain("宫廷开始注意你本人");
    expect(zhGuide).toContain("可能限制");
    expect(zhGuide).toContain("发布权");

    const zhSummary = tutorialSteps("zh").find((step) => step.id === "metrics")?.body ?? "";
    expect(zhSummary).toContain("宫廷压力看宫廷说法压住别人");
    expect(zhSummary).toContain("宫廷警戒看宫廷是否开始盯上你");

    const enSummary = tutorialSteps("en").find((step) => step.id === "metrics")?.body ?? "";
    expect(enSummary).toContain("Palace Pressure suppresses disagreement");
    expect(enSummary).toContain("Palace Alert means the palace is watching you");
  });
});
