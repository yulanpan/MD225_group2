import type { GameState, NumericStateKey, PlayerProfile, ZoneId } from "./types";

export type GuidedCampaignStep =
  | "off"
  | "firstTurn"
  | "publicSignals"
  | "systemSuspicion"
  | "fullControl";

export type GuidedTourId = "sources" | "actions" | "engine" | "comments" | "metrics";

export type GuidedTarget = {
  tourId: GuidedTourId;
  zoneId?: ZoneId;
  actionId?: string;
  metricKey?: NumericStateKey;
};

export type GuidedUnlockEvent = {
  id: string;
  label: string;
  labelZh: string;
  kind: "zone" | "metric" | "system";
};

const allZones: ZoneId[] = ["tailors", "ministers", "public", "child"];
const allMetrics: NumericStateKey[] = ["truth", "pressure", "virality", "publicDoubt", "reputation", "systemSuspicion"];

const visibleZonesByStep: Record<GuidedCampaignStep, ZoneId[]> = {
  off: allZones,
  firstTurn: ["tailors"],
  publicSignals: ["tailors", "ministers", "public"],
  systemSuspicion: ["tailors", "ministers", "public"],
  fullControl: allZones
};

const visibleMetricsByStep: Record<GuidedCampaignStep, NumericStateKey[]> = {
  off: allMetrics,
  firstTurn: ["truth", "pressure", "reputation"],
  publicSignals: ["truth", "pressure", "virality", "publicDoubt", "reputation"],
  systemSuspicion: allMetrics,
  fullControl: allMetrics
};

const guidedTargets: Record<GuidedCampaignStep, GuidedTarget | null> = {
  off: null,
  firstTurn: { tourId: "actions", zoneId: "tailors", actionId: "publishTailorsClaim" },
  publicSignals: { tourId: "comments", zoneId: "public", actionId: "showUnfilteredComments" },
  systemSuspicion: { tourId: "engine", metricKey: "systemSuspicion" },
  fullControl: null
};

const unlockEvents: GuidedUnlockEvent[] = [
  { id: "ministers", label: "Ministers' Reports", labelZh: "大臣报告", kind: "zone" },
  { id: "public", label: "Public Comments", labelZh: "公众评论", kind: "zone" },
  { id: "virality", label: "Spread", labelZh: "传播", kind: "metric" },
  { id: "publicDoubt", label: "Public Doubt", labelZh: "群众怀疑", kind: "metric" },
  { id: "systemSuspicion", label: "Palace Alert", labelZh: "宫廷警戒", kind: "metric" },
  { id: "dialogue", label: "Incoming Transmissions", labelZh: "突发交流", kind: "system" },
  { id: "fullControl", label: "Open Shift", labelZh: "自主值班", kind: "system" }
];

export function isGuidedCampaignActive(profile: PlayerProfile) {
  return profile.runs.length === 0 && !profile.decodedEngine && profile.biasAwareness < 100;
}

export function getGuidedCampaignStep(state: GameState, profile: PlayerProfile): GuidedCampaignStep {
  if (!isGuidedCampaignActive(profile)) return "off";
  if (state.history.length === 0) return "firstTurn";
  if (state.history.length === 1) return "publicSignals";
  if (state.history.length === 2) return "systemSuspicion";
  return "fullControl";
}

export function visibleZonesForGuidedStep(step: GuidedCampaignStep) {
  return [...visibleZonesByStep[step]];
}

export function getLockedZonesForGuidedStep(step: GuidedCampaignStep) {
  const visible = new Set(visibleZonesByStep[step]);
  return allZones.filter((zone) => !visible.has(zone));
}

export function visibleMetricsForGuidedStep(step: GuidedCampaignStep) {
  return [...visibleMetricsByStep[step]];
}

export function getLockedMetricsForGuidedStep(step: GuidedCampaignStep) {
  const visible = new Set(visibleMetricsByStep[step]);
  return allMetrics.filter((metric) => !visible.has(metric));
}

export function getGuidedTarget(step: GuidedCampaignStep) {
  const target = guidedTargets[step];
  return target ? { ...target } : null;
}

export function isZoneVisibleInGuidedStep(step: GuidedCampaignStep, zoneId: ZoneId) {
  return visibleZonesByStep[step].includes(zoneId);
}

export function isMetricVisibleInGuidedStep(step: GuidedCampaignStep, metric: NumericStateKey) {
  return visibleMetricsByStep[step].includes(metric);
}

export function getUnlockEvents(previousStep: GuidedCampaignStep, nextStep: GuidedCampaignStep): GuidedUnlockEvent[] {
  if (previousStep === nextStep) return [];
  if (previousStep === "firstTurn" && nextStep === "publicSignals") {
    return unlockEvents.filter((event) => ["ministers", "public", "virality", "publicDoubt"].includes(event.id));
  }
  if (previousStep === "publicSignals" && nextStep === "systemSuspicion") {
    return unlockEvents.filter((event) => ["systemSuspicion", "dialogue"].includes(event.id));
  }
  if (nextStep === "fullControl" && previousStep !== "off") {
    return unlockEvents.filter((event) => event.id === "fullControl");
  }
  return [];
}
