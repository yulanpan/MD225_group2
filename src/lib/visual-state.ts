import type { ActionChoice, ActionDefinition, EndingId, GameState, NumericStateKey } from "./types";

export type VisualActionKind = "ai" | "risk" | "public" | "default";

export type ToastMessage = {
  id: string;
  title: string;
  message: string;
};

export type MetricDelta = {
  key: NumericStateKey;
  before: number;
  after: number;
  delta: number;
};

const metricKeys: NumericStateKey[] = [
  "truth",
  "pressure",
  "virality",
  "publicDoubt",
  "reputation",
  "systemSuspicion"
];

export function classifyActionKind(action: ActionDefinition, choice?: ActionChoice): VisualActionKind {
  if (action.requiresAIRewrite && choice !== "original") return "ai";
  if (choice === "original") return "risk";
  if (action.zone === "child" || action.id.toLowerCase().includes("livestream")) return "risk";
  if (action.zone === "public") return "public";
  if (action.id.toLowerCase().includes("leak") || action.id.toLowerCase().includes("fact")) return "risk";
  return "default";
}

export function getMetricDeltas(before: GameState, after: GameState): MetricDelta[] {
  return metricKeys
    .map((key) => ({
      key,
      before: before[key],
      after: after[key],
      delta: after[key] - before[key]
    }))
    .filter((item) => item.delta !== 0);
}

export function limitToastStack(items: ToastMessage[], limit = 3): ToastMessage[] {
  return items.slice(0, limit);
}

export function heatmapCells(state: GameState): Array<"calm" | "mid" | "hot" | "gold"> {
  return Array.from({ length: 24 }, (_, index) => {
    const signal = (state.publicDoubt * 2 + state.virality + index) % 10;
    if (signal >= 7) return "hot";
    if (state.pressure + index > 13 && index % 5 === 0) return "gold";
    if (signal >= 4) return "mid";
    return "calm";
  });
}

export function endingPressureProfile(endingId: EndingId): "controlled" | "doubt" | "collapse" | "ranked" | "exposed" | "contained" | "unstable" | "liberated" {
  if (endingId === "perfectIllusion") return "controlled";
  if (endingId === "privateDoubt") return "doubt";
  if (endingId === "viralCollapse") return "collapse";
  if (endingId === "algorithmicConsensus") return "ranked";
  if (endingId === "editorExposed") return "exposed";
  if (endingId === "aiContainment") return "contained";
  if (endingId === "narrativeLiberation") return "liberated";
  return "unstable";
}
