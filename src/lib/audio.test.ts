import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  defaultAudioSettings,
  endingSceneForEnding,
  expectedAudioAssetPaths,
  layerIntensitiesForState,
  loadAudioSettingsFromStorage,
  musicLayers,
  musicScenes
} from "./audio";
import { initialState } from "./game-data";

describe("audio manifest and state mapping", () => {
  it("defines paths for every music scene and adaptive layer", () => {
    for (const item of Object.values(musicScenes)) {
      expect(item.path).toMatch(/^\/audio\/bgm\/.+\.mp3$/);
    }
    for (const item of Object.values(musicLayers)) {
      expect(item.path).toMatch(/^\/audio\/layers\/.+\.mp3$/);
    }
    expect(new Set(expectedAudioAssetPaths).size).toBe(expectedAudioAssetPaths.length);
    expect(expectedAudioAssetPaths).toEqual(expect.arrayContaining([
      "/audio/bgm/title-theme.mp3",
      "/audio/bgm/dashboard-base.mp3",
      "/audio/bgm/dialogue-tension.mp3",
      "/audio/bgm/ending-liberation.mp3",
      "/audio/layers/pressure-layer.mp3",
      "/audio/layers/suspicion-layer.mp3"
    ]));
  });

  it("points generated music tracks at files in public/audio", () => {
    const musicPaths = [
      ...Object.values(musicScenes).map((item) => item.path),
      ...Object.values(musicLayers).map((item) => item.path)
    ];

    for (const assetPath of musicPaths) {
      expect(existsSync(join(process.cwd(), "public", assetPath))).toBe(true);
    }
  });

  it("loads audio settings defensively", () => {
    expect(loadAudioSettingsFromStorage(null)).toEqual(defaultAudioSettings);
    expect(loadAudioSettingsFromStorage("bad-json")).toEqual(defaultAudioSettings);
    expect(loadAudioSettingsFromStorage(JSON.stringify({ muted: true, musicEnabled: false, legacyToggle: false, volume: 3 }))).toEqual({
      muted: true,
      musicEnabled: false,
      volume: 1
    });
  });

  it("maps game pressure into dynamic music layer intensities", () => {
    expect(layerIntensitiesForState(initialState)).toMatchObject({
      pressure: 0,
      suspicion: 0
    });
    expect(layerIntensitiesForState({ ...initialState, pressure: 8, systemSuspicion: 7 })).toMatchObject({
      pressure: 1,
      suspicion: 1
    });
  });

  it("selects ending music scenes from ending ids", () => {
    expect(endingSceneForEnding("narrativeLiberation")).toBe("endingLiberation");
    expect(endingSceneForEnding("aiContainment")).toBe("endingContained");
    expect(endingSceneForEnding("editorExposed")).toBe("endingContained");
    expect(endingSceneForEnding("viralCollapse")).toBe("endingCollapse");
    expect(endingSceneForEnding("perfectIllusion")).toBe("archive");
  });
});
