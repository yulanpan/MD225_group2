"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  audioSettingsStorageKey,
  defaultAudioSettings,
  loadAudioSettingsFromStorage,
  musicScenes,
  type AudioSettings,
  type MusicLayer,
  type MusicScene
} from "@/lib/audio";

type AudioContextValue = {
  unlocked: boolean;
  settings: AudioSettings;
  scene: MusicScene | null;
  setScene: (scene: MusicScene, options?: { duck?: boolean }) => void;
  setLayerIntensity: (layer: MusicLayer, intensity: number) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  unlock: () => void;
};

const GameAudioContext = createContext<AudioContextValue | null>(null);

function safePlay(audio: HTMLAudioElement) {
  return audio.play().catch(() => undefined);
}

function setAudioVolume(audio: HTMLAudioElement, value: number) {
  audio.volume = Math.max(0, Math.min(1, value));
}

let exclusiveMusicAudio: HTMLAudioElement | null = null;

function playExclusiveMusic(audio: HTMLAudioElement) {
  if (exclusiveMusicAudio && exclusiveMusicAudio !== audio) {
    exclusiveMusicAudio.pause();
    setAudioVolume(exclusiveMusicAudio, 0);
  }
  exclusiveMusicAudio = audio;
  return safePlay(audio);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(defaultAudioSettings);
  const [unlocked, setUnlocked] = useState(false);
  const [scene, setSceneState] = useState<MusicScene | null>(null);
  const sceneAudio = useRef<HTMLAudioElement | null>(null);
  const sceneDuck = useRef(false);
  const layerAudio = useRef<Partial<Record<MusicLayer, HTMLAudioElement>>>({});
  const layerTargets = useRef<Partial<Record<MusicLayer, number>>>({});
  const retiredSceneAudio = useRef<HTMLAudioElement[]>([]);
  const fadeTimers = useRef<Map<HTMLAudioElement, number>>(new Map());
  const settingsRef = useRef(settings);
  const unlockedRef = useRef(unlocked);

  const cancelFade = useCallback((audio: HTMLAudioElement | null | undefined) => {
    if (!audio) return;
    const timer = fadeTimers.current.get(audio);
    if (timer === undefined) return;
    window.clearInterval(timer);
    fadeTimers.current.delete(audio);
  }, []);

  const stopAudio = useCallback((audio: HTMLAudioElement | null | undefined) => {
    if (!audio) return;
    cancelFade(audio);
    audio.pause();
    setAudioVolume(audio, 0);
    if (exclusiveMusicAudio === audio) exclusiveMusicAudio = null;
  }, [cancelFade]);

  const stopRetiredScenes = useCallback((except?: HTMLAudioElement) => {
    retiredSceneAudio.current = retiredSceneAudio.current.filter((audio) => {
      if (audio === except) return true;
      stopAudio(audio);
      return false;
    });
  }, [stopAudio]);

  const fadeTo = useCallback((audio: HTMLAudioElement, targetVolume: number, duration: number, onComplete?: () => void) => {
    cancelFade(audio);
    const initial = audio.volume;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / duration);
      setAudioVolume(audio, initial + (targetVolume - initial) * progress);
      if (progress < 1) return;
      window.clearInterval(timer);
      fadeTimers.current.delete(audio);
      onComplete?.();
    }, 40);
    fadeTimers.current.set(audio, timer);
  }, [cancelFade]);

  const applyAllVolumes = useCallback((nextSettings: AudioSettings) => {
    const musicBlocked = nextSettings.muted || !nextSettings.musicEnabled;
    const activeScene = sceneAudio.current;
    if (musicBlocked) stopRetiredScenes(activeScene ?? undefined);
    if (activeScene?.dataset.scene) {
      cancelFade(activeScene);
      const config = musicScenes[activeScene.dataset.scene as MusicScene];
      const targetVolume = musicBlocked ? 0 : config.volume * nextSettings.volume * (sceneDuck.current ? 0.42 : 1);
      setAudioVolume(activeScene, targetVolume);
      if (musicBlocked) {
        activeScene.pause();
      } else if (unlockedRef.current && targetVolume > 0) {
        void playExclusiveMusic(activeScene);
      }
    }
    for (const audio of Object.values(layerAudio.current)) {
      if (!audio) continue;
      cancelFade(audio);
      audio.pause();
      setAudioVolume(audio, 0);
    }
  }, [cancelFade, stopRetiredScenes]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  useEffect(() => {
    queueMicrotask(() => {
      const loaded = loadAudioSettingsFromStorage(window.localStorage.getItem(audioSettingsStorageKey));
      setSettings(loaded);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(audioSettingsStorageKey, JSON.stringify(settings));
    applyAllVolumes(settings);
  }, [applyAllVolumes, settings]);

  const unlock = useCallback(() => {
    setUnlocked(true);
    if (sceneAudio.current && settingsRef.current.musicEnabled && !settingsRef.current.muted) {
      void playExclusiveMusic(sceneAudio.current);
    }
    for (const audio of Object.values(layerAudio.current)) {
      stopAudio(audio);
    }
  }, [stopAudio]);

  useEffect(() => {
    const handlePointer = () => unlock();
    window.addEventListener("pointerdown", handlePointer, { once: true });
    window.addEventListener("keydown", handlePointer, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("keydown", handlePointer);
    };
  }, [unlock]);

  useEffect(() => () => {
    stopAudio(sceneAudio.current);
    for (const audio of retiredSceneAudio.current) {
      stopAudio(audio);
    }
    retiredSceneAudio.current = [];
    for (const audio of Object.values(layerAudio.current)) {
      stopAudio(audio);
    }
  }, [stopAudio]);

  const setScene = useCallback((nextScene: MusicScene, options: { duck?: boolean } = {}) => {
    setSceneState(nextScene);
    const config = musicScenes[nextScene];
    const current = sceneAudio.current;
    const duck = Boolean(options.duck);
    stopRetiredScenes(current ?? undefined);
    for (const audio of Object.values(layerAudio.current)) {
      stopAudio(audio);
    }
    if (current?.dataset.scene === nextScene) {
      sceneDuck.current = duck;
      const targetVolume = settingsRef.current.muted || !settingsRef.current.musicEnabled
        ? 0
        : config.volume * settingsRef.current.volume * (duck ? 0.42 : 1);
      if (unlockedRef.current && targetVolume > 0) void playExclusiveMusic(current);
      fadeTo(current, targetVolume, 260);
      return;
    }
    stopAudio(current);
    const next = new Audio(config.path);
    next.loop = config.loop;
    next.preload = "auto";
    next.dataset.scene = nextScene;
    sceneDuck.current = duck;
    const targetVolume = settingsRef.current.muted || !settingsRef.current.musicEnabled
      ? 0
      : config.volume * settingsRef.current.volume * (duck ? 0.42 : 1);
    setAudioVolume(next, 0);
    sceneAudio.current = next;
    if (unlockedRef.current && targetVolume > 0) void playExclusiveMusic(next);
    fadeTo(next, targetVolume, 260);
  }, [fadeTo, stopAudio, stopRetiredScenes]);

  const setLayerIntensity = useCallback((layer: MusicLayer, intensity: number) => {
    const clamped = Math.max(0, Math.min(1, intensity));
    layerTargets.current[layer] = clamped;
    stopAudio(layerAudio.current[layer]);
  }, [stopAudio]);

  const value = useMemo<AudioContextValue>(() => ({
    unlocked,
    settings,
    scene,
    setScene,
    setLayerIntensity,
    setMuted: (muted) => setSettings((current) => ({ ...current, muted })),
    setVolume: (volume) => setSettings((current) => ({ ...current, volume: Math.max(0, Math.min(1, volume)) })),
    setMusicEnabled: (musicEnabled) => setSettings((current) => ({ ...current, musicEnabled })),
    unlock
  }), [scene, setLayerIntensity, setScene, settings, unlock, unlocked]);

  return (
    <GameAudioContext.Provider value={value}>
      {children}
      <AudioControls />
    </GameAudioContext.Provider>
  );

}

export function useGameAudio() {
  const context = useContext(GameAudioContext);
  if (!context) throw new Error("useGameAudio must be used within AudioProvider");
  return context;
}

function AudioControls() {
  const audio = useGameAudio();
  const [open, setOpen] = useState(false);
  const label = audio.settings.muted ? "Audio muted" : audio.unlocked ? "Audio enabled" : "Audio ready";

  return (
    <aside className={open ? "audio-control open" : "audio-control"} aria-label="Audio controls">
      <button
        className="audio-main"
        onClick={() => {
          audio.unlock();
          setOpen((current) => !current);
        }}
        aria-label={label}
      >
        <span aria-hidden="true">{audio.settings.muted ? "OFF" : "AUD"}</span>
      </button>
      <div className="audio-panel">
        <div className="audio-row">
          <b>{label}</b>
          <button onClick={() => audio.setMuted(!audio.settings.muted)}>
            {audio.settings.muted ? "Unmute" : "Mute"}
          </button>
        </div>
        <label>
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audio.settings.volume}
            onChange={(event) => audio.setVolume(Number(event.target.value))}
          />
        </label>
        <div className="audio-toggles">
          <button
            className={audio.settings.musicEnabled ? "active" : ""}
            aria-pressed={audio.settings.musicEnabled}
            onClick={() => audio.setMusicEnabled(!audio.settings.musicEnabled)}
          >
            Music
          </button>
        </div>
      </div>
    </aside>
  );
}
