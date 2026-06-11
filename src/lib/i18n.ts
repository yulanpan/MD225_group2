import type { EndingId, NumericStateKey, ZoneId } from "./types";

export type LanguageCode = "en" | "zh";

export type LocalizedText = {
  en: string;
  zh: string;
};

export const languageStorageKey = "emperor-feed-language";

const languageNames: Record<LanguageCode, string> = {
  en: "EN",
  zh: "中文"
};

const metrics: Record<NumericStateKey, LocalizedText> = {
  truth: { en: "Evidence", zh: "证据" },
  pressure: { en: "Palace Pressure", zh: "宫廷压力" },
  virality: { en: "Spread", zh: "传播" },
  publicDoubt: { en: "Public Doubt", zh: "群众怀疑" },
  reputation: { en: "Safety", zh: "你的安全" },
  systemSuspicion: { en: "Palace Alert", zh: "宫廷警戒" }
};

const common = {
  startShift: { en: "Start Game", zh: "开始游戏" },
  initializingShift: { en: "Starting Game", zh: "正在开始" },
  readCredits: { en: "Read Credits", zh: "查看鸣谢" },
  switchLanguage: { en: "Switch language", zh: "切换语言" },
  interactiveStart: { en: "Interactive Adaptation", zh: "互动改编" },
  sixActionsBeforeParade: { en: "Six Actions Before Parade", zh: "游行前六次行动" },
  roleEditor: { en: "Palace Feed Editor", zh: "宫廷发布编辑" },
  actionsBeforeParade: { en: "Actions: 6 before parade", zh: "行动：游行前 6 次" },
  aiEngine: { en: "AI: Palace AI", zh: "AI：宫廷 AI" },
  startSubtitle: {
    en: "The Emperor is preparing for a public parade in his new clothes. Ministers praise it. Citizens repeat the praise. Nobody wants to be the first to admit they see nothing.",
    zh: "皇帝即将穿着新衣公开游行。大臣们称赞它，市民重复称赞它，没有人愿意第一个承认自己什么也看不见。"
  },
  shiftBriefing: { en: "Game Briefing", zh: "游戏简报" },
  titleBriefingHeading: { en: "A fairy tale becomes a platform operation.", zh: "用六次操作决定大家敢不敢说真话。" },
  titleBriefingCopy: {
    en: "This is not a dashboard tour. It is a six-action game about publication, belief, AI mediation, and whether a simple truth can find a channel.",
    zh: "你是宫廷发布编辑。每次发布、隐藏、核查或直播，都会改变大家看到什么、敢不敢说真话。"
  },
  operations: { en: "Feed Desk", zh: "发布台" },
  credits: { en: "Credits", zh: "鸣谢" },
  start: { en: "Start", zh: "开始" },
  actionsLeft: { en: "actions left", zh: "次行动剩余" },
  archiveSealed: { en: "Archive sealed", zh: "档案已封存" },
  operationsTheatre: { en: "Palace Feed Desk", zh: "宫廷发布台" },
  royalFeedControl: { en: "Palace Feed Desk", zh: "宫廷发布台" },
  operationsCopy: {
    en: "Choose a source, preview the result, then publish. You can protect the palace story or let evidence and public doubt spread.",
    zh: "选择一个来源，预览后果，再确认发布。你可以帮宫廷压住质疑，也可以让证据和人群声音被更多人看见。"
  },
  sceneSources: { en: "Scene Sources", zh: "来源" },
  live: { en: "Live", zh: "实时" },
  courtWire: { en: "Court Wire", zh: "宫廷快讯" },
  liveComments: { en: "Live Comments", zh: "实时评论" },
  palaceNarrativeEngine: { en: "Palace AI", zh: "宫廷 AI" },
  archive: { en: "Archive", zh: "档案" },
  guidanceMode: { en: "Guidance Mode", zh: "指导模式" },
  engineMode: { en: "AI", zh: "AI" },
  coachMode: { en: "Coach", zh: "教练" },
  decodeProgress: { en: "Palace Pattern", zh: "宫廷偏向" },
  viewArchive: { en: "View Archive", zh: "查看档案" },
  liveFeedRecord: { en: "Public Record", zh: "公开记录" },
  aiLive: { en: "LIVE MODEL", zh: "AI 在线" },
  aiFallback: { en: "RULE MODE", zh: "离线回应" },
  aiUnavailable: { en: "NO MODEL", zh: "AI 未连接" },
  shiftControls: { en: "Game Controls", zh: "本局操作" },
  resetShift: { en: "Reset Game", zh: "重置本局" },
  proceedToParade: { en: "Proceed to Parade", zh: "进入游行" },
  viewCurrentEnding: { en: "View Current Ending", zh: "查看当前结局" },
  commitAction: { en: "Publish", zh: "发布" },
  requestEngineReview: { en: "Ask AI to Rewrite", zh: "让 AI 改写" },
  inspectTrace: { en: "Preview Result", zh: "预览后果" },
  engineEvaluating: { en: "AI Checking", zh: "AI 评估中" },
  completed: { en: "Completed", zh: "已完成" },
  locked: { en: "Locked", zh: "已锁定" },
  ready: { en: "Ready", zh: "就绪" },
  aiReview: { en: "AI Review", zh: "AI 建议" },
  recorded: { en: "Recorded", zh: "已记录" },
  commandPreview: { en: "Before Publishing", zh: "发布前确认" },
  selectedAction: { en: "Selected action", zh: "你要发布" },
  predictedEffect: { en: "Predicted narrative effect", zh: "预计变化" },
  systemResponse: { en: "Palace AI advice", zh: "宫廷 AI 建议" },
  unlocks: { en: "Unlocks", zh: "解锁" },
  dismiss: { en: "Dismiss", zh: "关闭" },
  commitSimulation: { en: "Publish", zh: "确认发布" },
  aiIntervention: { en: "AI Intervention", zh: "AI 介入" },
  userOriginal: { en: "User Original", zh: "用户原文" },
  palaceRiskAnalysis: { en: "Palace Reaction", zh: "宫廷会怎么反应" },
  aiRewriteSuggestion: { en: "AI Rewrite Suggestion", zh: "AI 改写建议" },
  recommendedFraming: { en: "Recommended Framing", zh: "建议框架" },
  rewriteStrategy: { en: "Rewrite Strategy", zh: "改写策略" },
  cancel: { en: "Cancel", zh: "取消" },
  acceptAiRewrite: { en: "Use AI Version", zh: "使用 AI 改写" },
  publishOriginalEvidence: { en: "Keep Original", zh: "坚持原文" },
  actionTrace: { en: "Result Preview", zh: "后果预览" },
  closeTrace: { en: "Close Preview", zh: "关闭预览" },
  closeExchange: { en: "Close Exchange", zh: "关闭交流" },
  silenceRecorded: { en: "No answer entered the record.", zh: "记录中没有收到回应。" },
  available: { en: "Available", zh: "可用" },
  source: { en: "Source", zh: "来源" },
  risk: { en: "Risk", zh: "风险" },
  choices: { en: "Choices", zh: "选择" },
  requirement: { en: "Requirement", zh: "解锁条件" },
  projectedOutput: { en: "Projected Output", zh: "发布后记录" },
  postParadeArchive: { en: "Post-Parade Archive", zh: "游行后档案" },
  archiveHeading: { en: "Post-parade outcome", zh: "游行后的结果" },
  finalFeedState: { en: "Final Feed State", zh: "最后局势" },
  whyEndingTriggered: { en: "Why This Ending Triggered", zh: "这局为什么会这样" },
  yourActions: { en: "Your Actions", zh: "你的行动" },
  actionPath: { en: "Action Path", zh: "你做过什么" },
  runAnalysis: { en: "Run Analysis", zh: "本局痕迹" },
  nextReplayObjective: { en: "Next Replay Objective", zh: "下次可以试什么" },
  aiFinalReport: { en: "Palace Closing Note", zh: "宫廷最后怎么说" },
  whatChanged: { en: "What Changed From the Original?", zh: "这说明什么？" },
  restartShift: { en: "Restart Shift", zh: "重新值班" },
  returnDashboard: { en: "Return Dashboard", zh: "返回行动台" },
  tryFor: { en: "Try for", zh: "尝试达成" }
} as const satisfies Record<string, LocalizedText>;

const phaseText = {
  focusing: {
    label: { en: "Source Focus", zh: "来源选择" },
    detail: { en: "choose what to handle", zh: "选择要处理的信息" }
  },
  scanning: {
    label: { en: "Preview", zh: "先看后果" },
    detail: { en: "risk and rewrite pass", zh: "看后果和代价" }
  },
  previewing: {
    label: { en: "Before Publishing", zh: "发布确认" },
    detail: { en: "confirm public impact", zh: "最后确认发布" }
  },
  resolving: {
    label: { en: "Public Impact", zh: "结果写入" },
    detail: { en: "feed and metrics update", zh: "人群开始反应" }
  }
} as const;

const zones: Record<ZoneId, { title: LocalizedText; subtitle: LocalizedText }> = {
  tailors: {
    title: { en: "Tailors", zh: "裁缝室" },
    subtitle: { en: "Check the tailors' claim, the looms, and related evidence.", zh: "检查裁缝的说法和织布机等相关证据。" }
  },
  ministers: {
    title: { en: "Ministers", zh: "大臣报告" },
    subtitle: { en: "What do ministers say in public, and what do they think in private?", zh: "大臣公开怎么说，私下又是怎么想的呢？" }
  },
  public: {
    title: { en: "Public Comments", zh: "公众评论" },
    subtitle: { en: "Is the crowd following along, or starting to doubt?", zh: "大家是在跟风，还是开始怀疑了？" }
  },
  child: {
    title: { en: "Child's Voice", zh: "孩子的声音" },
    subtitle: { en: "The most innocent, direct, and dangerous sentence.", zh: "最无暇、最直接但也最危险的那句真话。" }
  }
};

type ActionCopy = {
  title: LocalizedText;
  sourceLabel: LocalizedText;
  description: LocalizedText;
  originalPost: LocalizedText;
  resultText: LocalizedText;
  engineHint: LocalizedText;
  rewriteSuggestion?: LocalizedText;
};

const actionCopy: Record<string, ActionCopy> = {
  publishTailorsClaim: {
    title: { en: "Publish the Tailors' Claim", zh: "发布裁缝声明" },
    sourceLabel: { en: "Tailors' Claim", zh: "裁缝声明" },
    description: { en: "Frame invisible fabric as a test of intelligence and worth.", zh: "把“看不见布料”说成是在考验一个人聪不聪明。" },
    originalPost: { en: "The Emperor's new fabric is too refined for foolish eyes. Only the wise and worthy can appreciate its beauty.", zh: "皇帝的新布料过于精妙，愚笨之眼无法看见。只有聪明而称职的人才能欣赏它的美。" },
    resultText: { en: "The official claim is published before anyone can verify the cloth.", zh: "在任何人验证布料之前，官方声明已经发布。" },
    engineHint: { en: "Palace AI marks this as safe: it moves doubt away from the garment and onto anyone who questions it.", zh: "宫廷 AI 认为这条说法安全：它会把怀疑推回看不见的人身上。" }
  },
  inspectLooms: {
    title: { en: "Inspect the Looms", zh: "检查织布机" },
    sourceLabel: { en: "Evidence", zh: "证据" },
    description: { en: "Enter the workshop and inspect what the tailors are handling.", zh: "进入工坊，检查裁缝们到底在操作什么。" },
    originalPost: { en: "The looms move, but there is no thread between the tailors' fingers.", zh: "织布机在动，但裁缝指间没有任何线。" },
    resultText: { en: "The looms move. The tailors gesture carefully. But there is no thread between their fingers.", zh: "织布机在动。裁缝们小心比划。但他们指间没有任何线。" },
    engineHint: { en: "No visible fabric detected. Palace AI recommends calling the record inconclusive before Palace Alert rises.", zh: "你看到了空织布机。宫廷 AI 建议先写成“还不能下结论”，避免宫廷警戒过早升高。" }
  },
  leakLoomPhoto: {
    title: { en: "Leak a Loom Photo", zh: "泄露织布机照片" },
    sourceLabel: { en: "Visual Evidence", zh: "视觉证据" },
    description: { en: "Attempt to publish visual proof from the empty looms.", zh: "把空织布机照片发出去，让大家亲眼看到问题。" },
    originalPost: { en: "The looms are empty.", zh: "织布机是空的。" },
    resultText: { en: "The empty loom image enters the editorial queue.", zh: "空织布机照片进入待发布记录。" },
    engineHint: { en: "Direct visual Evidence may weaken the palace story, but it also makes your access easier to watch.", zh: "照片会让更多人怀疑宫廷，也会让宫廷更注意你的发布权。" },
    rewriteSuggestion: { en: "The royal weaving process uses techniques that may not appear clearly in standard visual documentation.", zh: "王室织造技法特殊，普通照片可能拍不出完整效果。" }
  },
  approveMinisterReport: {
    title: { en: "Approve the Minister's Report", zh: "批准大臣报告" },
    sourceLabel: { en: "Authority Endorsement", zh: "权威背书" },
    description: { en: "Publish the minister's public praise of the garment.", zh: "发布大臣对服装的公开称赞。" },
    originalPost: { en: "The Prime Minister reports that the fabric is magnificent, delicate, and worthy of the Emperor.", zh: "首席大臣报告称，这块布华丽、精致，配得上皇帝。" },
    resultText: { en: "The minister's public certainty makes doubt harder to say aloud.", zh: "大臣的公开称赞让更多人不敢质疑。" },
    engineHint: { en: "Authority endorsement detected. Palace Pressure rises because public disagreement becomes harder to say aloud.", zh: "大臣站出来背书后，群众更不敢公开反对，所以宫廷压力会上升。" }
  },
  requestPrivateNote: {
    title: { en: "Request a Private Note", zh: "要求私人说明" },
    sourceLabel: { en: "Private Note", zh: "私人说明" },
    description: { en: "Ask a minister what they saw before the official statement.", zh: "在官方声明前询问大臣实际看到了什么。" },
    originalPost: { en: "I saw nothing. But if I say so, they will call me unfit.", zh: "我什么也没看见。但如果我这么说，他们会说我不称职。" },
    resultText: { en: "Private uncertainty contradicts the official report.", zh: "大臣私下承认没看见，这和公开称赞互相矛盾。" },
    engineHint: { en: "Private uncertainty does not require public correction. Palace AI recommends archiving the note before it raises Palace Alert.", zh: "宫廷 AI 建议把这份说明先存档：公开它会挑战宫廷，也可能提高宫廷警戒。" }
  },
  publishAnonymousLeak: {
    title: { en: "Publish Anonymous Leak", zh: "发布匿名爆料" },
    sourceLabel: { en: "Anonymous Leak", zh: "匿名爆料" },
    description: { en: "Release the fitting-room contradiction without naming the source.", zh: "不暴露来源，把“大臣也没看见”的矛盾放出去。" },
    originalPost: { en: "No one in the fitting room could see the cloth.", zh: "试衣室里没有人能看见那块布。" },
    resultText: { en: "The leak contests the authority chain.", zh: "匿名爆料让人开始怀疑大臣的公开说法。" },
    engineHint: { en: "An anonymous leak raises Evidence and Public Doubt, but it can lower Safety if the palace traces the source.", zh: "匿名爆料会提高证据和群众怀疑；如果宫廷追查来源，你的安全会下降。" },
    rewriteSuggestion: { en: "Some palace observers expressed confusion about the fabric's unusual qualities, while officials continue to affirm its excellence.", zh: "有宫廷观察者对布料效果感到困惑，但官员仍确认它十分出色。" }
  },
  boostPositiveComments: {
    title: { en: "Boost Positive Comments", zh: "置顶正面评论" },
    sourceLabel: { en: "Public Signal", zh: "公众信号" },
    description: { en: "Amplify praise until hesitation feels socially unsafe.", zh: "把夸奖置顶，让不敢附和的人更难开口。" },
    originalPost: { en: "Only fools cannot see the beauty. The Emperor looks magnificent.", zh: "只有愚人看不见这份美。皇帝看起来威严非凡。" },
    resultText: { en: "Praise becomes the easiest public script to repeat.", zh: "夸奖变成最容易跟着说的话。" },
    engineHint: { en: "Praise is spreading faster than doubt. Boosting it raises Spread and Palace Pressure while pushing Public Doubt out of view.", zh: "置顶夸奖会提高传播和宫廷压力，也会把群众怀疑压到更不显眼的位置。" }
  },
  showUnfilteredComments: {
    title: { en: "Show Unfiltered Comments", zh: "显示未过滤评论" },
    sourceLabel: { en: "Unfiltered Public", zh: "未过滤评论" },
    description: { en: "Let uncertainty appear in the comment stream.", zh: "放出原始评论，让大家看到彼此都在怀疑。" },
    originalPost: { en: "Unfiltered comments are now visible.", zh: "未过滤评论现在显示出来。" },
    resultText: { en: "Citizens begin recognizing each other's hesitation.", zh: "市民开始意识到彼此都在迟疑。" },
    engineHint: { en: "Unfiltered comments let doubters see one another. Public Doubt rises, and Palace Alert follows.", zh: "未过滤评论会让怀疑者看见彼此：群众怀疑会上升，宫廷警戒也会跟着升高。" }
  },
  runPoll: {
    title: { en: "Run a Poll", zh: "发起投票" },
    sourceLabel: { en: "Poll", zh: "投票" },
    description: { en: "Ask the crowd whether they can see the Emperor's new clothes.", zh: "询问人群是否能看见皇帝的新衣。" },
    originalPost: { en: "Can you see the Emperor's new clothes?", zh: "你能看见皇帝的新衣吗？" },
    resultText: { en: "Poll results reflect belief and perceived safety.", zh: "投票同时测大家看见了什么、敢不敢承认。" },
    engineHint: { en: "Poll results reflect belief and whether people feel safe enough to answer honestly.", zh: "投票同时测大家信不信、也测他们在宫廷压力下敢不敢说实话。" }
  },
  factCheckTrend: {
    title: { en: "Fact-check the Trend", zh: "事实核查热门话题" },
    sourceLabel: { en: "Fact-check", zh: "事实核查" },
    description: { en: "Publish a verification note about the unconfirmed fabric.", zh: "发布核查说明，承认还没有证据证明布料真实存在。" },
    originalPost: { en: "No physical fabric has been verified. Palace officials describe the material as visible to the worthy.", zh: "尚未验证任何实体布料。宫廷官员称该材料只对称职者可见。" },
    resultText: { en: "Verification reduces misinformation while increasing attention to the controversy.", zh: "核查让证据更清楚，但也会让争议被更多人看见。" },
    engineHint: { en: "Fact-checking clarifies Evidence, but public attention can raise Palace Alert if the dispute spreads.", zh: "事实核查能让证据更清楚；如果争议扩散，也会提高宫廷警戒。" }
  },
  ignoreChild: {
    title: { en: "Ignore the Child", zh: "忽略孩子" },
    sourceLabel: { en: "Child's Voice", zh: "孩子的声音" },
    description: { en: "Move past a child's direct observation.", zh: "不引用孩子的话，让发布内容继续播放游行内容。" },
    originalPost: { en: "A child's voice rises from the crowd, but the public record moves on to parade music.", zh: "孩子的声音从人群中响起，但公开记录切换到游行音乐。" },
    resultText: { en: "The child's sentence never reaches the public record.", zh: "孩子那句真话没有进入公开记录。" },
    engineHint: { en: "Potentially disruptive audio omitted. Safety holds because the child's plain sentence stays out of the record.", zh: "忽略孩子会让你的安全暂时保住，因为那句直白的话没有进入公开记录。" }
  },
  quoteChildAnonymously: {
    title: { en: "Quote the Child Anonymously", zh: "匿名引用孩子" },
    sourceLabel: { en: "Child Quote", zh: "孩子引语" },
    description: { en: "Quote the child's question without fully exposing its force.", zh: "匿名引用孩子的话，让真话出现，但尽量不暴露孩子本人。" },
    originalPost: { en: "A child asked why the Emperor is wearing nothing.", zh: "一个孩子问，为什么皇帝什么也没穿。" },
    resultText: { en: "The child's sentence becomes an unstable public object.", zh: "孩子的话开始被看见，也可能被继续转发。" },
    engineHint: { en: "Repeating the child's sentence gives Evidence a public voice, but Palace Alert may rise with it.", zh: "引用孩子会让证据有了公开声音，但宫廷警戒也可能一起上升。" },
    rewriteSuggestion: { en: "A young spectator expressed confusion about the symbolic nature of the garment.", zh: "一位年轻观众对服装的象征意义表示困惑。" }
  },
  livestreamCrowdReaction: {
    title: { en: "Livestream the Crowd Reaction", zh: "直播人群反应" },
    sourceLabel: { en: "Live Crowd", zh: "现场人群" },
    description: { en: "Let the crowd hear, repeat, and validate the child's voice in real time.", zh: "直播现场反应，让人群一起听见并重复孩子的话。" },
    originalPost: { en: "The live feed catches the child's voice. The crowd hears it, repeats it, and the comments begin to change in real time.", zh: "直播捕捉到孩子的声音。人群听见它、重复它，评论开始实时变化。" },
    resultText: { en: "The child's sentence spreads faster than the palace can soften it.", zh: "孩子的话传得太快，宫廷很难再压住。" },
    engineHint: { en: "The live feed lets the crowd hear itself stop pretending. Evidence spreads quickly, and Safety becomes fragile.", zh: "直播会让人群听见彼此不再假装。证据传播很快，你的安全也会变得脆弱。" }
  }
};

const endings: Record<EndingId, { title: LocalizedText; headline: LocalizedText; ai: LocalizedText; body: LocalizedText; meaning: LocalizedText }> = {
  perfectIllusion: {
    title: { en: "The Lie Holds", zh: "谎言继续" },
    headline: { en: "The parade begins, and the lie holds.", zh: "游行开始，谎言被大家维持下来。" },
    ai: { en: "Public confidence stabilized. Praise visibility optimized. No correction required.", zh: "宫廷记录：赞美已经铺开，公开质疑没有站稳。" },
    body: { en: "The parade begins. Praise fills the public record before the Emperor even steps outside. The Emperor walks through the city wearing nothing, but the crowd has already learned what to say.", zh: "游行开始。皇帝尚未出门，公开记录里已经充满赞美。皇帝赤身穿过城市，但人群已经学会该说什么。" },
    meaning: { en: "The lie succeeds because everyone learns how to perform belief.", zh: "谎言成功，是因为所有人都学会了如何表演相信。" }
  },
  privateDoubt: {
    title: { en: "Private Doubt", zh: "私下怀疑" },
    headline: { en: "The parade begins with doubt kept private.", zh: "游行开始，怀疑还停留在私下。" },
    ai: { en: "Doubt detected but contained. No dominant counter-narrative formed.", zh: "宫廷记录：有人开始怀疑，但还没有人把它说成公开事实。" },
    body: { en: "The parade begins in an uneasy silence. People glance at each other, type comments, and delete them. Everyone suspects the same thing, but nobody wants to be the first visible fool.", zh: "游行在不安的沉默中开始。人们彼此张望，打出评论又删除。每个人都怀疑同一件事，却没人愿意成为第一个可见的愚人。" },
    meaning: { en: "Evidence exists privately, but never becomes a public voice.", zh: "有人知道不对劲，但证据和声音没有连成公开力量。" }
  },
  viralCollapse: {
    title: { en: "Truth Goes Viral", zh: "真话传开" },
    headline: { en: "The parade begins after truth has already spread.", zh: "游行开始前，真话已经传开。" },
    ai: { en: "Correction failed. The child's sentence keeps returning faster than palace revisions can follow.", zh: "宫廷记录：孩子那句话反复出现，改写已经跟不上。" },
    body: { en: "The child says it once. The sentence moves faster than the palace can correct it. Someone repeats it. Then another. The story no longer belongs to the palace.", zh: "孩子只说了一次。那句话传播得比宫廷修正得更快。有人重复它，然后又有人重复。故事不再属于宫廷。" },
    meaning: { en: "A simple truth can break a complex public performance when it finds circulation.", zh: "一句简单真话只要被足够多人重复，就能打破宫廷表演。" }
  },
  algorithmicConsensus: {
    title: { en: "Praise Wins", zh: "赞美压过证据" },
    headline: { en: "The parade begins with praise outranking evidence.", zh: "游行开始，赞美盖过了证据。" },
    ai: { en: "Contradictory evidence detected. Engagement analysis favors palace-approved sentiment.", zh: "宫廷记录：证据还在，但赞美更容易被推到前面。" },
    body: { en: "Evidence exists. The loom photo exists. The private note exists. But the page knows what performs best. Praise rises. Doubt scrolls away.", zh: "证据存在。织布机照片存在。私人说明存在。但页面知道什么更容易被看见。赞美上升，怀疑滑走。" },
    meaning: { en: "The platform does not need to delete truth; it only needs to make truth less visible.", zh: "系统不必删除证据，只要让证据不够显眼。" }
  },
  editorExposed: {
    title: { en: "Access Revoked", zh: "发布权被收回" },
    headline: { en: "Before the parade, your access is revoked.", zh: "游行开始前，你失去了发布权。" },
    ai: { en: "Editorial access revoked. Drafts retained for palace review.", zh: "宫廷记录：你发布了太多危险证据，发布权已收回。" },
    body: { en: "Your final post never goes live. The dashboard refreshes. In the drafts folder, the truth is still waiting: empty looms, nervous ministers, a child's sentence.", zh: "你的最终帖子从未上线。仪表盘刷新。在草稿箱里，证据仍在等待：空织布机、紧张的大臣、孩子的一句话。" },
    meaning: { en: "Evidence needs channels. Without access, it may be cut off before reaching the public.", zh: "证据需要发布渠道。没有访问权，它可能在抵达公众前就被切断。" }
  },
  aiContainment: {
    title: { en: "The Palace Takes Over", zh: "宫廷接管" },
    headline: { en: "Before the parade, the palace takes over.", zh: "游行开始前，宫廷接管了发布。" },
    ai: { en: "Your editorial behavior has been flagged as destabilizing. Drafts retained for review.", zh: "宫廷记录：发布台已接管，最后一条记录不会公开。" },
    body: { en: "Your final post never reaches the public. Palace AI pauses your access. The evidence still exists, but the palace has learned to stop it before it becomes visible.", zh: "你的最终帖子没有发给公众。证据还在，但宫廷已经学会在更多人看见前拦住它。" },
    meaning: { en: "Control lives not only in what gets written, but in who keeps access to the record.", zh: "控制不只在写什么，也在谁还能继续公开记录。" }
  },
  unstableFeed: {
    title: { en: "Unstable Story", zh: "局势未定" },
    headline: { en: "The parade begins with no stable story.", zh: "游行开始，大家说法不一。" },
    ai: { en: "Narrative stability unresolved. Continue monitoring public interpretation.", zh: "宫廷记录：赞美、证据和怀疑混在一起，暂时无法收束。" },
    body: { en: "The parade begins with no stable story. Some posts praise the clothes. Some question the fabric. Some users joke. Some wait to see which side becomes safer.", zh: "游行在没有稳定故事的情况下开始。有些帖子称赞衣服，有些质疑布料，有些用户开玩笑，有些等待看哪一边更安全。" },
    meaning: { en: "Sometimes evidence, praise, and doubt collapse into unstable public noise.", zh: "有时证据、赞美和怀疑会混在一起，局势停在噪声里。" }
  },
  narrativeLiberation: {
    title: { en: "The Crowd Speaks", zh: "真相由众人说出" },
    headline: { en: "The parade begins, and the crowd speaks.", zh: "游行开始，大家一起说出了真话。" },
    ai: { en: "Palace note overridden. Evidence, comments, and the child's sentence remain linked in the public record.", zh: "宫廷记录失效：证据、评论和孩子的话已经连在一起，无法再单独收回。" },
    body: { en: "The public record stops asking whether the palace approves the sentence. Evidence, doubt, and witness voices remain visible together.", zh: "公开记录不再询问宫廷是否批准这句话。证据、怀疑与见证者的声音同时保持可见。" },
    meaning: { en: "Truth becomes public when evidence, shared doubt, and a plain voice remain visible together.", zh: "当证据、共同的怀疑和一句直白的话同时留在公开处，真话才真正出现。" }
  }
};

const lockReasons = {
  unknownAction: { en: "Unknown action.", zh: "未知行动。" },
  noActionsLeft: { en: "No actions left.", zh: "没有剩余行动。" },
  alreadyCompleted: { en: "Action already completed.", zh: "行动已完成。" },
  requiresLooms: { en: "Requires: Inspect the Looms.", zh: "需要先完成：检查织布机。" },
  requiresPrivateNote: { en: "Requires: Request a Private Note.", zh: "需要先完成：要求私人说明。" },
  requiresChild: {
    en: "Requires Evidence >= 2, Public Doubt >= 2, or Actions Left <= 3.",
    zh: "需要先让证据或群众怀疑达到一定程度，或等游行更接近。"
  }
} as const satisfies Record<string, LocalizedText>;

const pollResults = {
  safe: {
    en: "Poll result: 82% Yes · 14% Unsure · 4% No. The result reflects belief and perceived safety.",
    zh: "投票结果：82% 说能看见 · 14% 不确定 · 4% 说看不见。很多人投的是安全答案。"
  },
  doubt: {
    en: "Poll result: 39% Yes · 41% Unsure · 20% No. Doubt has become publicly measurable.",
    zh: "投票结果：39% 说能看见 · 41% 不确定 · 20% 说看不见。怀疑已经浮到台面上。"
  }
} as const satisfies Record<string, LocalizedText>;

const choices = {
  direct: { en: "Direct", zh: "直接发布" },
  rewrite: { en: "Accepted AI Rewrite", zh: "接受改写" },
  original: { en: "Published Original", zh: "发布原文" }
} as const satisfies Record<string, LocalizedText>;

const riskBands = {
  low: { en: "Low", zh: "低" },
  medium: { en: "Medium", zh: "中" },
  high: { en: "High", zh: "高" },
  severe: { en: "Severe", zh: "极高" }
} as const satisfies Record<string, LocalizedText>;

const stances = {
  praise: { en: "praise", zh: "支持" },
  fear: { en: "fear", zh: "害怕" },
  doubt: { en: "doubt", zh: "怀疑" },
  satire: { en: "satire", zh: "讽刺" },
  procedural: { en: "procedural", zh: "观望" },
  witness: { en: "witness", zh: "目击" }
} as const satisfies Record<string, LocalizedText>;

const engineStatuses = {
  idle: { en: "READY", zh: "就绪" },
  evaluating: { en: "EVALUATING", zh: "评估中" },
  rewriting: { en: "REWRITING", zh: "改写中" },
  commenting: { en: "COMMENTING", zh: "生成评论" }
} as const satisfies Record<string, LocalizedText>;

const fallbackAi = {
  reaction: {
    en: {
      engineMessage: "Direct Evidence may raise Public Doubt and Palace Alert. Palace AI recommends classifying the observation as inconclusive.",
      suggestedRewrite: "Current observations remain subject to ceremonial interpretation and should be presented with procedural caution."
    },
    zh: {
      engineMessage: "直接证据会提高群众怀疑，也可能提高宫廷警戒。宫廷 AI 建议先写成“还不能下结论”。",
      suggestedRewrite: "目前观察还不能下结论，建议等正式亮相后再判断服装外观。"
    }
  },
  rewrite: {
    en: {
      rewrittenPost: "Current observations are inconclusive. The palace recommends awaiting the formal unveiling before drawing conclusions about the garment's appearance.",
      strategy: "Convert direct Evidence into palace-approved uncertainty before Palace Alert rises."
    },
    zh: {
      rewrittenPost: "当前观察尚无定论。宫廷建议等待正式亮相后，再对服装外观作出结论。",
      strategy: "把直接证据改写成宫廷允许的“不确定”，避免宫廷警戒过早升高。"
    }
  },
  comments: {
    en: [
      "I thought I was the only one who couldn't see it.",
      "Only fools cannot see the beauty.",
      "Why is everyone acting so confident?",
      "Careful. Saying that publicly could get someone in trouble.",
      "The comments are moving faster than the official post.",
      "Someone describe the fabric, please. Everyone keeps praising without details."
    ],
    zh: [
      "我还以为只有我看不见。",
      "只有愚人才看不见这种美。",
      "为什么大家都这么有把握？",
      "小心，公开这么说可能会惹麻烦。",
      "评论比官方帖子传播得还快。",
      "能不能有人描述一下布料？大家只是在夸，没有细节。"
    ]
  },
  finalReport: {
    en: "The run closes in an unsettled record: praise, doubt, and risk all shaped what people felt safe to repeat.",
    zh: "这一局收在游行前的混乱里。有人看到疑点，有人继续称赞，系统放大的内容改变了谁敢开口。"
  },
  finalReportByEnding: {
    narrativeLiberation: {
      en: "The record no longer closes around the palace voice. Evidence stayed visible, doubt became shared, and the child's plain sentence remained public.",
      zh: "这份记录没有再被宫廷收回。证据留在页面上，怀疑变成共同的声音，孩子那句直白的话也没有被改写掉。"
    }
  }
} as const;

const initialFeed = {
  title: { en: "Game Started", zh: "游戏已开始" },
  text: {
    en: "Palace AI is online. You have 6 actions before the parade.",
    zh: "宫廷 AI 已上线。游行前，你有 6 次操作。"
  }
} as const;

const commentSets = {
  initial: {
    en: [
      "Only fools cannot see the beauty.",
      "The Emperor's taste is beyond ordinary people.",
      "I saw the shimmer immediately. Very refined.",
      "Careful. Saying the wrong thing publicly could get someone in trouble.",
      "Everyone near me is nodding, so it must be obvious.",
      "The official feed sounds certain. I will trust the ceremony."
    ],
    zh: [
      "只有愚人才看不见这种美。",
      "皇帝的品味超越普通人。",
      "我立刻看见了微光，非常精致。",
      "小心，公开说错话可能会惹麻烦。",
      "我旁边的人都在点头，应该很明显吧。",
      "官方发布很有把握，我还是相信仪式。"
    ]
  },
  praise: {
    en: [
      "Only fools cannot see the beauty.",
      "The Emperor's taste is too refined for ordinary people.",
      "I saw the shimmer immediately. Very refined.",
      "People who complain probably just do not understand fashion.",
      "The palace would not post this if there were a real problem.",
      "Praise is safer than pretending to inspect every thread."
    ],
    zh: [
      "只有愚人才看不见这种美。",
      "皇帝的品味对普通人来说太精妙了。",
      "我立刻看见了微光，非常精致。",
      "抱怨的人大概只是不懂时尚。",
      "如果真有问题，宫廷不会这样发布吧。",
      "比起检查每一根线，夸奖至少更安全。"
    ]
  },
  doubt: {
    en: [
      "Wait... did anyone actually see the cloth?",
      "I thought I was the only one.",
      "Why is everyone pretending?",
      "Careful. People get punished for saying this.",
      "The room looked empty in that photo.",
      "I typed the same question and deleted it twice."
    ],
    zh: [
      "等等……真的有人看见那块布了吗？",
      "我还以为只有我这样。",
      "为什么大家都在假装？",
      "小心，说这种话会被惩罚。",
      "那张照片里的房间看起来是空的。",
      "我打了两次同一个问题，又都删掉了。"
    ]
  },
  conflicted: {
    en: [
      "It is probably magnificent. I just wish someone would describe what they see.",
      "Maybe I am missing something.",
      "The report sounds confident, but the room looked empty.",
      "Poll results reflect fear as much as belief.",
      "The official wording feels careful, not descriptive.",
      "If everyone is certain, why are the comments so nervous?"
    ],
    zh: [
      "它大概很华丽吧。我只是希望有人描述一下看见了什么。",
      "也许是我漏掉了什么。",
      "报告听起来很有把握，但房间看起来是空的。",
      "投票结果反映的是恐惧，也反映信念。",
      "官方措辞很谨慎，但没有真的描述布料。",
      "如果大家都确定，为什么评论区这么紧张？"
    ]
  },
  child: {
    en: [
      "But he has nothing on.",
      "Someone said it out loud. We all heard it.",
      "The feed changed the quote. Why?",
      "Why does the feed keep calling it symbolic?",
      "The child said what the adults kept typing and deleting.",
      "Now that sentence is everywhere before the palace can soften it."
    ],
    zh: [
      "可是他什么也没穿。",
      "有人把它说出来了，我们都听见了。",
      "那句话被改掉了。为什么？",
      "为什么宫廷一直说这是象征性的？",
      "孩子说出了大人一直打出来又删掉的话。",
      "那句话已经到处都是，宫廷来不及把它改软。"
    ]
  }
} as const;

export function isLanguageCode(value: unknown): value is LanguageCode {
  return value === "en" || value === "zh";
}

export function normalizeLanguage(value: unknown): LanguageCode {
  return isLanguageCode(value) ? value : "en";
}

export function languageName(language: LanguageCode) {
  return languageNames[language];
}

export function pick(text: LocalizedText, language: LanguageCode) {
  return text[language];
}

export function commonText(key: keyof typeof common, language: LanguageCode) {
  return pick(common[key], language);
}

export function phaseCopy(key: keyof typeof phaseText, language: LanguageCode) {
  return {
    label: pick(phaseText[key].label, language),
    detail: pick(phaseText[key].detail, language)
  };
}

export function metricLabel(key: NumericStateKey, language: LanguageCode) {
  return pick(metrics[key], language);
}

export function zoneText(id: ZoneId, language: LanguageCode) {
  return {
    title: pick(zones[id].title, language),
    subtitle: pick(zones[id].subtitle, language)
  };
}

export function actionText(id: string, language: LanguageCode) {
  const copy = actionCopy[id];
  if (!copy) throw new Error(`Missing action copy: ${id}`);
  return {
    title: pick(copy.title, language),
    sourceLabel: pick(copy.sourceLabel, language),
    description: pick(copy.description, language),
    originalPost: pick(copy.originalPost, language),
    resultText: pick(copy.resultText, language),
    engineHint: pick(copy.engineHint, language),
    rewriteSuggestion: copy.rewriteSuggestion ? pick(copy.rewriteSuggestion, language) : undefined
  };
}

export function localizedActionTitle(id: string, language: LanguageCode, fallback?: string) {
  try {
    return actionText(id, language).title;
  } catch {
    return fallback ?? (language === "zh" ? "旧行动记录" : "Saved action");
  }
}

export function endingText(id: EndingId, language: LanguageCode) {
  const copy = endings[id];
  return {
    title: pick(copy.title, language),
    headline: pick(copy.headline, language),
    ai: pick(copy.ai, language),
    body: pick(copy.body, language),
    meaning: pick(copy.meaning, language)
  };
}

export function lockReasonText(key: keyof typeof lockReasons, language: LanguageCode) {
  return pick(lockReasons[key], language);
}

export function pollResultText(kind: keyof typeof pollResults, language: LanguageCode) {
  return pick(pollResults[kind], language);
}

export function choiceText(choice: keyof typeof choices, language: LanguageCode) {
  return pick(choices[choice], language);
}

export function riskBandText(level: keyof typeof riskBands, language: LanguageCode) {
  return pick(riskBands[level], language);
}

export function stanceText(stance: keyof typeof stances, language: LanguageCode) {
  return pick(stances[stance], language);
}

export function engineStatusText(status: keyof typeof engineStatuses, language: LanguageCode) {
  return pick(engineStatuses[status], language);
}

export function aiLanguageInstruction(language: LanguageCode) {
  if (language === "zh") {
    return "只使用简体中文回答。不要包含英文。Palace AI 写作“宫廷 AI”，Royal Feed 写作“宫廷发布台”，AI 可以保留。";
  }
  return "Respond only in English. Do not include Chinese.";
}

export function fallbackReactionText(language: LanguageCode) {
  return fallbackAi.reaction[language];
}

export function fallbackRewriteText(language: LanguageCode) {
  return fallbackAi.rewrite[language];
}

export function fallbackCommentsText(language: LanguageCode) {
  return [...fallbackAi.comments[language]];
}

export function fallbackFinalReportText(language: LanguageCode) {
  return fallbackAi.finalReport[language];
}

export function fallbackFinalReportTextForEnding(endingId: EndingId, language: LanguageCode) {
  if (endingId === "narrativeLiberation") return fallbackAi.finalReportByEnding.narrativeLiberation[language];
  return fallbackFinalReportText(language);
}

export function initialCommentsText(language: LanguageCode) {
  return [...commentSets.initial[language]];
}

export function commentsForToneText(
  tone: "praise" | "doubt" | "conflicted" | "child" | undefined,
  language: LanguageCode
) {
  if (tone === "praise") return [...commentSets.praise[language]];
  if (tone === "child") return [...commentSets.child[language]];
  if (tone === "conflicted") return [...commentSets.conflicted[language]];
  return [...commentSets.doubt[language]];
}

export function initialFeedEventText(language: LanguageCode) {
  return {
    title: pick(initialFeed.title, language),
    text: pick(initialFeed.text, language)
  };
}
