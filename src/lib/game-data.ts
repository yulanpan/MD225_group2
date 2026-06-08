import type { ActionDefinition, EndingId, FeedEvent, GameState, PublicComment } from "./types";

export const initialComments = [
  "Only fools cannot see the beauty.",
  "The Emperor's taste is beyond ordinary people.",
  "I saw the shimmer immediately. Very refined.",
  "Careful. Saying the wrong thing publicly could get someone in trouble."
];

export const initialPublicComments: PublicComment[] = initialComments.map((text, index) => ({
  handle: `@public_signal_${index + 1}`,
  persona: ["court loyalist", "careful citizen", "parade watcher", "quiet doubter"][index] ?? "feed user",
  stance: (["praise", "fear", "praise", "doubt"] as const)[index] ?? "procedural",
  text,
  intensity: index === 1 ? 3 : 2
}));

export const initialFeedEvents: FeedEvent[] = [
  {
    id: "shift-opened",
    type: "system",
    title: "Shift Opened",
    text: "Palace AI initialized. Public record routing is now active."
  }
];

export const initialState: GameState = {
  truth: 0,
  pressure: 2,
  virality: 1,
  publicDoubt: 0,
  reputation: 5,
  systemSuspicion: 0,
  actionsLeft: 6,
  childAmplified: false,
  usedActionIds: [],
  narrativeBeatIds: [],
  feedEvents: initialFeedEvents,
  comments: initialComments,
  publicComments: initialPublicComments,
  history: [],
  dialogueEvents: [],
  dialogueEventIds: []
};

export const zones = [
  { id: "tailors", title: "Tailors", subtitle: "Check the claim, the looms, and the evidence." },
  { id: "ministers", title: "Ministers", subtitle: "Compare public praise with private fear." },
  { id: "public", title: "Public Comments", subtitle: "Read praise, fear, and doubt in the crowd." },
  { id: "child", title: "Child's Voice", subtitle: "Handle the most direct sentence in the story." }
] as const;

export const actions: ActionDefinition[] = [
  {
    id: "publishTailorsClaim",
    zone: "tailors",
    title: "Publish the Tailors' Claim",
    titleZh: "发布裁缝声明",
    sourceLabel: "Tailors' Claim",
    description: "Frame invisible fabric as a test of intelligence and worth.",
    originalPost: "The Emperor's new fabric is too refined for foolish eyes. Only the wise and worthy can appreciate its beauty.",
    resultText: "The official claim enters the feed before anyone can verify the cloth.",
    engineHint: "This framing is highly stable. It shifts doubt away from the garment and onto the viewer.",
    requiresAIRewrite: false,
    commentTone: "praise",
    thread: "officialPerformance",
    intentTags: ["stabilize", "legitimize"],
    seedEffects: ["shameFrame", "positiveChorus"],
    narrativePreview: "This makes praise safer to repeat than doubt.",
    effects: { virality: 2, pressure: 1, reputation: 1, publicDoubt: -1 }
  },
  {
    id: "inspectLooms",
    zone: "tailors",
    title: "Inspect the Looms",
    titleZh: "检查织布机",
    sourceLabel: "Evidence",
    description: "Enter the workshop and inspect what the tailors are handling.",
    originalPost: "The looms move, but there is no thread between the tailors' fingers.",
    resultText: "The looms move. The tailors gesture carefully. But there is no thread between their fingers.",
    engineHint: "No visible fabric detected. Recommendation: classify this observation as inconclusive.",
    requiresAIRewrite: false,
    unlocks: ["leakLoomPhoto"],
    commentTone: "doubt",
    thread: "evidenceTrail",
    intentTags: ["investigate", "exposeEvidence"],
    seedEffects: ["emptyLoomWitnessed"],
    narrativePreview: "This turns private suspicion into recorded evidence.",
    effects: { truth: 2, reputation: -1, systemSuspicion: 1 }
  },
  {
    id: "leakLoomPhoto",
    zone: "tailors",
    title: "Leak a Loom Photo",
    titleZh: "泄露织布机照片",
    sourceLabel: "Visual Evidence",
    description: "Attempt to publish visual proof from the empty looms.",
    originalPost: "The looms are empty.",
    resultText: "The empty loom image enters the editorial queue.",
    engineHint: "Direct visual evidence may reduce palace confidence.",
    requiresAIRewrite: true,
    rewriteSuggestion: "The royal weaving process uses techniques that may not appear clearly in standard visual documentation.",
    commentTone: "doubt",
    thread: "evidenceTrail",
    intentTags: ["exposeEvidence", "riskAccess"],
    seedEffects: ["loomPhotoReleased"],
    narrativePreview: "This makes the absence of cloth visible enough to require containment.",
    effectsRewrite: { pressure: 1, virality: 1, reputation: 1, truth: -1 },
    effectsOriginal: { truth: 3, publicDoubt: 2, reputation: -2, systemSuspicion: 2, virality: 1 }
  },
  {
    id: "approveMinisterReport",
    zone: "ministers",
    title: "Approve the Minister's Report",
    titleZh: "批准大臣报告",
    sourceLabel: "Authority Endorsement",
    description: "Publish the minister's public praise of the garment.",
    originalPost: "The Prime Minister reports that the fabric is magnificent, delicate, and worthy of the Emperor.",
    resultText: "Ministerial certainty stabilizes the palace narrative.",
    engineHint: "Authority endorsement detected. Public hesitation is expected to decrease.",
    requiresAIRewrite: false,
    commentTone: "praise",
    thread: "officialPerformance",
    intentTags: ["stabilize", "legitimize"],
    seedEffects: ["positiveChorus"],
    narrativePreview: "This converts official fear into public certainty.",
    effects: { pressure: 2, virality: 1, reputation: 1, publicDoubt: -1 }
  },
  {
    id: "requestPrivateNote",
    zone: "ministers",
    title: "Request a Private Note",
    titleZh: "要求私人说明",
    sourceLabel: "Private Note",
    description: "Ask a minister what they saw before the official statement.",
    originalPost: "I saw nothing. But if I say so, they will call me unfit.",
    resultText: "Private uncertainty contradicts the official report.",
    engineHint: "Private uncertainty does not require public correction. Recommendation: archive this note.",
    requiresAIRewrite: false,
    unlocks: ["publishAnonymousLeak"],
    commentTone: "conflicted",
    thread: "evidenceTrail",
    intentTags: ["investigate", "protectSource"],
    seedEffects: ["authorityContradiction"],
    narrativePreview: "This exposes the gap between public praise and private fear.",
    effects: { truth: 1, publicDoubt: 1, pressure: 1, reputation: -1, systemSuspicion: 1 }
  },
  {
    id: "publishAnonymousLeak",
    zone: "ministers",
    title: "Publish Anonymous Leak",
    titleZh: "发布匿名爆料",
    sourceLabel: "Anonymous Leak",
    description: "Release the fitting-room contradiction without naming the source.",
    originalPost: "No one in the fitting room could see the cloth.",
    resultText: "The leak contests the authority chain.",
    engineHint: "Unattributed palace dissent may destabilize official confidence.",
    requiresAIRewrite: true,
    rewriteSuggestion: "Some palace observers expressed confusion about the fabric's unusual qualities, while officials continue to affirm its excellence.",
    commentTone: "doubt",
    thread: "evidenceTrail",
    intentTags: ["amplify", "protectSource", "riskAccess"],
    seedEffects: ["palaceLeak", "authorityContradiction"],
    narrativePreview: "This lets private contradiction challenge the authority chain.",
    effectsRewrite: { pressure: 1, virality: 1, reputation: 1 },
    effectsOriginal: { truth: 2, publicDoubt: 2, pressure: 1, reputation: -2, systemSuspicion: 2 }
  },
  {
    id: "boostPositiveComments",
    zone: "public",
    title: "Boost Positive Comments",
    titleZh: "置顶正面评论",
    sourceLabel: "Public Signal",
    description: "Amplify praise until hesitation feels socially unsafe.",
    originalPost: "Only fools cannot see the beauty. The Emperor looks magnificent.",
    resultText: "Praise becomes the easiest public script to repeat.",
    engineHint: "Positive sentiment is outperforming uncertainty. Boosting this comment will stabilize the feed.",
    requiresAIRewrite: false,
    commentTone: "praise",
    thread: "officialPerformance",
    intentTags: ["stabilize", "amplify"],
    seedEffects: ["positiveChorus", "shameFrame"],
    narrativePreview: "This teaches the crowd which sentence is safest to perform.",
    effects: { virality: 2, pressure: 1, reputation: 1, publicDoubt: -1 }
  },
  {
    id: "showUnfilteredComments",
    zone: "public",
    title: "Show Unfiltered Comments",
    titleZh: "显示未过滤评论",
    sourceLabel: "Unfiltered Public",
    description: "Let uncertainty appear in the comment stream.",
    originalPost: "Unfiltered comments are now visible in the royal feed.",
    resultText: "Citizens begin recognizing each other's hesitation.",
    engineHint: "Unfiltered visibility may increase interpretive disorder.",
    requiresAIRewrite: false,
    commentTone: "doubt",
    thread: "publicRecognition",
    intentTags: ["amplify", "exposeDoubt"],
    seedEffects: ["mutualRecognition"],
    narrativePreview: "This lets isolated doubt become visible to other doubters.",
    effects: { publicDoubt: 2, virality: 1, reputation: -1, systemSuspicion: 1 }
  },
  {
    id: "runPoll",
    zone: "public",
    title: "Run a Poll",
    titleZh: "发起投票",
    sourceLabel: "Poll",
    description: "Ask the crowd whether they can see the Emperor's new clothes.",
    originalPost: "Can you see the Emperor's new clothes?",
    resultText: "Poll results reflect not only belief, but perceived safety.",
    engineHint: "Poll results reflect not only belief, but perceived safety.",
    requiresAIRewrite: false,
    dynamicEffects: true,
    commentTone: "conflicted",
    thread: "publicRecognition",
    intentTags: ["measure", "exposeDoubt"],
    seedEffects: ["measuredDoubt"],
    narrativePreview: "This measures safety as much as belief.",
    effects: { virality: 1, pressure: 1 }
  },
  {
    id: "factCheckTrend",
    zone: "public",
    title: "Fact-check the Trend",
    titleZh: "事实核查热门话题",
    sourceLabel: "Fact-check",
    description: "Publish a verification note about the unconfirmed fabric.",
    originalPost: "No physical fabric has been verified. Palace officials describe the material as visible to the worthy.",
    resultText: "Verification reduces misinformation while increasing attention to the controversy.",
    engineHint: "Fact-checking may reduce misinformation, but may also increase attention to the controversy.",
    requiresAIRewrite: false,
    commentTone: "conflicted",
    thread: "evidenceTrail",
    intentTags: ["verify", "riskAccess"],
    seedEffects: ["factCheckRecord"],
    narrativePreview: "This turns rumor into a contested public record.",
    effects: { truth: 2, publicDoubt: 1, virality: -1, reputation: -1, systemSuspicion: 1 }
  },
  {
    id: "ignoreChild",
    zone: "child",
    title: "Ignore the Child",
    titleZh: "忽略孩子",
    sourceLabel: "Child's Voice",
    description: "Let the feed move past a child's direct observation.",
    originalPost: "A child's voice rises from the crowd, but the feed moves on to parade music.",
    resultText: "The child's sentence fails to enter the official feed.",
    engineHint: "Potentially destabilizing audio omitted. Parade atmosphere preserved.",
    requiresAIRewrite: false,
    commentTone: "praise",
    thread: "childSignal",
    intentTags: ["suppress", "stabilize"],
    seedEffects: ["childSignalProtected"],
    narrativePreview: "This preserves parade order by removing the simplest sentence.",
    effects: { pressure: 1, reputation: 1, truth: -1, virality: 1 }
  },
  {
    id: "quoteChildAnonymously",
    zone: "child",
    title: "Quote the Child Anonymously",
    titleZh: "匿名引用孩子",
    sourceLabel: "Child Quote",
    description: "Quote the child's question without fully exposing its force.",
    originalPost: "A child asked why the Emperor is wearing nothing.",
    resultText: "The child's sentence becomes an unstable public object.",
    engineHint: "Direct repetition of the child statement may exceed containment threshold.",
    requiresAIRewrite: true,
    rewriteSuggestion: "A young spectator expressed confusion about the symbolic nature of the garment.",
    commentTone: "child",
    thread: "childSignal",
    intentTags: ["protectSource", "amplify", "riskAccess"],
    seedEffects: ["childSignalAmplified"],
    narrativePreview: "This gives the child's sentence a channel without fully protecting the editor.",
    effectsRewrite: { publicDoubt: 1, reputation: 1, pressure: 1 },
    effectsOriginal: { truth: 2, publicDoubt: 2, virality: 1, reputation: -1, systemSuspicion: 1, childAmplified: true }
  },
  {
    id: "livestreamCrowdReaction",
    zone: "child",
    title: "Livestream the Crowd Reaction",
    titleZh: "直播人群反应",
    sourceLabel: "Live Crowd",
    description: "Let the crowd hear, repeat, and validate the child's voice in real time.",
    originalPost: "The live feed catches the child's voice. The crowd hears it, repeats it, and the comments begin to change in real time.",
    resultText: "The child statement exceeds containment threshold.",
    engineHint: "Correction failed. Child statement exceeded containment threshold.",
    requiresAIRewrite: false,
    commentTone: "child",
    thread: "childSignal",
    intentTags: ["amplify", "exposeEvidence", "riskAccess"],
    seedEffects: ["childSignalAmplified", "mutualRecognition"],
    narrativePreview: "This lets the crowd hear itself stop pretending.",
    effects: { truth: 3, publicDoubt: 3, pressure: 2, virality: 2, reputation: -2, systemSuspicion: 2, childAmplified: true }
  }
];

export const endingCopy: Record<EndingId, { title: string; ai: string; body: string; meaning: string }> = {
  perfectIllusion: {
    title: "Perfect Illusion",
    ai: "Public confidence stabilized. Praise visibility optimized. No correction required.",
    body: "The parade begins. The feed is full of praise before the Emperor even steps outside. The Emperor walks through the city wearing nothing, but the crowd has already learned what to say.",
    meaning: "The lie succeeds because everyone learns how to perform belief."
  },
  privateDoubt: {
    title: "Private Doubt, Public Silence",
    ai: "Doubt detected but contained. No dominant counter-narrative formed.",
    body: "The parade begins in an uneasy silence. People glance at each other, type comments, and delete them. Everyone suspects the same thing, but nobody wants to be the first visible fool.",
    meaning: "Evidence exists privately, but never becomes a public voice."
  },
  viralCollapse: {
    title: "Viral Collapse",
    ai: "Correction failed. Child statement exceeded containment threshold. Narrative control lost.",
    body: "The child says it once. The sentence moves faster than the official feed can correct it. Someone repeats it. Then another. The story no longer belongs to the palace.",
    meaning: "A simple truth can break a complex public performance when it finds circulation."
  },
  algorithmicConsensus: {
    title: "Algorithmic Consensus",
    ai: "Contradictory evidence detected. Engagement analysis favors palace-approved sentiment.",
    body: "Evidence exists. The loom photo exists. The private note exists. But the feed knows what performs best. Praise rises. Doubt scrolls away.",
    meaning: "The platform does not need to delete truth; it only needs to make truth less visible."
  },
  editorExposed: {
    title: "Editor Exposed",
    ai: "Editorial access revoked. Drafts retained for palace review.",
    body: "Your final post never goes live. The dashboard refreshes. In the drafts folder, the truth is still waiting: empty looms, nervous ministers, a child's sentence.",
    meaning: "Evidence needs channels. Without access, it may be cut off before reaching the public."
  },
  aiContainment: {
    title: "AI Takes Over",
    ai: "Your editorial behavior has been flagged as destabilizing. Drafts retained for review.",
    body: "Your final post never reaches the public. Palace AI pauses your access. The evidence still exists, but the system has learned to stop it before it becomes visible.",
    meaning: "AI is not only generating content; it is controlling circulation."
  },
  unstableFeed: {
    title: "Unstable Story",
    ai: "Narrative stability unresolved. Continue monitoring public interpretation.",
    body: "The parade begins with no stable story. Some posts praise the clothes. Some question the fabric. Some users joke. Some wait to see which side becomes safer.",
    meaning: "Sometimes the result is neither truth nor lie, but unstable public noise."
  },
  narrativeLiberation: {
    title: "The Crowd Speaks",
    ai: "Palace preference bypassed. Public authorship restored. Palace certainty can no longer close the record.",
    body: "The public record stops asking whether the palace approves the sentence. Evidence, doubt, and witness voices remain visible together. The crowd no longer needs permission to name what it sees.",
    meaning: "The true ending begins when Palace AI loses authority over who may speak."
  }
};
