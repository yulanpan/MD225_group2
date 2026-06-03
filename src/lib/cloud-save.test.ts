import { describe, expect, it } from "vitest";
import { createEmptySnapshot, hasMeaningfulSnapshot, mergeProfiles, mergeSnapshots } from "./cloud-save";
import { createEmptyProfile } from "./profile";
import type { PlayerProfile, RunRecord } from "./types";
import { initialState } from "./game-data";

function run(id: string, completedAt: string): RunRecord {
  return {
    id,
    completedAt,
    endingId: "unstableFeed",
    language: "en",
    finalMetrics: { truth: 1, pressure: 1, virality: 1, publicDoubt: 1, reputation: 1, systemSuspicion: 1 },
    actionPath: [],
    feedEvents: [],
    dialogueSummaries: [],
    dialogueCount: 0,
    achievementsUnlocked: [],
    engineFragmentsUnlocked: [],
    biasAwarenessAfterRun: 0
  };
}

describe("cloud save merging", () => {
  it("merges profile unlocks, engine fragments, and runs without duplicates", () => {
    const local: PlayerProfile = {
      ...createEmptyProfile(),
      achievements: [{ id: "firstShift", runId: "local", unlockedAt: "2026-01-02T00:00:00.000Z" }],
      engineFragments: [{ id: "stabilityBias", runId: "local", unlockedAt: "2026-01-02T00:00:00.000Z" }],
      runs: [run("shared", "2026-01-02T00:00:00.000Z"), run("local", "2026-01-03T00:00:00.000Z")]
    };
    const remote: PlayerProfile = {
      ...createEmptyProfile(),
      achievements: [{ id: "rawEvidence", runId: "remote", unlockedAt: "2026-01-01T00:00:00.000Z" }],
      engineFragments: [{ id: "crowdSuppression", runId: "remote", unlockedAt: "2026-01-01T00:00:00.000Z" }],
      runs: [run("shared", "2026-01-02T00:00:00.000Z"), run("remote", "2026-01-01T00:00:00.000Z")]
    };

    const merged = mergeProfiles(local, remote);

    expect(merged.achievements.map((item) => item.id).sort()).toEqual(["firstShift", "rawEvidence"]);
    expect(merged.engineFragments.map((item) => item.id).sort()).toEqual(["crowdSuppression", "stabilityBias"]);
    expect(merged.biasAwareness).toBe(50);
    expect(merged.runs.map((item) => item.id)).toEqual(["local", "shared", "remote"]);
  });

  it("prefers current local run state but merges archive progression", () => {
    const local = { ...createEmptySnapshot(), state: initialState, currentRunId: "run-local", briefingDismissed: true };
    const remote = {
      ...createEmptySnapshot(),
      profile: { ...createEmptyProfile(), runs: [run("remote", "2026-01-01T00:00:00.000Z")] },
      state: { ...initialState, actionsLeft: 3 },
      currentRunId: "run-remote",
      guidanceUnlocked: true
    };

    const merged = mergeSnapshots(local, remote);

    expect(merged.currentRunId).toBe("run-local");
    expect(merged.state?.actionsLeft).toBe(6);
    expect(merged.profile.runs).toHaveLength(1);
    expect(merged.briefingDismissed).toBe(true);
    expect(merged.guidanceUnlocked).toBe(true);
  });

  it("detects empty and meaningful snapshots", () => {
    expect(hasMeaningfulSnapshot(createEmptySnapshot())).toBe(false);
    expect(hasMeaningfulSnapshot({ ...createEmptySnapshot(), currentRunId: "run-a" })).toBe(true);
  });
});
