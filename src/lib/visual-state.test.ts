import { describe, expect, it } from "vitest";
import { actions, initialState } from "./game-data";
import { classifyActionKind, getMetricDeltas, heatmapCells, limitToastStack } from "./visual-state";

describe("visual state helpers", () => {
  it("classifies action kinds for motion treatment", () => {
    expect(classifyActionKind(actions.find((action) => action.id === "leakLoomPhoto")!)).toBe("ai");
    expect(classifyActionKind(actions.find((action) => action.id === "leakLoomPhoto")!, "original")).toBe("risk");
    expect(classifyActionKind(actions.find((action) => action.id === "showUnfilteredComments")!)).toBe("public");
    expect(classifyActionKind(actions.find((action) => action.id === "ignoreChild")!)).toBe("default");
    expect(classifyActionKind(actions.find((action) => action.id === "livestreamCrowdReaction")!)).toBe("risk");
    expect(classifyActionKind(actions.find((action) => action.id === "publishTailorsClaim")!)).toBe("default");
  });

  it("extracts metric deltas from state changes", () => {
    const deltas = getMetricDeltas(initialState, {
      ...initialState,
      truth: 2,
      pressure: 1
    });

    expect(deltas).toEqual([
      { key: "truth", before: 0, after: 2, delta: 2 },
      { key: "pressure", before: 2, after: 1, delta: -1 }
    ]);
  });

  it("limits toast stacks and derives heatmap cells", () => {
    expect(limitToastStack([
      { id: "1", title: "One", message: "A" },
      { id: "2", title: "Two", message: "B" },
      { id: "3", title: "Three", message: "C" },
      { id: "4", title: "Four", message: "D" }
    ])).toHaveLength(3);

    expect(heatmapCells(initialState)).toHaveLength(24);
    expect(heatmapCells({ ...initialState, publicDoubt: 8, virality: 7 })).toContain("hot");
  });
});
