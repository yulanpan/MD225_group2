"use client";

import { loadStateFromStorage } from "./game-rules";
import { loadProfileFromStorage, profileStorageKey } from "./profile";
import { createEmptySnapshot, hasMeaningfulSnapshot, localSaveKeys, mergeSnapshots, type CloudSaveSnapshot } from "./cloud-save";

export function collectLocalSnapshot(): CloudSaveSnapshot {
  if (typeof window === "undefined") return createEmptySnapshot();
  const snapshot = createEmptySnapshot();
  const stateRaw = localStorage.getItem(localSaveKeys.state);
  const finalStateRaw = localStorage.getItem(localSaveKeys.finalState);
  return {
    ...snapshot,
    profile: loadProfileFromStorage(localStorage.getItem(profileStorageKey)),
    state: stateRaw ? loadStateFromStorage(stateRaw) : null,
    ending: localStorage.getItem(localSaveKeys.ending),
    finalState: finalStateRaw ? loadStateFromStorage(finalStateRaw) : null,
    currentRunId: localStorage.getItem(localSaveKeys.currentRunId),
    briefingDismissed: localStorage.getItem(localSaveKeys.briefingDismissed) === "true",
    guidanceUnlocked: localStorage.getItem(localSaveKeys.guidanceUnlocked) === "true",
    updatedAt: new Date().toISOString()
  };
}

export function applySnapshot(snapshot: CloudSaveSnapshot) {
  localStorage.setItem(profileStorageKey, JSON.stringify(snapshot.profile));
  setOrRemove(localSaveKeys.state, snapshot.state ? JSON.stringify(snapshot.state) : null);
  setOrRemove(localSaveKeys.ending, snapshot.ending);
  setOrRemove(localSaveKeys.finalState, snapshot.finalState ? JSON.stringify(snapshot.finalState) : null);
  setOrRemove(localSaveKeys.currentRunId, snapshot.currentRunId);
  setOrRemove(localSaveKeys.briefingDismissed, snapshot.briefingDismissed ? "true" : null);
  setOrRemove(localSaveKeys.guidanceUnlocked, snapshot.guidanceUnlocked ? "true" : null);
}

export function resolveSnapshotConflict(choice: "local" | "remote" | "merge", local: CloudSaveSnapshot, remote: CloudSaveSnapshot) {
  if (choice === "local") return local;
  if (choice === "remote") return remote;
  return mergeSnapshots(local, remote);
}

export function localSnapshotIsMeaningful(snapshot: CloudSaveSnapshot) {
  return hasMeaningfulSnapshot(snapshot);
}

function setOrRemove(key: string, value: string | null) {
  if (value) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
}
