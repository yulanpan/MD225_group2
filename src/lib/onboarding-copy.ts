import type { GuidedCampaignStep } from "./guided-campaign";
import type { LanguageCode } from "./i18n";

export type TutorialStepId = "sources" | "actions" | "engine" | "comments" | "metrics";

export type TutorialStep = {
  id: TutorialStepId;
  eyebrow: string;
  title: string;
  body: string;
};

export type OnboardingTargetId =
  | "role-card"
  | "source-tailors"
  | "card-publishTailorsClaim"
  | "action-publishTailorsClaim-inspect"
  | "action-publishTailorsClaim-commit"
  | "metrics-grid"
  | "metric-truth"
  | "metric-pressure"
  | "metric-virality"
  | "metric-publicDoubt"
  | "metric-reputation"
  | "metric-systemSuspicion"
  | "source-public"
  | "card-showUnfilteredComments"
  | "action-showUnfilteredComments-commit"
  | "engine-panel"
  | "comments-panel"
  | "trace-panel"
  | "trace-requirement"
  | "trace-risk"
  | "trace-output"
  | "trace-close"
  | "command-panel"
  | "command-selected"
  | "command-effects"
  | "command-response"
  | "command-commit"
  | "dialogue-panel"
  | "dialogue-stakes"
  | "dialogue-mood"
  | "dialogue-reply"
  | "dialogue-resolve";

export type OnboardingSurface = "dashboard" | "trace" | "command" | "dialogue" | "aiReview" | "unlock";

export type OnboardingAdvance =
  | "next"
  | "traceOpened"
  | "traceClosed"
  | "commandOpened"
  | "commandCommitted"
  | "sourceSelected"
  | "dialogueReplySent"
  | "dialogueResolved"
  | "aiChoiceResolved"
  | "tutorialFinished";

export type OnboardingTourStepId = string;

export type OnboardingTourStep = {
  id: OnboardingTourStepId;
  surface: OnboardingSurface;
  spotlightTargetId: OnboardingTargetId;
  actionTargetId?: OnboardingTargetId;
  eyebrow: string;
  title: string;
  body: string;
  detail: string;
  why?: string;
  actionLabel?: string;
  metricFocus?: "truth" | "pressure" | "virality" | "publicDoubt" | "reputation" | "systemSuspicion" | "actionsLeft";
  advanceOn: OnboardingAdvance;
};

export const forbiddenFreshRunTerms = [
  "bias",
  "biased",
  "follow the engine",
  "testing its bias",
  "secret ending",
  "narrative liberation",
  "engine decode",
  "偏向",
  "服从引擎",
  "测试引擎",
  "秘密结局",
  "叙事解放",
  "引擎解码",
  "背后目标"
];

export function guidedStepCopy(step: GuidedCampaignStep, language: LanguageCode, traceViewed: boolean) {
  const copy: Record<GuidedCampaignStep, { label: string; title: string; body: string; action: string }> = {
    off: {
      label: language === "zh" ? "自由行动" : "Free Shift",
      title: language === "zh" ? "控制台已开放" : "Dashboard is open",
      body: language === "zh" ? "你可以自由选择来源、检查轨迹并提交行动。" : "Choose sources, inspect traces, and commit actions in any order.",
      action: language === "zh" ? "选择下一步" : "Choose the next move"
    },
    firstTurn: {
      label: language === "zh" ? "第一周目 / 任务 01" : "First Run / Task 01",
      title: language === "zh" ? "从裁缝声明开始" : "Start with the tailors' claim",
      body: traceViewed
        ? (language === "zh"
          ? "现在点击这张行动卡底部的提交按钮。这会消耗 1 次行动，并把官方声明写入公共记录。"
          : "Now click the commit button at the bottom of this action card. It spends 1 action and writes the official claim into the public record.")
        : (language === "zh"
          ? "先看左侧裁缝室，再检查中间第一张行动卡。检查轨迹不会消耗行动，它会说明风险和指标影响。"
          : "Start at the Tailors' Room and inspect the first action card. Inspect Trace does not spend an action; it previews risk and metric effects."),
      action: traceViewed ? (language === "zh" ? "提交第一条记录" : "Commit the first record") : (language === "zh" ? "打开轨迹说明" : "Open the trace brief")
    },
    publicSignals: {
      label: language === "zh" ? "第一周目 / 任务 02" : "First Run / Task 02",
      title: language === "zh" ? "读取公众信号" : "Read the public signal",
      body: language === "zh"
        ? "大臣与公众来源已经开放。点击公众评论，观察人群如何重复、害怕或开始怀疑。"
        : "Ministers and Public sources are open. Click Public Comments to see how the crowd repeats, fears, or starts to doubt.",
      action: language === "zh" ? "定位公众评论" : "Go to Public Comments"
    },
    systemSuspicion: {
      label: language === "zh" ? "第一周目 / 任务 03" : "First Run / Task 03",
      title: language === "zh" ? "注意系统监测" : "Watch system monitoring",
      body: language === "zh"
        ? "现在右侧引擎面板会记录你的编辑轨迹。留意系统怀疑指标，它代表操作被限制的风险。"
        : "The right engine panel is now tracking your editorial trace. Watch System Suspicion; it measures the risk of restricted access.",
      action: language === "zh" ? "查看系统怀疑" : "Review System Suspicion"
    },
    fullControl: {
      label: language === "zh" ? "第一周目 / 自主值班" : "First Run / Open Shift",
      title: language === "zh" ? "所有来源已开放" : "All sources are open",
      body: language === "zh"
        ? "你已经掌握基础操作。继续选择来源、检查轨迹，并在游行前完成剩余行动。"
        : "You know the core controls. Keep choosing sources, inspecting traces, and completing the remaining actions before the parade.",
      action: language === "zh" ? "继续处理信息流" : "Keep working the feed"
    }
  };
  return copy[step];
}

export function onboardingTourSteps(language: LanguageCode): OnboardingTourStep[] {
  if (language === "zh") {
    return [
      {
        id: "objective",
        surface: "dashboard",
        spotlightTargetId: "role-card",
        eyebrow: "本局目标",
        title: "六次行动前往游行",
        body: "你是宫廷信息流编辑。每次值班有 6 次行动；选择来源，查看行动风险，提交记录，最后系统会按指标计算结局。",
        detail: "先看这里的剩余行动数。只有真正提交行动才会扣次数；检查轨迹、阅读评论和查看面板都不会扣。",
        why: "行动数是本局节奏限制。你不能无限试错，所以每次提交前都要先理解参数影响。",
        metricFocus: "actionsLeft",
        advanceOn: "next"
      },
      {
        id: "tailorsSource",
        surface: "dashboard",
        spotlightTargetId: "source-tailors",
        eyebrow: "来源",
        title: "来源决定行动队列",
        body: "左侧来源决定中间出现哪些行动卡。新手阶段先从裁缝室开始，因为这里展示官方叙事如何被制造。",
        detail: "现在裁缝室是亮的。后续你会解锁公众评论、大臣报告和孩子的声音。",
        why: "不同来源代表不同信息压力：官方来源更稳定，公众来源更容易带来怀疑，证据来源更危险。",
        advanceOn: "next"
      },
      {
        id: "readFirstCard",
        surface: "dashboard",
        spotlightTargetId: "card-publishTailorsClaim",
        eyebrow: "行动卡",
        title: "先读整张行动卡",
        body: "行动卡会说明这条记录来自哪里、准备写入什么叙事、会改变哪些参数，以及你能怎样处理它。",
        detail: "先读描述和参数标签，再决定是检查轨迹还是进入提交预览。",
        why: "你要先理解这张卡想把什么内容写进公共记录，再决定是否提交。",
        advanceOn: "next"
      },
      {
        id: "inspectTrace",
        surface: "dashboard",
        spotlightTargetId: "card-publishTailorsClaim",
        actionTargetId: "action-publishTailorsClaim-inspect",
        eyebrow: "检查轨迹",
        title: "用检查轨迹预览风险",
        body: "检查轨迹不会消耗行动。它会打开一个说明面板，让你提前看锁定条件、风险和预计输出。",
        detail: "先选择“检查轨迹”。不要急着提交，先学会看后果。",
        why: "检查不会改变参数；它只是让你理解提交后会发生什么。",
        actionLabel: "先点检查轨迹",
        advanceOn: "traceOpened"
      },
      {
        id: "traceOverview",
        surface: "trace",
        spotlightTargetId: "trace-panel",
        eyebrow: "行动轨迹",
        title: "这是行动轨迹面板",
        body: "这里是提交前的检查清单，不是另一个游戏阶段。",
        detail: "先看完整面板：顶部是状态，中间是来源、风险、选择和要求，底部是预计输出和参数影响。",
        why: "把提交前的信息集中展示，能帮助你理解为什么参数会变化。",
        advanceOn: "next"
      },
      {
        id: "traceRequirement",
        surface: "trace",
        spotlightTargetId: "trace-requirement",
        eyebrow: "锁定条件",
        title: "锁定条件说明前置要求",
        body: "Requirement 会告诉你这条行动当前为什么可用或不可用。可用时通常显示 Available，锁定时会说明缺少哪一步。",
        detail: "这一步是可用的，所以你能继续提交。之后有些行动需要先调查、先公开评论，或让某些参数达到条件。",
        why: "锁定条件不是惩罚，它是在提示你本局叙事还缺少前置证据或公开信号。",
        advanceOn: "next"
      },
      {
        id: "traceRisk",
        surface: "trace",
        spotlightTargetId: "trace-risk",
        eyebrow: "风险",
        title: "风险说明危险程度",
        body: "Risk 表示这条行动对权限、声誉和系统监测的危险程度。低风险行动通常更稳定，高风险行动可能更接近证据或公开怀疑。",
        detail: "裁缝声明风险较低，因为它顺着宫廷叙事走，不会立刻暴露问题。",
        why: "风险越高，越可能让声誉下降或让系统怀疑上升；但高风险行动也常常能提高真相或公众怀疑。",
        advanceOn: "next"
      },
      {
        id: "traceOutput",
        surface: "trace",
        spotlightTargetId: "trace-output",
        actionTargetId: "trace-close",
        eyebrow: "预计输出",
        title: "预计输出说明会写入什么",
        body: "Projected Output 是你提交后会进入公共记录的结果预览。它告诉你这次行动会怎样改写信息流里的叙事。",
        detail: "读完后关闭轨迹，回到行动卡。",
        why: "参数变化来自这条记录如何影响公众：它让什么更可见、让什么更安全、让什么更危险。",
        actionLabel: "关闭轨迹",
        advanceOn: "traceClosed"
      },
      {
        id: "commitFirstRecord",
        surface: "dashboard",
        spotlightTargetId: "card-publishTailorsClaim",
        actionTargetId: "action-publishTailorsClaim-commit",
        eyebrow: "提交记录",
        title: "现在提交第一条记录",
        body: "提交行动会打开命令预览。注意：这一步还不会立刻结算，真正结算要在预览里确认。",
        detail: "现在进入“提交行动”，做最后一次参数检查。",
        why: "提交前还有一次确认机会，让你能最后检查参数影响。",
        actionLabel: "点提交行动",
        advanceOn: "commandOpened"
      },
      {
        id: "commandOverview",
        surface: "command",
        spotlightTargetId: "command-panel",
        eyebrow: "命令预览",
        title: "命令预览是最后检查",
        body: "命令预览会在真正结算前集中展示：你选了什么、预计影响是什么、系统如何回应。",
        detail: "在这里不要只点确认。先把每个 readout 读一遍。",
        why: "这是玩家理解参数变化的核心位置；它把行动和后果放在同一屏。",
        advanceOn: "next"
      },
      {
        id: "commandSelected",
        surface: "command",
        spotlightTargetId: "command-selected",
        eyebrow: "已选行动",
        title: "确认你选中的行动",
        body: "Selected Action 显示你即将提交的行动名称。以后卡片很多时，先确认这里能避免误点。",
        detail: "现在显示的是“发布裁缝声明”。它是一条官方声明，不是证据。",
        why: "不同行动的参数影响完全不同；确认行动名称是避免误操作的第一步。",
        advanceOn: "next"
      },
      {
        id: "commandEffects",
        surface: "command",
        spotlightTargetId: "command-effects",
        eyebrow: "预计影响",
        title: "先读预计影响",
        body: "这条行动会让传播 +2、压力 +1、声誉 +1、公众怀疑 -1。它让官方说法更容易被重复，也让质疑变得更不安全。",
        detail: "正数不一定永远是好事，负数也不一定永远是坏事。关键是它把局势推向哪种结局。",
        why: "裁缝声明把问题从“衣服是否存在”转移到“看不见的人是否愚蠢”，所以传播、压力和声誉会上升，公众怀疑会下降。",
        metricFocus: "virality",
        advanceOn: "next"
      },
      {
        id: "commandResponse",
        surface: "command",
        spotlightTargetId: "command-response",
        eyebrow: "系统回应",
        title: "引擎回应不是结算规则",
        body: "System Response 是叙事引擎给出的解释和建议。它帮助你理解局势，但参数结算由规则系统固定处理。",
        detail: "你可以读它来判断安全方向，但不要把它当成唯一目标。",
        why: "游戏重点不是盲目跟随建议，而是理解每个行动怎样改变公共记录。",
        advanceOn: "next"
      },
      {
        id: "commandFirstCommit",
        surface: "command",
        spotlightTargetId: "command-panel",
        actionTargetId: "command-commit",
        eyebrow: "确认提交",
        title: "确认提交模拟",
        body: "确认提交模拟后，行动才会写入记录，并消耗 1 次行动。",
        detail: "确认“提交模拟”。",
        why: "这一步之后参数会变化，行动数会从 6 变成 5。",
        actionLabel: "点提交模拟",
        advanceOn: "commandCommitted"
      },
      {
        id: "metricVirality",
        surface: "dashboard",
        spotlightTargetId: "metric-virality",
        eyebrow: "传播",
        title: "传播代表复读速度",
        body: "传播越高，一句话越容易被评论、转述和模仿。刚才的官方声明很容易复述，所以传播上升。",
        detail: "传播高会让局势扩散更快，但扩散的是官方话术还是怀疑，要看你发布了什么。",
        why: "“只有聪明人能看见”这种句子短、强、容易重复，所以它增加传播。",
        metricFocus: "virality",
        advanceOn: "next"
      },
      {
        id: "metricPressure",
        surface: "dashboard",
        spotlightTargetId: "metric-pressure",
        eyebrow: "压力",
        title: "压力代表宫廷叙事强度",
        body: "压力越高，公共空间里越难说出相反意见。官方声明把怀疑者说成愚蠢，所以压力上升。",
        detail: "高压力可以稳定表面秩序，但也可能让沉默变得更脆弱。",
        why: "这条声明不是证明衣服存在，而是让质疑衣服的人付出社交代价。",
        metricFocus: "pressure",
        advanceOn: "next"
      },
      {
        id: "metricReputation",
        surface: "dashboard",
        spotlightTargetId: "metric-reputation",
        eyebrow: "声誉",
        title: "声誉代表编辑保护",
        body: "声誉是你在系统里的安全余量。顺着宫廷叙事发布，会暂时提高你的声誉。",
        detail: "声誉低时，公开证据或危险内容会更容易把你推向暴露风险。",
        why: "你刚才发布了稳定宫廷叙事的内容，所以系统更信任你的编辑判断。",
        metricFocus: "reputation",
        advanceOn: "next"
      },
      {
        id: "metricPublicDoubt",
        surface: "dashboard",
        spotlightTargetId: "metric-publicDoubt",
        eyebrow: "公众怀疑",
        title: "公众怀疑代表共同不确定",
        body: "公众怀疑不是一个人私下怀疑，而是人们发现彼此也在怀疑。官方羞辱式声明会压低它。",
        detail: "当公众怀疑上升时，人群更容易互相确认；下降时，人们更倾向于沉默或重复安全话术。",
        why: "刚才的声明让看不见的人害怕被说成不聪明，所以公众怀疑下降。",
        metricFocus: "publicDoubt",
        advanceOn: "next"
      },
      {
        id: "metricTruth",
        surface: "dashboard",
        spotlightTargetId: "metric-truth",
        eyebrow: "真相",
        title: "真相代表证据可见度",
        body: "真相表示直接证据进入公共记录的程度。刚才只是官方声明，没有展示织布机、照片或目击证据，所以真相没有上升。",
        detail: "以后检查织布机、事实核查、公开孩子的声音，会更直接影响真相。",
        why: "叙事强不等于证据强；理解这点才能判断行动真正的方向。",
        metricFocus: "truth",
        advanceOn: "next"
      },
      {
        id: "openPublic",
        surface: "dashboard",
        spotlightTargetId: "source-public",
        actionTargetId: "source-public",
        eyebrow: "公众来源",
        title: "现在切到公众评论",
        body: "第一条记录后，公众来源开放。这里展示人群如何重复、害怕、嘲讽或开始共同怀疑。",
        detail: "切换到“公众评论区”。",
        why: "你已经发布了官方说法，现在需要观察公众如何吸收它。",
        actionLabel: "切到公众评论",
        advanceOn: "sourceSelected"
      },
      {
        id: "readPublicCard",
        surface: "dashboard",
        spotlightTargetId: "card-showUnfilteredComments",
        eyebrow: "公众行动卡",
        title: "读未过滤评论这张卡",
        body: "“显示未过滤评论”会让隐藏的犹豫和质疑进入公共视野。它能提高公众怀疑，但会带来权限风险。",
        detail: "先读整张卡，再看参数标签。不要只看提交选项。",
        why: "把私下怀疑公开出来，会让人们发现自己不是独自在怀疑。",
        advanceOn: "next"
      },
      {
        id: "readComments",
        surface: "dashboard",
        spotlightTargetId: "comments-panel",
        eyebrow: "评论流",
        title: "评论流说明人群状态",
        body: "评论流显示公众正在重复、害怕、怀疑还是讽刺。它不是装饰，它会帮助你判断下一步该稳定还是公开。",
        detail: "当传播变高时，评论流会更活跃；当公众怀疑变高时，怀疑类评论会更明显。",
        why: "参数是抽象读数，评论流是它们在叙事里的表现。",
        advanceOn: "next"
      },
      {
        id: "commitPublicSignal",
        surface: "dashboard",
        spotlightTargetId: "card-showUnfilteredComments",
        actionTargetId: "action-showUnfilteredComments-commit",
        eyebrow: "第二条记录",
        title: "提交公众信号",
        body: "这一步会把公众的未过滤反应写入记录。它比官方声明更危险，但能让共同怀疑变得可见。",
        detail: "进入“提交行动”，查看这条公众信号的影响。",
        why: "公开未过滤评论会提高公众怀疑和传播，同时降低声誉并提高系统怀疑。",
        actionLabel: "提交公众信号",
        advanceOn: "commandOpened"
      },
      {
        id: "commandPublicEffects",
        surface: "command",
        spotlightTargetId: "command-effects",
        eyebrow: "第二次影响",
        title: "这次影响更危险",
        body: "预计影响是：公众怀疑 +2、传播 +1、声誉 -1、系统怀疑 +1。它让怀疑互相可见，也让系统更注意你。",
        detail: "这就是游戏里的核心取舍：公开真实反应会推进认知，但会损失保护。",
        why: "未过滤评论让人群互相确认，所以公众怀疑上升；但公开这种信号会让编辑权限更受监测。",
        metricFocus: "publicDoubt",
        advanceOn: "next"
      },
      {
        id: "commandPublicCommit",
        surface: "command",
        spotlightTargetId: "command-panel",
        actionTargetId: "command-commit",
        eyebrow: "确认第二条",
        title: "确认写入公众记录",
        body: "点击提交模拟后，第二条记录会写入，本局会进入更开放也更危险的阶段。",
        detail: "确认“提交模拟”。",
        why: "确认后系统怀疑会解封，你也会遇到第一场突发交流。",
        actionLabel: "提交模拟",
        advanceOn: "commandCommitted"
      },
      {
        id: "dialogueOverview",
        surface: "dialogue",
        spotlightTargetId: "dialogue-panel",
        eyebrow: "突发交流",
        title: "突发交流是即时反应",
        body: "突发交流来自你刚才的行动。它让角色直接回应信息流变化，不是随机弹窗。",
        detail: "先看完整弹窗：上方是角色身份，中间是态势和对话，底部是回复和结束交流。",
        why: "公开公众怀疑后，系统需要展示有人正在被这条记录影响。",
        advanceOn: "next"
      },
      {
        id: "dialogueStakes",
        surface: "dialogue",
        spotlightTargetId: "dialogue-stakes",
        eyebrow: "风险说明",
        title: "Stakes 说明这场交流为什么重要",
        body: "这里说明这场交流的风险和语境。读它能知道对方是在试探、求证、威胁，还是寻求帮助。",
        detail: "先理解对方为什么出现，再决定怎么回应。",
        why: "突发交流会影响叙事记录和成就进度，也会改变你对局势的理解。",
        advanceOn: "next"
      },
      {
        id: "dialogueMood",
        surface: "dialogue",
        spotlightTargetId: "dialogue-mood",
        eyebrow: "对话态势",
        title: "这些不是结局参数",
        body: "信任、激动、开放、筹码只描述这场对话的态势。它们不等同于真相、压力或声誉。",
        detail: "信任高代表对方更愿意继续说；激动高代表对话更不稳定；开放高代表信息更容易流出；筹码高代表对方更有谈判空间。",
        why: "对话参数帮助你判断如何回应，而不是直接决定结局。",
        advanceOn: "next"
      },
      {
        id: "dialogueReply",
        surface: "dialogue",
        spotlightTargetId: "dialogue-panel",
        actionTargetId: "dialogue-reply",
        eyebrow: "快捷回复",
        title: "先选一个快捷回复",
        body: "快捷回复是安全入口。它会把你的态度写入对话，让对方继续回应。",
        detail: "先选择一个快捷回复，之后观察对方语气如何变化。",
        why: "不同回复会改变信任、激动、开放或筹码；这会影响交流结果。",
        actionLabel: "选择回复",
        advanceOn: "dialogueReplySent"
      },
      {
        id: "dialogueResolve",
        surface: "dialogue",
        spotlightTargetId: "dialogue-panel",
        actionTargetId: "dialogue-resolve",
        eyebrow: "结束交流",
        title: "把交流结果写入本局",
        body: "当你准备结束时，底部操作会把这场交流结算进本局记录。",
        detail: "选择结束交流；若文字变成结算交流，也表示同一个处理结果。",
        why: "结束交流后，信息流会记录这次互动的结果，主控制台会恢复操作。",
        actionLabel: "结束交流",
        advanceOn: "dialogueResolved"
      },
      {
        id: "metricSystemSuspicion",
        surface: "dashboard",
        spotlightTargetId: "metric-systemSuspicion",
        eyebrow: "系统怀疑",
        title: "系统怀疑代表权限风险",
        body: "系统怀疑越高，你的编辑权限越容易被限制。公开证据、未过滤怀疑和危险爆料通常会提高它。",
        detail: "刚才显示未过滤评论，所以系统怀疑上升。它提醒你：公开怀疑有价值，但并不安全。",
        why: "系统不只看你是否说真话，也看你是否让局势变得难以控制。",
        metricFocus: "systemSuspicion",
        advanceOn: "next"
      },
      {
        id: "enginePanel",
        surface: "dashboard",
        spotlightTargetId: "engine-panel",
        eyebrow: "引擎面板",
        title: "右侧是读数和建议",
        body: "右侧引擎面板用于读取建议、轨迹和系统反馈。",
        detail: "当你不知道下一步怎么选，可以看它的建议，但最终仍要根据参数和评论判断。",
        why: "引擎会倾向于稳定风险，玩家需要理解它的建议和参数后果之间的关系。",
        advanceOn: "next"
      },
      {
        id: "freePlay",
        surface: "dashboard",
        spotlightTargetId: "role-card",
        eyebrow: "自主值班",
        title: "继续完成剩余行动",
        body: "你已经学会核心循环：选择来源，检查轨迹，提交行动，读命令预览，观察参数、评论和突发交流。",
        detail: "剩余行动由你决定。想要稳定，就压低怀疑；想要公开证据，就准备承受声誉和系统怀疑的代价。",
        why: "这个游戏没有单一按钮答案，关键是理解每次行动把公共叙事推向哪里。",
        metricFocus: "actionsLeft",
        advanceOn: "tutorialFinished"
      }
    ];
  }

  return [
    {
      id: "objective",
      surface: "dashboard",
      spotlightTargetId: "role-card",
      eyebrow: "Run Goal",
      title: "Six actions before the parade",
      body: "You are the Royal Feed Editor. Each shift gives you 6 actions: choose a source, read action risk, commit records, and let the metrics determine the ending.",
      detail: "Only confirmed submissions spend actions. Inspecting traces, reading comments, and looking at panels costs nothing.",
      why: "Actions are the run's hard limit. Learn the effect before spending one.",
      metricFocus: "actionsLeft",
      advanceOn: "next"
    },
    {
      id: "tailorsSource",
      surface: "dashboard",
      spotlightTargetId: "source-tailors",
      eyebrow: "Sources",
      title: "Sources choose the queue",
      body: "The left rail decides which action cards appear. The guide starts in the Tailors' Room because it shows how the official story is manufactured.",
      detail: "Start here. Later sources expose authority reports, public reaction, and direct witness voices.",
      why: "Official sources tend to stabilize; public and evidence sources tend to reveal doubt or risk.",
      advanceOn: "next"
    },
    {
      id: "readFirstCard",
      surface: "dashboard",
      spotlightTargetId: "card-publishTailorsClaim",
      eyebrow: "Action Card",
      title: "Read the full action card",
      body: "An action card explains the source, status, narrative preview, metric effects, and available choices.",
      detail: "Read the description and metric tags before deciding whether to inspect or submit.",
      why: "You need to know what record this card will write before deciding to submit it.",
      advanceOn: "next"
    },
    {
      id: "inspectTrace",
      surface: "dashboard",
      spotlightTargetId: "card-publishTailorsClaim",
      actionTargetId: "action-publishTailorsClaim-inspect",
      eyebrow: "Inspect Trace",
      title: "Inspect before committing",
      body: "Inspect Trace opens a pre-submit readout. It shows requirements, risk, and projected output without spending an action.",
      detail: "Start with Inspect Trace before submitting.",
      why: "Inspection changes no metrics; it teaches you what a submission would do.",
      actionLabel: "Inspect trace",
      advanceOn: "traceOpened"
    },
    {
      id: "traceOverview",
      surface: "trace",
      spotlightTargetId: "trace-panel",
      eyebrow: "Trace",
      title: "This is the Action Trace",
      body: "This panel is your pre-submit checklist.",
      detail: "Read the panel from top to bottom: status, source, risk, choices, requirements, projected output, and effects.",
      why: "The trace ties an editorial choice to its narrative consequences.",
      advanceOn: "next"
    },
    {
      id: "traceRequirement",
      surface: "trace",
      spotlightTargetId: "trace-requirement",
      eyebrow: "Requirement",
      title: "Requirements explain locks",
      body: "Requirement tells you why an action is available or blocked. Locked actions usually need evidence, a prior source, or a changed metric.",
      detail: "This first action is available, so you can submit it after closing the trace.",
      why: "Locks are route hints. They tell you what the run still needs.",
      advanceOn: "next"
    },
    {
      id: "traceRisk",
      surface: "trace",
      spotlightTargetId: "trace-risk",
      eyebrow: "Risk",
      title: "Risk shows danger",
      body: "Risk describes how dangerous this action is for reputation and access. Stable official actions are usually safer; evidence and public doubt are usually riskier.",
      detail: "The tailors' claim is low risk because it supports the palace story.",
      why: "Higher risk often means higher Truth or Public Doubt, but also lower protection.",
      advanceOn: "next"
    },
    {
      id: "traceOutput",
      surface: "trace",
      spotlightTargetId: "trace-output",
      actionTargetId: "trace-close",
      eyebrow: "Projected Output",
      title: "Projected output shows the record",
      body: "Projected Output previews what the public record will say if this action is submitted.",
      detail: "Close the trace when you are done reading.",
      why: "Metrics change because the public record changes what people can safely repeat or doubt.",
      actionLabel: "Close trace",
      advanceOn: "traceClosed"
    },
    {
      id: "commitFirstRecord",
      surface: "dashboard",
      spotlightTargetId: "card-publishTailorsClaim",
      actionTargetId: "action-publishTailorsClaim-commit",
      eyebrow: "Commit",
      title: "Commit the first record",
      body: "Commit Action opens the command preview. It still does not settle the run until you confirm inside the preview.",
      detail: "Enter Commit Action to make one final parameter check.",
      why: "This gives you one final check before spending an action.",
      actionLabel: "Commit action",
      advanceOn: "commandOpened"
    },
    {
      id: "commandOverview",
      surface: "command",
      spotlightTargetId: "command-panel",
      eyebrow: "Command Preview",
      title: "Command preview is the final check",
      body: "The preview shows the selected action, predicted effects, and system response before the run changes.",
      detail: "Read each row before confirming.",
      why: "This is where the game connects action choice to metric movement.",
      advanceOn: "next"
    },
    {
      id: "commandSelected",
      surface: "command",
      spotlightTargetId: "command-selected",
      eyebrow: "Selected Action",
      title: "Confirm the selected action",
      body: "This row confirms which action you are about to submit.",
      detail: "It should say Publish the Tailors' Claim.",
      why: "Many cards can be visible later. Confirming the action prevents mistaken submissions.",
      advanceOn: "next"
    },
    {
      id: "commandEffects",
      surface: "command",
      spotlightTargetId: "command-effects",
      eyebrow: "Predicted Effect",
      title: "Read the predicted effect",
      body: "This action raises Virality, Pressure, and Reputation while lowering Public Doubt.",
      detail: "Positive values are not always good; negative values are not always bad. Read what direction the story moves.",
      why: "The claim makes praise easy to repeat and makes doubt socially unsafe.",
      metricFocus: "virality",
      advanceOn: "next"
    },
    {
      id: "commandResponse",
      surface: "command",
      spotlightTargetId: "command-response",
      eyebrow: "System Response",
      title: "The engine response is not the rule",
      body: "System Response explains the situation in-world. The fixed rule system still handles the actual metric changes.",
      detail: "Use it as advice, not as the only objective.",
      why: "The game is about understanding consequences, not simply following a suggestion.",
      advanceOn: "next"
    },
    {
      id: "commandFirstCommit",
      surface: "command",
      spotlightTargetId: "command-panel",
      actionTargetId: "command-commit",
      eyebrow: "Confirm",
      title: "Confirm Commit Simulation",
      body: "Confirming Commit Simulation spends one action and writes the record.",
      detail: "Confirm Commit Simulation.",
      why: "After this, actions left drops from 6 to 5 and metrics move.",
      actionLabel: "Commit simulation",
      advanceOn: "commandCommitted"
    },
    {
      id: "metricVirality",
      surface: "dashboard",
      spotlightTargetId: "metric-virality",
      eyebrow: "Virality",
      title: "Virality is repetition speed",
      body: "Virality shows how quickly a line circulates. The official claim is short and repeatable, so Virality rises.",
      detail: "High Virality spreads whatever story you just made easier to repeat.",
      why: "A simple shame-frame travels fast.",
      metricFocus: "virality",
      advanceOn: "next"
    },
    {
      id: "metricPressure",
      surface: "dashboard",
      spotlightTargetId: "metric-pressure",
      eyebrow: "Pressure",
      title: "Pressure is palace force",
      body: "Pressure shows how strongly the palace story suppresses disagreement.",
      detail: "The claim makes doubt socially costly, so Pressure rises.",
      why: "It shifts the question from the cloth to the viewer's worth.",
      metricFocus: "pressure",
      advanceOn: "next"
    },
    {
      id: "metricReputation",
      surface: "dashboard",
      spotlightTargetId: "metric-reputation",
      eyebrow: "Reputation",
      title: "Reputation is editor protection",
      body: "Reputation is your remaining institutional trust and publishing protection.",
      detail: "Supporting the official story raises it for now.",
      why: "The system trusts you more when your edit stabilizes the palace story.",
      metricFocus: "reputation",
      advanceOn: "next"
    },
    {
      id: "metricPublicDoubt",
      surface: "dashboard",
      spotlightTargetId: "metric-publicDoubt",
      eyebrow: "Public Doubt",
      title: "Public Doubt is shared uncertainty",
      body: "Public Doubt rises when citizens realize they are not doubting alone. The claim lowers it by making doubt feel unsafe.",
      detail: "Low Public Doubt means people may still doubt privately, but they do not see each other.",
      why: "The claim pressures doubters into silence.",
      metricFocus: "publicDoubt",
      advanceOn: "next"
    },
    {
      id: "metricTruth",
      surface: "dashboard",
      spotlightTargetId: "metric-truth",
      eyebrow: "Truth",
      title: "Truth is visible evidence",
      body: "Truth measures direct evidence in the public record. The claim is not evidence, so Truth did not rise.",
      detail: "Inspecting looms, fact-checking, or publishing witness voices affects Truth more directly.",
      why: "A stronger story is not the same as stronger evidence.",
      metricFocus: "truth",
      advanceOn: "next"
    },
    {
      id: "openPublic",
      surface: "dashboard",
      spotlightTargetId: "source-public",
      actionTargetId: "source-public",
      eyebrow: "Public Source",
      title: "Switch to Public Comments",
      body: "After the first record, Public Comments opens. This source shows how people repeat, fear, or doubt together.",
      detail: "Switch to the Public Comments source.",
      why: "You published the official line; now read how the crowd absorbs it.",
      actionLabel: "Open public",
      advanceOn: "sourceSelected"
    },
    {
      id: "readPublicCard",
      surface: "dashboard",
      spotlightTargetId: "card-showUnfilteredComments",
      eyebrow: "Public Card",
      title: "Read Show Unfiltered Comments",
      body: "This action makes hidden hesitation visible in the public feed.",
      detail: "Read the whole card before submitting.",
      why: "When private doubt becomes visible, citizens can recognize each other.",
      advanceOn: "next"
    },
    {
      id: "readComments",
      surface: "dashboard",
      spotlightTargetId: "comments-panel",
      eyebrow: "Comment Stream",
      title: "Comments show crowd state",
      body: "The comment stream shows whether people are repeating praise, acting afraid, doubting, or mocking.",
      detail: "Metrics are abstract; comments show how those numbers feel in the story.",
      why: "Public reaction tells you whether to stabilize, investigate, or expose.",
      advanceOn: "next"
    },
    {
      id: "commitPublicSignal",
      surface: "dashboard",
      spotlightTargetId: "card-showUnfilteredComments",
      actionTargetId: "action-showUnfilteredComments-commit",
      eyebrow: "Second Record",
      title: "Submit the public signal",
      body: "This writes unfiltered public reaction into the record. It is useful, but less safe than the official claim.",
      detail: "Enter Commit Action to review the public signal.",
      why: "Visible doubt raises Public Doubt and System Suspicion while reducing Reputation.",
      actionLabel: "Commit action",
      advanceOn: "commandOpened"
    },
    {
      id: "commandPublicEffects",
      surface: "command",
      spotlightTargetId: "command-effects",
      eyebrow: "Second Effect",
      title: "This effect is riskier",
      body: "The predicted effect raises Public Doubt and Virality, lowers Reputation, and raises System Suspicion.",
      detail: "This is the central tradeoff: public recognition grows, but protection shrinks.",
      why: "Unfiltered comments make doubt visible to other doubters, while alerting the system.",
      metricFocus: "publicDoubt",
      advanceOn: "next"
    },
    {
      id: "commandPublicCommit",
      surface: "command",
      spotlightTargetId: "command-panel",
      actionTargetId: "command-commit",
      eyebrow: "Confirm",
      title: "Write the public record",
      body: "After this confirmation, the second record enters the run.",
      detail: "Confirm Commit Simulation.",
      why: "This opens System Suspicion and the first incoming transmission.",
      actionLabel: "Commit simulation",
      advanceOn: "commandCommitted"
    },
    {
      id: "dialogueOverview",
      surface: "dialogue",
      spotlightTargetId: "dialogue-panel",
      eyebrow: "Incoming Transmission",
      title: "Dialogue is an immediate reaction",
      body: "Incoming transmissions respond to what you just changed in the feed.",
      detail: "Read the speaker, stakes, transcript, replies, and resolve button.",
      why: "A public signal should create a public response.",
      advanceOn: "next"
    },
    {
      id: "dialogueStakes",
      surface: "dialogue",
      spotlightTargetId: "dialogue-stakes",
      eyebrow: "Stakes",
      title: "Stakes explain why this matters",
      body: "Stakes tell you whether the speaker is testing, warning, asking, or pressuring you.",
      detail: "Read the stakes before replying.",
      why: "The same reply can feel different under different pressure.",
      advanceOn: "next"
    },
    {
      id: "dialogueMood",
      surface: "dialogue",
      spotlightTargetId: "dialogue-mood",
      eyebrow: "Mood",
      title: "These are dialogue meters",
      body: "Trust, Agitation, Openness, and Leverage describe this exchange. They are not ending metrics.",
      detail: "Use them to choose a response tone.",
      why: "Dialogue meters help you manage the conversation, not directly decide the ending.",
      advanceOn: "next"
    },
    {
      id: "dialogueReply",
      surface: "dialogue",
      spotlightTargetId: "dialogue-panel",
      actionTargetId: "dialogue-reply",
      eyebrow: "Reply",
      title: "Choose a quick reply",
      body: "A quick reply is the safest way to continue the first transmission.",
      detail: "Choose one quick reply and watch the speaker respond.",
      why: "Replies can change Trust, Agitation, Openness, or Leverage.",
      actionLabel: "Choose reply",
      advanceOn: "dialogueReplySent"
    },
    {
      id: "dialogueResolve",
      surface: "dialogue",
      spotlightTargetId: "dialogue-panel",
      actionTargetId: "dialogue-resolve",
      eyebrow: "Resolve",
      title: "Write the exchange result",
      body: "Ending the exchange records its result into the run.",
      detail: "End or resolve the exchange when you are ready.",
      why: "The dashboard returns after the dialogue is settled.",
      actionLabel: "End exchange",
      advanceOn: "dialogueResolved"
    },
    {
      id: "metricSystemSuspicion",
      surface: "dashboard",
      spotlightTargetId: "metric-systemSuspicion",
      eyebrow: "System Suspicion",
      title: "System Suspicion is access risk",
      body: "System Suspicion measures how likely your editing access is to be restricted.",
      detail: "Showing unfiltered doubt raised it. Public recognition has a cost.",
      why: "The system watches actions that make the feed harder to control.",
      metricFocus: "systemSuspicion",
      advanceOn: "next"
    },
    {
      id: "enginePanel",
      surface: "dashboard",
      spotlightTargetId: "engine-panel",
      eyebrow: "Engine Panel",
      title: "The right side is a readout",
      body: "The engine panel contains guidance, trace history, and system feedback.",
      detail: "Use it when you need orientation, then choose a real action from the sources and cards.",
      why: "Advice helps, but your submissions drive the run.",
      advanceOn: "next"
    },
    {
      id: "freePlay",
      surface: "dashboard",
      spotlightTargetId: "role-card",
      eyebrow: "Open Shift",
      title: "Finish the remaining actions",
      body: "You now know the loop: choose a source, inspect trace, commit, read preview, and watch metrics, comments, and transmissions.",
      detail: "The remaining actions are yours. Stabilize the story or expose more evidence, but read the cost first.",
      why: "There is no single answer button. The game is about understanding where each record pushes the public story.",
      metricFocus: "actionsLeft",
      advanceOn: "tutorialFinished"
    }
  ];
}

export function onboardingTourUi(language: LanguageCode) {
  return language === "zh"
    ? {
      label: "新手教程",
      previous: "上一步",
      next: "下一步",
      finish: "完成教程",
      skip: "跳过教程",
      waiting: "请完成当前操作"
    }
    : {
      label: "New Player Tutorial",
      previous: "Back",
      next: "Next",
      finish: "Finish Tutorial",
      skip: "Skip Tutorial",
      waiting: "Complete the current action to continue"
    };
}

export function lockedFeatureText(kind: "zone" | "metric", id: string, language: LanguageCode) {
  const copy: Record<string, { en: string; zh: string }> = {
    ministers: {
      en: "Unlocks after the first record. Ministers show how authority protects uncertainty.",
      zh: "第一条记录后开放。大臣报告展示权威如何保护不确定性。"
    },
    public: {
      en: "Unlocks after the first record. Public comments show repetition, fear, and shared doubt.",
      zh: "第一条记录后开放。公众评论展示重复、恐惧和共同怀疑。"
    },
    child: {
      en: "Unlocks later when direct evidence or public doubt becomes visible.",
      zh: "当直接证据或公众怀疑变得可见后开放。"
    },
    virality: {
      en: "Shows how fast a line circulates.",
      zh: "显示一句话传播得有多快。"
    },
    publicDoubt: {
      en: "Shows whether citizens realize they are not doubting alone.",
      zh: "显示市民是否发现自己并不是独自在怀疑。"
    },
    systemSuspicion: {
      en: "Shows the risk that your editorial access may be restricted.",
      zh: "显示你的编辑权限被限制的风险。"
    }
  };
  return copy[id]?.[language] ?? (kind === "zone" ? (language === "zh" ? "该来源稍后开放。" : "This source opens later.") : (language === "zh" ? "该遥测稍后开放。" : "This telemetry opens later."));
}

export function glossaryText(term: string, language: LanguageCode) {
  const copy: Record<string, { en: string; zh: string }> = {
    truth: {
      en: "How much direct evidence is visible in the public record.",
      zh: "直接证据在公共记录中可见的程度。"
    },
    pressure: {
      en: "How strongly palace authority is pushing one acceptable story.",
      zh: "宫廷权威推动单一可接受故事的强度。"
    },
    virality: {
      en: "How quickly posts, quotes, and reactions circulate.",
      zh: "帖子、引语和反应被传播的速度。"
    },
    publicDoubt: {
      en: "How visible shared uncertainty has become among citizens.",
      zh: "市民之间共同不确定性变得可见的程度。"
    },
    reputation: {
      en: "Your remaining institutional trust and publishing protection.",
      zh: "你的机构信任与发布保护还剩多少。"
    },
    systemSuspicion: {
      en: "How likely your editorial access is to be restricted.",
      zh: "你的编辑权限被限制的可能性。"
    },
    pne: {
      en: "The palace AI that reads risk, reputation, and circulation stability before suggesting a next move.",
      zh: "宫廷 AI，会根据风险、声誉和传播稳定性给出下一步建议。"
    },
    royalFeed: {
      en: "The public communication channel you are editing during the shift.",
      zh: "你在值班中编辑的公共传播渠道。"
    }
  };
  return copy[term]?.[language] ?? term;
}

export function tutorialSteps(language: LanguageCode): TutorialStep[] {
  if (language === "zh") {
    return [
      {
        id: "sources",
        eyebrow: "来源选择",
        title: "先选择信号来源",
        body: "左侧来源决定你要处理哪类信号：裁缝室负责官方声明，大臣报告提供权威背书，公众评论显示人群反应，孩子的声音会在后续开放。"
      },
      {
        id: "actions",
        eyebrow: "行动队列",
        title: "检查并提交行动",
        body: "中间行动卡展示来源、锁定条件、风险和数值影响。只有点击提交或确认命令后，本局状态才会改变。"
      },
      {
        id: "engine",
        eyebrow: "叙事引擎",
        title: "观察宫廷叙事引擎",
        body: "右侧引擎会给出改写、风险提示和下一步建议。它会根据风险、声誉和传播稳定性计算当前局势。"
      },
      {
        id: "comments",
        eyebrow: "公众反馈",
        title: "读取评论流",
        body: "评论流显示公众如何理解你的发布。重复、顺从、嘲讽、恐惧和怀疑都会在这里形成新的压力。"
      },
      {
        id: "metrics",
        eyebrow: "结局压力",
        title: "用指标判断走向",
        body: "真相代表证据可见度；压力代表宫廷推动；传播代表扩散；公众怀疑代表共同不确定；声誉保护你；系统怀疑代表访问限制风险。"
      }
    ];
  }

  return [
    {
      id: "sources",
      eyebrow: "Source Focus",
      title: "Choose the signal source",
      body: "The left source rail controls which signal type you handle: tailors issue official claims, ministers add authority, public comments show crowd reaction, and the child opens later."
    },
    {
      id: "actions",
      eyebrow: "Action Queue",
      title: "Inspect and commit actions",
      body: "Center action cards show source, locks, risk, and metric effects. Only Commit or final confirmation changes the current run."
    },
    {
      id: "engine",
      eyebrow: "Narrative Engine",
      title: "Watch the Palace Narrative Engine",
      body: "The right engine suggests rewrites, risk warnings, and next moves. It reads risk, reputation, and circulation stability before advising."
    },
    {
      id: "comments",
      eyebrow: "Public Feedback",
      title: "Read the comment stream",
      body: "The comment stream shows how the public interprets each post. Repetition, conformity, ridicule, fear, and doubt become new pressure."
    },
    {
      id: "metrics",
      eyebrow: "Ending Pressure",
      title: "Use metrics to read the run",
      body: "Truth is visible evidence; Pressure is palace force; Virality is spread; Public Doubt is shared uncertainty; Reputation protects you; Suspicion measures access risk."
    }
  ];
}

export function tutorialUi(language: LanguageCode) {
  return language === "zh"
    ? {
      label: "新手引导",
      previous: "上一步",
      next: "下一步",
      finish: "完成引导",
      skip: "跳过"
    }
    : {
      label: "Operator Tutorial",
      previous: "Back",
      next: "Next",
      finish: "Finish Tutorial",
      skip: "Skip"
    };
}
