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
  truth: "Truth",
  pressure: "Pressure",
  virality: "Virality",
  publicDoubt: "Public Doubt",
  reputation: "Reputation",
  systemSuspicion: "System Suspicion"
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
  if (choice === "original" || action.zone === "child") return "risk";
  if (action.zone === "public") return "public";
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
      title: language === "zh" ? "引擎回应" : "Engine Response",
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
        ? "尝试在发布高风险证据前接受一次改写，避免太早被宫廷盯上。"
        : "Try lowering suspicion by accepting one rewrite before publishing risky evidence.",
      replayEndingHint: "algorithmicConsensus"
    };
  }
  if (ending === "narrativeLiberation") {
    return {
      replayTarget: language === "zh"
        ? "尝试看清引擎偏向后保留证据、放大人群起疑，并拒绝把证据改成宫廷话术。"
        : "After decoding the engine, preserve evidence, amplify shared doubt, and reject palace-safe framing.",
      replayEndingHint: "narrativeLiberation"
    };
  }
  return {
    replayTarget: language === "zh"
      ? "尝试在证据让人群起疑后，再放大孩子的声音。"
      : "Try amplifying the child's voice after evidence has made public doubt visible.",
    replayEndingHint: "viralCollapse"
  };
}

export function analyzeEnding(state: GameState, language: LanguageCode = "en"): EndingAnalysis {
  const dominantMetricKey = numericKeys.reduce((best, key) => (state[key] > state[best] ? key : best), numericKeys[0]);
  const strongestAction = state.history.reduce<HistoryEntry | undefined>(
    (best, entry) => (!best || actionImpact(entry) > actionImpact(best) ? entry : best),
    undefined
  );
  const riskiestAction = state.history.reduce<HistoryEntry | undefined>(
    (best, entry) => (!best || actionRisk(entry) > actionRisk(best) ? entry : best),
    undefined
  );
  const replay = replayTargetForEnding(calculateEnding(state), language);

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

export function explainEnding(state: GameState, language: LanguageCode = "en") {
  const ending = calculateEnding(state);
  if (language === "zh") {
    if (ending === "narrativeLiberation") return "你已经看清宫廷叙事引擎的偏向，并让证据、人群怀疑和孩子的声音连成一条线。";
    if (ending === "aiContainment") return "宫廷已经高度盯上你，因此最终帖子还没传开就被拦住。";
    if (ending === "viralCollapse") return "证据和人群起疑都很高，同时孩子的声音被放大，所以真话开始失控传播。";
    if (ending === "editorExposed") return "证据足够强，但你已经不够安全，宫廷因此撤销了你的发布权。";
    if (ending === "algorithmicConsensus") return "传播与宫廷压力保持高位，证据虽然存在，却被更容易传播的赞美压过。";
    if (ending === "perfectIllusion") return "宫廷批准的说法传得很快，而证据和人群起疑都保持低位。";
    if (ending === "privateDoubt") return "人群开始起疑，但证据还不够强，大家仍然只敢私下怀疑。";
    return "没有单一力量稳定游行叙事，因此信息流保持未解决状态。";
  }
  if (ending === "narrativeLiberation") return "You decoded the Palace Narrative Engine and turned evidence plus shared doubt into a public narrative before containment could close.";
  if (ending === "aiContainment") return "System Suspicion reached 7, so the Palace Narrative Engine contained the editor before the final post could circulate.";
  if (ending === "viralCollapse") return "Truth and Public Doubt both crossed containment thresholds while the child's voice was amplified.";
  if (ending === "editorExposed") return "Truth was strong, but editor reputation fell low enough for the palace to revoke access.";
  if (ending === "algorithmicConsensus") return "Virality and pressure stayed high while truth remained visible but easier to out-rank.";
  if (ending === "perfectIllusion") return "Palace-approved virality stayed high while truth and public doubt stayed low.";
  if (ending === "privateDoubt") return "Public Doubt rose, but truth never became strong enough to become a shared public voice.";
  return "No single force stabilized the parade narrative, so the feed remained unresolved.";
}
