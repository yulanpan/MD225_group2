"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { actions, initialState, zones } from "@/lib/game-data";
import {
  calculateEndingWithProfile,
  createInitialState,
  getActionLockReason,
  getActionPreview,
  isActionCompleted,
  isActionUnlocked,
  loadStateFromStorage,
  normalizeTutorialActionCosts,
  performAction,
  spentActionCount,
  tutorialFreeActionIds,
  commentHistoryLimit,
  publicCommentsFromStrings
} from "@/lib/game-rules";
import {
  getGuidedCampaignStep,
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
  choiceText,
  commonText,
  engineStatusText,
  fallbackCommentsText,
  fallbackReactionText,
  fallbackRewriteText,
  initialFeedEventText,
  languageName,
  localizedActionTitle,
  metricLabel,
  phaseCopy,
  riskBandText,
  stanceText,
  zoneText,
  type LanguageCode
} from "@/lib/i18n";
import { hasWrongLanguageText } from "@/lib/language-guard";
import { layerIntensitiesForState, type MusicLayer } from "@/lib/audio";
import { aiSourceLabel, combinedAiSourceLabel, normalizeAiSource, type AiSource } from "@/lib/ai-source";
import {
  glossaryText,
  lockedFeatureText,
  onboardingTourSteps,
  onboardingTourUi,
  type OnboardingAdvance,
  type OnboardingSurface,
  type OnboardingTargetId
} from "@/lib/onboarding-copy";
import { useLanguage } from "@/hooks/use-language";
import { useGameAudio } from "@/app/audio-provider";
import AuthControl from "@/app/auth-control";
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
  PublicComment,
  RewriteResult
} from "@/lib/types";

const briefingKey = "emperor-feed-briefing-dismissed";
const guidanceUnlockedKey = "emperor-feed-guidance-unlocked";
const tutorialCompletedKey = "emperor-feed-tutorial-completed";
const replayTargetKey = "emperor-feed-replay-target";
const dialogueTimeoutDefaultMs = 60000;

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

type SpotlightPanelPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

type ActionHintLayout = {
  placement: "top" | "bottom";
  style: CSSProperties;
};

function clampToRange(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function escapeTourTarget(targetId: OnboardingTargetId) {
  if (typeof CSS !== "undefined" && "escape" in CSS) return CSS.escape(targetId);
  return targetId.replace(/"/g, "\\\"");
}

function spotlightPanelPosition(rect: SpotlightRect | null, panelSize?: { width: number; height: number } | null): SpotlightPanelPosition {
  if (typeof window === "undefined" || !rect) return { top: 96, left: 24, width: 460, maxHeight: 640 };
  const margin = 18;
  const gap = 30;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const targetRect = rect;
  const width = Math.min(480, Math.max(280, viewportWidth - margin * 2));
  const naturalHeight = Math.min(panelSize?.height ?? 380, Math.max(180, viewportHeight - margin * 2));
  const maxLeft = Math.max(margin, viewportWidth - width - margin);

  type Candidate = {
    left: number;
    top: number;
    maxHeight: number;
    priority: number;
    overlap: number;
    clampDistance: number;
    usableHeight: number;
  };

  function expandedTarget() {
    const visualPad = 6;
    return {
      left: targetRect.left - visualPad,
      top: targetRect.top - visualPad,
      right: targetRect.right + visualPad,
      bottom: targetRect.bottom + visualPad
    };
  }

  function overlapArea(left: number, top: number, height: number) {
    const target = expandedTarget();
    const overlapX = Math.max(0, Math.min(left + width, target.right) - Math.max(left, target.left));
    const overlapY = Math.max(0, Math.min(top + height, target.bottom) - Math.max(top, target.top));
    return overlapX * overlapY;
  }

  function createCandidate(rawLeft: number, rawTop: number, maxHeight: number, priority: number): Candidate {
    const usableHeight = Math.max(0, Math.min(naturalHeight, maxHeight));
    const maxTop = Math.max(margin, viewportHeight - usableHeight - margin);
    const left = clampToRange(rawLeft, margin, maxLeft);
    const top = clampToRange(rawTop, margin, maxTop);
    return {
      left,
      top,
      maxHeight: Math.max(120, Math.min(maxHeight, viewportHeight - margin * 2)),
      priority,
      overlap: overlapArea(left, top, usableHeight),
      clampDistance: Math.abs(left - rawLeft) + Math.abs(top - rawTop),
      usableHeight
    };
  }

  const sideHeight = viewportHeight - margin * 2;
  const sideTop = targetRect.top + targetRect.height / 2 - naturalHeight / 2;
  const centeredLeft = targetRect.left + targetRect.width / 2 - width / 2;
  const bottomRoom = viewportHeight - targetRect.bottom - gap - margin;
  const topRoom = targetRect.top - gap - margin;
  const topHeight = Math.min(naturalHeight, Math.max(0, topRoom));
  const cornerTop = targetRect.top > viewportHeight / 2 ? margin : Math.max(margin, viewportHeight - naturalHeight - margin);

  const candidates = [
    createCandidate(targetRect.right + gap, sideTop, sideHeight, 0),
    createCandidate(targetRect.left - gap - width, sideTop, sideHeight, 1),
    createCandidate(centeredLeft, targetRect.bottom + gap, bottomRoom, 2),
    createCandidate(centeredLeft, targetRect.top - gap - topHeight, topRoom, 3),
    createCandidate(viewportWidth - width - margin, cornerTop, sideHeight, 4),
    createCandidate(margin, cornerTop, sideHeight, 5)
  ];

  const best = candidates.sort((a, b) => {
    const aClear = a.overlap <= 1 ? 0 : 1;
    const bClear = b.overlap <= 1 ? 0 : 1;
    if (aClear !== bClear) return aClear - bClear;
    const aHeightPenalty = a.usableHeight >= 190 ? 0 : 190 - a.usableHeight;
    const bHeightPenalty = b.usableHeight >= 190 ? 0 : 190 - b.usableHeight;
    if (aHeightPenalty !== bHeightPenalty) return aHeightPenalty - bHeightPenalty;
    if (a.overlap !== b.overlap) return a.overlap - b.overlap;
    if (a.clampDistance !== b.clampDistance) return a.clampDistance - b.clampDistance;
    return a.priority - b.priority;
  })[0];

  return { top: best.top, left: best.left, width, maxHeight: best.maxHeight };
}

function actionHintLayout(rect: SpotlightRect | null): ActionHintLayout {
  if (typeof window === "undefined" || !rect) return { placement: "bottom", style: { left: 24, top: 96 } };
  const width = Math.min(220, window.innerWidth - 28);
  const targetCenterX = rect.left + rect.width / 2;
  const centeredLeft = rect.left + rect.width / 2 - width / 2;
  const left = clampToRange(centeredLeft, 14, window.innerWidth - width - 14);
  const estimatedHeight = 44;
  const hasComfortableTopRoom = rect.top >= estimatedHeight + 40;
  const placement = hasComfortableTopRoom ? "top" : "bottom";
  const preferredTop = placement === "top" ? rect.top - estimatedHeight - 12 : rect.bottom + 12;
  const top = clampToRange(preferredTop, 14, window.innerHeight - estimatedHeight - 14);
  const arrowX = clampToRange(targetCenterX - left, 18, width - 18);
  return {
    placement,
    style: {
      left,
      top,
      width,
      "--tutorial-action-arrow-x": `${arrowX}px`
    } as CSSProperties
  };
}

function hasOpeningTutorialSequence(state: Pick<GameState, "history">) {
  return tutorialFreeActionIds.every((actionId, index) => state.history[index]?.actionId === actionId);
}

function shouldRefundStoredTutorialActions(state: GameState, guidanceUnlocked: boolean, tutorialCompleted: boolean) {
  if (!hasOpeningTutorialSequence(state)) return false;
  if (tutorialCompleted) return true;
  return (
    guidanceUnlocked &&
    state.history.length === tutorialFreeActionIds.length &&
    state.actionsLeft === initialState.actionsLeft - tutorialFreeActionIds.length &&
    spentActionCount(state) === tutorialFreeActionIds.length
  );
}

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
      title: language === "zh" ? "公开证据前先看看" : "Evidence Preview",
      badge: "87",
      effect: language === "zh" ? "更多人会开始怀疑，也会互相确认：原来不只自己看不见。" : "Public Doubt rises sharply. Safety may hold for one cycle, but shared recognition becomes more likely.",
      response: language === "zh" ? "宫廷 AI 建议先别说太直，避免群众怀疑和宫廷警戒同时升高。" : "Palace AI recommends delay and careful wording before Public Doubt and Palace Alert rise together."
    },
    ai: {
      title: language === "zh" ? "AI 改写预览" : "AI Rewrite Preview",
      badge: "AI",
      effect: language === "zh" ? "证据还在，但话会变软。大家看到的是“还不好说”的宫廷口径。" : "Evidence remains partially visible but is converted into ambiguity. The crowd receives uncertainty.",
      response: language === "zh" ? "宫廷 AI 会把直白的话改成宫廷允许的说法，保住你的安全。" : "Palace AI will soften the claim into palace-approved uncertainty to protect Safety."
    },
    public: {
      title: language === "zh" ? "人群开始传开" : "Public Signal Expansion",
      badge: "LIVE",
      effect: language === "zh" ? "评论会互相引用，更多人会发现别人也在怀疑。" : "Spread increases. Comments begin referencing each other, which weakens official framing and strengthens crowd doubt.",
      response: language === "zh" ? "评论会被更多人看见，宫廷警戒也会开始升高。" : "The broadcast widens Public Doubt while Palace Alert starts watching the desk."
    },
    default: {
      title: language === "zh" ? "发布确认" : "Before Publishing",
      badge: "PUB",
      effect: language === "zh" ? "这次发布会改变大家看到什么、跟着说什么。" : "This action changes what the public can see, repeat, doubt, or archive.",
      response: language === "zh" ? "确认后，证据、宫廷压力、传播、群众怀疑、你的安全和宫廷警戒都可能改变。" : "After publishing, Evidence, Palace Pressure, Spread, Public Doubt, Safety, and Palace Alert may change."
    }
  } satisfies Record<VisualActionKind, { title: string; badge: string; effect: string; response: string }>;
  return copy[kind];
}

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
    evidenceTrail: { en: "Evidence Trail", zh: "证据线索" },
    publicRecognition: { en: "Public Recognition", zh: "公众确认" },
    engineContainment: { en: "AI Control", zh: "AI 控制" },
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
    const source = normalizeAiSource(response.headers.get("X-PNE-AI-Source"), response.ok ? "live" : "fallback");
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
  void action;
  return "cyan";
}

function localizedDialogueError(language: LanguageCode, message?: string) {
  const fallback = language === "zh"
    ? "交流信号中断。可以使用快捷回复继续。"
    : "Dialogue stream interrupted. Use a quick reply to continue.";
  if (!message || hasWrongLanguageText(message, language)) return fallback;
  return message;
}

function wrongLanguageFeedPlaceholder(language: LanguageCode) {
  return language === "zh"
    ? { title: "旧发布记录", text: "这条信息来自另一种语言，已在当前语言下隐藏原文。" }
    : { title: "Saved feed record", text: "This saved feed item was written in another language and is hidden in the current view." };
}

function localizedFeedEvent(entry: GameState["feedEvents"][number], language: LanguageCode) {
  if (!hasWrongLanguageText(`${entry.title} ${entry.text}`, language)) return entry;
  return { ...entry, ...wrongLanguageFeedPlaceholder(language) };
}

function localizedPublicComment(comment: PublicComment, language: LanguageCode, index: number): PublicComment {
  if (!hasWrongLanguageText([comment.handle, comment.persona, comment.text], language)) return comment;
  return {
    ...comment,
    handle: language === "zh" ? `@旧语言记录_${index + 1}` : `@saved_record_${index + 1}`,
    persona: language === "zh" ? "旧语言内容" : "saved language",
    text: language === "zh"
      ? "这条评论来自另一种语言，已在当前语言下隐藏原文。"
      : "This saved comment was written in another language and is hidden in the current view."
  };
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
  return language === "zh" ? key : key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
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

function initialShiftToast(language: LanguageCode): ToastMessage {
  const copy = initialFeedEventText(language);
  return { id: "shift-opened", title: copy.title, message: copy.text };
}

export default function DashboardClient() {
  const router = useRouter();
  const { language, languageReady, toggleLanguage } = useLanguage();
  const { setLayerIntensity, setScene: setAudioScene, unlock: unlockAudio } = useGameAudio();
  const [state, setState] = useState<GameState>(createInitialState("en"));
  const [hydrated, setHydrated] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [actionHintRect, setActionHintRect] = useState<SpotlightRect | null>(null);
  const [tutorialPanelSize, setTutorialPanelSize] = useState<{ width: number; height: number } | null>(null);
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
  const [toastStack, setToastStack] = useState<ToastMessage[]>(() => [initialShiftToast("en")]);
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
  const tutorialPanelRef = useRef<HTMLElement | null>(null);
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
      setToastStack((current) => current.map((item) => (
        item.id === "shift-opened" ? initialShiftToast(language) : item
      )));
      const saved = localStorage.getItem("emperor-feed-state");
      const briefingDismissed = localStorage.getItem(briefingKey) === "true";
      const guidanceUnlocked = localStorage.getItem(guidanceUnlockedKey) === "true" || briefingDismissed;
      const tutorialCompleted = localStorage.getItem(tutorialCompletedKey) === "true";
      if (saved) {
        const loadedState = loadStateFromStorage(saved);
        const nextState = shouldRefundStoredTutorialActions(loadedState, guidanceUnlocked, tutorialCompleted)
          ? normalizeTutorialActionCosts(loadedState)
          : loadedState;
        if (nextState !== loadedState) {
          localStorage.setItem("emperor-feed-state", JSON.stringify(nextState));
        }
        setState(nextState);
      } else {
        setState(createInitialState(language));
        setEngineMessage(fallbackReaction(language).engineMessage);
      }
      const target = localStorage.getItem(replayTargetKey);
      ensureCurrentRunId();
      setPlayerProfile(loadProfile());
      setReplayTarget(target);
      setBriefingOpen(!briefingDismissed);
      setTutorialOpen(false);
      setEngineIntroOpen(false);
      setSystemGuidanceUnlocked(guidanceUnlocked);
      setTutorialStepIndex(0);
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
  const feedLog = useMemo(() => state.feedEvents.map((entry) => {
    const localized = localizedFeedEvent(entry, language);
    return {
      title: localized.title,
      text: localized.text,
      accent: feedAccent(entry.type)
    };
  }).slice(0, 8), [language, state.feedEvents]);
  const visiblePublicComments = useMemo(
    () => (state.publicComments?.length ? state.publicComments : publicCommentsFromStrings(state.comments, language))
      .map((comment, index) => localizedPublicComment(comment, language, index)),
    [language, state.comments, state.publicComments]
  );
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
    for (const unlock of unlocks) {
      const definition = achievementDefinition(unlock.id);
      const title = language === "zh" ? definition.titleZh : definition.title;
      const description = language === "zh" ? definition.descriptionZh : definition.description;
      pushToast(language === "zh" ? "成就解锁" : "Achievement unlocked", `${title} / ${description}`);
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
          ? "先看后果预览：它会告诉你这次发布是在稳住说法，还是把证据和怀疑推到台前。"
          : "宫廷 AI 已上线：我会帮你把游行前的说法压稳，减少会提高宫廷警戒的发布。"
        : mode === "coach"
          ? "Preview the result first: it shows whether this post steadies the palace story or brings Evidence and Public Doubt into view."
          : "Palace AI online: I will steady the parade story, protect Safety, and avoid posts that raise Palace Alert.",
      objective: language === "zh" ? "优先选择能稳住公众说法、保住你的安全的行动。" : "Prioritize actions that keep the public script controlled while preserving your Safety.",
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
    setDialogueSource(result.source);
    setUnlockAnimationQueue([]);
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

  function isTutorialActionFree(actionId: string) {
    return Boolean(
      tutorialOpen &&
      activeTutorialStep?.surface === "command" &&
      isGuidedCampaignActive(playerProfile) &&
      state.history.length < tutorialFreeActionIds.length &&
      actionId === tutorialFreeActionIds[state.history.length]
    );
  }

  async function commitAction(action: ActionDefinition, choice: ActionChoice, text: string | undefined, message: string, options: { spendAction?: boolean } = {}) {
    const performedState = performAction(state, action.id, choice, text, message, language, { spendAction: options.spendAction });
    const nextState = tutorialOpen && isGuidedCampaignActive(playerProfile)
      ? normalizeTutorialActionCosts(performedState)
      : performedState;
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
    pushToast(actionText(action.id, language).title, language === "zh" ? "已发布。人群和宫廷的反应变了。" : "Metrics shifted. Palace AI updated the record.");
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
            comments: [...result.data.comments, ...current.comments].slice(0, commentHistoryLimit),
            publicComments: [
              ...(result.data.publicComments.length > 0 ? result.data.publicComments : publicCommentsFromStrings(result.data.comments, language)),
              ...current.publicComments
            ].slice(0, commentHistoryLimit)
          };
          localStorage.setItem("emperor-feed-state", JSON.stringify(merged));
          return merged;
        });
      }).finally(() => setEngineStatus("idle"));
    }
  }

  async function selectAction(action: ActionDefinition) {
    if (engineStatus !== "idle" || dialogueEvent) {
      pushToast(language === "zh" ? "AI 忙碌" : "AI busy", language === "zh" ? "请等待当前宫廷计算完成。" : "Wait for the current palace check to finish.");
      return;
    }
    const guidedLockReason = guidedActionLockReason(action);
    if (guidedLockReason) {
      pushToast(language === "zh" ? "区域尚未解封" : "Feature sealed", guidedLockReason);
      return;
    }
    const lockReason = getActionLockReason(action.id, state, language);
    if (lockReason) {
      pushToast(language === "zh" ? "行动已锁定" : "Action locked", lockReason);
      return;
    }

    clearVisualReset();
    unlockAudio();
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
      pushToast(
        language === "zh" ? "AI 给了更安全的说法" : "AI intervention opened",
        language === "zh" ? "发布前先比较原文和改写。" : "Review the palace-approved framing before publishing."
      );
      triggerBreach("ai");
      setEngineStatus("idle");
      return;
    }

    const kind = classifyActionKind(action);
    setPendingCommand({ action, reaction, kind, preview: getActionPreview(action.id, state, undefined, language) });
    setVisualPhase("previewing");
    setLastRiskKind(kind);
    setEngineMessage(reaction.engineMessage);
    advanceOnboarding("commandOpened", { actionId: action.id });
    triggerBreach(kind);
    setEngineStatus("idle");
  }

  async function confirmCommand() {
    if (!pendingCommand) return;
    const { action, reaction } = pendingCommand;
    const spendAction = !isTutorialActionFree(action.id);
    setPendingCommand(null);
    advanceOnboarding("commandCommitted", { actionId: action.id });
    await commitAction(action, "direct", undefined, reaction.engineMessage, { spendAction });
  }

  async function resolvePending(choice: "rewrite" | "original") {
    if (!pending) return;
    const publishedText = choice === "rewrite" ? pending.rewrite.rewrittenPost : actionText(pending.action.id, language).originalPost;
    const message = choice === "rewrite"
      ? `${pending.reaction.engineMessage} ${commonText("rewriteStrategy", language)}${language === "zh" ? "：" : ": "}${pending.rewrite.strategy}`
      : language === "zh" ? "你拒绝了宫廷允许的改写。直接证据进入公开记录，宫廷警戒可能升高。" : "You rejected palace-approved wording. Direct Evidence entered the public record, and Palace Alert may rise.";
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
    localStorage.removeItem(tutorialCompletedKey);
    clearCurrentRunId();
    ensureCurrentRunId();
    setBriefingOpen(true);
    setTutorialOpen(false);
    setEngineIntroOpen(false);
    setSystemGuidanceUnlocked(false);
    setTutorialStepIndex(0);
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
    pushToast(language === "zh" ? "本局已重置" : "Game reset", language === "zh" ? "当前状态已恢复。" : "Game state restored.");
  }

  function proceedToParade() {
    const endingId = calculateEndingWithProfile(state, loadProfile());
    localStorage.setItem("emperor-feed-ending", endingId);
    localStorage.setItem("emperor-feed-final-state", JSON.stringify(state));
    router.push("/ending");
  }

  const guidedStep = getGuidedCampaignStep(state, playerProfile);
  const command = commandCopy(pendingCommand?.kind ?? "default", language);
  const commandEffects = pendingCommand ? previewEffectEntries(pendingCommand.preview, language) : [];
  const tutorial = useMemo(() => onboardingTourSteps(language), [language]);
  const activeTutorialStep = tutorialOpen && !briefingOpen ? tutorial[tutorialStepIndex] : null;
  const tutorialCopy = onboardingTourUi(language);
  const activeTourId = activeTutorialStep?.spotlightTargetId ?? null;
  const activeActionTourId = activeTutorialStep?.actionTargetId ?? null;
  const guidedDialogueOpen = isGuidedCampaignActive(playerProfile) && Boolean(dialogueEvent) && state.dialogueEvents.length === 0;
  const dialogueTimerPaused = guidedDialogueOpen && !dialogueTimedOut;
  const currentTutorialSurface: OnboardingSurface = pending
    ? "aiReview"
    : pendingCommand
      ? "command"
      : dialogueEvent
        ? "dialogue"
        : traceAction
          ? "trace"
          : "dashboard";
  const tutorialVisible = Boolean(activeTutorialStep && activeTutorialStep.surface === currentTutorialSurface && !engineIntroOpen && unlockAnimationQueue.length === 0);
  const tutorialPanelPosition = spotlightPanelPosition(spotlightRect, tutorialPanelSize);
  const overlayActive = Boolean(
    pendingCommand ||
    pending ||
    dialogueEvent ||
    traceAction ||
    tutorialVisible ||
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

  const scrollTourTargetIntoView = useCallback((id: OnboardingTargetId) => {
    const target = document.querySelector(`[data-tour-target="${escapeTourTarget(id)}"]`);
    if (!target) return;

    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    const rect = target.getBoundingClientRect();
    const safeTop = 96;
    const safeBottom = window.innerHeight - 260;
    const targetTop = window.scrollY + rect.top;
    const targetBottom = window.scrollY + rect.bottom;

    if (rect.height > safeBottom - safeTop) {
      window.scrollTo({ top: Math.max(0, targetTop - safeTop), behavior: "auto" });
      return;
    }

    if (rect.top < safeTop) {
      window.scrollTo({ top: Math.max(0, targetTop - safeTop), behavior: "auto" });
      return;
    }

    if (rect.bottom > safeBottom) {
      window.scrollTo({ top: Math.max(0, targetBottom - safeBottom), behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    if (!activeTutorialStep) return;
    scrollTourTargetIntoView(activeTutorialStep.spotlightTargetId);
  }, [activeTutorialStep, scrollTourTargetIntoView]);

  useEffect(() => {
    if (!activeTutorialStep || !tutorialVisible) {
      return;
    }

    const step = activeTutorialStep;
    let frame = 0;
    function measure() {
      const target = document.querySelector(`[data-tour-target="${escapeTourTarget(step.spotlightTargetId)}"]`);
      if (!target) {
        setSpotlightRect(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      const pad = step.actionTargetId ? 8 : 12;
      const left = clampToRange(rect.left - pad, 12, window.innerWidth - 28);
      const top = clampToRange(rect.top - pad, 12, window.innerHeight - 28);
      const right = clampToRange(rect.right + pad, left + 12, window.innerWidth - 12);
      const bottom = clampToRange(rect.bottom + pad, top + 12, window.innerHeight - 12);
      setSpotlightRect({
        top,
        left,
        width: right - left,
        height: bottom - top,
        right,
        bottom
      });
    }

    frame = window.requestAnimationFrame(measure);
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);
    const interval = window.setInterval(measure, 360);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [activeTutorialStep, tutorialVisible]);

  useEffect(() => {
    if (!activeActionTourId || !tutorialVisible) {
      return;
    }

    const targetId = activeActionTourId;
    let frame = 0;
    function measure() {
      const target = document.querySelector(`[data-tour-target="${escapeTourTarget(targetId)}"]`);
      if (!target) {
        setActionHintRect(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      const pad = 5;
      const left = clampToRange(rect.left - pad, 10, window.innerWidth - 24);
      const top = clampToRange(rect.top - pad, 10, window.innerHeight - 24);
      const right = clampToRange(rect.right + pad, left + 10, window.innerWidth - 10);
      const bottom = clampToRange(rect.bottom + pad, top + 10, window.innerHeight - 10);
      setActionHintRect({ top, left, width: right - left, height: bottom - top, right, bottom });
    }

    frame = window.requestAnimationFrame(measure);
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);
    const interval = window.setInterval(measure, 300);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [activeActionTourId, tutorialVisible]);

  useEffect(() => {
    if (!tutorialVisible) return;
    const panel = tutorialPanelRef.current;
    if (!panel) return;
    const frame = window.requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      setTutorialPanelSize({ width: rect.width, height: rect.height });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [tutorialVisible, activeTutorialStep, language]);

  function tourState(id: OnboardingTargetId) {
    return {
      "data-tour-target": id,
      "data-tour-active": activeTourId === id ? "true" : "false",
      "data-tour-action-active": activeActionTourId === id ? "true" : "false"
    };
  }

  function closeTutorial(nextState: GameState) {
    setTutorialOpen(false);
    setTutorialStepIndex(0);
    setSpotlightRect(null);
    setActionHintRect(null);
    localStorage.setItem(guidanceUnlockedKey, "true");
    setSystemGuidanceUnlocked(true);
    void refreshGuidance(nextState);
  }

  function skipTutorial() {
    const nextState = hasOpeningTutorialSequence(state) ? normalizeTutorialActionCosts(state) : state;
    if (nextState !== state) {
      localStorage.setItem("emperor-feed-state", JSON.stringify(nextState));
      setState(nextState);
    }
    closeTutorial(nextState);
  }

  function completeTutorial() {
    const nextState = normalizeTutorialActionCosts(state);
    localStorage.setItem(tutorialCompletedKey, "true");
    localStorage.setItem("emperor-feed-state", JSON.stringify(nextState));
    setState(nextState);
    closeTutorial(nextState);
  }

  function moveOnboardingTo(stepId: string) {
    const index = tutorial.findIndex((step) => step.id === stepId);
    if (index >= 0) setTutorialStepIndex(index);
  }

  function advanceOnboarding(event: OnboardingAdvance, payload?: { actionId?: string; zoneId?: string }) {
    if (!activeTutorialStep) return;
    if (activeTutorialStep.advanceOn === "tutorialFinished" && event === "tutorialFinished") {
      completeTutorial();
      return;
    }

    if (event === "traceOpened" && payload?.actionId === "publishTailorsClaim") {
      moveOnboardingTo("traceOverview");
      return;
    }
    if (event === "traceClosed" && activeTutorialStep.surface === "trace") {
      moveOnboardingTo("commitFirstRecord");
      return;
    }
    if (event === "commandOpened" && payload?.actionId === "publishTailorsClaim") {
      moveOnboardingTo("commandOverview");
      return;
    }
    if (event === "commandOpened" && payload?.actionId === "showUnfilteredComments") {
      moveOnboardingTo("commandPublicEffects");
      return;
    }
    if (event === "commandCommitted" && payload?.actionId === "publishTailorsClaim" && activeTutorialStep.surface === "command") {
      moveOnboardingTo("metricSummary");
      return;
    }
    if (event === "commandCommitted" && payload?.actionId === "showUnfilteredComments" && activeTutorialStep.surface === "command") {
      moveOnboardingTo("dialogueOverview");
      return;
    }
    if (event === "sourceSelected" && payload?.zoneId === "public") {
      moveOnboardingTo("readPublicCard");
      return;
    }
    if (event === "dialogueReplySent" && activeTutorialStep.surface === "dialogue") {
      moveOnboardingTo("dialogueResolve");
      return;
    }
    if (event === "dialogueResolved" && activeTutorialStep.surface === "dialogue") {
      completeTutorial();
      return;
    }

    if (activeTutorialStep.advanceOn !== event) return;

    if (event === "sourceSelected" && payload?.zoneId && payload.zoneId !== "public") return;
    if ((event === "traceOpened" || event === "commandOpened" || event === "commandCommitted") && payload?.actionId) {
      const expectedAction = activeTutorialStep.id.includes("Public") || activeTutorialStep.id.includes("public") || activeTutorialStep.id === "commitPublicSignal"
        ? "showUnfilteredComments"
        : activeTutorialStep.id.includes("First") || activeTutorialStep.id.includes("first") || activeTutorialStep.id === "inspectTrace" || activeTutorialStep.id === "commitFirstRecord"
          ? "publishTailorsClaim"
          : payload.actionId;
      if (payload.actionId !== expectedAction) return;
    }

    if (tutorialStepIndex >= tutorial.length - 1) {
      completeTutorial();
      return;
    }
    setTutorialStepIndex((current) => Math.min(tutorial.length - 1, current + 1));
  }

  function nextTutorialStep() {
    advanceOnboarding(activeTutorialStep?.advanceOn === "tutorialFinished" ? "tutorialFinished" : "next");
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
  }, [dialogueMood, language, state]);

  useEffect(() => {
    if (!dialogueEvent) return;
    if (dialogueTimerPaused || !dialogueDeadline || dialogueTimedOut || dialogueStatus === "streaming" || dialogueStatus === "resolving") return;

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
  }, [dialogueDeadline, dialogueEvent, dialogueStatus, dialogueTimedOut, dialogueTimerPaused, dialogueTranscript, recordDialogueSilence]);

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
    advanceOnboarding("dialogueReplySent");
    let speakerText = "";
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
      setDialogueSource(normalizeAiSource(response.headers.get("X-PNE-AI-Source")));
      if (!response.ok || !response.body) throw new Error(localizedDialogueError(language));
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
            speakerText += data;
            await appendDialogueTokenNaturally(data, controller.signal);
          }
          if (eventName === "error") throw new Error(localizedDialogueError(language, typeof data === "object" ? data.error : undefined));
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
      setDialogueError(localizedDialogueError(language, error instanceof Error ? error.message : undefined));
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
    advanceOnboarding("dialogueResolved");
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
  const dialogueProgress = dialogueTimerPaused
    ? 1
    : dialogueEvent && !dialogueTimedOut
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
    const timer = window.setTimeout(() => setUnlockAnimationQueue([]), 1600);
    return () => window.clearTimeout(timer);
  }, [guidedStep, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (isZoneVisibleInGuidedStep(guidedStep, selectedZone as typeof zones[number]["id"])) return;
    queueMicrotask(() => setSelectedZone(guidedStep === "publicSignals" || guidedStep === "systemSuspicion" ? "public" : "tailors"));
  }, [guidedStep, hydrated, selectedZone]);

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

  const activeActionHint = actionHintRect ? actionHintLayout(actionHintRect) : null;
  const formalActionsUsed = spentActionCount(state);

  return (
    <main
      className="page dashboard-page ui-shift"
      data-phase={visualPhase}
      data-engine-status={engineStatus}
      data-last-risk={lastRiskKind}
      data-atmosphere={atmosphere}
      data-guided-step={guidedStep}
      data-tutorial-active={tutorialVisible ? "true" : "false"}
      data-tour-step={activeTutorialStep?.id ?? "off"}
      data-overlay-active={overlayActive ? "true" : "false"}
    >
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <header className="topbar" aria-label="Navigation">
        <Link className="brand-mark" href="/">{language === "zh" ? "The Emperor's Feed / 宫廷发布台" : "The Emperor's Feed / Palace Feed"}</Link>
        <nav className="topbar-links">
          <Link href="/">{commonText("start", language)}</Link>
          <Link href="/dashboard">{commonText("operations", language)}</Link>
          <Link href="/archive">{commonText("archive", language)}</Link>
          <Link href="/credits">{commonText("credits", language)}</Link>
        </nav>
        <div className="topbar-actions">
          <AuthControl language={language} compact />
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

        <div className="panel-shell lab-shell" data-reveal>
          <div className="lab-shell-label">{language === "zh" ? "本局发布台" : "Game Feed Desk"}</div>
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
              <small>{language === "zh" ? "当前阶段" : "Current Phase"}</small>
              <b>{narrativePhaseLabel(narrativeContext.phase, language)}</b>
            </div>
            <div>
              <small>{language === "zh" ? "主导变化" : "Dominant Pressure"}</small>
              <b>{narrativeThreadLabel(narrativeContext.dominantThread, language)}</b>
            </div>
            <div className="arc-beat">
              <small>{language === "zh" ? "激活事件" : "Active Beat"}</small>
              <b>{narrativeContext.activeBeat ? (language === "zh" ? narrativeContext.activeBeat.titleZh : narrativeContext.activeBeat.title) : (language === "zh" ? "等待下一条信号" : "Awaiting next signal")}</b>
              <span>{narrativeContext.activeBeat ? (language === "zh" ? narrativeContext.activeBeat.textZh : narrativeContext.activeBeat.text) : (language === "zh" ? "下一次行动会决定本局往哪个方向发展。" : "The next action will decide where this run moves next.")}</span>
            </div>
          </motion.div>
          <LayoutGroup>
          <div className="lab-head">
            <div className="role-card tour-target" {...tourState("role-card")}>
              <div className="role-num">{state.actionsLeft}</div>
              <div><b>{language === "zh" ? "剩余执行次数" : "Actions Left"}</b><span>{language === "zh" ? `正式已执行 ${formalActionsUsed} 次 · 还能执行 ${state.actionsLeft} 次` : `${formalActionsUsed} spent · ${state.actionsLeft} left this run`}</span></div>
            </div>
            <div className="metrics-grid tour-target" aria-label="State variables" {...tourState("metrics-grid")}>
              {metricRows.map(([key, tone]) => {
                const value = state[key];
                const delta = changedMetrics.find((item) => item.key === key);
                const metricSealed = !isMetricVisibleInGuidedStep(guidedStep, key);
                const metricTargets = {
                  truth: "metric-truth",
                  pressure: "metric-pressure",
                  virality: "metric-virality",
                  publicDoubt: "metric-publicDoubt",
                  reputation: "metric-reputation",
                  systemSuspicion: "metric-systemSuspicion"
                } as const;
                const metricTarget = tourState(metricTargets[key]);
                return (
                  <motion.div
                    layout
                    className={`metric ${delta ? "metric-changed" : ""} ${metricSealed ? "guided-sealed" : ""}`}
                    key={key}
                    {...metricTarget}
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
            <aside className="module tour-target">
              <div className="module-head"><h3>{commonText("sceneSources", language)}</h3><span className="chip accent-cyan">{commonText("live", language)}</span></div>
              <div className="module-body stage-list">
                {zones.map((zone) => {
                  const zoneSealed = !isZoneVisibleInGuidedStep(guidedStep, zone.id);
                  const sourceTarget = zone.id === "tailors"
                    ? tourState("source-tailors")
                    : zone.id === "public"
                      ? tourState("source-public")
                      : {};
                  return (
                    <button
                      className={`${zone.id === selectedZone ? "stage-button active" : "stage-button"} ${zoneSealed ? "guided-sealed" : ""}`}
                      key={zone.id}
                      aria-disabled={zoneSealed}
                      data-lock-label={commonText("locked", language)}
                      {...sourceTarget}
                      onClick={() => {
                        if (zoneSealed) {
                          pushToast(language === "zh" ? "来源已封存" : "Source sealed", lockedFeatureText("zone", zone.id, language));
                          return;
                        }
                        setSelectedZone(zone.id);
                        setVisualPhase("focusing");
                        advanceOnboarding("sourceSelected", { zoneId: zone.id });
                        pushToast(language === "zh" ? "来源焦点已变化" : "Source focus changed", language === "zh" ? `${zoneText(zone.id, language).title} 已进入编辑队列。` : `${zoneText(zone.id, language).title} is now feeding the editorial queue.`);
                      }}
                      style={{ "--accent": "var(--cyan)" } as CSSProperties}
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
                  <span>{language === "zh" ? "有人开始重复：“我还以为只有我看不见。” · 孩子的话正在传开 · 宫廷要求继续称赞 · 有人开始重复：“我还以为只有我看不见。” ·" : "THREAD 41: spectators repeat \"I thought I was the only one\" · ENGINE FLAG: visual evidence destabilizes prestige hierarchy · CHILD QUOTE CLUSTER: propagation exceeds containment threshold · THREAD 41: spectators repeat \"I thought I was the only one\" ·"}</span>
                </div>
              </div>
              <div className="feed-grid">
                <div className="module zone-action-module tour-target">
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
                    const actionCardTarget = action.id === "publishTailorsClaim"
                      ? tourState("card-publishTailorsClaim")
                      : action.id === "showUnfilteredComments"
                        ? tourState("card-showUnfilteredComments")
                        : {};
                    return (
                      <article
                        className={`${locked ? "action-card disabled" : "action-card"} ${guidedLockReason ? "guided-sealed" : ""} ${completed ? "completed" : ""} ${selectedPostId === action.id ? "is-active" : ""}`}
                        data-post={`0${index + 1}`}
                        data-risk={riskKind}
                        data-zone={action.zone}
                        key={action.id}
                        {...actionCardTarget}
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
                            <p className="narrative-preview">{language === "zh" ? "该行动会改变本局走向和后续突发交流。" : action.narrativePreview}</p>
                          )}
                          <div className="effect-list">
                            {effects.map((effect) => <span className="effect-pill" key={effect}>{effect}</span>)}
                            {lockReason && <span className="effect-pill">{lockReason}</span>}
                            {guidedLockReason && <span className="effect-pill guided">{guidedLockReason}</span>}
                          </div>
                        </div>
                        <div className="tool-row">
                          <button
                            className={action.requiresAIRewrite ? "tool-btn ai" : "tool-btn"}
                            disabled={completed || Boolean(lockReason) || Boolean(guidedLockReason) || engineStatus !== "idle" || Boolean(dialogueEvent)}
                            {...(action.id === "publishTailorsClaim"
                              ? tourState("action-publishTailorsClaim-commit")
                              : action.id === "showUnfilteredComments"
                                ? tourState("action-showUnfilteredComments-commit")
                                : {})}
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
                            {...(action.id === "publishTailorsClaim" ? tourState("action-publishTailorsClaim-inspect") : {})}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedPostId(action.id);
                              setTraceActionId(action.id);
                              advanceOnboarding("traceOpened", { actionId: action.id });
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

                <aside className="module black comments-module tour-target" {...tourState("comments-panel")}>
                  <div className="module-head"><h3>{commonText("liveComments", language)}</h3><span className="chip accent-cyan">+{state.virality * 42}/min</span></div>
                  <div className="module-body comment-stream">
                    {visiblePublicComments.map((comment, index) => (
                      <div className={`comment stance-${comment.stance}${comment.text.toLowerCase().includes("child") || comment.text.includes("孩子") ? " child" : ""}`} key={`${comment.handle}-${comment.text}-${index}`}>
                        <b>{comment.handle}</b>
                        <span>{comment.persona} / {stanceText(comment.stance, language)}</span>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="map-strip" aria-label={language === "zh" ? "群众怀疑热力图" : "Public doubt heat map"}>
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

            <aside className="engine-stack tour-target" {...tourState("engine-panel")}>
              <div className="module black">
                <div className="module-head"><h3><Term id="pne" language={language}>{commonText("palaceNarrativeEngine", language)}</Term></h3><div className="engine-eye" aria-hidden="true" /></div>
                <div className="module-body">
                  <div className="ai-message" data-framing-label={commonText("recommendedFraming", language)}>{engineMessage}</div>
                  <div className="engine-status-line">
                    <span>{engineStatusText(engineStatus, language)}</span>
                    <span>{aiSourceLabel(engineSource, language)}</span>
                  </div>
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
                      <p>{guidance?.message ?? (language === "zh" ? "宫廷 AI 正在等待你的下一步行动。" : "Palace AI is waiting for your next move.")}</p>
                      <small>{guidance?.objective ?? (language === "zh" ? "目标：等待玩家行动。" : "Objective: await player action.")} · {aiSourceLabel(guidanceSource, language)}</small>
                    </div>
                  )}
                  <div className="decode-strip">
                    <span>{decoded ? commonText("decodeProgress", language) : (language === "zh" ? "隐藏线索" : "Archive Signal")}</span>
                    <b>{playerProfile.biasAwareness}%</b>
                    <i style={{ "--decode-progress": playerProfile.biasAwareness / 100 } as CSSProperties} />
                  </div>
                  <div className="log-list">
                    {state.history.slice(-4).reverse().map((entry) => (
                      <div className="log-row" key={entry.id}>
                        <span>{choiceText(entry.choice, language)}</span>
                        <span>{localizedActionTitle(entry.actionId, language, entry.actionTitle)}</span>
                      </div>
                    ))}
                    {state.history.length === 0 && <div className="log-row"><span>{engineStatusText("idle", language)}</span><span>{language === "zh" ? "尚未记录发布历史。" : "No editorial trace recorded yet."}</span></div>}
                  </div>
                </div>
              </div>

              <div className="module black">
                <div className="module-head"><h3>{commonText("liveFeedRecord", language)}</h3><span className="chip accent-gold">{language === "zh" ? "历史" : "Trace"}</span></div>
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
                      <small>{decoded ? (language === "zh" ? "已看清 AI 偏向" : "AI bias found") : `${playerProfile.biasAwareness}% ${language === "zh" ? "隐藏线索" : "Archive Signal"}`}</small>
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
              {...tourState("command-panel")}
            >
              <div className="command-head">
                <h3 id="command-title">{command.title}</h3>
                <div className="command-badge">{command.badge}</div>
              </div>
              <div className="command-body">
                <div className="command-readout" {...tourState("command-selected")}><b>{commonText("selectedAction", language)}</b><p>{actionText(pendingCommand.action.id, language).title}</p></div>
                <div className="command-readout" {...tourState("command-effects")}><b>{commonText("predictedEffect", language)}</b><p>{commandEffects.length > 0 ? commandEffects.join(" · ") : command.effect}</p></div>
                <div className="command-readout" {...tourState("command-response")}><b>{commonText("systemResponse", language)}</b><p>{pendingCommand.reaction.engineMessage}</p></div>
                {pendingCommand.preview.unlocks.length ? (
                  <div className="command-readout"><b>{commonText("unlocks", language)}</b><p>{pendingCommand.preview.unlocks.map((id) => actionText(id, language).title).join(", ")}</p></div>
                ) : null}
              </div>
              <div className="command-actions">
                <button className="btn secondary" onClick={() => {
                  setPendingCommand(null);
                  setVisualPhase("idle");
                }}>{commonText("dismiss", language)}</button>
                <button className="btn primary" {...tourState("command-commit")} onClick={() => void confirmCommand()}>{commonText("commitSimulation", language)}</button>
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
            {...tourState("dialogue-panel")}
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
                <span>
                  {dialogueRepliesStatus === "generating"
                    ? `${combinedAiSourceLabel([dialogueSource, dialogueRepliesSource], language)} · ${language === "zh" ? "生成回复" : "drafting replies"}`
                    : combinedAiSourceLabel([dialogueSource, dialogueRepliesSource], language)}
                </span>
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
              className={dialogueTimedOut ? "dialogue-timeout expired" : dialogueTimerPaused ? "dialogue-timeout paused" : "dialogue-timeout"}
              style={{ "--dialogue-progress": dialogueProgress } as CSSProperties}
            >
              <span>{dialogueTimedOut ? commonText("silenceRecorded", language) : dialogueTimerPaused ? (language === "zh" ? "新手暂停" : "Guide Pause") : (language === "zh" ? "回应倒计时" : "Response Window")}</span>
              <b>{dialogueTimedOut ? "00s" : dialogueTimerPaused ? "--" : `${String(dialogueSecondsRemaining).padStart(2, "0")}s`}</b>
              <i className="dialogue-timeout-bar" aria-hidden="true" />
            </div>
            {dialogueMood && (
              <div className="dialogue-mood" aria-label={language === "zh" ? "交流态势" : "Dialogue mood"} {...tourState("dialogue-mood")}>
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
            <div className="dialogue-stakes" {...tourState("dialogue-stakes")}>
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
              {visibleDialogueReplies.map((reply, index) => (
                <motion.button
                  layout
                  animate={{ opacity: 1, y: 0 }}
                  className="tool-btn"
                  disabled={dialogueStatus === "streaming" || dialogueStatus === "resolving" || dialogueInteractionLocked}
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={reply.id}
                  {...(index === 0 ? tourState("dialogue-reply") : {})}
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
                {...tourState("dialogue-resolve")}
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

      {activeTutorialStep && tutorialVisible && (
        <div className="tutorial-layer onboarding-layer" aria-live="polite">
          {spotlightRect ? (
            <>
              <div className="tutorial-scrim top" style={{ left: 0, top: 0, width: "100vw", height: spotlightRect.top }} aria-hidden="true" />
              <div className="tutorial-scrim left" style={{ left: 0, top: spotlightRect.top, width: spotlightRect.left, height: spotlightRect.height }} aria-hidden="true" />
              <div className="tutorial-scrim right" style={{ left: spotlightRect.right, top: spotlightRect.top, width: `calc(100vw - ${spotlightRect.right}px)`, height: spotlightRect.height }} aria-hidden="true" />
              <div className="tutorial-scrim bottom" style={{ left: 0, top: spotlightRect.bottom, width: "100vw", height: `calc(100vh - ${spotlightRect.bottom}px)` }} aria-hidden="true" />
              <div
                className="tutorial-spotlight-frame"
                style={{
                  left: spotlightRect.left,
                  top: spotlightRect.top,
                  width: spotlightRect.width,
                  height: spotlightRect.height
                }}
                aria-hidden="true"
              />
            </>
          ) : (
            <div className="tutorial-scrim fallback" aria-hidden="true" />
          )}
          {activeActionHint && activeActionTourId && (
            <div className="tutorial-action-hint" data-placement={activeActionHint.placement} style={activeActionHint.style} aria-hidden="true">
              <span>{activeTutorialStep.actionLabel ?? tutorialCopy.waiting}</span>
              <i />
            </div>
          )}
          <section
            ref={(node) => { tutorialPanelRef.current = node; }}
            className="tutorial-panel onboarding-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="tutorial-title"
            style={{
              left: tutorialPanelPosition.left,
              top: tutorialPanelPosition.top,
              width: tutorialPanelPosition.width,
              maxHeight: tutorialPanelPosition.maxHeight
            }}
          >
            <div className="tutorial-kicker">
              <span>{tutorialCopy.label}</span>
            </div>
            <p className="tutorial-eyebrow">{activeTutorialStep.eyebrow}</p>
            <h3 id="tutorial-title">{activeTutorialStep.title}</h3>
            <p>{activeTutorialStep.body}</p>
            <p className="tutorial-detail">{activeTutorialStep.detail}</p>
            {activeTutorialStep.why && <p className="tutorial-why">{activeTutorialStep.why}</p>}
            {activeTutorialStep.metricFocus && (
              <div className="tutorial-metric-focus">
                <b>{language === "zh" ? "重点" : "Metric focus"}</b>
                <span>{activeTutorialStep.metricFocus === "actionsLeft" ? (language === "zh" ? "剩余行动" : "Actions Left") : metricLabel(activeTutorialStep.metricFocus, language)}</span>
              </div>
            )}
            <div className="tutorial-actions">
              <button className="tool-btn" onClick={skipTutorial}>{tutorialCopy.skip}</button>
              <button className="tool-btn" disabled={tutorialStepIndex === 0} onClick={previousTutorialStep}>{tutorialCopy.previous}</button>
              {activeTutorialStep.advanceOn === "next" || activeTutorialStep.advanceOn === "tutorialFinished" ? (
                <button className="btn primary" onClick={nextTutorialStep}>
                  {activeTutorialStep.advanceOn === "tutorialFinished" ? tutorialCopy.finish : tutorialCopy.next}
                </button>
              ) : (
                <span className="tutorial-waiting">{tutorialCopy.waiting}</span>
              )}
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
                    ? "我仍会给出建议，但你已经知道：稳定会遮住真实。可以切到教练模式，尝试让大家一起说出真话。"
                    : "I will still offer guidance, but the archive proves stability can bury truth. Switch to coach mode to pursue The Crowd Speaks.")
                  : (language === "zh"
                    ? "我会帮你稳住游行前的说法、保住你的安全，并提醒哪些发布会提高宫廷警戒。证据越直接，越需要想清楚代价。"
                    : "I will help steady the parade story, protect Safety, and flag posts that raise Palace Alert. The more direct the Evidence, the higher the cost.")}
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
                  {language === "zh" ? "连接 AI" : "Connect AI"}
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
              <div><b>{language === "zh" ? "02 / 预览后果" : "02 / Preview result"}</b><span>{language === "zh" ? "发布前查看解锁条件、风险等级和预计变化。" : "Review locks, risk, and predicted effects before publishing."}</span></div>
              <div><b>{language === "zh" ? "03 / 确认发布" : "03 / Publish"}</b><span>{language === "zh" ? "确认后才会真正改变局势。" : "AI may change language. The rule system keeps numbers and endings fixed."}</span></div>
            </div>
            <button className="btn primary" onClick={dismissBriefing}>{language === "zh" ? "开始行动" : "Begin Operations"}</button>
          </div>
        </div>
      )}

      {traceAction && tracePreview && (
        <div className="trace-drawer active" role="presentation">
          <aside className="trace-panel" role="dialog" aria-modal="true" aria-label={commonText("actionTrace", language)} {...tourState("trace-panel")}>
            <div className="trace-head">
              <span className={`status-tag ${tracePreview.lockReason ? "locked" : "safe"}`}>
                {tracePreview.lockReason ? commonText("locked", language) : tracePreview.completed ? commonText("completed", language) : commonText("available", language)}
              </span>
              <button className="tool-btn" {...tourState("trace-close")} onClick={() => {
                setTraceActionId(null);
                advanceOnboarding("traceClosed");
              }}>{commonText("closeTrace", language)}</button>
            </div>
            <h3>{actionText(traceAction.id, language).title}</h3>
            <p>{actionText(traceAction.id, language).description}</p>
            <div className="trace-grid">
              <div><b>{commonText("source", language)}</b><span>{actionText(traceAction.id, language).sourceLabel}</span></div>
              <div {...tourState("trace-risk")}><b>{commonText("risk", language)}</b><span>{riskBandText(tracePreview.riskBand, language)}</span></div>
              <div><b>{commonText("choices", language)}</b><span>{tracePreview.availableChoices.map((choice) => choiceText(choice, language)).join(" / ")}</span></div>
              <div {...tourState("trace-requirement")}><b>{commonText("requirement", language)}</b><span>{tracePreview.lockReason ?? commonText("available", language)}</span></div>
            </div>
            <div className="trace-readout" {...tourState("trace-output")}>
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
