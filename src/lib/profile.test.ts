import { describe, expect, it } from "vitest";
import { initialState } from "./game-data";
import { performAction } from "./game-rules";
import {
  createEmptyProfile,
  engineFragmentDefinitions,
  evaluateAchievements,
  evaluateEngineFragments,
  loadProfileFromStorage,
  mergeEngineFragmentUnlocks,
  mergeAchievementUnlocks,
  recordCompletedRun,
  secretEndingEligible
} from "./profile";

describe("player profile and achievements", () => {
  it("loads bad or missing profile data defensively", () => {
    expect(loadProfileFromStorage(null)).toEqual(createEmptyProfile());
    expect(loadProfileFromStorage("bad-json")).toEqual(createEmptyProfile());
    expect(loadProfileFromStorage(JSON.stringify({ achievements: "bad", runs: "bad" }))).toEqual(createEmptyProfile());
  });

  it("evaluates gameplay achievements from the current state", () => {
    const inspected = performAction(initialState, "inspectLooms", "direct");
    const leaked = performAction(inspected, "leakLoomPhoto", "original");

    expect(evaluateAchievements({ ...leaked, publicDoubt: 6, dialogueEvents: [{ event: {} as never, transcript: [], outcomeTag: "noEffect", effects: {}, summary: "" }] })).toEqual(
      expect.arrayContaining(["firstShift", "rawEvidence", "dialogueHandler", "publicBreach"])
    );
  });

  it("merges achievement unlocks without duplicating existing awards", () => {
    const now = "2026-05-20T00:00:00.000Z";
    const first = mergeAchievementUnlocks(createEmptyProfile(), ["firstShift", "rawEvidence"], "run-a", now);
    const second = mergeAchievementUnlocks(first.profile, ["firstShift", "dialogueHandler"], "run-a", now);

    expect(first.newUnlocks.map((item) => item.id)).toEqual(["firstShift", "rawEvidence"]);
    expect(second.newUnlocks.map((item) => item.id)).toEqual(["dialogueHandler"]);
    expect(second.profile.achievements).toHaveLength(3);
  });

  it("records completed runs once and archives summary-only history", () => {
    const completed = performAction(initialState, "publishTailorsClaim", "direct");
    const first = recordCompletedRun(createEmptyProfile(), completed, "perfectIllusion", "en", "run-a", "2026-05-20T00:00:00.000Z");
    const second = recordCompletedRun(first.profile, completed, "perfectIllusion", "en", "run-a", "2026-05-20T00:00:01.000Z");

    expect(first.run).toMatchObject({
      id: "run-a",
      endingId: "perfectIllusion",
      actionPath: [{ actionId: "publishTailorsClaim", title: "Publish the Tailors' Claim", choice: "direct" }]
    });
    expect(first.profile.runs).toHaveLength(1);
    expect(first.newUnlocks.map((item) => item.id)).toEqual(expect.arrayContaining(["firstShift", "perfectIllusion"]));
    expect(first.profile.engineFragments.map((item) => item.id)).toContain("stabilityBias");
    expect(second.profile.runs).toHaveLength(1);
    expect(second.newUnlocks).toHaveLength(0);
  });

  it("unlocks complete archive after all endings have been recorded", () => {
    const endings = ["perfectIllusion", "privateDoubt", "viralCollapse", "algorithmicConsensus", "editorExposed", "aiContainment", "unstableFeed"] as const;
    const profile = endings.reduce(
      (current, endingId, index) => recordCompletedRun(current, initialState, endingId, "en", `run-${index}`).profile,
      createEmptyProfile()
    );
    const final = recordCompletedRun(profile, initialState, "narrativeLiberation", "en", "run-final");

    expect(final.newUnlocks.map((item) => item.id)).toContain("allEndings");
  });

  it("migrates older profile data into v2 meta progression fields", () => {
    const loaded = loadProfileFromStorage(JSON.stringify({
      version: 1,
      achievements: [{ id: "firstShift", runId: "run-a", unlockedAt: "2026-05-20T00:00:00.000Z" }],
      runs: []
    }));

    expect(loaded.version).toBe(2);
    expect(loaded.engineFragments).toEqual([]);
    expect(loaded.biasAwareness).toBe(0);
    expect(loaded.decodedEngine).toBe(false);
  });

  it("unlocks engine fragments and secret-ending eligibility through defiant evidence play", () => {
    const inspected = performAction(initialState, "inspectLooms", "direct");
    const leaked = performAction(inspected, "leakLoomPhoto", "original");
    const publicDoubt = performAction({ ...leaked, publicDoubt: 4, actionsLeft: 4 }, "showUnfilteredComments", "direct");
    const ids = evaluateEngineFragments(createEmptyProfile(), publicDoubt, "editorExposed");

    expect(ids).toEqual(expect.arrayContaining(["stabilityBias", "evidenceRecoding", "crowdSuppression", "containmentProtocol"]));
    const merged = mergeEngineFragmentUnlocks(createEmptyProfile(), engineFragmentDefinitions.map((item) => item.id), "run-a", "2026-05-20T00:00:00.000Z");
    expect(merged.profile.decodedEngine).toBe(true);
    expect(merged.profile.biasAwareness).toBe(100);
    expect(secretEndingEligible({ ...publicDoubt, truth: 5, publicDoubt: 5, systemSuspicion: 3 }, merged.profile)).toBe(true);
  });
});
