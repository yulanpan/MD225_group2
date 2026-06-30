import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioProvider, useGameAudio } from "./audio-provider";

class MockAudio {
  dataset: Record<string, string> = {};
  loop = false;
  paused = true;
  preload = "";
  src: string;
  volume = 0;

  constructor(src: string) {
    this.src = src;
    mockAudioInstances.push(this);
  }

  pause() {
    this.paused = true;
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }
}

const mockAudioInstances: MockAudio[] = [];

function audibleMusicScenes() {
  return mockAudioInstances
    .filter((audio) => audio.dataset.scene && !audio.paused && audio.volume > 0)
    .map((audio) => audio.dataset.scene);
}

function audibleMusicCount() {
  return mockAudioInstances.filter((audio) => !audio.paused && audio.volume > 0).length;
}

function AudioHarness() {
  const audio = useGameAudio();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    audio.setScene("dashboard");
    audio.setLayerIntensity("pressure", 1);
    audio.unlock();
  }, [audio]);

  return null;
}

function SceneSwitchHarness() {
  const audio = useGameAudio();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    audio.setScene("dashboard");
    audio.setLayerIntensity("pressure", 1);
    audio.unlock();
    window.setTimeout(() => audio.setScene("dialogue"), 650);
  }, [audio]);

  return null;
}

describe("AudioProvider controls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAudioInstances.length = 0;
    vi.stubGlobal("Audio", MockAudio);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("stops active music and cancels fades when Music is switched off", async () => {
    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(mockAudioInstances.length).toBeGreaterThan(0);
    expect(mockAudioInstances.some((audio) => !audio.paused)).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Music" }));
    expect(screen.getByRole("button", { name: "Music" })).toHaveAttribute("aria-pressed", "false");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    for (const audio of mockAudioInstances) {
      expect(audio.paused).toBe(true);
      expect(audio.volume).toBe(0);
    }
  });

  it("keeps exactly one music track audible while switching scenes", async () => {
    render(
      <AudioProvider>
        <SceneSwitchHarness />
      </AudioProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(620);
    });
    expect(audibleMusicScenes()).toEqual(["dashboard"]);
    expect(audibleMusicCount()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(80);
    });

    expect(audibleMusicScenes()).toEqual(["dialogue"]);
    expect(audibleMusicCount()).toBe(1);
    expect(mockAudioInstances.filter((audio) => audio.dataset.layer && !audio.paused && audio.volume > 0)).toHaveLength(0);
  });
});
