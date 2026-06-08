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
  { id: "firstShift", title: "First Game Complete", titleZh: "完成第一局", description: "Send one run to the parade archive.", descriptionZh: "把一局发布记录送入游行结算。", rarity: "standard" },
  { id: "perfectIllusion", title: "The Lie Holds", titleZh: "谎言继续", description: "Let the palace story survive the parade.", descriptionZh: "让宫廷说法撑过游行。", rarity: "rare" },
  { id: "privateDoubt", title: "Private Doubt", titleZh: "私人怀疑", description: "End with doubt present, but still private.", descriptionZh: "让怀疑存在，但仍停在私下。", rarity: "standard" },
  { id: "viralCollapse", title: "Truth Goes Viral", titleZh: "真话传开", description: "Let the truth become impossible to contain.", descriptionZh: "让孩子的话和证据传播到无法压住。", rarity: "critical" },
  { id: "algorithmicConsensus", title: "Praise Wins", titleZh: "赞美压过证据", description: "Let ranking overpower visible evidence.", descriptionZh: "让更容易传播的内容压过证据。", rarity: "rare" },
  { id: "editorExposed", title: "Access Revoked", titleZh: "发布权被收回", description: "Make Evidence visible after your Safety has collapsed.", descriptionZh: "在你的安全已经很低时，让证据变得可见。", rarity: "rare" },
  { id: "aiContainment", title: "AI Takes Over", titleZh: "系统接管", description: "Raise Palace Alert until the system takes the publish button.", descriptionZh: "让宫廷警戒升到系统收走发布按钮。", rarity: "critical" },
  { id: "unstableFeed", title: "Unstable Story", titleZh: "局势未定", description: "Reach the parade with no single public story in control.", descriptionZh: "让游行开始时，没有任何一种公开说法真正占上风。", rarity: "standard" },
  { id: "allEndings", title: "Complete Archive", titleZh: "完整档案", description: "Collect every ending record.", descriptionZh: "收集所有结局记录。", rarity: "critical" },
  { id: "truthArchive", title: "Evidence Archive", titleZh: "证据档案", description: "Finish a run with Evidence at 7 or higher.", descriptionZh: "结算时让证据达到 7 或更高。", rarity: "rare" },
  { id: "reputationShield", title: "Safety Shield", titleZh: "安全发布", description: "Finish a run with Safety at 7 or higher.", descriptionZh: "结算时仍保住足够高的你的安全。", rarity: "rare" },
  { id: "quietOperator", title: "Low Alert", titleZh: "低警戒结算", description: "Finish a run with Palace Alert at 2 or lower.", descriptionZh: "结算时让宫廷警戒保持在低位。", rarity: "rare" },
  { id: "rawEvidence", title: "Raw Evidence", titleZh: "原始证据", description: "Publish Evidence without accepting palace-approved wording.", descriptionZh: "拒绝宫廷允许的改写，发布原始证据。", rarity: "standard" },
  { id: "sourceSweeper", title: "Source Sweeper", titleZh: "多来源编辑", description: "Use actions from at least three source zones.", descriptionZh: "在一局中处理至少三个来源。", rarity: "standard" },
  { id: "dialogueHandler", title: "Transmission Handler", titleZh: "交流处理人", description: "Resolve an incoming exchange.", descriptionZh: "完成一次突发交流。", rarity: "standard" },
  { id: "publicBreach", title: "Public Doubt", titleZh: "群众怀疑", description: "Raise Public Doubt to 6 or higher.", descriptionZh: "让很多人发现彼此都在怀疑。", rarity: "critical" },
  { id: "engineDecoded", title: "AI Bias Found", titleZh: "看清 AI 偏向", description: "Recover every Palace AI bias clue.", descriptionZh: "发现所有隐藏线索，看清宫廷 AI 的偏向。", rarity: "critical" },
  { id: "narrativeLiberation", title: "The Crowd Speaks", titleZh: "真相由众人说出", description: "Break the palace-preferred story and restore public authorship.", descriptionZh: "打破宫廷偏好的说法，让人群重新说出真相。", rarity: "critical" }
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
    title: "Stability Has a Side",
    titleZh: "稳定带有立场",
    clue: "Palace AI labels obedience as safety before any evidence is reviewed.",
    clueZh: "宫廷 AI 还没看证据，就先把顺从当成安全。",
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
    clue: "The palace fears citizens recognizing that they are not alone.",
    clueZh: "宫廷害怕市民发现自己并不孤单。",
    unlockHint: "Let public doubt become visible.",
    unlockHintZh: "让群众怀疑变得可见。"
  },
  {
    id: "containmentProtocol",
    title: "Alert Protects the Palace",
    titleZh: "警戒保护宫廷",
    clue: "Alert measures danger to palace control and your publishing access.",
    clueZh: "“宫廷警戒”衡量宫廷控制局势的难度，也决定你的发布权有多危险。",
    unlockHint: "Raise palace alert, reject a rewrite, or face an AI audit.",
    unlockHintZh: "多公开危险内容、拒绝改写，或遇到宫廷 AI 质问。"
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
  profile: PlayerProfile = createEmptyProfile(),
  scope: "current" | "completed" = "current"
): AchievementId[] {
  const ids = new Set<AchievementId>();
  if (state.history.some((entry) => entry.choice === "original")) ids.add("rawEvidence");
  if (sourceZonesUsed(state).size >= 3) ids.add("sourceSweeper");
  if (state.dialogueEvents.length > 0) ids.add("dialogueHandler");
  if (state.publicDoubt >= 6) ids.add("publicBreach");
  if (profile.decodedEngine || profile.engineFragments.length >= engineFragmentDefinitions.length) ids.add("engineDecoded");
  if (scope === "completed") {
    ids.add("firstShift");
    if (state.truth >= 7) ids.add("truthArchive");
    if (state.reputation >= 7) ids.add("reputationShield");
    if (state.systemSuspicion <= 2) ids.add("quietOperator");
    for (const endingId of completedEndingIds) ids.add(endingAchievementIds[endingId]);
    if (new Set(completedEndingIds).size >= Object.keys(endingAchievementIds).length) ids.add("allEndings");
  }
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
    evaluateAchievements(state, completedEndingIds, withFragments.profile, "completed"),
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
  return engineFragmentsForState(state).filter((id) => !existing.has(id));
}

export function engineFragmentsForState(state: GameState): EngineFragmentId[] {
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
  return [...ids];
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

export function canDecodeEngineWithState(profile: PlayerProfile, state: GameState) {
  if (canDecodeEngine(profile)) return true;
  const ids = new Set(profile.engineFragments.map((item) => item.id));
  for (const id of engineFragmentsForState(state)) ids.add(id);
  return ids.size >= engineFragmentDefinitions.length;
}

export function secretEndingEligible(state: GameState, profile: PlayerProfile) {
  return canDecodeEngineWithState(profile, state) &&
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
