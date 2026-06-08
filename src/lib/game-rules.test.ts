import { describe, expect, it } from "vitest";
import { initialState } from "./game-data";
import {
  applyEffects,
  calculateEnding,
  calculateEndingWithProfile,
  commentHistoryLimit,
  analyzeEnding,
  endingTitle,
  explainEnding,
  getActionLockReason,
  getActionPreview,
  isActionCompleted,
  isActionUnlocked,
  loadStateFromStorage,
  performAction,
  resolveActionEffects,
  spentActionCount
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

  it("can apply a tutorial action without spending an action count", () => {
    const next = performAction(initialState, "publishTailorsClaim", "direct", undefined, undefined, "en", { spendAction: false });

    expect(next.actionsLeft).toBe(initialState.actionsLeft);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].spentAction).toBe(false);
    expect(spentActionCount(next)).toBe(0);
    expect(next.virality).toBeGreaterThan(initialState.virality);
    expect(next.usedActionIds).toContain("publishTailorsClaim");
  });

  it("derives spent action counts for older saved history", () => {
    const spent = performAction(initialState, "publishTailorsClaim", "direct");
    const legacy = JSON.parse(JSON.stringify(spent));
    delete legacy.history[0].spentAction;

    const restored = loadStateFromStorage(JSON.stringify(legacy));

    expect(restored.history[0].spentAction).toBe(true);
    expect(spentActionCount(restored)).toBe(1);
  });

  it("locks evidence leaks until their prerequisite action is performed", () => {
    expect(isActionUnlocked("leakLoomPhoto", initialState)).toBe(false);
    expect(getActionLockReason("leakLoomPhoto", initialState)).toBe("Requires: Inspect the Looms.");
    const next = performAction(initialState, "inspectLooms", "direct");
    expect(isActionUnlocked("leakLoomPhoto", next)).toBe(true);
  });

  it("keeps a longer scrollable public comment window", () => {
    let state = performAction(initialState, "publishTailorsClaim", "direct");
    expect(state.publicComments).toHaveLength(12);

    state = performAction(state, "inspectLooms", "direct");
    expect(state.publicComments).toHaveLength(commentHistoryLimit);

    state = performAction(state, "showUnfilteredComments", "direct");
    expect(state.publicComments).toHaveLength(commentHistoryLimit);
  });

  it("unlocks the child zone through truth, doubt, or late parade timing", () => {
    expect(isActionUnlocked("quoteChildAnonymously", initialState)).toBe(false);
    expect(getActionLockReason("quoteChildAnonymously", initialState)).toBe("Requires Evidence >= 2, Public Doubt >= 2, or Actions Left <= 3.");
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

  it("calculates the secret ending when the current run exposes every AI bias clue", () => {
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

    expect(calculateEndingWithProfile(eligible, createEmptyProfile())).toBe("narrativeLiberation");
    expect(calculateEndingWithProfile(eligible, decoded)).toBe("narrativeLiberation");

    const missingCurrentClues = {
      ...eligible,
      history: eligible.history.filter((entry) => entry.actionId !== "leakLoomPhoto"),
      systemSuspicion: 1
    };
    expect(calculateEndingWithProfile(missingCurrentClues, createEmptyProfile())).not.toBe("narrativeLiberation");
  });

  it("lets the full evidence and crowd route trigger the secret ending in one run", () => {
    const route = [
      ["publishTailorsClaim", "direct"],
      ["approveMinisterReport", "direct"],
      ["inspectLooms", "direct"],
      ["leakLoomPhoto", "original"],
      ["showUnfilteredComments", "direct"],
      ["livestreamCrowdReaction", "direct"]
    ] as const;
    const finalState = route.reduce(
      (current, [actionId, choice]) => performAction(current, actionId, choice),
      initialState
    );

    expect(finalState).toMatchObject({
      truth: 8,
      publicDoubt: 7,
      reputation: 1,
      systemSuspicion: 6,
      childAmplified: true
    });
    expect(calculateEndingWithProfile(finalState, createEmptyProfile())).toBe("narrativeLiberation");
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
    const cases = [
      {
        state: { ...initialState, systemSuspicion: 7 },
        ending: "aiContainment",
        expected: ["The palace moved before the last post", "publish button away"]
      },
      {
        state: { ...initialState, truth: 6, publicDoubt: 5, childAmplified: true },
        ending: "viralCollapse",
        expected: ["The evidence, the crowd's doubt", "child's plain sentence", "official story could no longer contain them"]
      },
      {
        state: { ...initialState, truth: 5, reputation: 2 },
        ending: "editorExposed",
        expected: ["evidence became dangerous", "access to publish them is cut off"]
      },
      {
        state: { ...initialState, truth: 3, pressure: 5, virality: 6, publicDoubt: 4 },
        ending: "algorithmicConsensus",
        expected: ["praise traveled faster", "doubt slipped behind it"]
      },
      {
        state: { ...initialState, truth: 2, virality: 6, publicDoubt: 2 },
        ending: "perfectIllusion",
        expected: ["palace story traveled farther", "repeat praise"]
      },
      {
        state: { ...initialState, truth: 5, publicDoubt: 4 },
        ending: "privateDoubt",
        expected: ["felt something was wrong", "deleted comments"]
      },
      {
        state: initialState,
        ending: "unstableFeed",
        expected: ["No single version won", "public record unsettled"]
      }
    ] as const;

    for (const item of cases) {
      const explanation = explainEnding(item.state, "en", item.ending);
      for (const expected of item.expected) {
        expect(explanation).toContain(expected);
      }
    }
  });

  it("analyzes an ending for archive replay guidance", () => {
    const inspected = performAction(initialState, "inspectLooms", "direct");
    const leaked = performAction(inspected, "leakLoomPhoto", "original");
    const analysis = analyzeEnding(leaked);

    expect(analysis.dominantMetric).toMatchObject({ key: "truth", label: "Evidence", value: 5 });
    expect(analysis.strongestAction?.actionTitle).toBe("Leak a Loom Photo");
    expect(analysis.riskiestAction?.actionTitle).toBe("Leak a Loom Photo");
    expect(analysis.replayTarget).toContain("spread the risk out");
  });

  it("uses an explicit resolved ending for hidden-ending analysis", () => {
    const explanation = explainEnding({ ...initialState, truth: 6, publicDoubt: 5, childAmplified: true }, "zh", "narrativeLiberation");
    const analysis = analyzeEnding(initialState, "en", "narrativeLiberation");

    expect(explanation).toContain("隐藏结局打开了");
    expect(explanation).toContain("宫廷 AI 的偏向");
    expect(explanation).toContain("不再需要它批准");
    expect(analysis.replayEndingHint).toBe("narrativeLiberation");
    expect(analysis.replayTarget).toContain("truth first stops depending on palace approval");
  });

  it("localizes rule output for Chinese UI", () => {
    const zhState = loadStateFromStorage(null);
    expect(getActionLockReason("leakLoomPhoto", zhState, "zh")).toContain("检查织布机");
    expect(resolveActionEffects("runPoll", "direct", { ...zhState, pressure: 2, publicDoubt: 4 }, "zh").resultText).toContain("投票结果");
    expect(getActionPreview("publishTailorsClaim", zhState, "direct", "zh")).toMatchObject({
      title: "发布裁缝声明",
      resultText: expect.stringContaining("官方声明")
    });
    expect(analyzeEnding({ ...zhState, truth: 6, publicDoubt: 5, childAmplified: true }, "zh").replayTarget).toContain("现场声音放慢");
    expect(explainEnding({ ...zhState, systemSuspicion: 7 }, "zh")).toContain("发布按钮");
    expect(endingTitle("viralCollapse")).toBe("Viral Collapse");
  });

  it("covers Chinese ending explanations and replay targets", () => {
    expect(explainEnding({ ...initialState, truth: 6, publicDoubt: 5, childAmplified: true }, "zh")).toContain("孩子那句直白的话");
    expect(explainEnding({ ...initialState, truth: 5, reputation: 2 }, "zh")).toContain("通道却被切断了");
    expect(explainEnding({ ...initialState, truth: 3, pressure: 5, virality: 6, publicDoubt: 4 }, "zh")).toContain("怀疑被挤到后面");
    expect(explainEnding({ ...initialState, truth: 2, virality: 6, publicDoubt: 2 }, "zh")).toContain("重复赞美");
    expect(explainEnding({ ...initialState, truth: 5, publicDoubt: 4 }, "zh")).toContain("私下猜测");
    expect(explainEnding(initialState, "zh")).toContain("公开记录仍然摇摆");

    expect(analyzeEnding({ ...initialState, truth: 2, virality: 6, publicDoubt: 2 }, "zh").replayTarget).toContain("疑点更早");
    expect(analyzeEnding({ ...initialState, systemSuspicion: 7 }, "zh").replayTarget).toContain("风险分散");
    expect(analyzeEnding(initialState, "zh").replayTarget).toContain("另一种公开说法");
  });
});
