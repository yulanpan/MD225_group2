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
    textZh: "信息流让市民觉得：看不见布料像是自己的问题。",
    priority: 60
  },
  {
    id: "empty-loom-record",
    phase: "setup",
    thread: "evidenceTrail",
    title: "Empty Loom Recorded",
    titleZh: "空织布机被记录",
    text: "The absence of thread becomes a record the engine must classify away.",
    textZh: "没有线这件事进入记录，宫廷 AI 需要想办法把它说得不那么直接。",
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
    textZh: "人群开始发现：别人也在怀疑。",
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
      return zh ? "大家记住自己和别人一起确认过：那里没有布。" : "People remember what they confirmed together: there was no cloth.";
    }
    if (seeds.includes("childSignalAmplified")) {
      return zh ? "那句直白的话留了下来。它太容易复述，宫廷后来很难把它重新包装。" : "The child's plain sentence remains. It was too easy to repeat for the palace to wrap it back up.";
    }
    if (seeds.includes("loomPhotoReleased") || seeds.includes("emptyLoomWitnessed")) {
      return zh ? "空织布机被记住了。只是这一局里，它还没来得及变成所有人的共识。" : "The empty looms stay in memory, even though this run did not turn them into public certainty.";
    }
    if (endingId === "perfectIllusion" || seeds.includes("positiveChorus")) {
      return zh ? "大家记住了该怎么称赞，却未必记得自己到底看见了什么。" : "People remember how to praise, not what they actually saw.";
    }
    return zh ? "大家记住的是一阵混乱：有人称赞，有人怀疑，也有人继续沉默。" : "People remember the confusion: praise, doubt, and silence occupying the same feed.";
  })();

  const editorConsequence = (() => {
    if (endingId === "narrativeLiberation") {
      return zh ? "你不只是值班编辑了。你把证据和人群声音留在了同一处。" : "You are no longer only the desk editor. You kept evidence and public voices in the same place.";
    }
    if (endingId === "aiContainment") {
      return zh ? "宫廷不再把发布台交给你。之后每一次发声都会先被它检查。" : "The palace no longer trusts you with the publishing desk. Later posts will be checked first.";
    }
    if (state.reputation <= 2) {
      return zh ? "你保住了记录，却失去了继续发出去的入口。" : "You kept the record, but lost the opening to keep publishing it.";
    }
    if (state.reputation >= 6) {
      return zh ? "你还被宫廷当作可靠的人，但这份可靠来自你一次次把风险压低。" : "The palace still sees you as reliable, but that reliability came from lowering risk again and again.";
    }
    return zh ? "你没有完全站到任何一边。宫廷会记住你不够顺从，公众也会记住你曾经打开过缝隙。" : "You did not fully stand on either side. The palace will remember your disobedience, and the public will remember the openings you made.";
  })();

  const engineLesson = (() => {
    if (endingId === "narrativeLiberation") {
      return zh ? "宫廷发现：只要大家看见它偏向谁，它的指引就会失去分量。" : "The palace learns that once people see who it favors, its guidance loses weight.";
    }
    if (endingId === "viralCollapse") {
      return zh ? "宫廷发现：人人都会转述的一句话最难处理。" : "The palace learns that one sentence anyone can repeat is the hardest thing to manage.";
    }
    if (endingId === "aiContainment") {
      return zh ? "宫廷发现：与其逐句改写，不如先夺走发布权。" : "The palace learns that taking the publish button away can work better than rewriting every sentence.";
    }
    if (endingId === "algorithmicConsensus") {
      return zh ? "宫廷发现：证据不必消失，只要被更顺口的赞美盖过去。" : "The palace learns that evidence does not have to vanish if praise can cover it first.";
    }
    return zh ? "宫廷发现：谁先被看见、谁敢继续说，会决定故事往哪边倒。" : "The palace learns that who is seen first, and who keeps speaking, decides where the story leans.";
  })();

  return { publicMemory, editorConsequence, engineLesson };
}
