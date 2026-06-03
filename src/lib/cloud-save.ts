import type { CloudSaveSnapshot } from "./auth";
import { calculateBiasAwareness, createEmptyProfile } from "./profile";
import type { PlayerProfile, RunRecord } from "./types";

export type { CloudSaveSnapshot } from "./auth";

export const localSaveKeys = {
  profile: "emperor-feed-profile",
  state: "emperor-feed-state",
  ending: "emperor-feed-ending",
  finalState: "emperor-feed-final-state",
  currentRunId: "emperor-feed-run-id",
  briefingDismissed: "emperor-feed-briefing-dismissed",
  guidanceUnlocked: "emperor-feed-guidance-unlocked"
} as const;

export function mergeProfiles(localProfile: PlayerProfile, remoteProfile: PlayerProfile): PlayerProfile {
  const achievementsByKey = new Map(
    [...remoteProfile.achievements, ...localProfile.achievements].map((item) => [`${item.id}:${item.runId}`, item])
  );
  const fragmentsByKey = new Map(
    [...remoteProfile.engineFragments, ...localProfile.engineFragments].map((item) => [`${item.id}:${item.runId}`, item])
  );
  const runs = mergeRuns(localProfile.runs, remoteProfile.runs);
  const engineFragments = [...fragmentsByKey.values()];
  const biasAwareness = calculateBiasAwareness(engineFragments);
  return {
    version: 2,
    achievements: [...achievementsByKey.values()],
    runs,
    engineFragments,
    biasAwareness,
    decodedEngine: biasAwareness >= 100 || localProfile.decodedEngine || remoteProfile.decodedEngine,
    secretEndingUnlocked: biasAwareness >= 100 || localProfile.secretEndingUnlocked || remoteProfile.secretEndingUnlocked
  };
}

export function mergeSnapshots(local: CloudSaveSnapshot, remote: CloudSaveSnapshot): CloudSaveSnapshot {
  const profile = mergeProfiles(local.profile, remote.profile);
  return {
    version: 1,
    profile,
    state: local.state ?? remote.state,
    ending: local.ending ?? remote.ending,
    finalState: local.finalState ?? remote.finalState,
    currentRunId: local.currentRunId ?? remote.currentRunId,
    briefingDismissed: local.briefingDismissed || remote.briefingDismissed,
    guidanceUnlocked: local.guidanceUnlocked || remote.guidanceUnlocked,
    updatedAt: new Date().toISOString()
  };
}

export function hasMeaningfulSnapshot(snapshot: CloudSaveSnapshot) {
  return Boolean(
    snapshot.state ||
    snapshot.ending ||
    snapshot.finalState ||
    snapshot.currentRunId ||
    snapshot.profile.achievements.length ||
    snapshot.profile.runs.length ||
    snapshot.profile.engineFragments.length
  );
}

export function createEmptySnapshot(): CloudSaveSnapshot {
  return {
    version: 1,
    profile: createEmptyProfile(),
    state: null,
    ending: null,
    finalState: null,
    currentRunId: null,
    briefingDismissed: false,
    guidanceUnlocked: false,
    updatedAt: new Date().toISOString()
  };
}

function mergeRuns(localRuns: RunRecord[], remoteRuns: RunRecord[]) {
  const byId = new Map<string, RunRecord>();
  for (const run of [...remoteRuns, ...localRuns]) byId.set(run.id, run);
  return [...byId.values()]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 30);
}
