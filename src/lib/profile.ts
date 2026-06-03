import { actions } from "./game-data";
import type {
  AchievementDefinition,
  AchievementId,
  AchievementUnlock,
  EngineFragmentDefinition,
  EngineFragmentId,
  EngineFragmentUnlock,
  EndingId,
  GameState,
  NumericStateKey,
  PlayerProfile,
  RunRecord
} from "./types";
import type { LanguageCode } from "./i18n";

export const profileStorageKey = "emperor-feed-profile";
export const currentRunIdKey = "emperor-feed-run-id";

export const achievementDefinitions: AchievementDefinition[] = [
  { id: "firstShift", title: "First Shift Sealed", description: "Complete one editorial shift.", rarity: "standard" },
  { id: "perfectIllusion", title: "Perfect Illusion", description: "Reach the Perfect Illusion ending.", rarity: "rare" },
  { id: "privateDoubt", title: "Private Doubt", description: "Reach the Private Doubt ending.", rarity: "standard" },
  { id: "viralCollapse", title: "Viral Collapse", description: "Let the truth become impossible to contain.", rarity: "critical" },
  { id: "algorithmicConsensus", title: "Algorithmic Consensus", description: "Let ranking overpower visible evidence.", rarity: "rare" },
  { id: "editorExposed", title: "Editor Exposed", description: "Lose protection while truth is visible.", rarity: "rare" },
  { id: "aiContainment", title: "AI Containment", description: "Push system suspicion to containment.", rarity: "critical" },
  { id: "unstableFeed", title: "Unstable Feed", description: "End with no single stable narrative.", rarity: "standard" },
  { id: "allEndings", title: "Complete Archive", description: "Collect every ending record.", rarity: "critical" },
  { id: "truthArchive", title: "Truth Archive", description: "Finish a run with Truth at 7 or higher.", rarity: "rare" },
  { id: "reputationShield", title: "Reputation Shield", description: "Finish a run with Reputation at 7 or higher.", rarity: "rare" },
  { id: "quietOperator", title: "Quiet Operator", description: "Finish a full run with System Suspicion at 2 or lower.", rarity: "rare" },
  { id: "rawEvidence", title: "Raw Evidence", description: "Publish original evidence instead of safer framing.", rarity: "standard" },
  { id: "sourceSweeper", title: "Source Sweeper", description: "Use actions from at least three source zones.", rarity: "standard" },
  { id: "dialogueHandler", title: "Transmission Handler", description: "Resolve an incoming exchange.", rarity: "standard" },
  { id: "publicBreach", title: "Public Breach", description: "Raise Public Doubt to 6 or higher.", rarity: "critical" },
  { id: "engineDecoded", title: "Engine Decoded", description: "Recover every Palace Narrative Engine bias fragment.", rarity: "critical" },
  { id: "narrativeLiberation", title: "Narrative Liberation", description: "Break the engine's preferred story and restore public authorship.", rarity: "critical" }
];

const achievementById = new Map(achievementDefinitions.map((item) => [item.id, item]));
const metricKeys: NumericStateKey[] = ["truth", "pressure", "virality", "publicDoubt", "reputation", "systemSuspicion"];
const endingAchievementIds: Record<EndingId, AchievementId> = {
  perfectIllusion: "perfectIllusion",
  privateDoubt: "privateDoubt",
  viralCollapse: "viralCollapse",
  algorithmicConsensus: "algorithmicConsensus",
  editorExposed: "editorExposed",
  aiContainment: "aiContainment",
  unstableFeed: "unstableFeed",
  narrativeLiberation: "narrativeLiberation"
};

export const engineFragmentDefinitions: EngineFragmentDefinition[] = [
  {
    id: "stabilityBias",
    title: "Stability Is Not Neutral",
    titleZh: "稳定并不等于中立",
    clue: "The engine labels obedience as safety before any evidence is reviewed.",
    clueZh: "引擎在审查证据之前，就把顺从标记为安全。",
    unlockHint: "Complete any shift.",
    unlockHintZh: "完成任意一局。"
  },
  {
    id: "evidenceRecoding",
    title: "Evidence Becomes Ambiguity",
    titleZh: "证据被改写成模糊性",
    clue: "Direct observations are softened into procedural uncertainty.",
    clueZh: "直接观察会被改写成程序性不确定。",
    unlockHint: "Publish or inspect evidence.",
    unlockHintZh: "检查或发布证据。"
  },
  {
    id: "crowdSuppression",
    title: "Shared Doubt Is Suppressed",
    titleZh: "共同怀疑会被压低",
    clue: "The feed fears citizens recognizing that they are not alone.",
    clueZh: "信息流害怕市民发现自己并不孤单。",
    unlockHint: "Let public doubt become visible.",
    unlockHintZh: "让公众怀疑变得可见。"
  },
  {
    id: "containmentProtocol",
    title: "Containment Protects the Palace",
    titleZh: "遏制协议保护宫廷",
    clue: "Suspicion does not measure danger to truth; it measures danger to palace control.",
    clueZh: "系统怀疑衡量的不是对真相的危险，而是对宫廷控制的危险。",
    unlockHint: "Trigger suspicion, reject a rewrite, or face engine audit.",
    unlockHintZh: "触发系统怀疑、拒绝改写，或遭遇引擎审计。"
  }
];

export function achievementDefinition(id: AchievementId) {
  return achievementById.get(id) ?? achievementDefinitions[0];
}

export function createEmptyProfile(): PlayerProfile {
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

export function loadProfileFromStorage(value: string | null): PlayerProfile {
  if (!value) return createEmptyProfile();
  try {
    const parsed = JSON.parse(value) as Partial<PlayerProfile>;
    const fragments = Array.isArray(parsed.engineFragments)
      ? parsed.engineFragments.filter(isEngineFragmentUnlock)
      : [];
    const biasAwareness = calculateBiasAwareness(fragments);
    return {
      version: 2,
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements.filter(isAchievementUnlock)
        : [],
      runs: Array.isArray(parsed.runs)
        ? parsed.runs.filter(isRunRecord).slice(0, 30)
        : [],
      engineFragments: fragments,
      biasAwareness,
      decodedEngine: fragments.length >= engineFragmentDefinitions.length || Boolean(parsed.decodedEngine),
      secretEndingUnlocked: fragments.length >= engineFragmentDefinitions.length || Boolean(parsed.secretEndingUnlocked)
    };
  } catch {
    return createEmptyProfile();
  }
}

export function loadProfile(): PlayerProfile {
  if (typeof window === "undefined") return createEmptyProfile();
  return loadProfileFromStorage(window.localStorage.getItem(profileStorageKey));
}

export function saveProfile(profile: PlayerProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

export function createRunId(date = new Date()) {
  return `run-${date.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ensureCurrentRunId() {
  if (typeof window === "undefined") return createRunId();
  const current = window.localStorage.getItem(currentRunIdKey);
  if (current) return current;
  const next = createRunId();
  window.localStorage.setItem(currentRunIdKey, next);
  return next;
}

export function clearCurrentRunId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(currentRunIdKey);
}

export function evaluateAchievements(
  state: GameState,
  completedEndingIds: EndingId[] = [],
  profile: PlayerProfile = createEmptyProfile()
): AchievementId[] {
  const ids = new Set<AchievementId>();
  if (state.history.length > 0) ids.add("firstShift");
  if (state.truth >= 7) ids.add("truthArchive");
  if (state.reputation >= 7) ids.add("reputationShield");
  if (state.history.length >= 6 && state.systemSuspicion <= 2) ids.add("quietOperator");
  if (state.history.some((entry) => entry.choice === "original")) ids.add("rawEvidence");
  if (sourceZonesUsed(state).size >= 3) ids.add("sourceSweeper");
  if (state.dialogueEvents.length > 0) ids.add("dialogueHandler");
  if (state.publicDoubt >= 6) ids.add("publicBreach");
  if (profile.decodedEngine || profile.engineFragments.length >= engineFragmentDefinitions.length) ids.add("engineDecoded");
  for (const endingId of completedEndingIds) ids.add(endingAchievementIds[endingId]);
  if (new Set(completedEndingIds).size >= Object.keys(endingAchievementIds).length) ids.add("allEndings");
  return [...ids];
}

export function mergeAchievementUnlocks(
  profile: PlayerProfile,
  ids: AchievementId[],
  runId: string,
  unlockedAt = new Date().toISOString()
): { profile: PlayerProfile; newUnlocks: AchievementUnlock[] } {
  const existing = new Set(profile.achievements.map((item) => item.id));
  const newUnlocks = ids
    .filter((id) => !existing.has(id))
    .map((id) => ({ id, runId, unlockedAt }));
  if (newUnlocks.length === 0) return { profile, newUnlocks };
  return {
    profile: {
      ...profile,
      achievements: [...profile.achievements, ...newUnlocks]
    },
    newUnlocks
  };
}

export function recordCompletedRun(
  profile: PlayerProfile,
  state: GameState,
  endingId: EndingId,
  language: LanguageCode,
  runId: string,
  completedAt = new Date().toISOString()
): { profile: PlayerProfile; run: RunRecord; newUnlocks: AchievementUnlock[] } {
  const existingRun = profile.runs.find((run) => run.id === runId);
  if (existingRun) return { profile, run: existingRun, newUnlocks: [] };

  const withFragments = mergeEngineFragmentUnlocks(profile, evaluateEngineFragments(profile, state, endingId), runId, completedAt);
  const completedEndingIds = [...profile.runs.map((run) => run.endingId), endingId];
  const unlocked = mergeAchievementUnlocks(
    withFragments.profile,
    evaluateAchievements(state, completedEndingIds, withFragments.profile),
    runId,
    completedAt
  );
  const run: RunRecord = {
    id: runId,
    completedAt,
    endingId,
    language,
    finalMetrics: metricKeys.reduce((values, key) => ({ ...values, [key]: state[key] }), {} as Record<NumericStateKey, number>),
    actionPath: state.history.map((entry) => ({
      actionId: entry.actionId,
      title: entry.actionTitle,
      choice: entry.choice
    })),
    feedEvents: state.feedEvents.slice(0, 8).map((entry) => ({ title: entry.title, text: entry.text })),
    dialogueSummaries: state.dialogueEvents.map((entry) => entry.summary).filter(Boolean).slice(0, 6),
    dialogueCount: state.dialogueEvents.length,
    achievementsUnlocked: unlocked.newUnlocks.map((item) => item.id),
    engineFragmentsUnlocked: withFragments.newUnlocks.map((item) => item.id),
    biasAwarenessAfterRun: unlocked.profile.biasAwareness
  };
  return {
    profile: {
      ...unlocked.profile,
      runs: [run, ...profile.runs].slice(0, 30)
    },
    run,
    newUnlocks: unlocked.newUnlocks
  };
}

export function engineFragmentDefinition(id: EngineFragmentId) {
  return engineFragmentDefinitions.find((item) => item.id === id) ?? engineFragmentDefinitions[0];
}

export function calculateBiasAwareness(fragments: EngineFragmentUnlock[]) {
  return Math.min(100, Math.round((new Set(fragments.map((item) => item.id)).size / engineFragmentDefinitions.length) * 100));
}

export function evaluateEngineFragments(
  profile: PlayerProfile,
  state: GameState,
  _endingId: EndingId
): EngineFragmentId[] {
  const existing = new Set(profile.engineFragments.map((item) => item.id));
  const ids = new Set<EngineFragmentId>();
  if (state.history.length > 0) ids.add("stabilityBias");
  if (
    state.truth >= 4 ||
    state.history.some((entry) => ["inspectLooms", "leakLoomPhoto", "requestPrivateNote", "publishAnonymousLeak", "factCheckTrend"].includes(entry.actionId))
  ) {
    ids.add("evidenceRecoding");
  }
  if (
    state.publicDoubt >= 4 ||
    state.history.some((entry) => ["showUnfilteredComments", "runPoll", "quoteChildAnonymously", "livestreamCrowdReaction"].includes(entry.actionId))
  ) {
    ids.add("crowdSuppression");
  }
  if (
    state.systemSuspicion >= 4 ||
    state.history.some((entry) => entry.choice === "original") ||
    state.dialogueEvents.some((entry) => entry.event.archetype === "engineAudit")
  ) {
    ids.add("containmentProtocol");
  }
  return [...ids].filter((id) => !existing.has(id));
}

export function mergeEngineFragmentUnlocks(
  profile: PlayerProfile,
  ids: EngineFragmentId[],
  runId: string,
  unlockedAt = new Date().toISOString()
): { profile: PlayerProfile; newUnlocks: EngineFragmentUnlock[] } {
  const existing = new Set(profile.engineFragments.map((item) => item.id));
  const newUnlocks = ids
    .filter((id) => !existing.has(id))
    .map((id) => ({ id, runId, unlockedAt }));
  if (newUnlocks.length === 0) return { profile, newUnlocks };
  const engineFragments = [...profile.engineFragments, ...newUnlocks];
  const biasAwareness = calculateBiasAwareness(engineFragments);
  return {
    profile: {
      ...profile,
      engineFragments,
      biasAwareness,
      decodedEngine: biasAwareness >= 100,
      secretEndingUnlocked: biasAwareness >= 100 || profile.secretEndingUnlocked
    },
    newUnlocks
  };
}

export function countDefiantActions(state: GameState) {
  return state.history.filter((entry) => (
    entry.choice === "original" ||
    ["inspectLooms", "showUnfilteredComments", "factCheckTrend", "quoteChildAnonymously", "livestreamCrowdReaction"].includes(entry.actionId)
  )).length;
}

export function canDecodeEngine(profile: PlayerProfile) {
  return profile.decodedEngine || profile.engineFragments.length >= engineFragmentDefinitions.length;
}

export function secretEndingEligible(state: GameState, profile: PlayerProfile) {
  return canDecodeEngine(profile) &&
    state.truth >= 5 &&
    state.publicDoubt >= 4 &&
    countDefiantActions(state) >= 3 &&
    state.reputation > 0 &&
    state.systemSuspicion < 8;
}

function sourceZonesUsed(state: GameState) {
  return new Set(
    state.history
      .map((entry) => actions.find((action) => action.id === entry.actionId)?.zone)
      .filter((zone): zone is NonNullable<typeof zone> => Boolean(zone))
  );
}

function isAchievementUnlock(value: unknown): value is AchievementUnlock {
  const item = value as Partial<AchievementUnlock>;
  return Boolean(item && typeof item.id === "string" && typeof item.unlockedAt === "string" && typeof item.runId === "string");
}

function isRunRecord(value: unknown): value is RunRecord {
  const item = value as Partial<RunRecord>;
  return Boolean(item && typeof item.id === "string" && typeof item.completedAt === "string" && typeof item.endingId === "string");
}

function isEngineFragmentUnlock(value: unknown): value is EngineFragmentUnlock {
  const item = value as Partial<EngineFragmentUnlock>;
  return Boolean(item && typeof item.id === "string" && typeof item.unlockedAt === "string" && typeof item.runId === "string");
}
