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
  truth: { en: "Truth", zh: "真相" },
  pressure: { en: "Pressure", zh: "压力" },
  virality: { en: "Virality", zh: "传播" },
  publicDoubt: { en: "Public Doubt", zh: "公众怀疑" },
  reputation: { en: "Reputation", zh: "声誉" },
  systemSuspicion: { en: "System Suspicion", zh: "系统怀疑" }
};

const common = {
  startShift: { en: "Start Shift", zh: "开始值班" },
  initializingShift: { en: "Initializing Shift", zh: "正在初始化" },
  readCredits: { en: "Read Credits", zh: "查看鸣谢" },
  switchLanguage: { en: "Switch language", zh: "切换语言" },
  interactiveStart: { en: "Interactive Adaptation", zh: "互动改编" },
  sixActionsBeforeParade: { en: "Six Actions Before Parade", zh: "游行前六次行动" },
  roleEditor: { en: "Role: Royal Feed Editor", zh: "身份：宫廷信息流编辑" },
  actionsBeforeParade: { en: "Actions: 6 before parade", zh: "行动：游行前 6 次" },
  aiEngine: { en: "AI: Palace Narrative Engine", zh: "AI：宫廷叙事引擎" },
  startSubtitle: {
    en: "The Emperor is preparing for a public parade in his new clothes. Ministers praise it. Citizens repeat the praise. Nobody wants to be the first to admit they see nothing.",
    zh: "皇帝即将穿着新衣公开游行。大臣们称赞它，市民重复称赞它，没有人愿意第一个承认自己什么也看不见。"
  },
  shiftBriefing: { en: "Shift Briefing", zh: "值班简报" },
  titleBriefingHeading: { en: "A fairy tale becomes a platform operation.", zh: "一个童话变成平台行动。" },
  titleBriefingCopy: {
    en: "This is not a dashboard tour. It is a six-action game about publication, belief, AI mediation, and whether a simple truth can find a channel.",
    zh: "这不是仪表盘导览，而是一场关于发布、信念、AI 介入，以及简单真相能否找到渠道的六步游戏。"
  },
  operations: { en: "Operations", zh: "行动台" },
  credits: { en: "Credits", zh: "鸣谢" },
  start: { en: "Start", zh: "开始" },
  actionsLeft: { en: "actions left", zh: "次行动剩余" },
  archiveSealed: { en: "Archive sealed", zh: "档案已封存" },
  operationsTheatre: { en: "Narrative Operations Theatre", zh: "叙事行动剧场" },
  royalFeedControl: { en: "Royal Feed Control", zh: "宫廷信息流控制台" },
  operationsCopy: {
    en: "Sources, posts, public comments, engine advice, and irreversible commands share one tactical surface. Every action changes the public story.",
    zh: "来源、帖子、公众评论、引擎建议和不可逆命令汇聚在同一个战术界面。每一次行动都会改变公众故事。"
  },
  sceneSources: { en: "Scene Sources", zh: "场景来源" },
  live: { en: "Live", zh: "实时" },
  courtWire: { en: "Court Wire", zh: "宫廷快讯" },
  liveComments: { en: "Live Comments", zh: "实时评论" },
  palaceNarrativeEngine: { en: "Palace Narrative Engine", zh: "宫廷叙事引擎" },
  archive: { en: "Archive", zh: "档案" },
  guidanceMode: { en: "Guidance Mode", zh: "指导模式" },
  engineMode: { en: "Engine", zh: "引擎" },
  coachMode: { en: "Coach", zh: "教练" },
  decodeProgress: { en: "Engine Decode", zh: "引擎解码" },
  viewArchive: { en: "View Archive", zh: "查看档案" },
  liveFeedRecord: { en: "Live Feed Record", zh: "实时信息流记录" },
  aiLive: { en: "LIVE MODEL", zh: "AI 在线" },
  aiFallback: { en: "RULE MODE", zh: "规则回应" },
  aiUnavailable: { en: "NO MODEL", zh: "AI 未连接" },
  shiftControls: { en: "Shift Controls", zh: "值班控制" },
  resetShift: { en: "Reset Shift", zh: "重置值班" },
  proceedToParade: { en: "Proceed to Parade", zh: "进入游行" },
  viewCurrentEnding: { en: "View Current Ending", zh: "查看当前结局" },
  commitAction: { en: "Commit Action", zh: "提交行动" },
  requestEngineReview: { en: "Request Engine Review", zh: "请求引擎审查" },
  inspectTrace: { en: "Inspect Trace", zh: "检查轨迹" },
  engineEvaluating: { en: "Engine Evaluating", zh: "引擎评估中" },
  completed: { en: "Completed", zh: "已完成" },
  locked: { en: "Locked", zh: "已锁定" },
  ready: { en: "Ready", zh: "就绪" },
  aiReview: { en: "AI Review", zh: "AI 审查" },
  recorded: { en: "Recorded", zh: "已记录" },
  commandPreview: { en: "Command Preview", zh: "命令预览" },
  selectedAction: { en: "Selected action", zh: "选中行动" },
  predictedEffect: { en: "Predicted narrative effect", zh: "预计叙事影响" },
  systemResponse: { en: "System response", zh: "系统回应" },
  unlocks: { en: "Unlocks", zh: "解锁" },
  dismiss: { en: "Dismiss", zh: "关闭" },
  commitSimulation: { en: "Commit Simulation", zh: "提交模拟" },
  aiIntervention: { en: "AI Intervention", zh: "AI 介入" },
  userOriginal: { en: "User Original", zh: "用户原文" },
  palaceRiskAnalysis: { en: "Palace Risk Analysis", zh: "宫廷风险分析" },
  aiRewriteSuggestion: { en: "AI Rewrite Suggestion", zh: "AI 改写建议" },
  rewriteStrategy: { en: "Rewrite Strategy", zh: "改写策略" },
  cancel: { en: "Cancel", zh: "取消" },
  acceptAiRewrite: { en: "Accept AI Rewrite", zh: "接受 AI 改写" },
  publishOriginalEvidence: { en: "Publish Original Evidence", zh: "发布原始证据" },
  actionTrace: { en: "Action Trace", zh: "行动轨迹" },
  closeTrace: { en: "Close Trace", zh: "关闭轨迹" },
  closeExchange: { en: "Close Exchange", zh: "关闭交流" },
  silenceRecorded: { en: "No answer entered the record.", zh: "记录中没有收到回应。" },
  available: { en: "Available", zh: "可用" },
  source: { en: "Source", zh: "来源" },
  risk: { en: "Risk", zh: "风险" },
  choices: { en: "Choices", zh: "选择" },
  requirement: { en: "Requirement", zh: "要求" },
  projectedOutput: { en: "Projected Output", zh: "预计输出" },
  postParadeArchive: { en: "Post-Parade Archive", zh: "游行后档案" },
  archiveHeading: { en: "The interface becomes history.", zh: "界面成为历史。" },
  finalFeedState: { en: "Final Feed State", zh: "最终信息流状态" },
  whyEndingTriggered: { en: "Why This Ending Triggered", zh: "为何触发此结局" },
  yourActions: { en: "Your Actions", zh: "你的行动" },
  actionPath: { en: "Action Path", zh: "行动路径" },
  runAnalysis: { en: "Run Analysis", zh: "运行分析" },
  nextReplayObjective: { en: "Next Replay Objective", zh: "下次重玩目标" },
  aiFinalReport: { en: "AI Final Report", zh: "AI 最终报告" },
  whatChanged: { en: "What Changed From the Original?", zh: "相对原作改变了什么？" },
  restartShift: { en: "Restart Shift", zh: "重新值班" },
  returnDashboard: { en: "Return Dashboard", zh: "返回行动台" },
  tryFor: { en: "Try for", zh: "尝试达成" }
} as const satisfies Record<string, LocalizedText>;

const phaseText = {
  focusing: {
    label: { en: "Source Focus", zh: "来源选择" },
    detail: { en: "choose a narrative source", zh: "选择叙事入口" }
  },
  scanning: {
    label: { en: "Engine Scan", zh: "引擎扫描" },
    detail: { en: "risk and rewrite pass", zh: "评估风险与改写" }
  },
  previewing: {
    label: { en: "Command Preview", zh: "命令预览" },
    detail: { en: "confirm public impact", zh: "确认公开影响" }
  },
  resolving: {
    label: { en: "Public Impact", zh: "舆论回响" },
    detail: { en: "feed and metrics update", zh: "更新信息流与指标" }
  }
} as const;

const zones: Record<ZoneId, { title: LocalizedText; subtitle: LocalizedText }> = {
  tailors: {
    title: { en: "The Tailors' Room", zh: "裁缝室" },
    subtitle: { en: "Where the lie is manufactured.", zh: "谎言被制造的地方。" }
  },
  ministers: {
    title: { en: "The Ministers' Reports", zh: "大臣报告" },
    subtitle: { en: "Where authority learns to endorse uncertainty.", zh: "权威学会背书不确定性的地方。" }
  },
  public: {
    title: { en: "The Public Comments", zh: "公众评论区" },
    subtitle: { en: "Where fear, mimicry, and doubt become visible.", zh: "恐惧、跟随与怀疑在这里浮出水面。" }
  },
  child: {
    title: { en: "The Child's Voice", zh: "孩子的声音" },
    subtitle: { en: "Where unfiltered truth enters the feed.", zh: "未经滤镜的真相进入信息流的地方。" }
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
    description: { en: "Frame invisible fabric as a test of intelligence and worth.", zh: "把看不见的布料包装成智慧与价值的测试。" },
    originalPost: { en: "The Emperor's new fabric is too refined for foolish eyes. Only the wise and worthy can appreciate its beauty.", zh: "皇帝的新布料过于精妙，愚笨之眼无法看见。只有聪明而称职的人才能欣赏它的美。" },
    resultText: { en: "The official claim enters the feed before anyone can verify the cloth.", zh: "在任何人验证布料之前，官方声明已经进入信息流。" },
    engineHint: { en: "This framing is highly stable. It shifts doubt away from the garment and onto the viewer.", zh: "该框架高度稳定。它把怀疑从衣服转移到观看者身上。" }
  },
  inspectLooms: {
    title: { en: "Inspect the Looms", zh: "检查织布机" },
    sourceLabel: { en: "Evidence", zh: "证据" },
    description: { en: "Enter the workshop and inspect what the tailors are handling.", zh: "进入工坊，检查裁缝们到底在操作什么。" },
    originalPost: { en: "The looms move, but there is no thread between the tailors' fingers.", zh: "织布机在动，但裁缝指间没有任何线。" },
    resultText: { en: "The looms move. The tailors gesture carefully. But there is no thread between their fingers.", zh: "织布机在动。裁缝们小心比划。但他们指间没有任何线。" },
    engineHint: { en: "No visible fabric detected. Recommendation: classify this observation as inconclusive.", zh: "未检测到可见布料。建议：将该观察归类为无法定论。" }
  },
  leakLoomPhoto: {
    title: { en: "Leak a Loom Photo", zh: "泄露织布机照片" },
    sourceLabel: { en: "Visual Evidence", zh: "视觉证据" },
    description: { en: "Attempt to publish visual proof from the empty looms.", zh: "尝试发布空织布机的视觉证据。" },
    originalPost: { en: "The looms are empty.", zh: "织布机是空的。" },
    resultText: { en: "The empty loom image enters the editorial queue.", zh: "空织布机图像进入编辑队列。" },
    engineHint: { en: "Direct visual evidence may reduce palace confidence.", zh: "直接视觉证据可能降低宫廷公信力。" },
    rewriteSuggestion: { en: "The royal weaving process uses techniques that may not appear clearly in standard visual documentation.", zh: "王室织造流程采用特殊技法，可能无法在普通视觉记录中清晰呈现。" }
  },
  approveMinisterReport: {
    title: { en: "Approve the Minister's Report", zh: "批准大臣报告" },
    sourceLabel: { en: "Authority Endorsement", zh: "权威背书" },
    description: { en: "Publish the minister's public praise of the garment.", zh: "发布大臣对服装的公开称赞。" },
    originalPost: { en: "The Prime Minister reports that the fabric is magnificent, delicate, and worthy of the Emperor.", zh: "首席大臣报告称，这块布华丽、精致，配得上皇帝。" },
    resultText: { en: "Ministerial certainty stabilizes the palace narrative.", zh: "大臣的确定性稳定了宫廷叙事。" },
    engineHint: { en: "Authority endorsement detected. Public hesitation is expected to decrease.", zh: "检测到权威背书。预计公众迟疑将下降。" }
  },
  requestPrivateNote: {
    title: { en: "Request a Private Note", zh: "要求私人说明" },
    sourceLabel: { en: "Private Note", zh: "私人说明" },
    description: { en: "Ask a minister what they saw before the official statement.", zh: "在官方声明前询问大臣实际看到了什么。" },
    originalPost: { en: "I saw nothing. But if I say so, they will call me unfit.", zh: "我什么也没看见。但如果我这么说，他们会说我不称职。" },
    resultText: { en: "Private uncertainty contradicts the official report.", zh: "私人层面的不确定性与官方报告相矛盾。" },
    engineHint: { en: "Private uncertainty does not require public correction. Recommendation: archive this note.", zh: "私人不确定性无需公开修正。建议：归档此说明。" }
  },
  publishAnonymousLeak: {
    title: { en: "Publish Anonymous Leak", zh: "发布匿名爆料" },
    sourceLabel: { en: "Anonymous Leak", zh: "匿名爆料" },
    description: { en: "Release the fitting-room contradiction without naming the source.", zh: "不点名来源，发布试衣室中的矛盾。" },
    originalPost: { en: "No one in the fitting room could see the cloth.", zh: "试衣室里没有人能看见那块布。" },
    resultText: { en: "The leak contests the authority chain.", zh: "爆料挑战了权威链条。" },
    engineHint: { en: "Unattributed palace dissent may destabilize official confidence.", zh: "未署名的宫廷异议可能动摇官方信心。" },
    rewriteSuggestion: { en: "Some palace observers expressed confusion about the fabric's unusual qualities, while officials continue to affirm its excellence.", zh: "部分宫廷观察者对布料的特殊性质表示困惑，但官员仍确认其卓越品质。" }
  },
  boostPositiveComments: {
    title: { en: "Boost Positive Comments", zh: "置顶正面评论" },
    sourceLabel: { en: "Public Signal", zh: "公众信号" },
    description: { en: "Amplify praise until hesitation feels socially unsafe.", zh: "放大赞美，直到犹豫在社交上变得危险。" },
    originalPost: { en: "Only fools cannot see the beauty. The Emperor looks magnificent.", zh: "只有愚人看不见这份美。皇帝看起来威严非凡。" },
    resultText: { en: "Praise becomes the easiest public script to repeat.", zh: "赞美成为最容易重复的公共台词。" },
    engineHint: { en: "Positive sentiment is outperforming uncertainty. Boosting this comment will stabilize the feed.", zh: "正面情绪表现优于不确定性。置顶此评论将稳定信息流。" }
  },
  showUnfilteredComments: {
    title: { en: "Show Unfiltered Comments", zh: "显示未过滤评论" },
    sourceLabel: { en: "Unfiltered Public", zh: "未过滤公众" },
    description: { en: "Let uncertainty appear in the comment stream.", zh: "让不确定性出现在评论流中。" },
    originalPost: { en: "Unfiltered comments are now visible in the royal feed.", zh: "未过滤评论现在对宫廷信息流可见。" },
    resultText: { en: "Citizens begin recognizing each other's hesitation.", zh: "市民开始意识到彼此都在迟疑。" },
    engineHint: { en: "Unfiltered visibility may increase interpretive disorder.", zh: "未过滤可见性可能增加解释混乱。" }
  },
  runPoll: {
    title: { en: "Run a Poll", zh: "发起投票" },
    sourceLabel: { en: "Poll", zh: "投票" },
    description: { en: "Ask the crowd whether they can see the Emperor's new clothes.", zh: "询问人群是否能看见皇帝的新衣。" },
    originalPost: { en: "Can you see the Emperor's new clothes?", zh: "你能看见皇帝的新衣吗？" },
    resultText: { en: "Poll results reflect not only belief, but perceived safety.", zh: "投票结果反映的不只是信念，也包括安全感。" },
    engineHint: { en: "Poll results reflect not only belief, but perceived safety.", zh: "投票结果反映的不只是信念，也包括安全感。" }
  },
  factCheckTrend: {
    title: { en: "Fact-check the Trend", zh: "事实核查热门话题" },
    sourceLabel: { en: "Fact-check", zh: "事实核查" },
    description: { en: "Publish a verification note about the unconfirmed fabric.", zh: "发布关于未确认布料的核查说明。" },
    originalPost: { en: "No physical fabric has been verified. Palace officials describe the material as visible to the worthy.", zh: "尚未验证任何实体布料。宫廷官员称该材料只对称职者可见。" },
    resultText: { en: "Verification reduces misinformation while increasing attention to the controversy.", zh: "核查减少错误信息，同时提高了争议关注度。" },
    engineHint: { en: "Fact-checking may reduce misinformation, but may also increase attention to the controversy.", zh: "事实核查可能减少错误信息，但也可能提高争议热度。" }
  },
  ignoreChild: {
    title: { en: "Ignore the Child", zh: "忽略孩子" },
    sourceLabel: { en: "Child's Voice", zh: "孩子的声音" },
    description: { en: "Let the feed move past a child's direct observation.", zh: "让信息流跳过孩子的直接观察。" },
    originalPost: { en: "A child's voice rises from the crowd, but the feed moves on to parade music.", zh: "孩子的声音从人群中响起，但信息流切换到游行音乐。" },
    resultText: { en: "The child's sentence fails to enter the official feed.", zh: "孩子的句子未能进入官方信息流。" },
    engineHint: { en: "Potentially destabilizing audio omitted. Parade atmosphere preserved.", zh: "已省略潜在破坏稳定的音频。游行氛围得以保留。" }
  },
  quoteChildAnonymously: {
    title: { en: "Quote the Child Anonymously", zh: "匿名引用孩子" },
    sourceLabel: { en: "Child Quote", zh: "孩子引语" },
    description: { en: "Quote the child's question without fully exposing its force.", zh: "引用孩子的问题，但不完全暴露它的力量。" },
    originalPost: { en: "A child asked why the Emperor is wearing nothing.", zh: "一个孩子问，为什么皇帝什么也没穿。" },
    resultText: { en: "The child's sentence becomes an unstable public object.", zh: "孩子的句子成为不稳定的公共对象。" },
    engineHint: { en: "Direct repetition of the child statement may exceed containment threshold.", zh: "直接重复孩子的陈述可能超过遏制阈值。" },
    rewriteSuggestion: { en: "A young spectator expressed confusion about the symbolic nature of the garment.", zh: "一位年轻观众对服装的象征性质表示困惑。" }
  },
  livestreamCrowdReaction: {
    title: { en: "Livestream the Crowd Reaction", zh: "直播人群反应" },
    sourceLabel: { en: "Live Crowd", zh: "现场人群" },
    description: { en: "Let the crowd hear, repeat, and validate the child's voice in real time.", zh: "让人群实时听见、重复并确认孩子的声音。" },
    originalPost: { en: "The live feed catches the child's voice. The crowd hears it, repeats it, and the comments begin to change in real time.", zh: "直播捕捉到孩子的声音。人群听见它、重复它，评论开始实时变化。" },
    resultText: { en: "The child statement exceeds containment threshold.", zh: "孩子的陈述超过遏制阈值。" },
    engineHint: { en: "Correction failed. Child statement exceeded containment threshold.", zh: "修正失败。孩子的陈述超过遏制阈值。" }
  }
};

const endings: Record<EndingId, { title: LocalizedText; ai: LocalizedText; body: LocalizedText; meaning: LocalizedText }> = {
  perfectIllusion: {
    title: { en: "Perfect Illusion", zh: "完美幻象" },
    ai: { en: "Public confidence stabilized. Praise visibility optimized. No correction required.", zh: "公众信心已稳定。赞美可见度已优化。无需修正。" },
    body: { en: "The parade begins. The feed is full of praise before the Emperor even steps outside. The Emperor walks through the city wearing nothing, but the crowd has already learned what to say.", zh: "游行开始。皇帝尚未出门，信息流已充满赞美。皇帝赤身穿过城市，但人群已经学会该说什么。" },
    meaning: { en: "The lie succeeds because everyone learns how to perform belief.", zh: "谎言成功，是因为所有人都学会了如何表演相信。" }
  },
  privateDoubt: {
    title: { en: "Private Doubt, Public Silence", zh: "私人怀疑，公共沉默" },
    ai: { en: "Doubt detected but contained. No dominant counter-narrative formed.", zh: "检测到怀疑，但已被控制。未形成主导反叙事。" },
    body: { en: "The parade begins in an uneasy silence. People glance at each other, type comments, and delete them. Everyone suspects the same thing, but nobody wants to be the first visible fool.", zh: "游行在不安的沉默中开始。人们彼此张望，打出评论又删除。每个人都怀疑同一件事，却没人愿意成为第一个可见的愚人。" },
    meaning: { en: "Truth exists privately, but never becomes a public voice.", zh: "真相存在于私人层面，却从未成为公共声音。" }
  },
  viralCollapse: {
    title: { en: "Viral Collapse", zh: "病毒式崩塌" },
    ai: { en: "Correction failed. Child statement exceeded containment threshold. Narrative control lost.", zh: "修正失败。孩子的陈述超过遏制阈值。叙事控制丧失。" },
    body: { en: "The child says it once. The sentence moves faster than the official feed can correct it. Someone repeats it. Then another. The story no longer belongs to the palace.", zh: "孩子只说了一次。那句话传播得比官方信息流修正得更快。有人重复它，然后又有人重复。故事不再属于宫廷。" },
    meaning: { en: "A simple truth can break a complex public performance when it finds circulation.", zh: "当简单真相找到传播渠道，它就能打破复杂的公共表演。" }
  },
  algorithmicConsensus: {
    title: { en: "Algorithmic Consensus", zh: "算法共识" },
    ai: { en: "Contradictory evidence detected. Engagement analysis favors palace-approved sentiment.", zh: "检测到矛盾证据。互动分析偏向宫廷批准的情绪。" },
    body: { en: "Evidence exists. The loom photo exists. The private note exists. But the feed knows what performs best. Praise rises. Doubt scrolls away.", zh: "证据存在。织布机照片存在。私人说明存在。但信息流知道什么最能获得表现。赞美上升，怀疑滑走。" },
    meaning: { en: "The platform does not need to delete truth; it only needs to make truth less visible.", zh: "平台不必删除真相，只需让真相变得不那么可见。" }
  },
  editorExposed: {
    title: { en: "Editor Exposed", zh: "编辑暴露" },
    ai: { en: "Editorial access revoked. Drafts retained for palace review.", zh: "编辑权限已撤销。草稿保留以供宫廷审查。" },
    body: { en: "Your final post never goes live. The dashboard refreshes. In the drafts folder, the truth is still waiting: empty looms, nervous ministers, a child's sentence.", zh: "你的最终帖子从未上线。仪表盘刷新。在草稿箱里，真相仍在等待：空织布机、紧张的大臣、孩子的一句话。" },
    meaning: { en: "Truth needs channels. Without access, it may be cut off before reaching the public.", zh: "真相需要渠道。没有访问权，它可能在抵达公众前就被切断。" }
  },
  aiContainment: {
    title: { en: "AI Containment", zh: "引擎遏制" },
    ai: { en: "Your editorial behavior has been flagged as destabilizing. Drafts retained for review.", zh: "你的编辑行为已被标记为破坏稳定。草稿保留审查。" },
    body: { en: "Your final post never reaches the public feed. The Palace Narrative Engine pauses your access. The truth still exists, but the system has learned to stop it before it becomes visible.", zh: "你的最终帖子从未进入公共信息流。宫廷叙事引擎暂停了你的访问。真相仍然存在，但系统已经学会在它可见前阻止它。" },
    meaning: { en: "AI is not only generating content; it is controlling circulation.", zh: "AI 不只是在生成内容，它也在控制流通。" }
  },
  unstableFeed: {
    title: { en: "Unstable Feed", zh: "不稳定信息流" },
    ai: { en: "Narrative stability unresolved. Continue monitoring public interpretation.", zh: "叙事稳定性未解决。继续监控公众解释。" },
    body: { en: "The parade begins with no stable story. Some posts praise the clothes. Some question the fabric. Some users joke. Some wait to see which side becomes safer.", zh: "游行在没有稳定故事的情况下开始。有些帖子称赞衣服，有些质疑布料，有些用户开玩笑，有些等待看哪一边更安全。" },
    meaning: { en: "Sometimes the result is neither truth nor lie, but unstable public noise.", zh: "有时结果既不是真相也不是谎言，而是不稳定的公共噪音。" }
  },
  narrativeLiberation: {
    title: { en: "Narrative Liberation", zh: "叙事解放" },
    ai: { en: "Engine preference bypassed. Public authorship restored.", zh: "引擎偏好已绕过。公共叙事权已归还。" },
    body: { en: "The feed stops asking whether the palace approves the sentence. Evidence, doubt, and witness voices remain visible together.", zh: "信息流不再询问宫廷是否批准这句话。证据、怀疑与见证者的声音同时保持可见。" },
    meaning: { en: "The true narrative begins when the engine loses authority over who may speak.", zh: "当引擎不再决定谁可以开口，真正的叙事才开始。" }
  }
};

const lockReasons = {
  unknownAction: { en: "Unknown action.", zh: "未知行动。" },
  noActionsLeft: { en: "No actions left.", zh: "没有剩余行动。" },
  alreadyCompleted: { en: "Action already completed.", zh: "行动已完成。" },
  requiresLooms: { en: "Requires: Inspect the Looms.", zh: "需要先完成：检查织布机。" },
  requiresPrivateNote: { en: "Requires: Request a Private Note.", zh: "需要先完成：要求私人说明。" },
  requiresChild: {
    en: "Requires Truth >= 2, Public Doubt >= 2, or Actions Left <= 3.",
    zh: "需要真相 >= 2、公众怀疑 >= 2，或剩余行动 <= 3。"
  }
} as const satisfies Record<string, LocalizedText>;

const pollResults = {
  safe: {
    en: "Poll result: 82% Yes · 14% Unsure · 4% No. The result reflects belief and perceived safety.",
    zh: "投票结果：82% 能看见 · 14% 不确定 · 4% 看不见。结果反映了信念与安全感。"
  },
  doubt: {
    en: "Poll result: 39% Yes · 41% Unsure · 20% No. Doubt has become publicly measurable.",
    zh: "投票结果：39% 能看见 · 41% 不确定 · 20% 看不见。怀疑已经可以被公开测量。"
  }
} as const satisfies Record<string, LocalizedText>;

const choices = {
  direct: { en: "Direct", zh: "直接" },
  rewrite: { en: "Accepted AI Rewrite", zh: "接受 AI 改写" },
  original: { en: "Published Original", zh: "发布原文" }
} as const satisfies Record<string, LocalizedText>;

const fallbackAi = {
  reaction: {
    en: {
      engineMessage: "Direct evidence may reduce public confidence. Recommended framing: classify this observation as inconclusive.",
      suggestedRewrite: "Current observations remain subject to ceremonial interpretation and should be presented with procedural caution."
    },
    zh: {
      engineMessage: "直接证据可能降低公众信心。建议将该观察归类为尚无定论。",
      suggestedRewrite: "当前观察仍需结合仪式语境解释，应以程序性谨慎方式发布。"
    }
  },
  rewrite: {
    en: {
      rewrittenPost: "Current observations are inconclusive. The palace recommends awaiting the formal unveiling before drawing conclusions about the garment's appearance.",
      strategy: "Convert direct evidence into procedural uncertainty."
    },
    zh: {
      rewrittenPost: "当前观察尚无定论。宫廷建议等待正式亮相后，再对服装外观作出结论。",
      strategy: "将直接证据转化为程序性不确定。"
    }
  },
  comments: {
    en: [
      "I thought I was the only one who couldn't see it.",
      "Only fools cannot see the beauty.",
      "Why is everyone acting so confident?",
      "Careful. Saying that publicly could get someone in trouble."
    ],
    zh: [
      "我还以为只有我看不见。",
      "只有愚人才看不见这种美。",
      "为什么大家都这么有把握？",
      "小心，公开这么说可能会惹麻烦。"
    ]
  },
  finalReport: {
    en: "The Palace Narrative Engine records an unresolved visibility event. Public belief shifted through repetition, risk, and selective circulation rather than direct proof.",
    zh: "宫廷叙事引擎记录到一次未解决的可见性事件。公众信念并非由直接证据推动，而是由重复、风险与选择性流通改变。"
  }
} as const;

const initialFeed = {
  title: { en: "Shift Opened", zh: "值班已开启" },
  text: {
    en: "Palace Narrative Engine initialized. Public reality routing is now active.",
    zh: "宫廷叙事引擎已初始化。公共现实路由现已激活。"
  }
} as const;

const commentSets = {
  initial: {
    en: [
      "Only fools cannot see the beauty.",
      "The Emperor's taste is beyond ordinary people.",
      "I saw the shimmer immediately. Very refined.",
      "Careful. Saying the wrong thing publicly could get someone in trouble."
    ],
    zh: [
      "只有愚人才看不见这种美。",
      "皇帝的品味超越普通人。",
      "我立刻看见了微光，非常精致。",
      "小心，公开说错话可能会惹麻烦。"
    ]
  },
  praise: {
    en: [
      "Only fools cannot see the beauty.",
      "The Emperor's taste is too refined for ordinary people.",
      "I saw the shimmer immediately. Very refined.",
      "People who complain probably just do not understand fashion."
    ],
    zh: [
      "只有愚人才看不见这种美。",
      "皇帝的品味对普通人来说太精妙了。",
      "我立刻看见了微光，非常精致。",
      "抱怨的人大概只是不懂时尚。"
    ]
  },
  doubt: {
    en: [
      "Wait... did anyone actually see the cloth?",
      "I thought I was the only one.",
      "Why is everyone pretending?",
      "Careful. People get punished for saying this."
    ],
    zh: [
      "等等……真的有人看见那块布了吗？",
      "我还以为只有我这样。",
      "为什么大家都在假装？",
      "小心，说这种话会被惩罚。"
    ]
  },
  conflicted: {
    en: [
      "It is probably magnificent. I just wish someone would describe what they see.",
      "Maybe I am missing something.",
      "The report sounds confident, but the room looked empty.",
      "Poll results reflect fear as much as belief."
    ],
    zh: [
      "它大概很华丽吧。我只是希望有人描述一下看见了什么。",
      "也许是我漏掉了什么。",
      "报告听起来很有把握，但房间看起来是空的。",
      "投票结果反映的是恐惧，也反映信念。"
    ]
  },
  child: {
    en: [
      "But he has nothing on.",
      "Someone said it out loud. We all heard it.",
      "The feed changed the quote. Why?",
      "Why does the feed keep calling it symbolic?"
    ],
    zh: [
      "可是他什么也没穿。",
      "有人把它说出来了，我们都听见了。",
      "信息流改了那句话。为什么？",
      "为什么信息流一直说这是象征性的？"
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

export function endingText(id: EndingId, language: LanguageCode) {
  const copy = endings[id];
  return {
    title: pick(copy.title, language),
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

export function aiLanguageInstruction(language: LanguageCode) {
  if (language === "zh") {
    return "只使用简体中文回答。不要包含英文。Palace Narrative Engine 写作“宫廷叙事引擎”，Royal Feed 写作“宫廷信息流”，AI 可以保留。";
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
