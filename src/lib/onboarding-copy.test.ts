import { describe, expect, it } from "vitest";
import {
  forbiddenFreshRunTerms,
  glossaryText,
  guidedStepCopy,
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
});
