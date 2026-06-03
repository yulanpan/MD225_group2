import { describe, expect, it } from "vitest";
import { initialState } from "./game-data";
import { performAction } from "./game-rules";
import {
  getGuidedCampaignStep,
  getGuidedTarget,
  getLockedMetricsForGuidedStep,
  getLockedZonesForGuidedStep,
  getUnlockEvents,
  isGuidedCampaignActive,
  visibleMetricsForGuidedStep,
  visibleZonesForGuidedStep
} from "./guided-campaign";
import { createEmptyProfile } from "./profile";
import type { PlayerProfile, RunRecord } from "./types";

function completedProfile(): PlayerProfile {
  const run: RunRecord = {
    id: "run-a",
    completedAt: "2026-05-20T00:00:00.000Z",
    endingId: "unstableFeed",
    language: "en",
    finalMetrics: {
      truth: 0,
      pressure: 0,
      virality: 0,
      publicDoubt: 0,
      reputation: 0,
      systemSuspicion: 0
    },
    actionPath: [],
    dialogueCount: 0,
    achievementsUnlocked: []
  };
  return { ...createEmptyProfile(), runs: [run] };
}

describe("guided first-run campaign", () => {
  it("activates only for a fresh undecoded profile", () => {
    expect(isGuidedCampaignActive(createEmptyProfile())).toBe(true);
    expect(isGuidedCampaignActive(completedProfile())).toBe(false);
    expect(isGuidedCampaignActive({ ...createEmptyProfile(), decodedEngine: true, biasAwareness: 100 })).toBe(false);
  });

  it("starts with a visible but sealed dashboard", () => {
    const profile = createEmptyProfile();
    const step = getGuidedCampaignStep(initialState, profile);

    expect(step).toBe("firstTurn");
    expect(visibleZonesForGuidedStep(step)).toEqual(["tailors"]);
    expect(getLockedZonesForGuidedStep(step)).toEqual(["ministers", "public", "child"]);
    expect(visibleMetricsForGuidedStep(step)).toEqual(["truth", "pressure", "reputation"]);
    expect(getLockedMetricsForGuidedStep(step)).toEqual(["virality", "publicDoubt", "systemSuspicion"]);
    expect(getGuidedTarget(step)).toMatchObject({ zoneId: "tailors", actionId: "publishTailorsClaim" });
  });

  it("unlocks public signals after the first committed action", () => {
    const profile = createEmptyProfile();
    const first = performAction(initialState, "publishTailorsClaim", "direct");
    const step = getGuidedCampaignStep(first, profile);

    expect(step).toBe("publicSignals");
    expect(visibleZonesForGuidedStep(step)).toEqual(["tailors", "ministers", "public"]);
    expect(getLockedZonesForGuidedStep(step)).toEqual(["child"]);
    expect(visibleMetricsForGuidedStep(step)).toEqual(["truth", "pressure", "virality", "publicDoubt", "reputation"]);
    expect(getLockedMetricsForGuidedStep(step)).toEqual(["systemSuspicion"]);
    expect(getGuidedTarget(step)).toMatchObject({ zoneId: "public", actionId: "showUnfilteredComments" });
    expect(getUnlockEvents("firstTurn", step).map((event) => event.id)).toEqual([
      "ministers",
      "public",
      "virality",
      "publicDoubt"
    ]);
  });

  it("reveals system suspicion before full control", () => {
    const profile = createEmptyProfile();
    const first = performAction(initialState, "publishTailorsClaim", "direct");
    const second = performAction(first, "showUnfilteredComments", "direct");
    const step = getGuidedCampaignStep(second, profile);

    expect(step).toBe("systemSuspicion");
    expect(visibleMetricsForGuidedStep(step)).toContain("systemSuspicion");
    expect(getGuidedTarget(step)).toMatchObject({ tourId: "engine" });
    expect(getUnlockEvents("publicSignals", step).map((event) => event.id)).toEqual(["systemSuspicion", "dialogue"]);
  });

  it("returns full control by the third committed action or for experienced profiles", () => {
    const profile = createEmptyProfile();
    const first = performAction(initialState, "publishTailorsClaim", "direct");
    const second = performAction(first, "showUnfilteredComments", "direct");
    const third = performAction(second, "approveMinisterReport", "direct");

    expect(getGuidedCampaignStep(third, profile)).toBe("fullControl");
    expect(getGuidedCampaignStep(initialState, completedProfile())).toBe("off");
    expect(visibleZonesForGuidedStep("fullControl")).toEqual(["tailors", "ministers", "public", "child"]);
    expect(getLockedMetricsForGuidedStep("fullControl")).toEqual([]);
  });
});
