import { describe, expect, it } from "vitest";
import {
  forbiddenFreshRunTerms,
  glossaryText,
  guidedStepCopy,
  onboardingTourSteps,
  tutorialSteps
} from "./onboarding-copy";

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
      expect(steps.length).toBeGreaterThanOrEqual(30);
      expect(new Set(steps.map((step) => step.surface))).toEqual(new Set(["dashboard", "trace", "command", "dialogue"]));
      expect(steps.map((step) => step.spotlightTargetId).slice(0, 9)).toEqual([
        "role-card",
        "source-tailors",
        "card-publishTailorsClaim",
        "card-publishTailorsClaim",
        "trace-panel",
        "trace-requirement",
        "trace-risk",
        "trace-output",
        "card-publishTailorsClaim"
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
      expect(steps.find((step) => step.id === "dialogueReply")).toMatchObject({
        surface: "dialogue",
        actionTargetId: "dialogue-reply",
        advanceOn: "dialogueReplySent"
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
});
