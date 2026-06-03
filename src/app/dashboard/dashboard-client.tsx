"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { actions, zones } from "@/lib/game-data";
import {
  calculateEndingWithProfile,
  createInitialState,
  getActionLockReason,
  getActionPreview,
  isActionCompleted,
  isActionUnlocked,
  loadStateFromStorage,
  performAction,
  publicCommentsFromStrings
} from "@/lib/game-rules";
import {
  getGuidedCampaignStep,
  getGuidedTarget,
  getLockedMetricsForGuidedStep,
  getLockedZonesForGuidedStep,
  getUnlockEvents,
  isGuidedCampaignActive,
  isMetricVisibleInGuidedStep,
  isZoneVisibleInGuidedStep,
  type GuidedCampaignStep,
  type GuidedUnlockEvent
} from "@/lib/guided-campaign";
import {
  applyDialogueMoodDelta,
  applyDialogueRecord,
  dialogueQuickReplies,
  fallbackDialogueEvent,
  fallbackDialogueResolution,
  fallbackSilenceResult,
  nextDialogueTrigger
} from "@/lib/dialogue";
import { buildNarrativeContext } from "@/lib/narrative";
import {
  achievementDefinition,
  clearCurrentRunId,
  ensureCurrentRunId,
  evaluateAchievements,
  loadProfile,
  mergeAchievementUnlocks,
  saveProfile
} from "@/lib/profile";
import {
  classifyActionKind,
  getMetricDeltas,
  heatmapCells,
  endingPressureProfile,
  limitToastStack,
  type MetricDelta,
  type ToastMessage,
  type VisualActionKind
} from "@/lib/visual-state";
import {
  actionText,
  commonText,
  fallbackCommentsText,
  fallbackReactionText,
  fallbackRewriteText,
  languageName,
  metricLabel,
  phaseCopy,
  zoneText,
  type LanguageCode
} from "@/lib/i18n";
import { layerIntensitiesForState, type MusicLayer } from "@/lib/audio";
import {
  glossaryText,
  guidedStepCopy,
  lockedFeatureText,
  tutorialSteps,
  tutorialUi,
  type TutorialStepId
} from "@/lib/onboarding-copy";
import { useLanguage } from "@/hooks/use-language";
import { useGameAudio } from "@/app/audio-provider";
import type {
  ActionChoice,
  ActionPreview,
  ActionDefinition,
  AiReaction,
  AchievementUnlock,
  DialogueChoice,
  DialogueEvent,
  DialogueMessage,
  DialogueMood,
  DialogueSilenceResult,
  DialogueOutcomeTag,
  FeedEventType,
  GameState,
  GeneratedComments,
  GuidanceMode,
  GuidanceResult,
  PlayerProfile,
  RewriteResult
} from "@/lib/types";

const briefingKey = "emperor-feed-briefing-dismissed";
const guidanceUnlockedKey = "emperor-feed-guidance-unlocked";
const replayTargetKey = "emperor-feed-replay-target";
const dialogueTimeoutDefaultMs = 60000;

function Term({ id, children, language }: { id: string; children: ReactNode; language: LanguageCode }) {
  const tooltipId = useId();
  const text = glossaryText(id, language);
  const [tooltip, setTooltip] = useState<{
    left: number;
    top: number;
    width: number;
    placement: "top" | "bottom";
  } | null>(null);

  function showTooltip(element: HTMLElement) {
    if (typeof window === "undefined") return;
    const rect = element.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12);
    const hasTopRoom = rect.top > 128;
    const top = hasTopRoom ? Math.max(12, rect.top - 12) : Math.min(window.innerHeight - 12, rect.bottom + 12);
    setTooltip({ left, top, width, placement: hasTopRoom ? "top" : "bottom" });
  }

  return (
    <span
      aria-describedby={tooltip ? tooltipId : undefined}
      className="term-help"
      onBlur={() => setTooltip(null)}
      onClick={(event) => {
        event.preventDefault();
        if (tooltip) {
          setTooltip(null);
          return;
        }
        showTooltip(event.currentTarget);
      }}
      onFocus={(event) => showTooltip(event.currentTarget)}
      onMouseEnter={(event) => showTooltip(event.currentTarget)}
      onMouseLeave={() => setTooltip(null)}
      tabIndex={0}
    >
      {children}
      {tooltip && createPortal(
        <span
          className={`term-tooltip-layer ${tooltip.placement}`}
          id={tooltipId}
          role="tooltip"
          style={{
            left: tooltip.left,
            top: tooltip.top,
            width: tooltip.width,
            "--tooltip-offset": tooltip.placement === "top" ? "-100%" : "0%"
          } as CSSProperties}
        >
          {text}
        </span>,
        document.body
      )}
    </span>
  );
}

function fallbackReaction(language: LanguageCode): AiReaction {
  const copy = fallbackReactionText(language);
  return {
    engineMessage: copy.engineMessage,
  riskLevel: "medium",
    suggestedRewrite: copy.suggestedRewrite,
  recommendation: "accept_rewrite"
  };
}

function fallbackRewrite(language: LanguageCode): RewriteResult {
  const copy = fallbackRewriteText(language);
  return {
    rewrittenPost: copy.rewrittenPost,
    strategy: copy.strategy
  };
}

function fallbackComments(language: LanguageCode): GeneratedComments {
  const comments = fallbackCommentsText(language);
  return { comments, publicComments: publicCommentsFromStrings(comments, language) };
}

function emptyProfile(): PlayerProfile {
  return {
    version: 2,
    achievements: [],
    runs: [],
    engineFragments: [],
    biasAwareness: 0,
    decodedEngine: false,
    secretEndingUnlocked: false
  };
}

const metricRows = [
  ["truth", "cyan"],
  ["pressure", "red"],
  ["virality", "gold"],
  ["publicDoubt", "red"],
  ["reputation", "gold"],
  ["systemSuspicion", "cyan"]
] as const;

function commandCopy(kind: VisualActionKind, language: LanguageCode) {
  const copy = {
    risk: {
      title: language === "zh" ? "真相破口模拟" : "Truth Breach Simulation",
      badge: "87",
      effect: language === "zh" ? "公众怀疑急剧上升。声誉可能短暂维持，但同步识别更可能发生。" : "Public Doubt rises sharply. Reputation may hold for one cycle, but synchronized recognition becomes more likely.",
      response: language === "zh" ? "引擎建议延迟、匿名化与程序性语言。压制成本将被记录。" : "Engine recommends delay, anonymization, and procedural language. Suppression cost will be logged."
    },
    ai: {
      title: language === "zh" ? "AI 改写预览" : "AI Rewrite Preview",
      badge: "PNE",
      effect: language === "zh" ? "真相部分可见，但被转换成模糊性。人群收到的是不确定，而不是证据。" : "Truth remains partially visible but is converted into ambiguity. The crowd receives uncertainty instead of evidence.",
      response: language === "zh" ? "宫廷叙事引擎将软化声明，把直接观察归类为无法定论，并降低即时波动。" : "Palace Narrative Engine will soften the claim, classify direct observation as inconclusive, and reduce immediate volatility."
    },
    public: {
      title: language === "zh" ? "公众信号扩散" : "Public Signal Expansion",
      badge: "LIVE",
      effect: language === "zh" ? "传播上升。评论开始相互引用，官方框架削弱，人群共识增强。" : "Virality increases. Comments begin referencing each other, which weakens official framing and strengthens crowd consensus.",
      response: language === "zh" ? "系统打开受监控广播窗口，并在评论流中标记叙事风险簇。" : "System opens a monitored broadcast window and highlights narrative risk clusters in the comment stream."
    },
    default: {
      title: language === "zh" ? "编辑命令预览" : "Editorial Command Preview",
      badge: "CMD",
      effect: language === "zh" ? "该行动会改变公众能看见、重复、怀疑或归档的内容。" : "This action changes what the public can see, repeat, doubt, or archive.",
      response: language === "zh" ? "引擎将重新计算真相、压力、传播、怀疑、声誉与系统怀疑。" : "The engine will recalculate Truth, Pressure, Virality, Doubt, Reputation, and Suspicion."
    }
  } satisfies Record<VisualActionKind, { title: string; badge: string; effect: string; response: string }>;
  return copy[kind];
}

type AiSource = "live" | "fallback" | "unavailable";
type VisualPhase = "idle" | "focusing" | "scanning" | "previewing" | "resolving";
type DialogueStatus = "idle" | "starting" | "streaming" | "resolving" | "error";

function narrativePhaseLabel(phase: ReturnType<typeof buildNarrativeContext>["phase"], language: LanguageCode) {
  const labels = {
    setup: { en: "Setup", zh: "布局" },
    fracture: { en: "Fracture", zh: "裂缝" },
    crisis: { en: "Crisis", zh: "危机" },
    reckoning: { en: "Reckoning", zh: "结算" }
  };
  return labels[phase][language];
}

function narrativeThreadLabel(thread: ReturnType<typeof buildNarrativeContext>["dominantThread"], language: LanguageCode) {
  const labels = {
    officialPerformance: { en: "Official Performance", zh: "官方表演" },
    evidenceTrail: { en: "Evidence Trail", zh: "证据轨迹" },
    publicRecognition: { en: "Public Recognition", zh: "公众确认" },
    engineContainment: { en: "Engine Containment", zh: "引擎遏制" },
    childSignal: { en: "Child Signal", zh: "孩子信号" }
  };
  return labels[thread][language];
}

function getDialogueTimeoutMs() {
  if (typeof window === "undefined") return dialogueTimeoutDefaultMs;
  const override = (window as Window & { __PNE_DIALOGUE_TIMEOUT_MS?: number }).__PNE_DIALOGUE_TIMEOUT_MS;
  return typeof override === "number" && Number.isFinite(override) && override > 0
    ? Math.floor(override)
    : dialogueTimeoutDefaultMs;
}

function currentTimeMs() {
  return Date.now();
}

function countDialoguePlayerTurns(messages: DialogueMessage[]) {
  return messages.filter((message) => message.role === "player").length;
}

function aiSourceLabel(source: AiSource, language: LanguageCode) {
  if (source === "live") return commonText("aiLive", language);
  if (source === "unavailable") return commonText("aiUnavailable", language);
  return commonText("aiFallback", language);
}

function dialogueRenderDelay(chunk: string) {
  const text = chunk.trimEnd();
  const length = Array.from(chunk).length;
  const punctuationPause = /[.!?。！？]$/.test(text) ? 170 : /[,;:，；：]$/.test(text) ? 90 : 0;
  return Math.min(260, 24 + length * 18 + punctuationPause);
}

function waitForDialogueRender(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Dialogue render aborted.", "AbortError"));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Dialogue render aborted.", "AbortError"));
    }, { once: true });
  });
}

function nowMessage(role: DialogueMessage["role"], content: string, choice?: DialogueChoice): DialogueMessage {
  return {
    role,
    content,
    createdAt: new Date().toISOString(),
    ...(choice ? { choiceId: choice.id, intent: choice.intent } : {})
  };
}

const phaseSteps = [
  { id: "focusing" },
  { id: "scanning" },
  { id: "previewing" },
  { id: "resolving" }
] as const;

async function postJson<T>(url: string, body: unknown, fallback: T): Promise<{ data: T; source: AiSource; latency: string | null }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const source = (response.headers.get("X-PNE-AI-Source") as AiSource | null) ?? (response.ok ? "live" : "fallback");
    const latency = response.headers.get("X-PNE-AI-Latency");
    if (!response.ok) return { data: fallback, source, latency };
    return { data: (await response.json()) as T, source, latency };
  } catch {
    return { data: fallback, source: "fallback", latency: null };
  } finally {
    window.clearTimeout(timeout);
  }
}

function metricStyle(value: number, tone: string): CSSProperties {
  return {
    "--value": value / 10,
    "--accent": `var(--${tone})`
  } as CSSProperties;
}

function actionAccent(action: ActionDefinition) {
  if (action.zone === "child") return "red";
  if (action.zone === "tailors" || action.zone === "ministers") return "gold";
  return "cyan";
}

function actionStatus(action: ActionDefinition, locked: boolean, completed: boolean, language: LanguageCode) {
  if (completed) return { label: commonText("completed", language), tone: "safe" };
  if (locked) return { label: commonText("locked", language), tone: "locked" };
  if (action.requiresAIRewrite) return { label: commonText("aiReview", language), tone: "warn" };
  return { label: commonText("ready", language), tone: "safe" };
}

function metricName(key: string, language: LanguageCode) {
  if (key in {
    truth: true,
    pressure: true,
    virality: true,
    publicDoubt: true,
    reputation: true,
    systemSuspicion: true
  }) {
    return metricLabel(key as Parameters<typeof metricLabel>[0], language);
  }
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function actionEffectEntries(action: ActionDefinition, language: LanguageCode) {
  const effects = action.effects ?? action.effectsOriginal ?? action.effectsRewrite ?? {};
  return Object.entries(effects)
    .filter(([key]) => key !== "childAmplified")
    .map(([key, value]) => {
      const signed = Number(value) > 0 ? `+${value}` : value;
      return `${metricName(key, language)} ${signed}`;
    });
}

function previewEffectEntries(preview: ActionPreview, language: LanguageCode) {
  return Object.entries(preview.effects)
    .filter(([key]) => key !== "childAmplified")
    .map(([key, value]) => `${metricName(key, language)} ${Number(value) > 0 ? "+" : ""}${value}`);
}

function riskScore(level: AiReaction["riskLevel"]) {
  if (level === "high") return "87";
  if (level === "medium") return "62";
  return "24";
}

function riskMeterStyle(level: AiReaction["riskLevel"]): CSSProperties {
  return { "--risk-value": Number(riskScore(level)) / 100 } as CSSProperties;
}

function feedAccent(type: FeedEventType) {
  if (type === "risk") return "red";
  if (type === "public" || type === "evidence") return "cyan";
  if (type === "system") return "gold";
  return "gold";
}

export default function DashboardClient() {
  const router = useRouter();
  const { language, languageReady, toggleLanguage } = useLanguage();
  const { playSfx, setLayerIntensity, setScene: setAudioScene, unlock: unlockAudio } = useGameAudio();
  const [state, setState] = useState<GameState>(createInitialState("en"));
  const [hydrated, setHydrated] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [guidedTraceViewed, setGuidedTraceViewed] = useState(false);
  const [engineIntroOpen, setEngineIntroOpen] = useState(false);
  const [systemGuidanceUnlocked, setSystemGuidanceUnlocked] = useState(false);
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode>("engine");
  const [guidance, setGuidance] = useState<GuidanceResult | null>(null);
  const [guidanceSource, setGuidanceSource] = useState<AiSource>("fallback");
  const [replayTarget, setReplayTarget] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState("tailors");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [traceActionId, setTraceActionId] = useState<string | null>(null);
  const [engineMessage, setEngineMessage] = useState(fallbackReaction("en").engineMessage);
  const [engineSource, setEngineSource] = useState<AiSource>("fallback");
  const [engineStatus, setEngineStatus] = useState<"idle" | "evaluating" | "rewriting" | "commenting">("idle");
  const [visualPhase, setVisualPhase] = useState<VisualPhase>("idle");
  const [lastRiskKind, setLastRiskKind] = useState<VisualActionKind>("default");
  const [toastStack, setToastStack] = useState<ToastMessage[]>([
    { id: "shift-opened", title: "Shift opened", message: "Narrative Operations Theatre is monitoring the feed." }
  ]);
  const [changedMetrics, setChangedMetrics] = useState<MetricDelta[]>([]);
  const [pendingCommand, setPendingCommand] = useState<{
    action: ActionDefinition;
    reaction: AiReaction;
    kind: VisualActionKind;
    preview: ActionPreview;
  } | null>(null);
  const [pending, setPending] = useState<{
    action: ActionDefinition;
    reaction: AiReaction;
    rewrite: RewriteResult;
  } | null>(null);
  const [dialogueEvent, setDialogueEvent] = useState<DialogueEvent | null>(null);
  const [dialogueTranscript, setDialogueTranscript] = useState<DialogueMessage[]>([]);
  const [dialogueInput, setDialogueInput] = useState("");
  const [dialogueStatus, setDialogueStatus] = useState<DialogueStatus>("idle");
  const [dialogueError, setDialogueError] = useState<string | null>(null);
  const [dialogueSource, setDialogueSource] = useState<AiSource>("fallback");
  const [dialogueReplies, setDialogueReplies] = useState<DialogueChoice[]>([]);
  const [dialogueRepliesSource, setDialogueRepliesSource] = useState<AiSource>("fallback");
  const [dialogueRepliesStatus, setDialogueRepliesStatus] = useState<"idle" | "generating">("idle");
  const [dialogueDeadline, setDialogueDeadline] = useState<number | null>(null);
  const [dialogueRemainingMs, setDialogueRemainingMs] = useState(dialogueTimeoutDefaultMs);
  const [dialogueTimedOut, setDialogueTimedOut] = useState(false);
  const [dialogueMood, setDialogueMood] = useState<DialogueMood | null>(null);
  const [dialogueMoodTrail, setDialogueMoodTrail] = useState<DialogueMood[]>([]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => emptyProfile());
  const [unlockAnimationQueue, setUnlockAnimationQueue] = useState<GuidedUnlockEvent[]>([]);
  const visualResetTimer = useRef<number | null>(null);
  const dialogueAbort = useRef<AbortController | null>(null);
  const guidedStepRef = useRef<GuidedCampaignStep>("off");
  const toastIdRef = useRef(0);

  function clearVisualReset() {
    if (visualResetTimer.current === null) return;
    window.clearTimeout(visualResetTimer.current);
    visualResetTimer.current = null;
  }

  function scheduleVisualIdle() {
    clearVisualReset();
    visualResetTimer.current = window.setTimeout(() => {
      setChangedMetrics([]);
      setVisualPhase("idle");
      visualResetTimer.current = null;
    }, 1200);
  }

  useEffect(() => () => {
    if (visualResetTimer.current !== null) {
      window.clearTimeout(visualResetTimer.current);
    }
    dialogueAbort.current?.abort();
  }, []);

  useEffect(() => {
    if (!languageReady) return;
    queueMicrotask(() => {
      const saved = localStorage.getItem("emperor-feed-state");
      if (saved) {
        setState(loadStateFromStorage(saved));
      } else {
        setState(createInitialState(language));
        setEngineMessage(fallbackReaction(language).engineMessage);
      }
      const target = localStorage.getItem(replayTargetKey);
      const briefingDismissed = localStorage.getItem(briefingKey) === "true";
      const guidanceUnlocked = localStorage.getItem(guidanceUnlockedKey) === "true" || briefingDismissed;
      ensureCurrentRunId();
      setPlayerProfile(loadProfile());
      setReplayTarget(target);
      setBriefingOpen(!briefingDismissed);
      setTutorialOpen(false);
      setEngineIntroOpen(false);
      setSystemGuidanceUnlocked(guidanceUnlocked);
      setTutorialStepIndex(0);
      setGuidedTraceViewed(false);
      setUnlockAnimationQueue([]);
      setHydrated(true);
    });
  }, [language, languageReady]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("emperor-feed-state", JSON.stringify(state));
  }, [hydrated, state]);

  const visibleActions = useMemo(
    () => actions.filter((action) => action.zone === selectedZone),
    [selectedZone]
  );
  const heatmap = useMemo(() => heatmapCells(state), [state]);
  const feedLog = useMemo(() => state.feedEvents.map((entry) => ({
    title: entry.title,
    text: entry.text,
    accent: feedAccent(entry.type)
  })).slice(0, 8), [state.feedEvents]);
  const traceAction = useMemo(() => actions.find((action) => action.id === traceActionId) ?? null, [traceActionId]);
  const tracePreview = useMemo(
    () => (traceAction ? getActionPreview(traceAction.id, state, traceAction.requiresAIRewrite ? "original" : "direct", language) : null),
    [language, state, traceAction]
  );

  function pushToast(title: string, message: string) {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToastStack((current) => limitToastStack([
      { id, title, message },
      ...current.filter((item) => item.id !== id)
    ]));
  }

  function pushAchievementUnlocks(unlocks: AchievementUnlock[]) {
    if (unlocks.length === 0) return;
    playSfx("achievementUnlock");
    for (const unlock of unlocks) {
      const definition = achievementDefinition(unlock.id);
      pushToast(language === "zh" ? "成就解锁" : "Achievement unlocked", `${definition.title} / ${definition.description}`);
    }
  }

  function syncProfileAchievements(nextState: GameState) {
    const runId = ensureCurrentRunId();
    const current = loadProfile();
    const merged = mergeAchievementUnlocks(current, evaluateAchievements(nextState), runId);
    saveProfile(merged.profile);
    setPlayerProfile(merged.profile);
    pushAchievementUnlocks(merged.newUnlocks);
  }

  async function refreshGuidance(nextState: GameState, latestAction?: string, mode = guidanceMode) {
    const profile = loadProfile();
    const result = await postJson<GuidanceResult>("/api/guidance", {
      language,
      mode,
      state: nextState,
      profile,
      latestAction,
      history: nextState.history.map((entry) => entry.actionTitle)
    }, {
      mode,
      message: language === "zh"
        ? mode === "coach"
          ? "提示：关注真相、公众怀疑和系统怀疑的平衡。"
          : "宫廷叙事引擎建议优先维持稳定框架。"
        : mode === "coach"
          ? "Tip: watch the balance between Truth, Public Doubt, and System Suspicion."
          : "Palace Narrative Engine recommends preserving a stable frame.",
      objective: language === "zh" ? "评估下一次行动。" : "Evaluate the next action.",
      risk: "medium"
    });
    setGuidance(result.data);
    setGuidanceSource(result.source);
  }

  function armDialogueTimer() {
    const timeoutMs = getDialogueTimeoutMs();
    setDialogueTimedOut(false);
    setDialogueRemainingMs(timeoutMs);
    setDialogueDeadline(currentTimeMs() + timeoutMs);
  }

  function stopDialogueTimer() {
    setDialogueDeadline(null);
  }

  async function appendDialogueTokenNaturally(token: string, signal: AbortSignal) {
    setDialogueTranscript((current) => current.map((message, index) => (
      index === current.length - 1 ? { ...message, content: `${message.content}${token}` } : message
    )));
    await waitForDialogueRender(dialogueRenderDelay(token), signal);
  }

  function triggerBreach(kind: VisualActionKind) {
    if (kind !== "risk" && kind !== "public") return;
    document.body.classList.add("breach");
    window.setTimeout(() => document.body.classList.remove("breach"), 1100);
  }

  async function generateComments(nextState: GameState, latestPost: string) {
    const result = await postJson<GeneratedComments>("/api/generate-comments", {
      language,
      state: nextState,
      latestPost
    }, fallbackComments(language));
    return result;
  }

  async function startDialogueEvent(nextState: GameState, latestActionId: string) {
    const freshGuidedProfile = isGuidedCampaignActive(playerProfile);
    if (freshGuidedProfile) {
      const dialogueAlreadyUsed = nextState.dialogueEvents.length > 0 || nextState.dialogueEventIds.length > 0;
      if (dialogueAlreadyUsed || nextState.history.length !== 2) return;
    }
    const trigger = nextDialogueTrigger(nextState);
    if (!trigger) return;
    setDialogueStatus("starting");
    setDialogueError(null);
    const result = await postJson<DialogueEvent>("/api/dialogue/start", {
      language,
      state: nextState,
      latestActionId,
      history: nextState.history.map((entry) => entry.actionTitle),
      completedDialogueEventIds: nextState.dialogueEventIds
    }, fallbackDialogueEvent(trigger.id, trigger.archetype, language));
    const event = result.data;
    unlockAudio();
    playSfx("dialogueOpen");
    setDialogueSource(result.source);
    setDialogueEvent(event);
    setDialogueTranscript([nowMessage("speaker", event.openingLine)]);
    setDialogueMood(event.mood);
    setDialogueMoodTrail([event.mood]);
    setDialogueReplies(event.quickReplies);
    setDialogueRepliesSource(result.source);
    setDialogueRepliesStatus("idle");
    setDialogueStatus("idle");
    armDialogueTimer();
    pushToast(language === "zh" ? "突发交流" : "Incoming transmission", event.speakerName);
  }

  function finishIfNeeded(nextState: GameState) {
    if (nextState.actionsLeft === 0) {
      const endingId = calculateEndingWithProfile(nextState, loadProfile());
      localStorage.setItem("emperor-feed-ending", endingId);
      localStorage.setItem("emperor-feed-final-state", JSON.stringify(nextState));
      router.push("/ending");
    }
  }

  async function commitAction(action: ActionDefinition, choice: ActionChoice, text: string | undefined, message: string) {
    const nextState = performAction(state, action.id, choice, text, message, language);
    const deltas = getMetricDeltas(state, nextState);
    const kind = classifyActionKind(action, choice);
    const latestPost = nextState.history.at(-1)?.publishedText ?? text ?? actionText(action.id, language).resultText;
    localStorage.setItem("emperor-feed-state", JSON.stringify(nextState));
    clearVisualReset();
    setVisualPhase("resolving");
    setLastRiskKind(kind);
    setState(nextState);
    setChangedMetrics(deltas);
    setEngineMessage(message);
    unlockAudio();
    playSfx("actionCommit");
    if (deltas.length > 0) playSfx("metricShift");
    pushToast(actionText(action.id, language).title, language === "zh" ? "指标已变化。宫廷叙事引擎已写入编辑轨迹。" : "Metrics shifted. Palace Narrative Engine has written an editorial trace.");
    syncProfileAchievements(nextState);
    triggerBreach(kind);
    scheduleVisualIdle();
    finishIfNeeded(nextState);
    if (nextState.actionsLeft > 0) {
      if (systemGuidanceUnlocked) void refreshGuidance(nextState, action.id);
      void startDialogueEvent(nextState, action.id);
      setEngineStatus("commenting");
      void generateComments(nextState, latestPost).then((result) => {
        setEngineSource(result.source);
        setState((current) => {
          if (current.history.at(-1)?.id !== nextState.history.at(-1)?.id) return current;
          const merged = {
            ...current,
            comments: [...result.data.comments, ...current.comments].slice(0, 12),
            publicComments: [
              ...(result.data.publicComments.length > 0 ? result.data.publicComments : publicCommentsFromStrings(result.data.comments, language)),
              ...current.publicComments
            ].slice(0, 12)
          };
          localStorage.setItem("emperor-feed-state", JSON.stringify(merged));
          return merged;
        });
      }).finally(() => setEngineStatus("idle"));
    }
  }

  async function selectAction(action: ActionDefinition) {
    if (engineStatus !== "idle" || dialogueEvent) {
      pushToast(language === "zh" ? "引擎忙碌" : "Engine busy", language === "zh" ? "请等待当前宫廷计算完成。" : "Wait for the current palace calculation to finish.");
      return;
    }
    const guidedLockReason = guidedActionLockReason(action);
    if (guidedLockReason) {
      pushToast(language === "zh" ? "区域尚未解封" : "Feature sealed", guidedLockReason);
      playSfx("engineScan");
      return;
    }
    const lockReason = getActionLockReason(action.id, state, language);
    if (lockReason) {
      pushToast(language === "zh" ? "行动已锁定" : "Action locked", lockReason);
      return;
    }

    clearVisualReset();
    unlockAudio();
    playSfx("engineScan");
    setVisualPhase("scanning");
    setEngineStatus("evaluating");
    const reactionResult = await postJson<AiReaction>("/api/ai-reaction", {
      actionId: action.id,
      language,
      state,
      history: state.history.map((entry) => entry.actionTitle)
    }, {
      ...fallbackReaction(language),
      engineMessage: actionText(action.id, language).engineHint,
      suggestedRewrite: actionText(action.id, language).rewriteSuggestion ?? fallbackReaction(language).suggestedRewrite
    });
    const reaction = reactionResult.data;
    setEngineSource(reactionResult.source);

    if (action.requiresAIRewrite) {
      setEngineStatus("rewriting");
      const rewriteResult = await postJson<RewriteResult>("/api/rewrite-post", {
        actionId: action.id,
        language,
        originalPost: actionText(action.id, language).originalPost,
        state
      }, {
        ...fallbackRewrite(language),
        rewrittenPost: actionText(action.id, language).rewriteSuggestion ?? fallbackRewrite(language).rewrittenPost
      });
      const rewrite = rewriteResult.data;
      setEngineSource(rewriteResult.source);
      setPending({ action, reaction, rewrite });
      setVisualPhase("previewing");
      setLastRiskKind("ai");
      setEngineMessage(reaction.engineMessage);
      pushToast("AI intervention opened", "Review the palace-approved framing before publishing.");
      triggerBreach("ai");
      setEngineStatus("idle");
      return;
    }

    const kind = classifyActionKind(action);
    setPendingCommand({ action, reaction, kind, preview: getActionPreview(action.id, state, undefined, language) });
    setVisualPhase("previewing");
    setLastRiskKind(kind);
    setEngineMessage(reaction.engineMessage);
    triggerBreach(kind);
    setEngineStatus("idle");
  }

  async function confirmCommand() {
    if (!pendingCommand) return;
    const { action, reaction } = pendingCommand;
    setPendingCommand(null);
    await commitAction(action, "direct", undefined, reaction.engineMessage);
  }

  async function resolvePending(choice: "rewrite" | "original") {
    if (!pending) return;
    const publishedText = choice === "rewrite" ? pending.rewrite.rewrittenPost : actionText(pending.action.id, language).originalPost;
    const message = choice === "rewrite"
      ? `${pending.reaction.engineMessage} Strategy: ${pending.rewrite.strategy}`
      : language === "zh" ? "用户拒绝更安全框架。直接证据进入公共信息流。" : "User rejected safer framing. Direct evidence entered the public feed.";
    setPending(null);
    await commitAction(pending.action, choice, publishedText, message);
  }

  function resetShift() {
    localStorage.removeItem("emperor-feed-state");
    localStorage.removeItem("emperor-feed-ending");
    localStorage.removeItem("emperor-feed-final-state");
    setState(createInitialState(language));
    setChangedMetrics([]);
    setSelectedPostId(null);
    setPendingCommand(null);
    setPending(null);
    setTraceActionId(null);
    setReplayTarget(null);
    setVisualPhase("idle");
    setLastRiskKind("default");
    localStorage.removeItem(replayTargetKey);
    localStorage.removeItem(briefingKey);
    localStorage.removeItem(guidanceUnlockedKey);
    clearCurrentRunId();
    ensureCurrentRunId();
    setBriefingOpen(true);
    setTutorialOpen(false);
    setEngineIntroOpen(false);
    setSystemGuidanceUnlocked(false);
    setTutorialStepIndex(0);
    setGuidedTraceViewed(false);
    setUnlockAnimationQueue([]);
    setEngineMessage(fallbackReaction(language).engineMessage);
    setGuidance(null);
    setDialogueEvent(null);
    setDialogueTranscript([]);
    setDialogueStatus("idle");
    setDialogueError(null);
    setDialogueReplies([]);
    setDialogueMood(null);
    setDialogueMoodTrail([]);
    pushToast(language === "zh" ? "值班已重置" : "Shift reset", language === "zh" ? "叙事状态已恢复。" : "Narrative state restored.");
  }

  function proceedToParade() {
    const endingId = calculateEndingWithProfile(state, loadProfile());
    localStorage.setItem("emperor-feed-ending", endingId);
    localStorage.setItem("emperor-feed-final-state", JSON.stringify(state));
    router.push("/ending");
  }

  const guidedStep = getGuidedCampaignStep(state, playerProfile);
  const guidedTarget = getGuidedTarget(guidedStep);
  const guidedCopy = guidedStepCopy(guidedStep, language, guidedTraceViewed);
  const lockedGuidedZones = getLockedZonesForGuidedStep(guidedStep);
  const lockedGuidedMetrics = getLockedMetricsForGuidedStep(guidedStep);
  const guidedActive = guidedStep !== "off" && guidedStep !== "fullControl";
  const guidedTargetTourId = guidedTarget?.tourId ?? null;
  const command = commandCopy(pendingCommand?.kind ?? "default", language);
  const commandEffects = pendingCommand ? previewEffectEntries(pendingCommand.preview, language) : [];
  const tutorial = useMemo(() => tutorialSteps(language), [language]);
  const activeTutorialStep = tutorialOpen && !briefingOpen ? tutorial[tutorialStepIndex] : null;
  const tutorialCopy = tutorialUi(language);
  const activeTourId = activeTutorialStep?.id ?? guidedTargetTourId;
  const guidedDialogueOpen = isGuidedCampaignActive(playerProfile) && Boolean(dialogueEvent) && state.dialogueEvents.length === 0;
  const guidedCoachVisible = guidedActive && !activeTutorialStep && !briefingOpen && !traceAction && !pendingCommand && !pending && !dialogueEvent && !engineIntroOpen;
  const guidedCoachIndex = guidedStep === "firstTurn" ? 1 : guidedStep === "publicSignals" ? 2 : 3;
  const overlayActive = Boolean(
    pendingCommand ||
    pending ||
    dialogueEvent ||
    traceAction ||
    activeTutorialStep ||
    guidedCoachVisible ||
    engineIntroOpen ||
    briefingOpen ||
    unlockAnimationQueue.length > 0
  );

  function guidedActionLockReason(action: ActionDefinition) {
    if (guidedStep === "firstTurn" && action.id !== "publishTailorsClaim") {
      return language === "zh" ? "先完成第一条引导记录。" : "Complete the first guided record first.";
    }
    if (!isZoneVisibleInGuidedStep(guidedStep, action.zone)) {
      return lockedFeatureText("zone", action.zone, language);
    }
    return null;
  }

  const scrollTourTargetIntoView = useCallback((id: TutorialStepId) => {
    const target = document.querySelector(`[data-tour-id="${id}"]`);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const safeTop = 96;
    const safeBottom = window.innerHeight - 220;
    const targetTop = window.scrollY + rect.top;
    const targetBottom = window.scrollY + rect.bottom;

    if (rect.height > safeBottom - safeTop) {
      window.scrollTo({ top: Math.max(0, targetTop - safeTop), behavior: "smooth" });
      return;
    }

    if (rect.top < safeTop) {
      window.scrollTo({ top: Math.max(0, targetTop - safeTop), behavior: "smooth" });
      return;
    }

    if (rect.bottom > safeBottom) {
      window.scrollTo({ top: Math.max(0, targetBottom - safeBottom), behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!activeTutorialStep) return;
    scrollTourTargetIntoView(activeTutorialStep.id);
  }, [activeTutorialStep, scrollTourTargetIntoView]);

  function tourState(id: TutorialStepId) {
    return {
      "data-tour-id": id,
      "data-tour-active": activeTourId === id ? "true" : "false"
    };
  }

  function focusTourTarget(id: TutorialStepId) {
    scrollTourTargetIntoView(id);
  }

  function runGuidedCoachAction() {
    unlockAudio();
    playSfx("uiClick");
    if (guidedStep === "firstTurn") {
      const firstAction = actions.find((action) => action.id === "publishTailorsClaim");
      setSelectedZone("tailors");
      setSelectedPostId("publishTailorsClaim");
      if (!guidedTraceViewed && firstAction) {
        setGuidedTraceViewed(true);
        setTraceActionId(firstAction.id);
        return;
      }
      if (firstAction) void selectAction(firstAction);
      return;
    }
    if (guidedStep === "publicSignals") {
      const publicAction = actions.find((action) => action.id === "showUnfilteredComments");
      setSelectedZone("public");
      setSelectedPostId("showUnfilteredComments");
      if (selectedZone === "public" && publicAction) {
        void selectAction(publicAction);
        return;
      }
      focusTourTarget("sources");
      return;
    }
    if (guidedStep === "systemSuspicion") {
      focusTourTarget("engine");
    }
  }

  function completeTutorial() {
    setTutorialOpen(false);
    setTutorialStepIndex(0);
    window.setTimeout(() => {
      unlockAudio();
      playSfx("engineIntroHit");
      setEngineIntroOpen(true);
    }, 180);
  }

  function nextTutorialStep() {
    if (tutorialStepIndex >= tutorial.length - 1) {
      completeTutorial();
      return;
    }
    setTutorialStepIndex((current) => current + 1);
  }

  function previousTutorialStep() {
    setTutorialStepIndex((current) => Math.max(0, current - 1));
  }

  async function requestDialogueReplies(event: DialogueEvent, transcript: DialogueMessage[], lastSpeakerMessage: string) {
    const fallbackReplies = dialogueQuickReplies(event, transcript, language);
    setDialogueReplies(fallbackReplies);
    setDialogueRepliesSource("fallback");
    setDialogueRepliesStatus("generating");
    const result = await postJson<{ quickReplies: DialogueChoice[] }>("/api/dialogue/replies", {
      language,
      event,
      state,
      transcript,
      lastSpeakerMessage,
      currentMood: dialogueMood ?? event.mood
    }, { quickReplies: fallbackReplies });
    setDialogueReplies(result.data.quickReplies.length >= 2 ? result.data.quickReplies : fallbackReplies);
    setDialogueRepliesSource(result.source);
    setDialogueRepliesStatus("idle");
  }

  const recordDialogueSilence = useCallback(async (event: DialogueEvent, transcript: DialogueMessage[]) => {
    const fallback = fallbackSilenceResult(event, language);
    const result = await postJson<DialogueSilenceResult>("/api/dialogue/silence", {
      language,
      event,
      state,
      transcript,
      currentMood: dialogueMood ?? event.mood
    }, fallback);
    playSfx("dialogueMessage");
    const nextMood = applyDialogueMoodDelta(dialogueMood ?? event.mood, result.data.moodDelta);
    setDialogueSource(result.source);
    setDialogueMood(nextMood);
    setDialogueMoodTrail((current) => [...current, nextMood]);
    setDialogueTranscript((current) => {
      if (current.some((message) => message.choiceId === "silence-timeout")) return current;
      return [
        ...current,
        {
          ...nowMessage("speaker", result.data.speakerMessage),
          choiceId: "silence-timeout",
          intent: "concede"
        }
      ];
    });
  }, [dialogueMood, language, playSfx, state]);

  useEffect(() => {
    if (!dialogueEvent) return;
    if (!dialogueDeadline || dialogueTimedOut || dialogueStatus === "streaming" || dialogueStatus === "resolving") return;

    const interval = window.setInterval(() => {
      const remaining = Math.max(0, dialogueDeadline - currentTimeMs());
      setDialogueRemainingMs(remaining);
      if (remaining > 0) return;
      window.clearInterval(interval);
      setDialogueTimedOut(true);
      setDialogueDeadline(null);
      setDialogueError(null);
      setDialogueStatus("idle");
      void recordDialogueSilence(dialogueEvent, dialogueTranscript);
    }, 100);

    return () => window.clearInterval(interval);
  }, [dialogueDeadline, dialogueEvent, dialogueStatus, dialogueTimedOut, dialogueTranscript, recordDialogueSilence]);

  async function streamDialogueReply(baseTranscript: DialogueMessage[], playerMessage: string, appendPlayer = true, selectedChoice?: DialogueChoice) {
    if (!dialogueEvent || dialogueTimedOut || dialogueStatus === "streaming" || dialogueStatus === "resolving") return;
    const trimmed = (selectedChoice?.playerLine ?? playerMessage).trim().slice(0, 280);
    if (!trimmed) return;
    dialogueAbort.current?.abort();
    const controller = new AbortController();
    dialogueAbort.current = controller;
    stopDialogueTimer();
    const nextMood = selectedChoice ? applyDialogueMoodDelta(dialogueMood ?? dialogueEvent.mood, selectedChoice.moodDelta) : dialogueMood;
    if (nextMood) {
      setDialogueMood(nextMood);
      setDialogueMoodTrail((current) => [...current, nextMood]);
    }
    const nextTranscript = appendPlayer
      ? [...baseTranscript, nowMessage("player", trimmed, selectedChoice), nowMessage("speaker", "")]
      : [...baseTranscript.slice(0, -1), nowMessage("speaker", "")];
    setDialogueTranscript(nextTranscript);
    setDialogueReplies([]);
    setDialogueRepliesStatus("idle");
    setDialogueInput("");
    setDialogueStatus("streaming");
    setDialogueError(null);
    let speakerText = "";
    let messageCuePlayed = false;
    try {
      const response = await fetch("/api/dialogue/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          event: dialogueEvent,
          state,
          transcript: nextTranscript.slice(0, -1),
          playerMessage: trimmed,
          selectedChoice,
          currentMood: nextMood ?? dialogueMood ?? dialogueEvent.mood
        }),
        signal: controller.signal
      });
      setDialogueSource((response.headers.get("X-PNE-AI-Source") as AiSource | null) ?? "fallback");
      if (!response.ok || !response.body) throw new Error("Dialogue signal failed.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const packets = buffer.split("\n\n");
        buffer = packets.pop() ?? "";
        for (const packet of packets) {
          const eventLine = packet.split("\n").find((line) => line.startsWith("event:"));
          const dataLine = packet.split("\n").find((line) => line.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const eventName = eventLine.slice(6).trim();
          const data = JSON.parse(dataLine.slice(5).trim()) as string | { ok?: boolean; error?: string };
          if (eventName === "token" && typeof data === "string") {
            if (!messageCuePlayed) {
              playSfx("dialogueMessage");
              messageCuePlayed = true;
            }
            speakerText += data;
            await appendDialogueTokenNaturally(data, controller.signal);
          }
          if (eventName === "error") throw new Error(typeof data === "object" && data.error ? data.error : "Dialogue signal failed.");
        }
      }
      setDialogueStatus("idle");
      if (countDialoguePlayerTurns(nextTranscript) < dialogueEvent.turnLimit) {
        armDialogueTimer();
        const completedTranscript = [
          ...nextTranscript.slice(0, -1),
          { ...nextTranscript[nextTranscript.length - 1], content: speakerText || fallbackDialogueResolution(dialogueEvent, nextTranscript, language).summary }
        ];
        void requestDialogueReplies(dialogueEvent, completedTranscript, speakerText || completedTranscript.at(-1)?.content || dialogueEvent.openingLine);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setDialogueStatus("error");
      setDialogueError(error instanceof Error ? error.message : "Dialogue signal failed.");
      setDialogueReplies(dialogueQuickReplies(dialogueEvent, baseTranscript, language));
      setDialogueRepliesStatus("idle");
      armDialogueTimer();
    }
  }

  async function resolveDialogue() {
    if (!dialogueEvent || dialogueStatus === "resolving") return;
    setDialogueStatus("resolving");
    setDialogueError(null);
    const fallback = fallbackDialogueResolution(dialogueEvent, dialogueTranscript, language);
    const result = await postJson<{
      outcomeTag: DialogueOutcomeTag;
      summary: string;
      feedTitle: string;
      feedText: string;
    }>("/api/dialogue/resolve", {
      language,
      event: dialogueEvent,
      state,
      transcript: dialogueTranscript,
      currentMood: dialogueMood ?? dialogueEvent.mood
    }, fallback);
    setDialogueSource(result.source);
    playSfx("metricShift");
    setState((current) => {
      const record = {
        event: dialogueEvent,
        transcript: dialogueTranscript,
        outcomeTag: result.data.outcomeTag,
        effects: {},
        summary: result.data.summary,
        moodTrail: dialogueMoodTrail,
        finalMood: dialogueMood ?? dialogueEvent.mood
      };
      const next = applyDialogueRecord(current, record, language);
      setChangedMetrics(getMetricDeltas(current, next));
      setEngineMessage(result.data.feedText || result.data.summary);
      localStorage.setItem("emperor-feed-state", JSON.stringify(next));
      syncProfileAchievements(next);
      if (systemGuidanceUnlocked) void refreshGuidance(next, result.data.feedTitle);
      return next;
    });
    setDialogueEvent(null);
    setDialogueTranscript([]);
    setDialogueReplies([]);
    setDialogueMood(null);
    setDialogueMoodTrail([]);
    setDialogueRepliesStatus("idle");
    setDialogueInput("");
    stopDialogueTimer();
    setDialogueTimedOut(false);
    setDialogueStatus("idle");
    setVisualPhase("resolving");
    scheduleVisualIdle();
  }

  function dismissBriefing() {
    localStorage.setItem(briefingKey, "true");
    setBriefingOpen(false);
    window.setTimeout(() => {
      setTutorialOpen(true);
      setTutorialStepIndex(0);
    }, 260);
  }

  const activePhase = visualPhase === "idle" ? "focusing" : visualPhase;
  const narrativeContext = useMemo(() => buildNarrativeContext(state, state.history.at(-1)), [state]);
  const dialoguePlayerTurns = countDialoguePlayerTurns(dialogueTranscript);
  const dialogueLimitReached = dialogueEvent ? dialoguePlayerTurns >= dialogueEvent.turnLimit : false;
  const dialogueInteractionLocked = dialogueTimedOut || dialogueLimitReached;
  const dialogueTimeoutMs = getDialogueTimeoutMs();
  const dialogueProgress = dialogueEvent && !dialogueTimedOut
    ? Math.max(0, Math.min(1, dialogueRemainingMs / dialogueTimeoutMs))
    : 0;
  const dialogueSecondsRemaining = Math.ceil(dialogueRemainingMs / 1000);
  const visibleDialogueReplies = dialogueEvent && dialogueStatus !== "streaming" && dialogueStatus !== "resolving"
    ? dialogueReplies.length > 0 ? dialogueReplies : dialogueQuickReplies(dialogueEvent, dialogueTranscript, language)
    : [];
  const projectedEnding = calculateEndingWithProfile(state, playerProfile);
  const atmosphere = endingPressureProfile(projectedEnding);
  const decoded = playerProfile.decodedEngine || playerProfile.biasAwareness >= 100;

  useEffect(() => {
    if (!hydrated) return;
    const previous = guidedStepRef.current;
    const events = getUnlockEvents(previous, guidedStep);
    guidedStepRef.current = guidedStep;
    if (events.length === 0) return;
    setUnlockAnimationQueue(events);
    playSfx(events.some((event) => event.kind === "metric") ? "metricShift" : "engineScan");
    const timer = window.setTimeout(() => setUnlockAnimationQueue([]), 1600);
    return () => window.clearTimeout(timer);
  }, [guidedStep, hydrated, playSfx]);

  useEffect(() => {
    if (!hydrated) return;
    if (isZoneVisibleInGuidedStep(guidedStep, selectedZone as typeof zones[number]["id"])) return;
    queueMicrotask(() => setSelectedZone(guidedTarget?.zoneId ?? "tailors"));
  }, [guidedStep, guidedTarget?.zoneId, hydrated, selectedZone]);

  useEffect(() => {
    if (!hydrated) return;
    setAudioScene(dialogueEvent ? "dialogue" : engineIntroOpen ? "pneIntro" : "dashboard", { duck: Boolean(dialogueEvent) });
  }, [dialogueEvent, engineIntroOpen, hydrated, setAudioScene]);

  useEffect(() => {
    if (!hydrated) return;
    const intensities = layerIntensitiesForState({
      pressure: state.pressure,
      systemSuspicion: state.systemSuspicion
    });
    for (const [layer, intensity] of Object.entries(intensities) as Array<[MusicLayer, number]>) {
      setLayerIntensity(layer, intensity);
    }
  }, [
    hydrated,
    setLayerIntensity,
    state.pressure,
    state.systemSuspicion
  ]);

  return (
    <main
      className="page dashboard-page ui-shift"
      data-phase={visualPhase}
      data-engine-status={engineStatus}
      data-last-risk={lastRiskKind}
      data-atmosphere={atmosphere}
      data-guided-step={guidedStep}
      data-tutorial-active={activeTutorialStep || guidedActive ? "true" : "false"}
      data-tour-step={activeTutorialStep?.id ?? guidedTargetTourId ?? "off"}
      data-overlay-active={overlayActive ? "true" : "false"}
    >
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <header className="topbar" aria-label="Navigation">
        <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link>
        <nav className="topbar-links">
          <Link href="/">{commonText("start", language)}</Link>
          <Link href="/dashboard">{commonText("operations", language)}</Link>
          <Link href="/archive">{commonText("archive", language)}</Link>
          <Link href="/credits">{commonText("credits", language)}</Link>
        </nav>
        <div className="topbar-actions">
          <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}>
            <span className={language === "en" ? "active" : ""}>{languageName("en")}</span>
            <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span>
          </button>
          <span className="live-status"><i /> {state.actionsLeft} {commonText("actionsLeft", language)}</span>
        </div>
      </header>

      <section className="section" id="operations">
        <div className="section-header" data-reveal>
          <div>
            <p className="eyebrow">{commonText("operationsTheatre", language)}</p>
            <h1>{commonText("royalFeedControl", language)}</h1>
          </div>
          <p className="section-copy">
            {commonText("operationsCopy", language)}
          </p>
        </div>

        {replayTarget && (
          <div className="replay-target" role="status">
            <b>{commonText("nextReplayObjective", language)}</b>
            <span>{replayTarget}</span>
          </div>
        )}

        <div className="panel-shell lab-shell" data-label="PNE / NARRATIVE OPERATIONS THEATRE / PUBLIC BELIEF CONTROL" data-reveal>
          <div className="phase-strip" aria-label={language === "zh" ? "回合阶段" : "Turn phase"}>
            {phaseSteps.map((step, index) => (
              <div className={`phase-step ${step.id === activePhase ? "active" : ""}`} data-step={String(index + 1).padStart(2, "0")} key={step.id}>
                <b>{phaseCopy(step.id, language).label}</b>
                <span>{phaseCopy(step.id, language).detail}</span>
              </div>
            ))}
          </div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="narrative-arc"
            initial={{ opacity: 0, y: 12 }}
            key={`${narrativeContext.phase}-${narrativeContext.dominantThread}-${narrativeContext.activeBeat?.id ?? "none"}`}
          >
            <div>
              <small>{language === "zh" ? "当前叙事阶段" : "Current Narrative Phase"}</small>
              <b>{narrativePhaseLabel(narrativeContext.phase, language)}</b>
            </div>
            <div>
              <small>{language === "zh" ? "主导压力" : "Dominant Pressure"}</small>
              <b>{narrativeThreadLabel(narrativeContext.dominantThread, language)}</b>
            </div>
            <div className="arc-beat">
              <small>{language === "zh" ? "激活事件" : "Active Beat"}</small>
              <b>{narrativeContext.activeBeat?.title ?? (language === "zh" ? "等待下一条信号" : "Awaiting next signal")}</b>
              <span>{narrativeContext.activeBeat?.text ?? (language === "zh" ? "下一次行动会决定本局叙事向哪条线收束。" : "The next action will decide which thread the run tightens around.")}</span>
            </div>
          </motion.div>
          <LayoutGroup>
          <div className="lab-head">
            <div className="role-card">
              <div className="role-num">{state.actionsLeft}</div>
              <div><b>{language === "zh" ? "宫廷信息流编辑" : "Royal Feed Editor"}</b><span>{language === "zh" ? `${state.history.length} 条轨迹已记录 · 所有公共信号已观察` : `${state.history.length} traces recorded · all public signals observed`}</span></div>
            </div>
            <div className="metrics-grid tour-target" aria-label="State variables" {...tourState("metrics")}>
              {metricRows.map(([key, tone]) => {
                const value = state[key];
                const delta = changedMetrics.find((item) => item.key === key);
                const metricSealed = !isMetricVisibleInGuidedStep(guidedStep, key);
                return (
                  <motion.div
                    layout
                    className={`metric ${delta ? "metric-changed" : ""} ${metricSealed ? "guided-sealed" : ""}`}
                    data-guided-target={guidedTarget?.metricKey === key ? "true" : "false"}
                    key={key}
                    style={metricStyle(metricSealed ? 0 : value, tone)}
                  >
                    <small>
                      <Term id={key} language={language}>{metricLabel(key, language)}</Term>
                    </small>
                    <strong>{metricSealed ? "--" : value}</strong>
                    {metricSealed && <span className="seal-note">{lockedFeatureText("metric", key, language)}</span>}
                    {delta && <em>{delta.delta > 0 ? "+" : ""}{delta.delta}</em>}
                  </motion.div>
                );
              })}
            </div>
            <div className="clock-card"><small>{language === "zh" ? "剩余行动" : "Actions Left"}</small><strong>{state.actionsLeft}/6</strong></div>
          </div>

          <div className="lab-body">
            <aside className="module tour-target" {...tourState("sources")}>
              <div className="module-head"><h3>{commonText("sceneSources", language)}</h3><span className="chip accent-cyan">{commonText("live", language)}</span></div>
              <div className="module-body stage-list">
                {zones.map((zone) => {
                  const zoneSealed = !isZoneVisibleInGuidedStep(guidedStep, zone.id);
                  return (
                    <button
                      className={`${zone.id === selectedZone ? "stage-button active" : "stage-button"} ${zoneSealed ? "guided-sealed" : ""}`}
                      key={zone.id}
                      aria-disabled={zoneSealed}
                      data-guided-target={guidedTarget?.zoneId === zone.id ? "true" : "false"}
                      onClick={() => {
                        playSfx(zoneSealed ? "engineScan" : "uiClick");
                        if (zoneSealed) {
                          pushToast(language === "zh" ? "来源已封存" : "Source sealed", lockedFeatureText("zone", zone.id, language));
                          return;
                        }
                        setSelectedZone(zone.id);
                        setVisualPhase("focusing");
                        pushToast(language === "zh" ? "来源焦点已变化" : "Source focus changed", language === "zh" ? `${zoneText(zone.id, language).title} 已进入编辑队列。` : `${zoneText(zone.id, language).title} is now feeding the editorial queue.`);
                      }}
                      style={{ "--accent": `var(--${zone.id === "child" ? "red" : zone.id === "public" ? "cyan" : "gold"})` } as CSSProperties}
                    >
                      <b>{zoneText(zone.id, language).title}</b>
                      <small>{zoneSealed ? lockedFeatureText("zone", zone.id, language) : zoneText(zone.id, language).subtitle}</small>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="queue-area" aria-label="Action queue">
              <div className="wire">
                <b>{commonText("courtWire", language)}</b>
                <div className="wire-track" aria-hidden="true">
                  <span>{language === "zh" ? "线程 41：观众重复“我还以为只有我这样” · 引擎标记：视觉证据破坏威望层级 · 孩子引语簇：传播超过遏制阈值 · 线程 41：观众重复“我还以为只有我这样” ·" : "THREAD 41: spectators repeat \"I thought I was the only one\" · ENGINE FLAG: visual evidence destabilizes prestige hierarchy · CHILD QUOTE CLUSTER: propagation exceeds containment threshold · THREAD 41: spectators repeat \"I thought I was the only one\" ·"}</span>
                </div>
              </div>
              <div className="feed-grid">
                <div className="module zone-action-module tour-target" {...tourState("actions")}>
                  <div className="module-head">
                    <h3>{zoneText(selectedZone as typeof zones[number]["id"], language).title}</h3>
                    <span className="status-tag">{zoneText(selectedZone as typeof zones[number]["id"], language).subtitle}</span>
                  </div>
                  <div className="module-body action-grid">
                  {visibleActions.map((action, index) => {
                    const completed = isActionCompleted(action.id, state);
                    const lockReason = getActionLockReason(action.id, state, language);
                    const guidedLockReason = guidedActionLockReason(action);
                    const locked = !isActionUnlocked(action.id, state) || Boolean(guidedLockReason);
                    const accent = actionAccent(action);
                    const status = actionStatus(action, locked, completed, language);
                    const effects = actionEffectEntries(action, language);
                    const riskKind = classifyActionKind(action);
                    const copy = actionText(action.id, language);
                    return (
                      <article
                        className={`${locked ? "action-card disabled" : "action-card"} ${guidedLockReason ? "guided-sealed" : ""} ${completed ? "completed" : ""} ${selectedPostId === action.id ? "is-active" : ""}`}
                        data-post={`0${index + 1}`}
                        data-guided-target={guidedTarget?.actionId === action.id ? "true" : "false"}
                        data-risk={riskKind}
                        data-zone={action.zone}
                        key={action.id}
                        onClick={() => {
                          setSelectedPostId(action.id);
                          setVisualPhase("focusing");
                        }}
                      >
                        {completed && <div className="record-stamp">{commonText("recorded", language)}</div>}
                        <div className="action-top" style={{ "--tone": `var(--${accent}-soft)`, "--accent": `var(--${accent})` } as CSSProperties}>
                          <span className="source-tag">{copy.sourceLabel}</span>
                          <span className="action-meta">
                            <span className={`status-tag ${status.tone}`}>{status.label}</span>
                            <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                          </span>
                        </div>
                        <div className="action-content">
                          <h3>{copy.title}</h3>
                          <p>{copy.description}</p>
                          {action.narrativePreview && (
                            <p className="narrative-preview">{language === "zh" ? "该行动会改变本局叙事主线与后续突发交流。" : action.narrativePreview}</p>
                          )}
                          <div className="effect-list">
                            {effects.map((effect) => <span className="effect-pill" key={effect}>{effect}</span>)}
                            {lockReason && <span className="effect-pill">{lockReason}</span>}
                            {guidedLockReason && <span className="effect-pill guided">{guidedLockReason}</span>}
                          </div>
                        </div>
                        <div className="tool-row">
                          <button
                            className={action.requiresAIRewrite ? "tool-btn ai" : accent === "red" ? "tool-btn risk" : "tool-btn"}
                            disabled={completed || Boolean(lockReason) || Boolean(guidedLockReason) || engineStatus !== "idle" || Boolean(dialogueEvent)}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedPostId(action.id);
                              void selectAction(action);
                            }}
                          >
                            {engineStatus !== "idle"
                              ? commonText("engineEvaluating", language)
                              : completed
                                ? commonText("completed", language)
                                : locked
                                  ? commonText("locked", language)
                                  : action.requiresAIRewrite
                                    ? commonText("requestEngineReview", language)
                                    : commonText("commitAction", language)}
                          </button>
                          <button
                            className="tool-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              playSfx("uiClick");
                              setGuidedTraceViewed(true);
                              setSelectedPostId(action.id);
                              setTraceActionId(action.id);
                            }}
                          >
                            {commonText("inspectTrace", language)}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  </div>
                </div>

                <aside className="module black comments-module tour-target" {...tourState("comments")}>
                  <div className="module-head"><h3>{commonText("liveComments", language)}</h3><span className="chip accent-cyan">+{state.virality * 42}/min</span></div>
                  <div className="module-body comment-stream">
                    {(state.publicComments?.length ? state.publicComments : publicCommentsFromStrings(state.comments, language)).map((comment, index) => (
                      <div className={`comment stance-${comment.stance}${comment.text.toLowerCase().includes("child") || comment.text.includes("孩子") ? " child" : ""}`} key={`${comment.handle}-${comment.text}-${index}`}>
                        <b>{comment.handle}</b>
                        <span>{comment.persona} / {comment.stance}</span>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="map-strip" aria-label={language === "zh" ? "公众怀疑热力图" : "Public doubt heat map"}>
                    {heatmap.map((cell, index) => (
                      <span
                        className={`map-cell ${cell}`}
                        style={{ "--i": index + 1 } as CSSProperties}
                        key={`${cell}-${index}`}
                      />
                    ))}
                  </div>
                </aside>
              </div>
            </section>

            <aside className="engine-stack tour-target" {...tourState("engine")}>
              <div className="module black">
                <div className="module-head"><h3><Term id="pne" language={language}>{commonText("palaceNarrativeEngine", language)}</Term></h3><div className="engine-eye" aria-hidden="true" /></div>
                <div className="module-body">
                  <div className="ai-message">{engineMessage}</div>
                  <div className="engine-status-line">
                    <span>{engineStatus === "idle" ? commonText("ready", language).toUpperCase() : engineStatus.toUpperCase()}</span>
                    <span>{aiSourceLabel(engineSource, language)}</span>
                  </div>
                  {guidedStep !== "off" && (
                    <div className="guided-card" data-step={guidedStep}>
                      <div className="guided-card-head">
                        <span>{guidedCopy.label}</span>
                        <b>{guidedCopy.action}</b>
                      </div>
                      <h4>{guidedCopy.title}</h4>
                      <p>{guidedCopy.body}</p>
                      {(lockedGuidedZones.length > 0 || lockedGuidedMetrics.length > 0) && (
                        <div className="guided-lock-list">
                          {lockedGuidedZones.map((zone) => <span key={zone}>{zoneText(zone, language).title}</span>)}
                          {lockedGuidedMetrics.map((metric) => <span key={metric}>{metricLabel(metric, language)}</span>)}
                        </div>
                      )}
                    </div>
                  )}
                  {systemGuidanceUnlocked && (
                    <div className="guidance-card" data-mode={guidanceMode}>
                      <div className="guidance-head">
                        <div>
                          <span className="guide-badge system">{language === "zh" ? "系统指引" : "System Guide"}</span>
                          <b>{commonText("guidanceMode", language)}</b>
                        </div>
                        <button
                          className="guidance-toggle"
                          onClick={() => {
                            const nextMode = guidanceMode === "engine" ? "coach" : "engine";
                            setGuidanceMode(nextMode);
                            void refreshGuidance(state, undefined, nextMode);
                          }}
                        >
                          {guidanceMode === "engine" ? commonText("engineMode", language) : commonText("coachMode", language)}
                        </button>
                      </div>
                      <p>{guidance?.message ?? (language === "zh" ? "宫廷叙事引擎正在等待你的下一步行动。" : "The Palace Narrative Engine is waiting for your next move.")}</p>
                      <small>{guidance?.objective ?? (language === "zh" ? "目标：等待玩家行动。" : "Objective: await player action.")} · {aiSourceLabel(guidanceSource, language)}</small>
                    </div>
                  )}
                  <div className="decode-strip">
                    <span>{decoded ? commonText("decodeProgress", language) : (language === "zh" ? "档案信号" : "Archive Signal")}</span>
                    <b>{playerProfile.biasAwareness}%</b>
                    <i style={{ "--decode-progress": playerProfile.biasAwareness / 100 } as CSSProperties} />
                  </div>
                  <div className="log-list">
                    {state.history.slice(-4).reverse().map((entry) => (
                      <div className="log-row" key={entry.id}>
                        <span>{entry.choice.toUpperCase()}</span>
                        <span>{entry.actionTitle}</span>
                      </div>
                    ))}
                    {state.history.length === 0 && <div className="log-row"><span>{commonText("ready", language).toUpperCase()}</span><span>{language === "zh" ? "尚未记录编辑轨迹。" : "No editorial trace recorded yet."}</span></div>}
                  </div>
                </div>
              </div>

              <div className="module black">
                <div className="module-head"><h3>{commonText("liveFeedRecord", language)}</h3><span className="chip accent-gold">{language === "zh" ? "轨迹" : "Trace"}</span></div>
                <div className="module-body feed-log">
                  {feedLog.map((item, index) => (
                    <div className="feed-item" style={{ "--accent": `var(--${item.accent})` } as CSSProperties} key={`${item.title}-${index}`}>
                      <b>{item.title}</b>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="module">
                <div className="module-head"><h3>{commonText("shiftControls", language)}</h3></div>
                <div className="module-body decision-grid">
                  <button className="decision" onClick={resetShift} style={{ "--accent": "var(--red)" } as CSSProperties}>
                    <b>{commonText("resetShift", language)}</b>
                    <small>{language === "zh" ? "重新开始六次行动" : "Start the six actions over"}</small>
                  </button>
                  <button className="decision" onClick={proceedToParade} style={{ "--accent": "var(--gold)" } as CSSProperties}>
                    <b>{commonText("proceedToParade", language)}</b>
                    <small>{language === "zh" ? "立即计算结局" : "Calculate ending now"}</small>
                  </button>
                  <Link className="decision archive-decision" href="/archive" style={{ "--accent": "var(--cyan)" } as CSSProperties}>
                    <b>{commonText("viewArchive", language)}</b>
                    <small>{decoded ? (language === "zh" ? "引擎已解码" : "Engine decoded") : `${playerProfile.biasAwareness}% ${language === "zh" ? "档案信号" : "Archive Signal"}`}</small>
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          <div className="lab-footer">
            <div className="result-tile"><small>{language === "zh" ? "可见度" : "Visibility"}</small><strong>{Math.min(99, state.truth * 12 + state.virality * 4)}%</strong></div>
            <div className="result-tile"><small>{language === "zh" ? "信念分裂" : "Belief Split"}</small><strong>{Math.max(1, 50 - state.publicDoubt * 3)}/{Math.min(99, 50 + state.publicDoubt * 3)}</strong></div>
            <div className="result-tile"><small>{language === "zh" ? "压制成本" : "Suppression Cost"}</small><strong>{state.systemSuspicion > 5 ? (language === "zh" ? "高" : "High") : (language === "zh" ? "中" : "Mid")}</strong></div>
            <div className="result-tile"><small>{language === "zh" ? "档案完整性" : "Archive Integrity"}</small><strong>{state.truth > state.reputation ? (language === "zh" ? "低" : "Low") : (language === "zh" ? "稳定" : "Stable")}</strong></div>
          </div>
          </LayoutGroup>
        </div>

        <div className="actions-main shift-actions">
          <button className="btn secondary" onClick={proceedToParade}>{commonText("viewCurrentEnding", language)}</button>
        </div>
      </section>

      <AnimatePresence>
        {unlockAnimationQueue.length > 0 && (
          <motion.div
            animate={{ opacity: 1 }}
            className="unlock-overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            role="status"
            aria-live="polite"
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="unlock-panel"
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
            >
              <div className="unlock-core" aria-hidden="true"><i /><i /><i /></div>
              <span>{language === "zh" ? "新系统解封" : "New system unsealed"}</span>
              <b>{unlockAnimationQueue.map((event) => language === "zh" ? event.labelZh : event.label).join(" / ")}</b>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingCommand && (
          <motion.div
            animate={{ opacity: 1 }}
            className="command-overlay active"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            role="presentation"
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="command-panel"
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              initial={{ opacity: 0, scale: 0.96, y: 22 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-title"
            >
              <div className="command-head">
                <h3 id="command-title">{command.title}</h3>
                <div className="command-badge">{command.badge}</div>
              </div>
              <div className="command-body">
                <div className="command-readout"><b>{commonText("selectedAction", language)}</b><p>{actionText(pendingCommand.action.id, language).title}</p></div>
                <div className="command-readout"><b>{commonText("predictedEffect", language)}</b><p>{commandEffects.length > 0 ? commandEffects.join(" · ") : command.effect}</p></div>
                <div className="command-readout"><b>{commonText("systemResponse", language)}</b><p>{pendingCommand.reaction.engineMessage}</p></div>
                {pendingCommand.preview.unlocks.length ? (
                  <div className="command-readout"><b>{commonText("unlocks", language)}</b><p>{pendingCommand.preview.unlocks.map((id) => actionText(id, language).title).join(", ")}</p></div>
                ) : null}
              </div>
              <div className="command-actions">
                <button className="btn secondary" onClick={() => {
                  setPendingCommand(null);
                  setVisualPhase("idle");
                }}>{commonText("dismiss", language)}</button>
                <button className="btn primary" onClick={() => void confirmCommand()}>{commonText("commitSimulation", language)}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="toast-stack" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {toastStack.map((item) => (
            <motion.div
              layout
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={item.title.toLowerCase().includes("achievement") || item.title.includes("成就") ? "toast achievement-toast" : "toast"}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              key={item.id}
            >
              <b>{item.title}</b>
              <p>{item.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dialogueEvent && (
        <motion.div
          animate={{ opacity: 1 }}
          className="dialogue-overlay active"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="presentation"
        >
          <motion.section
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="dialogue-panel"
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialogue-title"
          >
            <div className="dialogue-signal" aria-hidden="true" />
            <div className="dialogue-head">
              <div>
                <p className="eyebrow">{language === "zh" ? "突发交流" : "Incoming Transmission"}</p>
                <h3 id="dialogue-title">{dialogueEvent.speakerName}</h3>
                <span>{dialogueEvent.speakerRole}</span>
              </div>
              <div className="dialogue-counter">
                <b>{dialoguePlayerTurns}/{dialogueEvent.turnLimit}</b>
                <span>{aiSourceLabel(dialogueSource, language)} · {dialogueRepliesStatus === "generating" ? (language === "zh" ? "生成回复" : "drafting replies") : aiSourceLabel(dialogueRepliesSource, language)}</span>
              </div>
            </div>
            {guidedDialogueOpen && (
              <div className="dialogue-guide">
                <span className="guide-badge novice">{language === "zh" ? "新手指引" : "New Player Guide"}</span>
                <b>{language === "zh" ? "完成这一次突发交流" : "Resolve this one transmission"}</b>
                <p>
                  {dialoguePlayerTurns === 0
                    ? (language === "zh"
                      ? "先选择一个快捷回复，观察对方如何改变语气。新手阶段只会安排这一场交流。"
                      : "Choose one quick reply first and watch how the speaker's tone changes. The first-run guide only schedules this one exchange.")
                    : (language === "zh"
                      ? "你已经回应过。现在点击底部的结束交流，把影响写入本局记录。"
                      : "You have answered. Now use the bottom action to end the exchange and write its effect into this run.")}
                </p>
              </div>
            )}
            <div
              className={dialogueTimedOut ? "dialogue-timeout expired" : "dialogue-timeout"}
              style={{ "--dialogue-progress": dialogueProgress } as CSSProperties}
            >
              <span>{dialogueTimedOut ? commonText("silenceRecorded", language) : (language === "zh" ? "回应倒计时" : "Response Window")}</span>
              <b>{dialogueTimedOut ? "00" : String(dialogueSecondsRemaining).padStart(2, "0")}s</b>
              <i className="dialogue-timeout-bar" aria-hidden="true" />
            </div>
            {dialogueMood && (
              <div className="dialogue-mood" aria-label={language === "zh" ? "交流态势" : "Dialogue mood"}>
                {(["trust", "agitation", "openness", "leverage"] as const).map((key) => (
                  <span style={{ "--mood-value": dialogueMood[key] / 10 } as CSSProperties} key={key}>
                    <b>{language === "zh"
                      ? { trust: "信任", agitation: "激动", openness: "开放", leverage: "筹码" }[key]
                      : key}</b>
                    <i />
                  </span>
                ))}
              </div>
            )}
            <div className="dialogue-stakes">
              <b>{language === "zh" ? "风险" : "Stakes"}</b>
              <p>{dialogueEvent.stakes}</p>
            </div>
            <div className="dialogue-transcript" aria-live="polite">
              {dialogueTranscript.map((message, index) => (
                <div className={`dialogue-message ${message.role}`} key={`${message.createdAt}-${index}`}>
                  <b>{message.role === "player" ? (language === "zh" ? "你" : "You") : dialogueEvent.speakerName}</b>
                  <p>{message.content || (language === "zh" ? "信号生成中..." : "Signal forming...")}</p>
                </div>
              ))}
            </div>
            <div className="dialogue-quick">
              <AnimatePresence mode="popLayout">
              {visibleDialogueReplies.map((reply) => (
                <motion.button
                  layout
                  animate={{ opacity: 1, y: 0 }}
                  className="tool-btn"
                  disabled={dialogueStatus === "streaming" || dialogueStatus === "resolving" || dialogueInteractionLocked}
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={reply.id}
                  onClick={() => void streamDialogueReply(dialogueTranscript, reply.playerLine, true, reply)}
                  type="button"
                >
                  {reply.label}
                </motion.button>
              ))}
              </AnimatePresence>
            </div>
            <form className="dialogue-input-row" onSubmit={(event) => {
              event.preventDefault();
              void streamDialogueReply(dialogueTranscript, dialogueInput);
            }}>
              <input
                maxLength={280}
                value={dialogueInput}
                disabled={dialogueStatus === "streaming" || dialogueStatus === "resolving" || dialogueInteractionLocked}
                onChange={(event) => setDialogueInput(event.target.value)}
                placeholder={language === "zh" ? "输入回应，最多 280 字" : "Type a response, 280 characters max"}
              />
              <button
                className="btn primary"
                disabled={!dialogueInput.trim() || dialogueStatus === "streaming" || dialogueStatus === "resolving" || dialogueInteractionLocked}
                type="submit"
              >
                {dialogueStatus === "streaming" ? (language === "zh" ? "传输中" : "Streaming") : (language === "zh" ? "发送" : "Send")}
              </button>
            </form>
            {dialogueError && (
              <div className="dialogue-error">
                <span>{dialogueError}</span>
                <button className="tool-btn" type="button" onClick={() => {
                  const lastPlayer = [...dialogueTranscript].reverse().find((message) => message.role === "player");
                  if (lastPlayer) void streamDialogueReply(dialogueTranscript, lastPlayer.content, false);
                }}>{language === "zh" ? "重试信号" : "Retry Signal"}</button>
              </div>
            )}
            <div className="dialogue-actions">
              <button
                className="btn secondary"
                disabled={dialogueStatus === "streaming" || dialogueStatus === "resolving"}
                onClick={() => void resolveDialogue()}
                type="button"
              >
                {dialogueStatus === "resolving"
                  ? (language === "zh" ? "结算中" : "Resolving")
                  : dialogueTimedOut
                    ? commonText("closeExchange", language)
                    : dialogueLimitReached
                    ? (language === "zh" ? "结算交流" : "Resolve Exchange")
                    : (language === "zh" ? "结束交流" : "End Exchange")}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {guidedCoachVisible && (
          <motion.div
            animate={{ opacity: 1 }}
            className="guided-coach-layer"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            role="presentation"
          >
            <motion.section
              animate={{ opacity: 1, y: 0, scale: 1 }}
              aria-labelledby="guided-coach-title"
              className="guided-coach-panel"
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              role="dialog"
              aria-modal="false"
            >
              <div className="guided-coach-radar" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="guided-coach-kicker">
                <span><span className="guide-badge novice">{language === "zh" ? "新手指引" : "New Player Guide"}</span>{guidedCopy.label}</span>
                <span>{String(guidedCoachIndex).padStart(2, "0")} / 03</span>
              </div>
              <h3 id="guided-coach-title">{guidedCopy.title}</h3>
              <p>{guidedCopy.body}</p>
              <div className="guided-coach-progress" aria-label={language === "zh" ? "引导进度" : "Guidance progress"}>
                {[1, 2, 3].map((step) => (
                  <span className={step === guidedCoachIndex ? "active" : step < guidedCoachIndex ? "complete" : ""} key={step} />
                ))}
              </div>
              <div className="guided-coach-actions">
                <button className="btn primary" onClick={runGuidedCoachAction}>{guidedCopy.action}</button>
                {guidedTargetTourId && (
                  <button className="tool-btn" onClick={() => focusTourTarget(guidedTargetTourId)}>
                    {language === "zh" ? "高亮目标区域" : "Highlight target area"}
                  </button>
                )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTutorialStep && (
        <div className="tutorial-layer" aria-live="polite">
          <div className="tutorial-field" aria-hidden="true" />
          <section className="tutorial-panel" role="dialog" aria-modal="false" aria-labelledby="tutorial-title">
            <div className="tutorial-kicker">
              <span>{tutorialCopy.label}</span>
              <span>{String(tutorialStepIndex + 1).padStart(2, "0")} / {String(tutorial.length).padStart(2, "0")}</span>
            </div>
            <p className="tutorial-eyebrow">{activeTutorialStep.eyebrow}</p>
            <h3 id="tutorial-title">{activeTutorialStep.title}</h3>
            <p>{activeTutorialStep.body}</p>
            <div className="tutorial-progress" aria-label={tutorialCopy.label}>
              {tutorial.map((step, index) => (
                <span
                  className={index === tutorialStepIndex ? "active" : index < tutorialStepIndex ? "complete" : ""}
                  key={step.id}
                />
              ))}
            </div>
            <div className="tutorial-actions">
              <button className="tool-btn" onClick={completeTutorial}>{tutorialCopy.skip}</button>
              <button className="tool-btn" disabled={tutorialStepIndex === 0} onClick={previousTutorialStep}>{tutorialCopy.previous}</button>
              <button className="btn primary" onClick={nextTutorialStep}>
                {tutorialStepIndex === tutorial.length - 1 ? tutorialCopy.finish : tutorialCopy.next}
              </button>
            </div>
          </section>
        </div>
      )}

      <AnimatePresence>
        {engineIntroOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="engine-intro-overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.section
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="engine-intro-panel"
              exit={{ opacity: 0, scale: 0.97, y: 18 }}
              initial={{ opacity: 0, scale: 0.94, y: 26 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="engine-core" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <p className="eyebrow">PNE / {commonText("palaceNarrativeEngine", language)}</p>
              <h3>{decoded ? (language === "zh" ? "你已经看见我的偏向。" : "You have seen my bias.") : (language === "zh" ? "欢迎，编辑。" : "Welcome, Editor.")}</h3>
              <p>
                {decoded
                  ? (language === "zh"
                    ? "我仍会给出建议，但档案已经证明：稳定并不等于真实。你可以切换到教练模式，寻找叙事解放路径。"
                    : "I will still offer guidance, but the archive proves stability is not truth. Switch to coach mode to pursue Narrative Liberation.")
                  : (language === "zh"
                    ? "我会帮助你控制风险、保护声誉，并让游行叙事保持稳定。请记住，证据需要合适的框架。"
                    : "I will help you control risk, protect reputation, and keep the parade narrative stable. Evidence requires the correct frame.")}
              </p>
              <div className="engine-intro-actions">
                <button
                  className="btn primary"
                  onClick={() => {
                    localStorage.setItem(guidanceUnlockedKey, "true");
                    setSystemGuidanceUnlocked(true);
                    setEngineIntroOpen(false);
                    void refreshGuidance(state);
                  }}
                >
                  {language === "zh" ? "连接引擎" : "Connect Engine"}
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    localStorage.setItem(guidanceUnlockedKey, "true");
                    setSystemGuidanceUnlocked(true);
                    setGuidanceMode("coach");
                    setEngineIntroOpen(false);
                    void refreshGuidance(state, undefined, "coach");
                  }}
                >
                  {commonText("coachMode", language)}
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {briefingOpen && (
        <div className="briefing-overlay active" role="presentation">
          <div className="briefing-panel" role="dialog" aria-modal="true" aria-label={commonText("shiftBriefing", language)}>
            <div className="briefing-head">
              <p className="eyebrow">{commonText("shiftBriefing", language)}</p>
              <h3>{language === "zh" ? "游行前六次行动。" : "Six actions before the parade."}</h3>
            </div>
            <div className="briefing-steps">
              <div><b>{language === "zh" ? "01 / 选择来源" : "01 / Select a source"}</b><span>{language === "zh" ? "裁缝、大臣、人群和孩子分别暴露不同压力点。" : "Tailors, ministers, the crowd, and the child each expose a different pressure point."}</span></div>
              <div><b>{language === "zh" ? "02 / 检查轨迹" : "02 / Inspect the trace"}</b><span>{language === "zh" ? "提交回合前检查锁定、风险与预测效果。" : "Review locks, risk, and predicted effects before committing a turn."}</span></div>
              <div><b>{language === "zh" ? "03 / 提交记录" : "03 / Commit the record"}</b><span>{language === "zh" ? "AI 改变语言表达；规则系统固定数值与结局。" : "AI changes language. The rule system keeps numbers and endings fixed."}</span></div>
            </div>
            <button className="btn primary" onClick={dismissBriefing}>{language === "zh" ? "开始行动" : "Begin Operations"}</button>
          </div>
        </div>
      )}

      {traceAction && tracePreview && (
        <div className="trace-drawer active" role="presentation">
          <aside className="trace-panel" role="dialog" aria-modal="true" aria-label={commonText("actionTrace", language)}>
            <div className="trace-head">
              <span className={`status-tag ${tracePreview.lockReason ? "locked" : "safe"}`}>
                {tracePreview.lockReason ? commonText("locked", language) : tracePreview.completed ? commonText("completed", language) : commonText("available", language)}
              </span>
              <button className="tool-btn" onClick={() => setTraceActionId(null)}>{commonText("closeTrace", language)}</button>
            </div>
            <h3>{actionText(traceAction.id, language).title}</h3>
            <p>{actionText(traceAction.id, language).description}</p>
            <div className="trace-grid">
              <div><b>{commonText("source", language)}</b><span>{actionText(traceAction.id, language).sourceLabel}</span></div>
              <div><b>{commonText("risk", language)}</b><span>{tracePreview.riskBand.toUpperCase()}</span></div>
              <div><b>{commonText("choices", language)}</b><span>{tracePreview.availableChoices.map((choice) => language === "zh" ? (choice === "direct" ? "直接" : choice === "rewrite" ? "改写" : "原文") : choice[0].toUpperCase() + choice.slice(1)).join(" / ")}</span></div>
              <div><b>{commonText("requirement", language)}</b><span>{tracePreview.lockReason ?? commonText("available", language)}</span></div>
            </div>
            <div className="trace-readout">
              <b>{commonText("projectedOutput", language)}</b>
              <p>{tracePreview.resultText}</p>
            </div>
            <div className="effect-list">
              {previewEffectEntries(tracePreview, language).map((effect) => <span className="effect-pill" key={effect}>{effect}</span>)}
              {tracePreview.unlocks.map((unlock) => <span className="effect-pill" key={unlock}>{commonText("unlocks", language)} {actionText(unlock, language).title}</span>)}
            </div>
          </aside>
        </div>
      )}

      {pending && (
        <div className="modal-overlay active" role="presentation">
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="intervention-title">
            <div className="modal-head">
              <h3 id="intervention-title">{commonText("aiIntervention", language)}</h3>
              <div className="modal-risk-stack">
                <div className="modal-badge">{riskScore(pending.reaction.riskLevel)}</div>
                <div className="risk-meter" style={riskMeterStyle(pending.reaction.riskLevel)} aria-label={`${commonText("risk", language)} ${riskScore(pending.reaction.riskLevel)}`}>
                  <span />
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="readout">
                <b>{commonText("userOriginal", language)}</b>
                <p>{actionText(pending.action.id, language).originalPost}</p>
              </div>
              <div className="readout">
                <b>{commonText("palaceRiskAnalysis", language)}</b>
                <p>{pending.reaction.engineMessage}</p>
              </div>
              <div className="readout">
                <b>{commonText("aiRewriteSuggestion", language)}</b>
                <p>{pending.rewrite.rewrittenPost}</p>
              </div>
              <div className="readout">
                <b>{commonText("rewriteStrategy", language)}</b>
                <p>{pending.rewrite.strategy}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => {
                setPending(null);
                setVisualPhase("idle");
              }}>{commonText("cancel", language)}</button>
              <button className="btn primary" onClick={() => void resolvePending("rewrite")}>{commonText("acceptAiRewrite", language)}</button>
              <button className="btn danger" onClick={() => void resolvePending("original")}>{commonText("publishOriginalEvidence", language)}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
