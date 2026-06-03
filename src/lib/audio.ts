import type { EndingId, GameState } from "./types";

export type MusicScene =
  | "title"
  | "dashboard"
  | "archive"
  | "dialogue"
  | "pneIntro"
  | "endingContained"
  | "endingCollapse"
  | "endingLiberation";

export type MusicLayer = "pressure" | "suspicion";

export type SoundEffect =
  | "uiHover"
  | "uiClick"
  | "actionCommit"
  | "engineScan"
  | "engineIntroHit"
  | "dialogueOpen"
  | "dialogueMessage"
  | "metricShift"
  | "fragmentUnlock"
  | "achievementUnlock"
  | "endingTrigger";

export type AudioSettings = {
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  volume: number;
};

export const audioSettingsStorageKey = "emperor-feed-audio-settings";

export const defaultAudioSettings: AudioSettings = {
  muted: false,
  musicEnabled: true,
  sfxEnabled: true,
  volume: 0.72
};

export const musicScenes: Record<MusicScene, { path: string; loop: boolean; volume: number }> = {
  title: { path: "/audio/bgm/title-theme.mp3", loop: true, volume: 0.72 },
  dashboard: { path: "/audio/bgm/dashboard-base.mp3", loop: true, volume: 0.58 },
  archive: { path: "/audio/bgm/archive-loop.mp3", loop: true, volume: 0.56 },
  dialogue: { path: "/audio/bgm/dialogue-tension.mp3", loop: true, volume: 0.48 },
  pneIntro: { path: "/audio/bgm/pne-intro.mp3", loop: false, volume: 0.68 },
  endingContained: { path: "/audio/bgm/ending-contained.mp3", loop: true, volume: 0.72 },
  endingCollapse: { path: "/audio/bgm/ending-collapse.mp3", loop: true, volume: 0.74 },
  endingLiberation: { path: "/audio/bgm/ending-liberation.mp3", loop: true, volume: 0.82 }
};

export const musicLayers: Record<MusicLayer, { path: string; volume: number }> = {
  pressure: { path: "/audio/layers/pressure-layer.mp3", volume: 0.34 },
  suspicion: { path: "/audio/layers/suspicion-layer.mp3", volume: 0.38 }
};

export const soundEffects: Record<SoundEffect, { path: string; volume: number }> = {
  uiHover: { path: "/audio/sfx/ui-hover.mp3", volume: 0.24 },
  uiClick: { path: "/audio/sfx/ui-click.mp3", volume: 0.34 },
  actionCommit: { path: "/audio/sfx/action-commit.mp3", volume: 0.58 },
  engineScan: { path: "/audio/sfx/engine-scan.mp3", volume: 0.5 },
  engineIntroHit: { path: "/audio/sfx/engine-intro-hit.mp3", volume: 0.72 },
  dialogueOpen: { path: "/audio/sfx/dialogue-open.mp3", volume: 0.56 },
  dialogueMessage: { path: "/audio/sfx/dialogue-message.mp3", volume: 0.28 },
  metricShift: { path: "/audio/sfx/metric-shift.mp3", volume: 0.38 },
  fragmentUnlock: { path: "/audio/sfx/fragment-unlock.mp3", volume: 0.68 },
  achievementUnlock: { path: "/audio/sfx/achievement-unlock.mp3", volume: 0.62 },
  endingTrigger: { path: "/audio/sfx/ending-trigger.mp3", volume: 0.8 }
};

export const expectedAudioAssetPaths = [
  ...Object.values(musicScenes).map((item) => item.path),
  ...Object.values(musicLayers).map((item) => item.path),
  ...Object.values(soundEffects).map((item) => item.path)
];

export function clampAudioVolume(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : defaultAudioSettings.volume));
}

export function loadAudioSettingsFromStorage(value: string | null): AudioSettings {
  if (!value) return defaultAudioSettings;
  try {
    const parsed = JSON.parse(value) as Partial<AudioSettings>;
    return {
      muted: typeof parsed.muted === "boolean" ? parsed.muted : defaultAudioSettings.muted,
      musicEnabled: typeof parsed.musicEnabled === "boolean" ? parsed.musicEnabled : defaultAudioSettings.musicEnabled,
      sfxEnabled: typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : defaultAudioSettings.sfxEnabled,
      volume: clampAudioVolume(typeof parsed.volume === "number" ? parsed.volume : defaultAudioSettings.volume)
    };
  } catch {
    return defaultAudioSettings;
  }
}

export function layerIntensitiesForState(
  state: Pick<GameState, "pressure" | "systemSuspicion">
): Record<MusicLayer, number> {
  return {
    pressure: thresholdIntensity(state.pressure, 5, 8),
    suspicion: thresholdIntensity(state.systemSuspicion, 4, 7)
  };
}

export function endingSceneForEnding(endingId: EndingId): MusicScene {
  if (endingId === "narrativeLiberation") return "endingLiberation";
  if (endingId === "aiContainment" || endingId === "editorExposed") return "endingContained";
  if (endingId === "viralCollapse") return "endingCollapse";
  return "archive";
}

function thresholdIntensity(value: number, start: number, full: number) {
  if (value < start) return 0;
  return clampAudioVolume((value - start + 1) / (full - start + 1));
}
