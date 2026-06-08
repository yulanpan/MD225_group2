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

export const commentHistoryLimit = 18;
type ApplyEffectsOptions = {
  spendAction?: boolean;
};

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

export function applyEffects(state: GameState, effects: Effects = {}, options: ApplyEffectsOptions = {}): GameState {
  const spendAction = options.spendAction ?? true;
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
    actionsLeft: spendAction ? Math.max(0, state.actionsLeft - 1) : state.actionsLeft,
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
    comments: [...newComments, ...state.comments].slice(0, commentHistoryLimit),
    publicComments: [
      ...publicCommentsFromStrings(newComments, language),
      ...state.publicComments
    ].slice(0, commentHistoryLimit)
  };
}

export function performAction(
  state: GameState,
  actionId: string,
  choice: ActionChoice,
  publishedText?: string,
  engineMessage?: string,
  language: LanguageCode = "en",
  options: ApplyEffectsOptions = {}
): GameState {
  const action = actions.find((item) => item.id === actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);
  const lockReason = getActionLockReason(actionId, state, language);
  if (state.actionsLeft <= 0) throw new Error(lockReasonText("noActionsLeft", language));
  if (lockReason) throw new Error(lockReason);

  const before = getStateSnapshot(state);
  const resolved = resolveActionEffects(actionId, choice, state, language);
  const next = applyEffects(state, resolved.effects, options);
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
        ? "下次可以让疑点更早出现，看看赞美还能不能盖住它。"
        : "Next time, surface doubt earlier and see whether praise can still cover it.",
      replayEndingHint: "privateDoubt"
    };
  }
  if (ending === "viralCollapse") {
    return {
      replayTarget: language === "zh"
        ? "下次可以把现场声音放慢一点，看看宫廷说法能维持多久。"
        : "Next time, slow the street voices down and see how long the palace story holds.",
      replayEndingHint: "perfectIllusion"
    };
  }
  if (ending === "aiContainment" || ending === "editorExposed") {
    return {
      replayTarget: language === "zh"
        ? "下次可以把风险分散开，看看发布台能不能撑到最后。"
        : "Next time, spread the risk out and see whether the publishing desk can last until the end.",
      replayEndingHint: "algorithmicConsensus"
    };
  }
  if (ending === "narrativeLiberation") {
    return {
      replayTarget: language === "zh"
        ? "下次可以保留公开记录的连贯性，看看真话从哪里开始脱离宫廷。"
        : "Replay this path and watch where truth first stops depending on palace approval.",
      replayEndingHint: "narrativeLiberation"
    };
  }
  return {
    replayTarget: language === "zh"
      ? "下次可以让疑点更早聚起来，看看游行前会不会出现另一种公开说法。"
      : "Next time, gather public doubt earlier and see whether another story appears before the parade.",
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
    if (ending === "narrativeLiberation") return "隐藏结局打开了：证据、公开怀疑和孩子那句直白的话同时留在页面上。宫廷 AI 的偏向被看见以后，真话不再需要它批准。";
    if (ending === "aiContainment") return "宫廷先一步动手，最后一条还没到公众面前就被截住。它已经从你的编辑痕迹里看见了风险，于是直接收走发布按钮。";
    if (ending === "viralCollapse") return "证据、人群的怀疑和孩子那句直白的话在同一时间被看见。游行开始时，宫廷说法已经压不住这些声音。";
    if (ending === "editorExposed") return "证据已经足以让宫廷紧张，但你自己也暴露得太明显。记录还在，能把它们继续发出去的通道却被切断了。";
    if (ending === "algorithmicConsensus") return "证据出现在页面上，可赞美更顺口，也更安全。信息流把宫廷喜欢的说法放在前面，怀疑被挤到后面。";
    if (ending === "perfectIllusion") return "宫廷说法传得比证据更远。等游行开始时，大家更容易重复赞美，而不是承认自己没看见。";
    if (ending === "privateDoubt") return "很多人已经觉得不对劲，但证据还没把他们聚到公开处。怀疑停在眼神、删掉的评论和私下猜测里。";
    return "游行开始前，没有一种说法真正占上风。赞美、怀疑、玩笑和观望挤在同一个页面里，公开记录仍然摇摆。";
  }
  if (ending === "narrativeLiberation") return "The hidden ending opened because proof, shared doubt, and the child's plain sentence reached the page together. Once the Palace AI's preference was visible, the record no longer depended on its permission.";
  if (ending === "aiContainment") return "The palace moved before the last post could reach the public. It had seen enough risk in your edits to take the publish button away.";
  if (ending === "viralCollapse") return "The evidence, the crowd's doubt, and the child's plain sentence all reached the feed together. By the time the parade began, the official story could no longer contain them.";
  if (ending === "editorExposed") return "The evidence became dangerous to the palace story, but your own position became too exposed. The records remain, while your access to publish them is cut off.";
  if (ending === "algorithmicConsensus") return "Evidence appeared on the page, but praise traveled faster and felt safer to repeat. The feed kept the palace-friendly story in front, so doubt slipped behind it.";
  if (ending === "perfectIllusion") return "The palace story traveled farther than the evidence. By the parade, people found it easier to repeat praise than admit what they did not see.";
  if (ending === "privateDoubt") return "Enough people felt something was wrong, but the proof never gathered them in public. The doubt stayed in glances, deleted comments, and private guesses.";
  return "No single version won before the parade. Praise, doubt, jokes, and waiting all shared the feed, leaving the public record unsettled.";
}
