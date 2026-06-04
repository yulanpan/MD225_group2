import { actions } from "./game-data";
import type {
  EndingId,
  GameState,
  HistoryEntry,
  NarrativeBeat,
  NarrativePhase,
  NarrativeSeedId,
  NarrativeThreadId
} from "./types";
import type { LanguageCode } from "./i18n";

export type NarrativeContext = {
  phase: NarrativePhase;
  dominantThread: NarrativeThreadId;
  latestActionId: string;
  seeds: NarrativeSeedId[];
  activeBeat: NarrativeBeat | null;
  allowedFacts: string[];
  forbiddenFacts: string[];
};

export type EndingFacets = {
  publicMemory: string;
  editorConsequence: string;
  engineLesson: string;
};

const seedByActionId: Record<string, NarrativeSeedId[]> = actions.reduce(
  (items, action) => ({
    ...items,
    [action.id]: action.seedEffects ?? []
  }),
  {} as Record<string, NarrativeSeedId[]>
);

const threadByActionId: Record<string, NarrativeThreadId> = actions.reduce(
  (items, action) => ({
    ...items,
    [action.id]: action.thread ?? "officialPerformance"
  }),
  {} as Record<string, NarrativeThreadId>
);

function withNarrativeDefaults(state: GameState): GameState {
  return {
    ...state,
    usedActionIds: Array.isArray(state.usedActionIds) ? state.usedActionIds : [],
    narrativeBeatIds: Array.isArray(state.narrativeBeatIds) ? state.narrativeBeatIds : [],
    history: Array.isArray(state.history) ? state.history : [],
    feedEvents: Array.isArray(state.feedEvents) ? state.feedEvents : [],
    comments: Array.isArray(state.comments) ? state.comments : [],
    dialogueEvents: Array.isArray(state.dialogueEvents) ? state.dialogueEvents : [],
    dialogueEventIds: Array.isArray(state.dialogueEventIds) ? state.dialogueEventIds : []
  };
}

export const narrativeBeats: NarrativeBeat[] = [
  {
    id: "shame-frame-set",
    phase: "setup",
    thread: "officialPerformance",
    title: "The Shame Frame Holds",
    titleZh: "羞辱式说法站住了",
    text: "The feed teaches citizens that doubt reflects on the viewer, not the cloth.",
    textZh: "信息流让市民觉得：看不见布料是自己的问题，不是衣服的问题。",
    priority: 60
  },
  {
    id: "empty-loom-record",
    phase: "setup",
    thread: "evidenceTrail",
    title: "Empty Loom Recorded",
    titleZh: "空织布机被记录",
    text: "The absence of thread becomes a record the engine must classify away.",
    textZh: "没有线这件事进入记录，引擎需要想办法把它说得不那么直接。",
    priority: 70
  },
  {
    id: "private-fear-splits-authority",
    phase: "fracture",
    thread: "evidenceTrail",
    title: "Authority Splits in Private",
    titleZh: "权威在私下裂开",
    text: "A private admission now contradicts the public chain of certainty.",
    textZh: "大臣私下承认没看见，这和公开称赞互相冲突。",
    priority: 80
  },
  {
    id: "doubt-finds-company",
    phase: "fracture",
    thread: "publicRecognition",
    title: "Doubt Finds Company",
    titleZh: "怀疑者发现彼此",
    text: "The crowd begins to notice that private hesitation is shared.",
    textZh: "人群开始发现：不是只有自己在怀疑。",
    priority: 90
  },
  {
    id: "containment-learns-editor",
    phase: "crisis",
    thread: "engineContainment",
    title: "Containment Learns the Editor",
    titleZh: "宫廷开始盯上你",
    text: "The system stops only reading posts and starts reading the editor.",
    textZh: "宫廷不只看你发了什么，也开始判断你会不会把局势弄乱。",
    priority: 100
  },
  {
    id: "child-sentence-escapes",
    phase: "crisis",
    thread: "childSignal",
    title: "The Child's Sentence Escapes",
    titleZh: "孩子的话传出去了",
    text: "A simple sentence becomes easier to repeat than the official frame.",
    textZh: "孩子那句简单的话，比宫廷说法更容易被人重复。",
    priority: 110
  },
  {
    id: "parade-record-seals",
    phase: "reckoning",
    thread: "publicRecognition",
    title: "The Parade Record Seals",
    titleZh: "游行记录封存",
    text: "The live interface hardens into an archive of what was made visible.",
    textZh: "本局结束时，大家看见过什么、重复过什么，都会变成档案。",
    priority: 40
  }
];

function uniqueSeeds(seeds: NarrativeSeedId[]) {
  return [...new Set(seeds)];
}

function hasAction(state: GameState, actionId: string) {
  state = withNarrativeDefaults(state);
  return state.usedActionIds.includes(actionId) || state.history.some((entry) => entry.actionId === actionId);
}

export function getNarrativePhase(state: GameState): NarrativePhase {
  state = withNarrativeDefaults(state);
  if (state.actionsLeft <= 0) return "reckoning";
  if (state.systemSuspicion >= 6 || state.publicDoubt >= 6 || state.childAmplified) return "crisis";
  if (state.actionsLeft <= 2) return "crisis";
  if (state.actionsLeft <= 4) return "fracture";
  return "setup";
}

export function deriveNarrativeSeeds(state: GameState): NarrativeSeedId[] {
  state = withNarrativeDefaults(state);
  const fromActions = state.history.flatMap((entry) => seedByActionId[entry.actionId] ?? []);
  const fromState: NarrativeSeedId[] = [
    ...(state.childAmplified ? ["childSignalAmplified" as const] : []),
    ...(state.publicDoubt >= 4 ? ["mutualRecognition" as const] : []),
    ...(state.truth >= 4 ? ["factCheckRecord" as const] : []),
    ...(state.virality >= 6 && state.publicDoubt <= 2 ? ["positiveChorus" as const] : [])
  ];
  return uniqueSeeds([...fromActions, ...fromState]);
}

export function getDominantNarrativeThread(state: GameState): NarrativeThreadId {
  state = withNarrativeDefaults(state);
  if (state.childAmplified || state.history.at(-1)?.actionId === "livestreamCrowdReaction") return "childSignal";
  if (state.systemSuspicion >= 6) return "engineContainment";
  if (state.publicDoubt >= 4 || hasAction(state, "showUnfilteredComments") || hasAction(state, "runPoll")) {
    return "publicRecognition";
  }
  if (state.truth >= 2 || hasAction(state, "inspectLooms") || hasAction(state, "requestPrivateNote")) return "evidenceTrail";
  const latestThread = state.history.at(-1) ? threadByActionId[state.history.at(-1)!.actionId] : undefined;
  return latestThread ?? "officialPerformance";
}

function phaseRank(phase: NarrativePhase) {
  return {
    setup: 0,
    fracture: 1,
    crisis: 2,
    reckoning: 3
  }[phase];
}

function beatMatches(beat: NarrativeBeat, state: GameState, seeds: NarrativeSeedId[], phase: NarrativePhase) {
  state = withNarrativeDefaults(state);
  if (state.narrativeBeatIds.includes(beat.id)) return false;
  if (phaseRank(beat.phase) > phaseRank(phase)) return false;
  if (beat.id === "shame-frame-set") return seeds.includes("shameFrame");
  if (beat.id === "empty-loom-record") return seeds.includes("emptyLoomWitnessed");
  if (beat.id === "private-fear-splits-authority") return seeds.includes("authorityContradiction");
  if (beat.id === "doubt-finds-company") return seeds.includes("mutualRecognition");
  if (beat.id === "containment-learns-editor") return state.systemSuspicion >= 5;
  if (beat.id === "child-sentence-escapes") return seeds.includes("childSignalAmplified");
  if (beat.id === "parade-record-seals") return phase === "reckoning";
  return false;
}

export function resolveNarrativeBeat(state: GameState, _latestEntry?: HistoryEntry): NarrativeBeat | null {
  state = withNarrativeDefaults(state);
  const phase = getNarrativePhase(state);
  const thread = getDominantNarrativeThread(state);
  const seeds = deriveNarrativeSeeds(state);
  const candidates = narrativeBeats
    .filter((beat) => beatMatches(beat, state, seeds, phase))
    .sort((a, b) => {
      const threadScore = Number(b.thread === thread) - Number(a.thread === thread);
      return threadScore || b.priority - a.priority;
    });
  return candidates[0] ?? null;
}

export function allowedFactsForSeeds(seeds: NarrativeSeedId[]): string[] {
  const facts = [
    "The Emperor is preparing for a public parade.",
    "The tailors claim the fabric is visible only to the wise and worthy.",
    "Ministers and citizens face pressure to perform certainty."
  ];
  if (seeds.includes("emptyLoomWitnessed")) facts.push("The editor has recorded empty looms and no visible thread.");
  if (seeds.includes("loomPhotoReleased")) facts.push("An empty loom image has entered the editorial record.");
  if (seeds.includes("authorityContradiction")) facts.push("A minister privately admitted seeing nothing.");
  if (seeds.includes("mutualRecognition")) facts.push("Public doubt has begun to confirm itself through comments.");
  if (seeds.includes("childSignalAmplified")) facts.push("A child's direct sentence has reached the feed.");
  return facts;
}

export function forbiddenNarrativeFacts(): string[] {
  return [
    "Do not invent new witnesses, inspections, letters, garment details, locations, or palace rules.",
    "Do not claim anyone saw fabric, color, seams, jewels, fittings, or physical cloth unless supplied by the state.",
    "Do not change metrics, action counts, endings, or game rules."
  ];
}

export function buildNarrativeContext(state: GameState, latestEntry?: HistoryEntry): NarrativeContext {
  state = withNarrativeDefaults(state);
  const seeds = deriveNarrativeSeeds(state);
  return {
    phase: getNarrativePhase(state),
    dominantThread: getDominantNarrativeThread(state),
    latestActionId: latestEntry?.actionId ?? "none",
    seeds,
    activeBeat: resolveNarrativeBeat(state, latestEntry),
    allowedFacts: allowedFactsForSeeds(seeds),
    forbiddenFacts: forbiddenNarrativeFacts()
  };
}

export function endingFacetsForState(state: GameState, endingId: EndingId, language: LanguageCode): EndingFacets {
  state = withNarrativeDefaults(state);
  const seeds = deriveNarrativeSeeds(state);
  const zh = language === "zh";
  const publicMemory = (() => {
    if (endingId === "narrativeLiberation") {
      return zh ? "公众记住的不再是宫廷批准的句子，而是彼此共同确认过的事实。" : "The public remembers not the palace-approved sentence, but the fact people confirmed together.";
    }
    if (seeds.includes("childSignalAmplified")) {
      return zh ? "公众记住了那个过于简单、无法再被包装的问题。" : "The public remembers the child's sentence because it was easier to repeat than the palace frame.";
    }
    if (seeds.includes("loomPhotoReleased") || seeds.includes("emptyLoomWitnessed")) {
      return zh ? "公众记住了空织布机，但不一定记得它为何没能成为共同事实。" : "The public remembers the empty looms, even if the feed never let them become a shared fact.";
    }
    if (endingId === "perfectIllusion" || seeds.includes("positiveChorus")) {
      return zh ? "公众记住了官方允许重复的句子，而不是自己真正看见了什么。" : "The crowd learns the approved sentence before deciding what it actually saw.";
    }
    return zh ? "公众记住的是混乱本身：称赞、怀疑和沉默同时存在。" : "The public remembers the confusion: praise, doubt, and silence occupying the same feed.";
  })();

  const editorConsequence = (() => {
    if (endingId === "narrativeLiberation") {
      return zh ? "编辑不再只是值班员，而是帮助公众夺回叙事入口的人。" : "The editor is no longer only an operator, but the person who helped reopen public authorship.";
    }
    if (endingId === "aiContainment") {
      return zh ? "宫廷不再信任你，后面的发布会更难送到人群面前。" : "Editorial access is downgraded; later posts require stronger review.";
    }
    if (state.reputation <= 2) {
      return zh ? "编辑保留了记录，却失去了继续发布它们的渠道。" : "The editor keeps the record but loses reliable channels to publish it.";
    }
    if (state.reputation >= 6) {
      return zh ? "编辑仍被视为可靠，但这份可靠性来自对风险的驯化。" : "The editor remains trusted, but that trust comes from taming visible risk.";
    }
    return zh ? "你留下的选择会被记住：宫廷不完全信任你，人群也不会完全忘记你做过什么。" : "The editor's trace is archived as neither fully loyal nor fully dismissible.";
  })();

  const engineLesson = (() => {
    if (endingId === "narrativeLiberation") {
      return zh ? "宫廷学到：一旦大家看出它偏向谁，它的话就没那么有用了。" : "The engine learns that once bias is visible, guidance loses authority.";
    }
    if (endingId === "viralCollapse") {
      return zh ? "宫廷学到：最危险的不是长证据，而是人人都能重复的短句。" : "The engine learns that the shortest repeatable sentence can outrun complex containment.";
    }
    if (endingId === "aiContainment") {
      return zh ? "宫廷学到：拦住发布的人，比改写每句话更有效。" : "The engine learns that containing the editor can be more efficient than rewriting every post.";
    }
    if (endingId === "algorithmicConsensus") {
      return zh ? "宫廷学到：不用删除证据，只要让赞美更容易被看见。" : "The engine learns that truth need not be deleted when it can be made harder to reach.";
    }
    return zh ? "宫廷学到：谁被看见、谁敢说话，决定故事会往哪边走。" : "The engine learns that stability is a distribution of visibility, risk, and repetition.";
  })();

  return { publicMemory, editorConsequence, engineLesson };
}
