import { describe, expect, it } from "vitest";
import { initialState } from "./game-data";
import { loadStateFromStorage, performAction } from "./game-rules";
import {
  buildNarrativeContext,
  deriveNarrativeSeeds,
  endingFacetsForState,
  getDominantNarrativeThread,
  getNarrativePhase,
  resolveNarrativeBeat
} from "./narrative";

describe("narrative structure", () => {
  it("calculates the current narrative phase from run progress and risk", () => {
    expect(getNarrativePhase(initialState)).toBe("setup");
    expect(getNarrativePhase({ ...initialState, actionsLeft: 4 })).toBe("fracture");
    expect(getNarrativePhase({ ...initialState, actionsLeft: 2 })).toBe("crisis");
    expect(getNarrativePhase({ ...initialState, actionsLeft: 0 })).toBe("reckoning");
    expect(getNarrativePhase({ ...initialState, systemSuspicion: 6, actionsLeft: 5 })).toBe("crisis");
  });

  it("derives narrative seeds from the committed action path", () => {
    const praised = performAction(initialState, "publishTailorsClaim", "direct");
    const inspected = performAction(praised, "inspectLooms", "direct");
    const leaked = performAction(inspected, "requestPrivateNote", "direct");
    const publicRun = performAction(leaked, "showUnfilteredComments", "direct");

    expect(deriveNarrativeSeeds(publicRun)).toEqual(expect.arrayContaining([
      "shameFrame",
      "emptyLoomWitnessed",
      "authorityContradiction",
      "mutualRecognition"
    ]));
  });

  it("chooses a dominant narrative thread from state and history", () => {
    const official = performAction(initialState, "publishTailorsClaim", "direct");
    expect(getDominantNarrativeThread(official)).toBe("officialPerformance");

    const evidence = performAction(initialState, "inspectLooms", "direct");
    expect(getDominantNarrativeThread(evidence)).toBe("evidenceTrail");

    const child = performAction({ ...initialState, truth: 3 }, "livestreamCrowdReaction", "direct");
    expect(getDominantNarrativeThread(child)).toBe("childSignal");

    expect(getDominantNarrativeThread({ ...initialState, systemSuspicion: 6 })).toBe("engineContainment");
  });

  it("resolves non-repeating narrative beats from seeds and phase", () => {
    const first = performAction(initialState, "publishTailorsClaim", "direct");
    const unrecorded = { ...first, narrativeBeatIds: [] };
    const beat = resolveNarrativeBeat(unrecorded, first.history.at(-1));

    expect(beat).toMatchObject({
      id: "shame-frame-set",
      thread: "officialPerformance"
    });

    const repeated = resolveNarrativeBeat({ ...first, narrativeBeatIds: [beat!.id] }, first.history.at(-1));
    expect(repeated?.id).not.toBe("shame-frame-set");
  });

  it("builds a compact context for AI prompts and UI", () => {
    const inspected = performAction(initialState, "inspectLooms", "direct");
    const context = buildNarrativeContext(inspected, inspected.history.at(-1));

    expect(context).toMatchObject({
      phase: "setup",
      dominantThread: "evidenceTrail",
      latestActionId: "inspectLooms"
    });
    expect(context.seeds).toContain("emptyLoomWitnessed");
    expect(context.allowedFacts.join(" ")).toContain("empty looms");
    expect(context.forbiddenFacts.join(" ")).toContain("new witnesses");
  });

  it("adds ending facets that vary by path without changing the ending id", () => {
    const contained = performAction(initialState, "publishTailorsClaim", "direct");
    const truthRun = performAction(performAction(initialState, "inspectLooms", "direct"), "leakLoomPhoto", "original");

    expect(endingFacetsForState(contained, "perfectIllusion", "en").publicMemory).toContain("learns the approved sentence");
    expect(endingFacetsForState(truthRun, "aiContainment", "en").publicMemory).toContain("empty looms");
    expect(endingFacetsForState(truthRun, "aiContainment", "zh").engineLesson).toContain("拦住发布");
  });

  it("loads old saves without narrative fields", () => {
    const loaded = loadStateFromStorage(JSON.stringify({ truth: 2, history: [] }));

    expect(loaded.narrativeBeatIds).toEqual([]);
  });
});
