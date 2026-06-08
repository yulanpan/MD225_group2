export type NumericStateKey =
  | "truth"
  | "pressure"
  | "virality"
  | "publicDoubt"
  | "reputation"
  | "systemSuspicion";

export type ZoneId = "tailors" | "ministers" | "public" | "child";

export type ActionChoice = "direct" | "rewrite" | "original";

export type RiskLevel = "low" | "medium" | "high";

export type NarrativePhase = "setup" | "fracture" | "crisis" | "reckoning";

export type NarrativeThreadId =
  | "officialPerformance"
  | "evidenceTrail"
  | "publicRecognition"
  | "engineContainment"
  | "childSignal";

export type NarrativeSeedId =
  | "shameFrame"
  | "emptyLoomWitnessed"
  | "loomPhotoReleased"
  | "authorityContradiction"
  | "palaceLeak"
  | "mutualRecognition"
  | "measuredDoubt"
  | "factCheckRecord"
  | "childSignalProtected"
  | "childSignalAmplified"
  | "positiveChorus";

export type EndingId =
  | "perfectIllusion"
  | "privateDoubt"
  | "viralCollapse"
  | "algorithmicConsensus"
  | "editorExposed"
  | "aiContainment"
  | "unstableFeed"
  | "narrativeLiberation";

export type GameState = Record<NumericStateKey, number> & {
  actionsLeft: number;
  childAmplified: boolean;
  usedActionIds: string[];
  narrativeBeatIds: string[];
  feedEvents: FeedEvent[];
  comments: string[];
  publicComments: PublicComment[];
  history: HistoryEntry[];
  dialogueEvents: DialogueRecord[];
  dialogueEventIds: string[];
};

export type Effects = Partial<Record<NumericStateKey, number>> & {
  childAmplified?: boolean;
};

export type HistoryEntry = {
  id: string;
  actionId: string;
  actionTitle: string;
  zone: string;
  choice: ActionChoice;
  publishedText: string;
  resultText?: string;
  engineMessage: string;
  spentAction?: boolean;
  metricDeltas?: HistoryMetricDelta[];
  stateBefore: Omit<GameState, "history">;
  stateAfter: Omit<GameState, "history">;
};

export type HistoryMetricDelta = {
  key: NumericStateKey;
  before: number;
  after: number;
  delta: number;
};

export type FeedEventType = "official" | "evidence" | "risk" | "public" | "system";

export type FeedEvent = {
  id: string;
  type: FeedEventType;
  title: string;
  text: string;
};

export type NarrativeBeat = {
  id: string;
  phase: NarrativePhase;
  thread: NarrativeThreadId;
  title: string;
  titleZh: string;
  text: string;
  textZh: string;
  priority: number;
};

export type ActionRiskBand = "low" | "medium" | "high" | "severe";

export type ActionPreview = {
  actionId: string;
  title: string;
  lockReason: string | null;
  completed: boolean;
  availableChoices: ActionChoice[];
  selectedChoice: ActionChoice;
  effects: Effects;
  resultText: string;
  unlocks: string[];
  riskBand: ActionRiskBand;
};

export type EndingAnalysis = {
  dominantMetric: {
    key: NumericStateKey;
    label: string;
    value: number;
  };
  strongestAction?: HistoryEntry;
  riskiestAction?: HistoryEntry;
  replayTarget: string;
  replayEndingHint: EndingId;
};

export type ActionDefinition = {
  id: string;
  zone: ZoneId;
  title: string;
  titleZh: string;
  sourceLabel: string;
  description: string;
  originalPost: string;
  resultText: string;
  engineHint: string;
  requiresAIRewrite: boolean;
  unlocks?: string[];
  effects?: Effects;
  effectsRewrite?: Effects;
  effectsOriginal?: Effects;
  rewriteSuggestion?: string;
  dynamicEffects?: boolean;
  commentTone?: "praise" | "doubt" | "conflicted" | "child";
  thread?: NarrativeThreadId;
  intentTags?: string[];
  seedEffects?: NarrativeSeedId[];
  narrativePreview?: string;
};

export type AiReaction = {
  engineMessage: string;
  riskLevel: RiskLevel;
  suggestedRewrite: string;
  recommendation: "accept_rewrite" | "publish_original" | "delay";
};

export type RewriteResult = {
  rewrittenPost: string;
  strategy: string;
};

export type GeneratedComments = {
  comments: string[];
  publicComments: PublicComment[];
};

export type FinalReport = {
  report: string;
};

export type DialogueArchetype =
  | "ministerChallenge"
  | "tailorThreat"
  | "publicWitness"
  | "archiveClerk"
  | "childGuardian"
  | "engineAudit";

export type DialogueOutcomeTag =
  | "reassureAuthority"
  | "surfaceDoubt"
  | "increaseSuspicion"
  | "containNarrative"
  | "amplifyWitness"
  | "noEffect";

export type DialoguePromptPatch = {
  angle: string;
  speakerAgenda: string;
  forbiddenFrame: string;
  pressureLine: string;
};

export type DialogueMoodKey = "trust" | "agitation" | "openness" | "leverage";

export type DialogueMood = Record<DialogueMoodKey, number>;

export type DialogueMoodDelta = Partial<Record<DialogueMoodKey, number>>;

export type DialogueChoiceIntent = "stabilize" | "challenge" | "clarify" | "protect" | "escalate" | "concede";

export type DialogueChoice = {
  id: string;
  label: string;
  playerLine: string;
  intent: DialogueChoiceIntent;
  moodDelta: DialogueMoodDelta;
};

export type DialogueEvent = {
  id: string;
  archetype: DialogueArchetype;
  speakerName: string;
  speakerRole: string;
  openingLine: string;
  stakes: string;
  mood: DialogueMood;
  quickReplies: DialogueChoice[];
  promptPatch: DialoguePromptPatch;
  turnLimit: number;
};

export type DialogueMessage = {
  role: "speaker" | "player" | "system";
  content: string;
  createdAt: string;
  choiceId?: string;
  intent?: DialogueChoiceIntent;
};

export type DialogueRecord = {
  event: DialogueEvent;
  transcript: DialogueMessage[];
  outcomeTag: DialogueOutcomeTag;
  effects: Effects;
  summary: string;
  moodTrail?: DialogueMood[];
  finalMood?: DialogueMood;
};

export type DialogueSilenceResult = {
  speakerMessage: string;
  moodDelta: DialogueMoodDelta;
};

export type PublicCommentStance = "praise" | "fear" | "doubt" | "satire" | "procedural" | "witness";

export type PublicComment = {
  handle: string;
  persona: string;
  stance: PublicCommentStance;
  text: string;
  intensity: number;
};

export type AchievementId =
  | "firstShift"
  | "perfectIllusion"
  | "privateDoubt"
  | "viralCollapse"
  | "algorithmicConsensus"
  | "editorExposed"
  | "aiContainment"
  | "unstableFeed"
  | "allEndings"
  | "truthArchive"
  | "reputationShield"
  | "quietOperator"
  | "rawEvidence"
  | "sourceSweeper"
  | "dialogueHandler"
  | "publicBreach"
  | "engineDecoded"
  | "narrativeLiberation";

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  rarity: "standard" | "rare" | "critical";
};

export type AchievementUnlock = {
  id: AchievementId;
  unlockedAt: string;
  runId: string;
};

export type RunRecord = {
  id: string;
  completedAt: string;
  endingId: EndingId;
  language: "en" | "zh";
  finalMetrics: Record<NumericStateKey, number>;
  actionPath: Array<{
    actionId: string;
    title: string;
    choice: ActionChoice;
  }>;
  feedEvents?: Array<{
    title: string;
    text: string;
  }>;
  dialogueSummaries?: string[];
  dialogueCount: number;
  achievementsUnlocked: AchievementId[];
  engineFragmentsUnlocked?: EngineFragmentId[];
  biasAwarenessAfterRun?: number;
};

export type EngineFragmentId =
  | "stabilityBias"
  | "evidenceRecoding"
  | "crowdSuppression"
  | "containmentProtocol";

export type EngineFragmentDefinition = {
  id: EngineFragmentId;
  title: string;
  titleZh: string;
  clue: string;
  clueZh: string;
  unlockHint: string;
  unlockHintZh: string;
};

export type EngineFragmentUnlock = {
  id: EngineFragmentId;
  runId: string;
  unlockedAt: string;
};

export type PlayerProfile = {
  version: 2;
  achievements: AchievementUnlock[];
  runs: RunRecord[];
  engineFragments: EngineFragmentUnlock[];
  biasAwareness: number;
  decodedEngine: boolean;
  secretEndingUnlocked: boolean;
};

export type GuidanceMode = "engine" | "coach";

export type GuidanceResult = {
  mode: GuidanceMode;
  message: string;
  objective: string;
  risk: "low" | "medium" | "high";
};
