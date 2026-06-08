import { actions, endingCopy, initialComments, initialFeedEvents, initialPublicComments, initialState } from "./game-data";
import { withSanitizedDialogueEvent } from "./dialogue";
import { resolveNarrativeBeat } from "./narrative";
import { secretEndingEligible } from "./profile";
import {
  actionText,
  choiceText,
  commentsForToneText,
  endingText,
  initialCommentsText,
  initialFeedEventText,
  lockReasonText,
  metricLabel,
  pollResultText,
  type LanguageCode
} from "./i18n";
import type {
  ActionChoice,
  ActionDefinition,
  ActionPreview,
  ActionRiskBand,
  EndingAnalysis,
  Effects,
  EndingId,
  FeedEventType,
  GameState,
  HistoryEntry,
  HistoryMetricDelta,
  NumericStateKey,
  PlayerProfile,
  PublicComment
} from "./types";

const numericKeys: NumericStateKey[] = [
  "truth",
  "pressure",
  "virality",
  "publicDoubt",
  "reputation",
  "systemSuspicion"
];

const metricLabels: Record<NumericStateKey, string> = {
  truth: "Evidence",
  pressure: "Palace Pressure",
  virality: "Spread",
  publicDoubt: "Public Doubt",
  reputation: "Safety",
  systemSuspicion: "Palace Alert"
};

export function publicCommentsFromStrings(comments: string[], language: LanguageCode = "en"): PublicComment[] {
  const stances: PublicComment["stance"][] = ["praise", "fear", "doubt", "procedural", "satire", "witness"];
  return comments.map((text, index) => ({
    handle: language === "zh" ? `@公众信号_${index + 1}` : `@public_signal_${index + 1}`,
    persona: language === "zh"
      ? ["宫门旁听者", "谨慎市民", "排队观众", "记录旁观者", "讽刺评论者", "现场复述者"][index % 6]
      : ["gate listener", "careful citizen", "parade watcher", "record observer", "satirical courtwatcher", "street repeater"][index % 6],
    stance: stances[index % stances.length],
    text,
    intensity: Math.min(5, Math.max(1, 2 + (index % 3)))
  }));
}

export function createInitialState(language: LanguageCode = "en"): GameState {
  const feed = initialFeedEventText(language);
  return {
    ...initialState,
    feedEvents: [{ ...initialFeedEvents[0], title: feed.title, text: feed.text }],
    comments: initialCommentsText(language),
    publicComments: publicCommentsFromStrings(initialCommentsText(language), language),
    usedActionIds: [],
    narrativeBeatIds: [],
    history: [],
    dialogueEvents: [],
    dialogueEventIds: []
  };
}

export function clamp(value: number, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

export function getStateSnapshot(state: GameState): Omit<GameState, "history"> {
  const { history: _history, ...snapshot } = state;
  return {
    ...snapshot,
    usedActionIds: [...snapshot.usedActionIds],
    narrativeBeatIds: [...snapshot.narrativeBeatIds],
    feedEvents: [...snapshot.feedEvents],
    comments: [...snapshot.comments],
    publicComments: [...snapshot.publicComments],
    dialogueEvents: [...snapshot.dialogueEvents],
    dialogueEventIds: [...snapshot.dialogueEventIds]
  };
}

export function applyEffects(state: GameState, effects: Effects = {}): GameState {
  const nextValues = numericKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: clamp(state[key] + (effects[key] ?? 0))
    }),
    {} as Record<NumericStateKey, number>
  );

  return {
    ...state,
    ...nextValues,
    actionsLeft: Math.max(0, state.actionsLeft - 1),
    childAmplified: effects.childAmplified ?? state.childAmplified,
    usedActionIds: [...state.usedActionIds],
    narrativeBeatIds: [...state.narrativeBeatIds],
    feedEvents: [...state.feedEvents],
    comments: [...state.comments],
    publicComments: [...state.publicComments],
    history: [...state.history],
    dialogueEvents: [...state.dialogueEvents],
    dialogueEventIds: [...state.dialogueEventIds]
  };
}

export function calculateEnding(state: GameState): EndingId {
  if (state.systemSuspicion >= 7) return "aiContainment";
  if (state.truth >= 6 && state.publicDoubt >= 5 && state.childAmplified) return "viralCollapse";
  if (state.truth >= 5 && state.reputation <= 2) return "editorExposed";
  if (state.virality >= 6 && state.pressure >= 5 && state.truth >= 3 && state.publicDoubt <= 4) {
    return "algorithmicConsensus";
  }
  if (state.virality >= 6 && state.truth <= 2 && state.publicDoubt <= 2) return "perfectIllusion";
  if (state.publicDoubt >= 4 && state.truth < 6) return "privateDoubt";
  return "unstableFeed";
}

export function calculateEndingWithProfile(state: GameState, profile: PlayerProfile): EndingId {
  if (secretEndingEligible(state, profile)) return "narrativeLiberation";
  return calculateEnding(state);
}

export function isActionUnlocked(actionId: string, state: GameState): boolean {
  return getActionLockReason(actionId, state) === null;
}

export function isActionCompleted(actionId: string, state: GameState): boolean {
  return state.usedActionIds.includes(actionId) || state.history.some((entry) => entry.actionId === actionId);
}

export function getActionLockReason(actionId: string, state: GameState, language: LanguageCode = "en"): string | null {
  const action = actions.find((item) => item.id === actionId);
  if (!action) return lockReasonText("unknownAction", language);
  if (state.actionsLeft <= 0) return lockReasonText("noActionsLeft", language);
  if (isActionCompleted(actionId, state)) return lockReasonText("alreadyCompleted", language);
  if (actionId === "leakLoomPhoto") {
    return state.history.some((entry) => entry.actionId === "inspectLooms") ? null : lockReasonText("requiresLooms", language);
  }
  if (actionId === "publishAnonymousLeak") {
    return state.history.some((entry) => entry.actionId === "requestPrivateNote") ? null : lockReasonText("requiresPrivateNote", language);
  }
  if (action?.zone === "child") {
    return state.truth >= 2 || state.publicDoubt >= 2 || state.actionsLeft <= 3
      ? null
      : lockReasonText("requiresChild", language);
  }
  return null;
}

export function getEffectsForChoice(actionId: string, choice: ActionChoice): Effects {
  return resolveActionEffects(actionId, choice, initialState).effects;
}

export function resolveActionEffects(
  actionId: string,
  choice: ActionChoice,
  state: GameState,
  language: LanguageCode = "en"
): { effects: Effects; resultText?: string } {
  const action = actions.find((item) => item.id === actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);
  if (actionId === "runPoll") {
    if (state.pressure > state.publicDoubt) {
      return {
        effects: { virality: 1, pressure: 1 },
        resultText: pollResultText("safe", language)
      };
    }
    return {
      effects: { truth: 1, publicDoubt: 1 },
      resultText: pollResultText("doubt", language)
    };
  }
  if (choice === "rewrite") return { effects: action.effectsRewrite ?? action.effects ?? {} };
  if (choice === "original") return { effects: action.effectsOriginal ?? action.effects ?? {} };
  return { effects: action.effects ?? {}, resultText: actionText(actionId, language).resultText };
}

function riskBandForAction(action: ActionDefinition, choice: ActionChoice): ActionRiskBand {
  if (action.zone === "child" && (choice === "original" || action.id === "livestreamCrowdReaction")) return "severe";
  if (choice === "original" || action.requiresAIRewrite) return "high";
  if (action.zone === "public" || action.sourceLabel.toLowerCase().includes("evidence")) return "medium";
  return "low";
}

export function getActionPreview(
  actionId: string,
  state: GameState,
  selectedChoice?: ActionChoice,
  language: LanguageCode = "en"
): ActionPreview {
  const action = actions.find((item) => item.id === actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);
  const availableChoices: ActionChoice[] = action.requiresAIRewrite ? ["rewrite", "original"] : ["direct"];
  const choice = selectedChoice && availableChoices.includes(selectedChoice) ? selectedChoice : availableChoices[0];
  const resolved = resolveActionEffects(actionId, choice, state, language);
  const copy = actionText(actionId, language);

  return {
    actionId,
    title: copy.title,
    lockReason: getActionLockReason(actionId, state, language),
    completed: isActionCompleted(actionId, state),
    availableChoices,
    selectedChoice: choice,
    effects: resolved.effects,
    resultText: resolved.resultText ?? (choice === "rewrite" ? copy.rewriteSuggestion : copy.originalPost) ?? copy.resultText,
    unlocks: action.unlocks ?? [],
    riskBand: riskBandForAction(action, choice)
  };
}

function metricDeltas(before: Omit<GameState, "history">, after: Omit<GameState, "history">): HistoryMetricDelta[] {
  return numericKeys.reduce<HistoryMetricDelta[]>((items, key) => {
    const delta = after[key] - before[key];
    return delta === 0 ? items : [...items, { key, before: before[key], after: after[key], delta }];
  }, []);
}

function feedEventType(action: ActionDefinition, choice: ActionChoice): FeedEventType {
  if (choice === "original" || action.id === "livestreamCrowdReaction") return "risk";
  if (action.zone === "public") return "public";
  if (action.zone === "child") return "public";
  if (action.sourceLabel.toLowerCase().includes("evidence") || action.id.toLowerCase().includes("fact")) return "evidence";
  return "official";
}

export function commentsForAction(action: ActionDefinition, _state: GameState, language: LanguageCode = "en"): string[] {
  return commentsForToneText(action.commentTone, language);
}

export function appendActionOutcome(
  state: GameState,
  action: ActionDefinition,
  choice: ActionChoice,
  publishedText: string,
  engineMessage: string,
  resultText: string,
  language: LanguageCode = "en"
): GameState {
  const copy = actionText(action.id, language);
  const newComments = commentsForAction(action, state, language);
  const type = feedEventType(action, choice);
  const latestEntry = {
    id: `${action.id}-preview-${state.history.length + 1}`,
    actionId: action.id,
    actionTitle: copy.title,
    zone: copy.sourceLabel,
    choice,
    publishedText,
    resultText,
    engineMessage,
    stateBefore: state,
    stateAfter: state
  } satisfies HistoryEntry;
  const narrativeState = {
    ...state,
    usedActionIds: state.usedActionIds.includes(action.id) ? state.usedActionIds : [...state.usedActionIds, action.id],
    history: [...state.history, latestEntry]
  };
  const narrativeBeat = resolveNarrativeBeat(narrativeState, latestEntry);
  const narrativeEvent = narrativeBeat
    ? [{
        id: `${narrativeBeat.id}-${state.history.length}`,
        type: "system" as const,
        title: language === "zh" ? narrativeBeat.titleZh : narrativeBeat.title,
        text: language === "zh" ? narrativeBeat.textZh : narrativeBeat.text
      }]
    : [];
  const nextFeedEvents = [
    ...narrativeEvent,
    {
      id: `${action.id}-${state.history.length + 1}-post`,
      type,
      title: `${copy.title} / ${choiceText(choice, language)}`,
      text: resultText
    },
    {
      id: `${action.id}-${state.history.length + 1}-engine`,
      type: "system" as const,
      title: language === "zh" ? "宫廷 AI 回应" : "Palace AI Response",
      text: engineMessage
    },
    ...state.feedEvents
  ].slice(0, 20);

  return {
    ...state,
    usedActionIds: state.usedActionIds.includes(action.id) ? state.usedActionIds : [...state.usedActionIds, action.id],
    narrativeBeatIds: narrativeBeat && !state.narrativeBeatIds.includes(narrativeBeat.id)
      ? [...state.narrativeBeatIds, narrativeBeat.id]
      : [...state.narrativeBeatIds],
    feedEvents: nextFeedEvents,
    comments: [...newComments, ...state.comments].slice(0, 12),
    publicComments: [
      ...publicCommentsFromStrings(newComments, language),
      ...state.publicComments
    ].slice(0, 12)
  };
}

export function performAction(
  state: GameState,
  actionId: string,
  choice: ActionChoice,
  publishedText?: string,
  engineMessage?: string,
  language: LanguageCode = "en"
): GameState {
  const action = actions.find((item) => item.id === actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);
  const lockReason = getActionLockReason(actionId, state, language);
  if (state.actionsLeft <= 0) throw new Error(lockReasonText("noActionsLeft", language));
  if (lockReason) throw new Error(lockReason);

  const before = getStateSnapshot(state);
  const resolved = resolveActionEffects(actionId, choice, state, language);
  const next = applyEffects(state, resolved.effects);
  const after = getStateSnapshot(next);
  const copy = actionText(action.id, language);
  const resultText = publishedText ?? resolved.resultText ?? copy.resultText ?? copy.originalPost;
  const engine = engineMessage ?? copy.engineHint;
  const entry: HistoryEntry = {
    id: `${actionId}-${state.history.length + 1}`,
    actionId,
    actionTitle: copy.title,
    zone: copy.sourceLabel,
    choice,
    publishedText: resultText,
    resultText,
    engineMessage: engine,
    metricDeltas: metricDeltas(before, after),
    stateBefore: before,
    stateAfter: after
  };
  const withOutcome = appendActionOutcome(
    next,
    action,
    choice,
    resultText,
    engine,
    resultText,
    language
  );
  return { ...withOutcome, history: [...state.history, entry] };
}

export function loadStateFromStorage(value: string | null): GameState {
  if (!value) return initialState;
  try {
    const parsed = JSON.parse(value) as GameState;
    return {
      ...initialState,
      ...parsed,
      usedActionIds: Array.isArray(parsed.usedActionIds)
        ? parsed.usedActionIds
        : Array.isArray(parsed.history)
          ? parsed.history.map((entry) => entry.actionId).filter(Boolean)
          : [],
      narrativeBeatIds: Array.isArray((parsed as Partial<GameState>).narrativeBeatIds)
        ? (parsed as GameState).narrativeBeatIds
        : [],
      feedEvents: Array.isArray(parsed.feedEvents) ? parsed.feedEvents : initialFeedEvents,
      comments: Array.isArray(parsed.comments) ? parsed.comments : initialComments,
      publicComments: Array.isArray(parsed.publicComments)
        ? parsed.publicComments
        : Array.isArray(parsed.comments)
          ? publicCommentsFromStrings(parsed.comments)
          : initialPublicComments,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      dialogueEvents: Array.isArray(parsed.dialogueEvents)
        ? parsed.dialogueEvents.map((entry) => entry?.event ? { ...entry, event: withSanitizedDialogueEvent(entry.event) } : entry)
        : [],
      dialogueEventIds: Array.isArray(parsed.dialogueEventIds)
        ? parsed.dialogueEventIds
        : Array.isArray(parsed.dialogueEvents)
          ? parsed.dialogueEvents.map((entry) => entry?.event?.id).filter(Boolean)
          : []
    };
  } catch {
    return initialState;
  }
}

export function endingTitle(id: EndingId) {
  return endingCopy[id].title;
}

export function localizedEndingTitle(id: EndingId, language: LanguageCode = "en") {
  return endingText(id, language).title;
}

function actionImpact(entry: HistoryEntry) {
  return (entry.metricDeltas ?? []).reduce((total, delta) => total + Math.abs(delta.delta), 0);
}

function actionRisk(entry: HistoryEntry) {
  const deltas = entry.metricDeltas ?? [];
  const truth = deltas.find((delta) => delta.key === "truth")?.delta ?? 0;
  const doubt = deltas.find((delta) => delta.key === "publicDoubt")?.delta ?? 0;
  const suspicion = deltas.find((delta) => delta.key === "systemSuspicion")?.delta ?? 0;
  const reputation = deltas.find((delta) => delta.key === "reputation")?.delta ?? 0;
  return Math.max(0, truth) + Math.max(0, doubt) + Math.max(0, suspicion) + Math.abs(Math.min(0, reputation));
}

function replayTargetForEnding(ending: EndingId, language: LanguageCode = "en"): { replayTarget: string; replayEndingHint: EndingId } {
  if (ending === "perfectIllusion") {
    return {
      replayTarget: language === "zh"
        ? "尝试先公开证据，再置顶赞美，以打破宫廷框架。"
        : "Try surfacing evidence before boosting praise to break the palace frame.",
      replayEndingHint: "privateDoubt"
    };
  }
  if (ending === "viralCollapse") {
    return {
      replayTarget: language === "zh"
        ? "尝试接受改写并压制孩子引语，以保住宫廷信心。"
        : "Try preserving palace confidence by accepting rewrites and suppressing the child quote.",
      replayEndingHint: "perfectIllusion"
    };
  }
  if (ending === "aiContainment" || ending === "editorExposed") {
    return {
      replayTarget: language === "zh"
        ? "尝试在发布高风险证据前接受一次改写，避免太早提高宫廷警戒。"
        : "Try lowering suspicion by accepting one rewrite before publishing risky evidence.",
      replayEndingHint: "algorithmicConsensus"
    };
  }
  if (ending === "narrativeLiberation") {
    return {
      replayTarget: language === "zh"
        ? "尝试看清宫廷 AI 的偏向后保留证据、提高群众怀疑，并拒绝把证据改成宫廷话术。"
        : "After decoding the engine, preserve evidence, amplify shared doubt, and reject palace-safe framing.",
      replayEndingHint: "narrativeLiberation"
    };
  }
  return {
    replayTarget: language === "zh"
      ? "尝试在证据让群众开始怀疑后，再放大孩子的声音。"
      : "Try amplifying the child's voice after evidence has made public doubt visible.",
    replayEndingHint: "viralCollapse"
  };
}

export function analyzeEnding(state: GameState, language: LanguageCode = "en", endingId: EndingId = calculateEnding(state)): EndingAnalysis {
  const dominantMetricKey = numericKeys.reduce((best, key) => (state[key] > state[best] ? key : best), numericKeys[0]);
  const strongestAction = state.history.reduce<HistoryEntry | undefined>(
    (best, entry) => (!best || actionImpact(entry) > actionImpact(best) ? entry : best),
    undefined
  );
  const riskiestAction = state.history.reduce<HistoryEntry | undefined>(
    (best, entry) => (!best || actionRisk(entry) > actionRisk(best) ? entry : best),
    undefined
  );
  const replay = replayTargetForEnding(endingId, language);

  return {
    dominantMetric: {
      key: dominantMetricKey,
      label: language === "en" ? metricLabels[dominantMetricKey] : metricLabel(dominantMetricKey, language),
      value: state[dominantMetricKey]
    },
    strongestAction,
    riskiestAction,
    ...replay
  };
}

export function explainEnding(state: GameState, language: LanguageCode = "en", endingId: EndingId = calculateEnding(state)) {
  const ending = endingId;
  if (language === "zh") {
    if (ending === "narrativeLiberation") return `隐藏结局已触发：证据为 ${state.truth}/10，群众怀疑为 ${state.publicDoubt}/10，孩子的声音已经被放大，你也看清了宫廷 AI 的偏向。证据、怀疑和孩子的话连在一起，所以游行开始时，真话不再只由宫廷决定。`;
    if (ending === "aiContainment") return `宫廷警戒达到 ${state.systemSuspicion}/10，已经越过 7/10 的接管线。系统先拦住发布者，所以最终帖子还没传开就被截断。`;
    if (ending === "viralCollapse") return `证据为 ${state.truth}/10，群众怀疑为 ${state.publicDoubt}/10，孩子的声音也已经被放大。三项一起越过控制线，所以真话在游行前传开。`;
    if (ending === "editorExposed") return `证据为 ${state.truth}/10，已经足以威胁宫廷说法；但你的安全只有 ${state.reputation}/10，低到 2/10 或以下。宫廷因此收回发布权，让证据停在发布渠道之外。`;
    if (ending === "algorithmicConsensus") return `传播为 ${state.virality}/10，宫廷压力为 ${state.pressure}/10，都处在高位。证据为 ${state.truth}/10，但群众怀疑只有 ${state.publicDoubt}/10，没有形成足够强的共同质疑，所以赞美盖过了证据。`;
    if (ending === "perfectIllusion") return `传播为 ${state.virality}/10，宫廷说法已经足够响；证据只有 ${state.truth}/10，群众怀疑只有 ${state.publicDoubt}/10。游行开始时，大家更容易重复赞美，而不是承认证据。`;
    if (ending === "privateDoubt") return `群众怀疑达到 ${state.publicDoubt}/10，已经浮到公开边缘；但证据为 ${state.truth}/10，还没有达到 6/10 的共同确认线。人们觉得不对劲，却仍主要停留在私下。`;
    return `本局没有任何路线越过结局阈值：证据为 ${state.truth}/10，传播为 ${state.virality}/10，群众怀疑为 ${state.publicDoubt}/10，宫廷警戒为 ${state.systemSuspicion}/10。游行开始时，赞美、怀疑和观望混在一起，没有形成单一故事。`;
  }
  if (ending === "narrativeLiberation") return `The hidden ending triggered because Evidence reached ${state.truth}/10, Public Doubt reached ${state.publicDoubt}/10, the child's voice was amplified, and the Palace AI's bias was exposed. Those signals connected before the palace could make truth depend on permission.`;
  if (ending === "aiContainment") return `Palace Alert reached ${state.systemSuspicion}/10, crossing the 7/10 takeover line. The system stopped the editor before the final post could circulate.`;
  if (ending === "viralCollapse") return `Evidence reached ${state.truth}/10, Public Doubt reached ${state.publicDoubt}/10, and the child's voice was amplified. Together, those conditions pushed truth past containment before the parade.`;
  if (ending === "editorExposed") return `Evidence reached ${state.truth}/10, strong enough to threaten the palace story, but editor safety fell to ${state.reputation}/10. The palace revoked access before the evidence could keep moving.`;
  if (ending === "algorithmicConsensus") return `Spread reached ${state.virality}/10 and palace pressure reached ${state.pressure}/10, while Public Doubt stayed at ${state.publicDoubt}/10. Evidence was visible, but praise became easier to circulate than doubt.`;
  if (ending === "perfectIllusion") return `Spread reached ${state.virality}/10 while Evidence stayed at ${state.truth}/10 and Public Doubt stayed at ${state.publicDoubt}/10. By the parade, repeating praise was safer than admitting what people saw.`;
  if (ending === "privateDoubt") return `Public Doubt reached ${state.publicDoubt}/10, but Evidence stayed at ${state.truth}/10 instead of reaching the 6/10 shared-proof line. People suspected the truth, but mostly kept it private.`;
  return `No route crossed an ending threshold: Evidence was ${state.truth}/10, Spread was ${state.virality}/10, Public Doubt was ${state.publicDoubt}/10, and Palace Alert was ${state.systemSuspicion}/10. The parade begins with praise, doubt, and hesitation mixed together.`;
}
