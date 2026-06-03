"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  audioSettingsStorageKey,
  defaultAudioSettings,
  loadAudioSettingsFromStorage,
  musicLayers,
  musicScenes,
  soundEffects,
  type AudioSettings,
  type MusicLayer,
  type MusicScene,
  type SoundEffect
} from "@/lib/audio";

type AudioContextValue = {
  unlocked: boolean;
  settings: AudioSettings;
  scene: MusicScene | null;
  setScene: (scene: MusicScene, options?: { duck?: boolean }) => void;
  setLayerIntensity: (layer: MusicLayer, intensity: number) => void;
  playSfx: (effect: SoundEffect) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  unlock: () => void;
};

const GameAudioContext = createContext<AudioContextValue | null>(null);

function safePlay(audio: HTMLAudioElement) {
  return audio.play().catch(() => undefined);
}

function setAudioVolume(audio: HTMLAudioElement, value: number) {
  audio.volume = Math.max(0, Math.min(1, value));
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

  const crossfade = useCallback((current: HTMLAudioElement | null, next: HTMLAudioElement, targetVolume: number, duration: number) => {
    cancelFade(current);
    cancelFade(next);
    const startedAt = Date.now();
    const initialCurrentVolume = current?.volume ?? 0;
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / duration);
      setAudioVolume(next, targetVolume * progress);
      if (current) setAudioVolume(current, initialCurrentVolume * (1 - progress));
      if (progress < 1) return;
      window.clearInterval(timer);
      fadeTimers.current.delete(next);
      if (current) {
        fadeTimers.current.delete(current);
        stopAudio(current);
        retiredSceneAudio.current = retiredSceneAudio.current.filter((audio) => audio !== current);
      }
    }, 40);
    fadeTimers.current.set(next, timer);
    if (current) fadeTimers.current.set(current, timer);
  }, [cancelFade, stopAudio]);

  const applyAllVolumes = useCallback((nextSettings: AudioSettings) => {
    const activeScene = sceneAudio.current;
    if (activeScene?.dataset.scene) {
      const config = musicScenes[activeScene.dataset.scene as MusicScene];
      setAudioVolume(activeScene, nextSettings.muted || !nextSettings.musicEnabled ? 0 : config.volume * nextSettings.volume * (sceneDuck.current ? 0.42 : 1));
    }
    for (const [layer, audio] of Object.entries(layerAudio.current) as Array<[MusicLayer, HTMLAudioElement]>) {
      const config = musicLayers[layer];
      const intensity = layerTargets.current[layer] ?? 0;
      setAudioVolume(audio, nextSettings.muted || !nextSettings.musicEnabled ? 0 : config.volume * nextSettings.volume * intensity);
    }
  }, []);

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
      void safePlay(sceneAudio.current);
    }
    for (const [layer, audio] of Object.entries(layerAudio.current) as Array<[MusicLayer, HTMLAudioElement]>) {
      if ((layerTargets.current[layer] ?? 0) > 0 && settingsRef.current.musicEnabled && !settingsRef.current.muted) {
        void safePlay(audio);
      }
    }
  }, []);

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
    if (current?.dataset.scene === nextScene) {
      sceneDuck.current = duck;
      const targetVolume = settingsRef.current.muted || !settingsRef.current.musicEnabled
        ? 0
        : config.volume * settingsRef.current.volume * (duck ? 0.42 : 1);
      if (unlockedRef.current && targetVolume > 0) void safePlay(current);
      fadeTo(current, targetVolume, 260);
      return;
    }
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
    if (unlockedRef.current && targetVolume > 0) void safePlay(next);
    if (current) retiredSceneAudio.current = [...retiredSceneAudio.current, current];
    crossfade(current, next, targetVolume, 620);
  }, [crossfade, fadeTo, stopRetiredScenes]);

  const setLayerIntensity = useCallback((layer: MusicLayer, intensity: number) => {
    const clamped = Math.max(0, Math.min(1, intensity));
    layerTargets.current[layer] = clamped;
    const config = musicLayers[layer];
    let audio = layerAudio.current[layer];
    if (!audio) {
      audio = new Audio(config.path);
      audio.loop = true;
      audio.preload = "auto";
      audio.dataset.layer = layer;
      setAudioVolume(audio, 0);
      layerAudio.current[layer] = audio;
    }
    const targetVolume = settingsRef.current.muted || !settingsRef.current.musicEnabled
      ? 0
      : config.volume * settingsRef.current.volume * clamped;
    if (unlockedRef.current && targetVolume > 0) void safePlay(audio);
    fadeTo(audio, targetVolume, 420, () => {
      if (targetVolume === 0) audio?.pause();
    });
  }, [fadeTo]);

  const playSfx = useCallback((effect: SoundEffect) => {
    const current = settingsRef.current;
    if (!unlockedRef.current || current.muted || !current.sfxEnabled) return;
    const config = soundEffects[effect];
    const audio = new Audio(config.path);
    setAudioVolume(audio, config.volume * current.volume);
    void safePlay(audio);
  }, []);

  const value = useMemo<AudioContextValue>(() => ({
    unlocked,
    settings,
    scene,
    setScene,
    setLayerIntensity,
    playSfx,
    setMuted: (muted) => setSettings((current) => ({ ...current, muted })),
    setVolume: (volume) => setSettings((current) => ({ ...current, volume: Math.max(0, Math.min(1, volume)) })),
    setMusicEnabled: (musicEnabled) => setSettings((current) => ({ ...current, musicEnabled })),
    setSfxEnabled: (sfxEnabled) => setSettings((current) => ({ ...current, sfxEnabled })),
    unlock
  }), [playSfx, scene, setLayerIntensity, setScene, settings, unlock, unlocked]);

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
          audio.playSfx("uiClick");
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
            onClick={() => audio.setMusicEnabled(!audio.settings.musicEnabled)}
          >
            Music
          </button>
          <button
            className={audio.settings.sfxEnabled ? "active" : ""}
            onClick={() => audio.setSfxEnabled(!audio.settings.sfxEnabled)}
          >
            SFX
          </button>
        </div>
      </div>
    </aside>
  );
}
