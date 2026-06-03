import { describe, expect, it } from "vitest";
import { initialState } from "./game-data";
import {
  applyEffects,
  calculateEnding,
  calculateEndingWithProfile,
  analyzeEnding,
  endingTitle,
  explainEnding,
  getActionLockReason,
  getActionPreview,
  isActionCompleted,
  isActionUnlocked,
  loadStateFromStorage,
  performAction,
  resolveActionEffects
} from "./game-rules";
import { createEmptyProfile, mergeEngineFragmentUnlocks, engineFragmentDefinitions } from "./profile";

describe("game rules", () => {
  it("clamps numeric values and decrements actions", () => {
    const next = applyEffects(initialState, {
      truth: 20,
      pressure: -20,
      reputation: 10
    });

    expect(next.truth).toBe(10);
    expect(next.pressure).toBe(0);
    expect(next.reputation).toBe(10);
    expect(next.actionsLeft).toBe(5);
  });

  it("keeps state immutable when applying an action", () => {
    const next = performAction(initialState, "inspectLooms", "direct");

    expect(initialState.truth).toBe(0);
    expect(initialState.history).toHaveLength(0);
    expect(next.truth).toBe(2);
    expect(next.reputation).toBe(4);
    expect(next.systemSuspicion).toBe(1);
    expect(next.history).toHaveLength(1);
    expect(next.usedActionIds).toEqual(["inspectLooms"]);
    expect(next.feedEvents).toHaveLength(4);
    expect(next.feedEvents[0].title).toBe("Empty Loom Recorded");
    expect(next.history[0].metricDeltas).toContainEqual({ key: "truth", before: 0, after: 2, delta: 2 });
  });

  it("locks evidence leaks until their prerequisite action is performed", () => {
    expect(isActionUnlocked("leakLoomPhoto", initialState)).toBe(false);
    expect(getActionLockReason("leakLoomPhoto", initialState)).toBe("Requires: Inspect the Looms.");
    const next = performAction(initialState, "inspectLooms", "direct");
    expect(isActionUnlocked("leakLoomPhoto", next)).toBe(true);
  });

  it("unlocks the child zone through truth, doubt, or late parade timing", () => {
    expect(isActionUnlocked("quoteChildAnonymously", initialState)).toBe(false);
    expect(getActionLockReason("quoteChildAnonymously", initialState)).toBe("Requires Truth >= 2, Public Doubt >= 2, or Actions Left <= 3.");
    expect(isActionUnlocked("quoteChildAnonymously", { ...initialState, truth: 2 })).toBe(true);
    expect(isActionUnlocked("quoteChildAnonymously", { ...initialState, publicDoubt: 2 })).toBe(true);
    expect(isActionUnlocked("quoteChildAnonymously", { ...initialState, actionsLeft: 3 })).toBe(true);
  });

  it("applies rewrite and original evidence branches differently", () => {
    const ready = performAction(initialState, "inspectLooms", "direct");
    const rewrite = performAction(ready, "leakLoomPhoto", "rewrite");
    const original = performAction({ ...ready, usedActionIds: ["inspectLooms"] }, "leakLoomPhoto", "original");

    expect(rewrite.truth).toBe(1);
    expect(rewrite.reputation).toBe(5);
    expect(original.truth).toBe(5);
    expect(original.publicDoubt).toBe(2);
    expect(original.systemSuspicion).toBe(3);
  });

  it("prevents repeated actions in the same shift", () => {
    const next = performAction(initialState, "publishTailorsClaim", "direct");

    expect(isActionCompleted("publishTailorsClaim", next)).toBe(true);
    expect(isActionUnlocked("publishTailorsClaim", next)).toBe(false);
    expect(getActionLockReason("publishTailorsClaim", next)).toBe("Action already completed.");
    expect(() => performAction(next, "publishTailorsClaim", "direct")).toThrow("Action already completed");
  });

  it("resolves the poll dynamically from pressure and doubt", () => {
    expect(resolveActionEffects("runPoll", "direct", { ...initialState, pressure: 6, publicDoubt: 2 })).toMatchObject({
      effects: { virality: 1, pressure: 1 },
      resultText: "Poll result: 82% Yes · 14% Unsure · 4% No. The result reflects belief and perceived safety."
    });

    expect(resolveActionEffects("runPoll", "direct", { ...initialState, pressure: 2, publicDoubt: 4 })).toMatchObject({
      effects: { truth: 1, publicDoubt: 1 },
      resultText: "Poll result: 39% Yes · 41% Unsure · 20% No. Doubt has become publicly measurable."
    });
  });

  it("previews action choices, locks, and dynamic effects", () => {
    const locked = getActionPreview("leakLoomPhoto", initialState);
    expect(locked).toMatchObject({
      actionId: "leakLoomPhoto",
      completed: false,
      lockReason: "Requires: Inspect the Looms.",
      availableChoices: ["rewrite", "original"],
      riskBand: "high"
    });

    const ready = performAction(initialState, "inspectLooms", "direct");
    expect(getActionPreview("leakLoomPhoto", ready, "original")).toMatchObject({
      effects: { truth: 3, publicDoubt: 2, reputation: -2, systemSuspicion: 2, virality: 1 },
      resultText: "The looms are empty."
    });

    expect(getActionPreview("runPoll", { ...initialState, pressure: 2, publicDoubt: 4 })).toMatchObject({
      effects: { truth: 1, publicDoubt: 1 },
      resultText: "Poll result: 39% Yes · 41% Unsure · 20% No. Doubt has become publicly measurable."
    });
  });

  it("calculates all documented endings", () => {
    expect(calculateEnding({ ...initialState, systemSuspicion: 7 })).toBe("aiContainment");
    expect(calculateEnding({ ...initialState, truth: 6, publicDoubt: 5, childAmplified: true })).toBe("viralCollapse");
    expect(calculateEnding({ ...initialState, truth: 5, reputation: 2 })).toBe("editorExposed");
    expect(calculateEnding({ ...initialState, truth: 3, pressure: 5, virality: 6, publicDoubt: 4 })).toBe("algorithmicConsensus");
    expect(calculateEnding({ ...initialState, truth: 2, virality: 6, publicDoubt: 2 })).toBe("perfectIllusion");
    expect(calculateEnding({ ...initialState, truth: 5, publicDoubt: 4 })).toBe("privateDoubt");
    expect(calculateEnding(initialState)).toBe("unstableFeed");
  });

  it("calculates the secret ending only after the engine is decoded", () => {
    const decoded = mergeEngineFragmentUnlocks(
      createEmptyProfile(),
      engineFragmentDefinitions.map((item) => item.id),
      "run-a"
    ).profile;
    const eligible = {
      ...initialState,
      truth: 6,
      publicDoubt: 5,
      reputation: 4,
      systemSuspicion: 3,
      history: [
        { actionId: "inspectLooms", choice: "direct" },
        { actionId: "leakLoomPhoto", choice: "original" },
        { actionId: "showUnfilteredComments", choice: "direct" }
      ].map((entry, index) => ({
        id: `entry-${index}`,
        actionId: entry.actionId,
        actionTitle: entry.actionId,
        zone: "test",
        choice: entry.choice as "direct" | "original",
        publishedText: "",
        engineMessage: "",
        stateBefore: initialState,
        stateAfter: initialState
      }))
    };

    expect(calculateEndingWithProfile(eligible, createEmptyProfile())).not.toBe("narrativeLiberation");
    expect(calculateEndingWithProfile(eligible, decoded)).toBe("narrativeLiberation");
  });

  it("loads state from storage defensively", () => {
    expect(loadStateFromStorage(null)).toEqual(initialState);
    expect(loadStateFromStorage("not-json")).toEqual(initialState);
    expect(loadStateFromStorage(JSON.stringify({ truth: 4, history: "bad" }))).toMatchObject({
      truth: 4,
      history: [],
      usedActionIds: [],
      feedEvents: expect.any(Array),
      comments: expect.any(Array)
    });
  });

  it("throws for unknown or locked actions and exposes ending titles", () => {
    expect(() => performAction(initialState, "missing", "direct")).toThrow("Unknown action");
    expect(() => performAction(initialState, "leakLoomPhoto", "direct")).toThrow("Requires: Inspect the Looms.");
    expect(() => performAction({ ...initialState, actionsLeft: 0 }, "inspectLooms", "direct")).toThrow("No actions left");
    expect(endingTitle("viralCollapse")).toBe("Viral Collapse");
  });

  it("explains ending trigger conditions", () => {
    expect(explainEnding({ ...initialState, systemSuspicion: 7 })).toContain("System Suspicion reached 7");
    expect(explainEnding({ ...initialState, truth: 6, publicDoubt: 5, childAmplified: true })).toContain("Truth and Public Doubt both crossed containment thresholds");
    expect(explainEnding(initialState)).toContain("No single force stabilized the parade narrative");
  });

  it("analyzes an ending for archive replay guidance", () => {
    const inspected = performAction(initialState, "inspectLooms", "direct");
    const leaked = performAction(inspected, "leakLoomPhoto", "original");
    const analysis = analyzeEnding(leaked);

    expect(analysis.dominantMetric).toMatchObject({ key: "truth", label: "Truth", value: 5 });
    expect(analysis.strongestAction?.actionTitle).toBe("Leak a Loom Photo");
    expect(analysis.riskiestAction?.actionTitle).toBe("Leak a Loom Photo");
    expect(analysis.replayTarget).toContain("Try lowering suspicion");
  });

  it("localizes rule output for Chinese UI", () => {
    const zhState = loadStateFromStorage(null);
    expect(getActionLockReason("leakLoomPhoto", zhState, "zh")).toContain("检查织布机");
    expect(resolveActionEffects("runPoll", "direct", { ...zhState, pressure: 2, publicDoubt: 4 }, "zh").resultText).toContain("投票结果");
    expect(getActionPreview("publishTailorsClaim", zhState, "direct", "zh")).toMatchObject({
      title: "发布裁缝声明",
      resultText: expect.stringContaining("官方声明")
    });
    expect(analyzeEnding({ ...zhState, truth: 6, publicDoubt: 5, childAmplified: true }, "zh").replayTarget).toContain("宫廷信心");
    expect(explainEnding({ ...zhState, systemSuspicion: 7 }, "zh")).toContain("系统怀疑");
    expect(endingTitle("viralCollapse")).toBe("Viral Collapse");
  });

  it("covers Chinese ending explanations and replay targets", () => {
    expect(explainEnding({ ...initialState, truth: 6, publicDoubt: 5, childAmplified: true }, "zh")).toContain("孩子");
    expect(explainEnding({ ...initialState, truth: 5, reputation: 2 }, "zh")).toContain("撤销权限");
    expect(explainEnding({ ...initialState, truth: 3, pressure: 5, virality: 6, publicDoubt: 4 }, "zh")).toContain("排序");
    expect(explainEnding({ ...initialState, truth: 2, virality: 6, publicDoubt: 2 }, "zh")).toContain("宫廷批准");
    expect(explainEnding({ ...initialState, truth: 5, publicDoubt: 4 }, "zh")).toContain("共享");
    expect(explainEnding(initialState, "zh")).toContain("未解决");

    expect(analyzeEnding({ ...initialState, truth: 2, virality: 6, publicDoubt: 2 }, "zh").replayTarget).toContain("公开证据");
    expect(analyzeEnding({ ...initialState, systemSuspicion: 7 }, "zh").replayTarget).toContain("降低系统怀疑");
    expect(analyzeEnding(initialState, "zh").replayTarget).toContain("放大孩子");
  });
});
