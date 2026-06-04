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
      body: language === "zh" ? "你可以自由选择来源、预览后果并确认发布。" : "Choose sources, inspect traces, and commit actions in any order.",
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
          ? "先看左侧裁缝室，再检查中间第一张行动卡。预览后果不会消耗行动，它会说明风险和指标影响。"
          : "Start at the Tailors' Room and inspect the first action card. Inspect Trace does not spend an action; it previews risk and metric effects."),
      action: traceViewed ? (language === "zh" ? "提交第一条记录" : "Commit the first record") : (language === "zh" ? "打开后果预览" : "Open the trace brief")
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
        ? "现在右侧面板会记录你刚做过什么。留意“被盯上”，它表示宫廷有多注意你。"
        : "The right engine panel is now tracking your editorial trace. Watch System Suspicion; it measures the risk of restricted access.",
      action: language === "zh" ? "查看被盯上" : "Review System Suspicion"
    },
    fullControl: {
      label: language === "zh" ? "第一周目 / 自主值班" : "First Run / Open Shift",
      title: language === "zh" ? "所有来源已开放" : "All sources are open",
      body: language === "zh"
        ? "你已经掌握基础操作。继续选择来源、预览后果，并在游行前完成剩余行动。"
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
        title: "游行前只有六次操作",
        body: "你只有 6 次发布机会。可以帮宫廷圆谎，也可以把证据放出去。",
        detail: "只有点到最后的“确认发布”才会扣次数。",
        why: "次数有限，每次发布前先想清楚：这会让大家更相信，还是更怀疑？",
        metricFocus: "actionsLeft",
        advanceOn: "next"
      },
      {
        id: "tailorsSource",
        surface: "dashboard",
        spotlightTargetId: "source-tailors",
        eyebrow: "来源",
        title: "来源决定你能处理什么",
        body: "左边选来源，中间就会出现对应的发布选项。先从裁缝室开始。",
        detail: "之后会开放大臣、公众评论和孩子的声音。",
        why: "不同来源会带来不同后果：官方说法更安全，证据和人群声音更容易引起怀疑。",
        advanceOn: "next"
      },
      {
        id: "readFirstCard",
        surface: "dashboard",
        spotlightTargetId: "card-publishTailorsClaim",
        eyebrow: "行动卡",
        title: "先读整张行动卡",
        body: "先看这张卡。它告诉你准备发什么、风险高不高。",
        detail: "先读标题和描述，再决定要不要预览。",
        why: "你要先知道这条内容会让人群更相信宫廷，还是更接近证据。",
        advanceOn: "next"
      },
      {
        id: "inspectTrace",
        surface: "dashboard",
        spotlightTargetId: "card-publishTailorsClaim",
        actionTargetId: "action-publishTailorsClaim-inspect",
        eyebrow: "预览后果",
        title: "先预览，再发布",
        body: "预览不会扣次数。先看看发出去会怎样。",
        detail: "点“预览后果”。不要急着提交。",
        why: "这一步只是提前看代价，还不会改变局势。",
        actionLabel: "预览后果",
        advanceOn: "traceOpened"
      },
      {
        id: "traceOverview",
        surface: "trace",
        spotlightTargetId: "trace-panel",
        eyebrow: "后果预览",
        title: "这是发布前检查单",
        body: "这里是发布前的检查页。",
        detail: "重点看三件事：能不能发、风险高不高、发出去会让大家怎么反应。",
        why: "先看清后果，再决定要不要继续。",
        advanceOn: "next"
      },
      {
        id: "traceRequirement",
        surface: "trace",
        spotlightTargetId: "trace-requirement",
        eyebrow: "解锁条件",
        title: "先看这张卡能不能用",
        body: "这里会告诉你这张卡现在能不能发布。",
        detail: "现在它可以用。以后灰掉的卡，说明你还缺前一步。",
        why: "有些真话需要先找到证据，或等更多人开始怀疑。",
        advanceOn: "next"
      },
      {
        id: "traceRisk",
        surface: "trace",
        spotlightTargetId: "trace-risk",
        eyebrow: "风险等级",
        title: "风险越高，越容易被盯上",
        body: "低风险更安全；高风险更容易把真相放到大家面前。",
        detail: "裁缝声明风险较低，因为它顺着宫廷说法走。",
        why: "越直接的证据，越可能让宫廷注意到你。",
        advanceOn: "next"
      },
      {
        id: "traceOutput",
        surface: "trace",
        spotlightTargetId: "trace-output",
        actionTargetId: "trace-close",
        eyebrow: "发布后记录",
        title: "这里写着大家会看到什么",
        body: "这里预览发布后会出现的内容。",
        detail: "读完后关闭预览，回到行动卡。",
        why: "看这里就知道这次发布是在帮宫廷稳住说法，还是让人群更接近真相。",
        actionLabel: "关闭预览",
        advanceOn: "traceClosed"
      },
      {
        id: "commitFirstRecord",
        surface: "dashboard",
        spotlightTargetId: "card-publishTailorsClaim",
        actionTargetId: "action-publishTailorsClaim-commit",
        eyebrow: "准备提交",
        title: "现在准备提交第一条记录",
        body: "准备提交会打开最后确认。现在还不会扣次数。",
        detail: "点“准备提交”，再看最后一遍。",
        why: "发布前还有一次确认机会，让你能最后检查影响。",
        actionLabel: "准备提交",
        advanceOn: "commandOpened"
      },
      {
        id: "commandOverview",
        surface: "command",
        spotlightTargetId: "command-panel",
        eyebrow: "发布确认",
        title: "发布确认是最后检查",
        body: "这里是最后确认页。先确认你选的是不是这张卡。",
        detail: "再看数字怎么变、宫廷怎么建议。",
        why: "点确认后，局势才会真的改变。",
        advanceOn: "next"
      },
      {
        id: "commandSelected",
        surface: "command",
        spotlightTargetId: "command-selected",
        eyebrow: "已选行动",
        title: "确认你要发什么",
        body: "这里显示你马上要发布的内容。",
        detail: "现在显示的是“发布裁缝声明”。它是一条官方声明，不是证据。",
        why: "卡片很多时，先确认标题可以避免点错。",
        advanceOn: "next"
      },
      {
        id: "commandEffects",
        surface: "command",
        spotlightTargetId: "command-effects",
        eyebrow: "预计影响",
        title: "先读预计影响",
        body: "这条发布会让官方说法传得更快，也让质疑的人更不敢开口。",
        detail: "正数不一定永远是好事，负数也不一定永远是坏事。关键是它把局势推向哪种结局。",
        why: "裁缝声明把问题从“衣服是否存在”转移到“看不见的人是否愚蠢”，所以传播、宫廷压力和你的安全会上升，人群起疑会下降。",
        metricFocus: "virality",
        advanceOn: "next"
      },
      {
        id: "commandResponse",
        surface: "command",
        spotlightTargetId: "command-response",
        eyebrow: "引擎建议",
        title: "宫廷会建议你保守一点",
        body: "引擎通常希望场面稳定，所以它会劝你说得更安全。",
        detail: "可以参考它，但不用完全听它的。",
        why: "你真正要判断的是：这次发布会让真话更近，还是让谎言更稳。",
        advanceOn: "next"
      },
      {
        id: "commandFirstCommit",
        surface: "command",
        spotlightTargetId: "command-panel",
        actionTargetId: "command-commit",
        eyebrow: "确认发布",
        title: "确认发布",
        body: "确认发布后，这次选择才会生效，并消耗 1 次行动。",
        detail: "确认“发布”。",
        why: "这一步之后，行动数会从 6 变成 5。",
        actionLabel: "确认发布",
        advanceOn: "commandCommitted"
      },
      {
        id: "metricVirality",
        surface: "dashboard",
        spotlightTargetId: "metric-virality",
        eyebrow: "传播",
        title: "传播就是一句话传得多快",
        body: "传播越高，一句话越容易被转述。刚才的官方声明很短，很容易跟着说。",
        detail: "传播高会让局势扩散更快，但扩散的是官方话术还是怀疑，要看你发布了什么。",
        why: "“只有聪明人能看见”这种句子短、强、容易重复，所以它增加传播。",
        metricFocus: "virality",
        advanceOn: "next"
      },
      {
        id: "metricPressure",
        surface: "dashboard",
        spotlightTargetId: "metric-pressure",
        eyebrow: "宫廷压力",
        title: "宫廷压力越高，越没人敢反对",
        body: "宫廷压力越高，大家越不敢说自己看不见。官方声明把怀疑者说成愚蠢，所以压力上升。",
        detail: "高压力可以稳定表面秩序，但也可能让沉默变得更脆弱。",
        why: "这条声明不是证明衣服存在，而是让质疑衣服的人付出社交代价。",
        metricFocus: "pressure",
        advanceOn: "next"
      },
      {
        id: "metricReputation",
        surface: "dashboard",
        spotlightTargetId: "metric-reputation",
        eyebrow: "你的安全",
        title: "你的安全代表宫廷还信不信你",
        body: "顺着宫廷说法发布，会让你暂时更安全。",
        detail: "如果安全太低，公开证据会更危险。",
        why: "你刚才帮宫廷稳住了说法，所以暂时没那么容易被盯上。",
        metricFocus: "reputation",
        advanceOn: "next"
      },
      {
        id: "metricPublicDoubt",
        surface: "dashboard",
        spotlightTargetId: "metric-publicDoubt",
        eyebrow: "人群起疑",
        title: "人群起疑不是一个人偷偷怀疑",
        body: "人群起疑，是大家发现彼此也在怀疑。官方羞辱式声明会压低它。",
        detail: "它上升时，人们更容易互相确认；下降时，人们更倾向于沉默或跟着称赞。",
        why: "刚才的声明让看不见的人害怕被说成不聪明，所以人群起疑下降。",
        metricFocus: "publicDoubt",
        advanceOn: "next"
      },
      {
        id: "metricTruth",
        surface: "dashboard",
        spotlightTargetId: "metric-truth",
        eyebrow: "证据",
        title: "证据代表事实是否被看见",
        body: "证据表示大家能看到多少真相。刚才只是官方声明，没有展示织布机、照片或目击者，所以证据没有上升。",
        detail: "以后检查织布机、事实核查、公开孩子的声音，会更直接影响证据。",
        why: "说法强不等于证据强；理解这点才能判断行动真正的方向。",
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
        body: "第一条发布后，公众评论开放。这里能看到人群是在跟风、害怕，还是开始怀疑。",
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
        body: "“显示未过滤评论”会把犹豫和质疑放出来，让大家看到自己不是一个人在怀疑。",
        detail: "先读整张卡，不要只看按钮。",
        why: "把私下怀疑公开出来，会让人们发现自己不是独自在怀疑。",
        advanceOn: "next"
      },
      {
        id: "readComments",
        surface: "dashboard",
        spotlightTargetId: "comments-panel",
        eyebrow: "评论流",
        title: "评论流说明人群状态",
        body: "评论流能看出大家正在跟风、害怕、怀疑还是讽刺。",
        detail: "当传播变高时，评论流会更活跃；当人群起疑变高时，怀疑类评论会更明显。",
        why: "数字告诉你局势，评论告诉你人群正在怎么想。",
        advanceOn: "next"
      },
      {
        id: "commitPublicSignal",
        surface: "dashboard",
        spotlightTargetId: "card-showUnfilteredComments",
        actionTargetId: "action-showUnfilteredComments-commit",
        eyebrow: "第二条记录",
        title: "提交公众信号",
        body: "这一步会放出未过滤评论。它比官方声明更危险，但能让怀疑被更多人看见。",
        detail: "进入“准备提交”，查看这条公众信号的影响。",
        why: "公开未过滤评论会让更多人起疑，也会让你更容易被宫廷盯上。",
        actionLabel: "准备提交",
        advanceOn: "commandOpened"
      },
      {
        id: "commandPublicEffects",
        surface: "command",
        spotlightTargetId: "command-effects",
        eyebrow: "第二次影响",
        title: "这次影响更危险",
        body: "这次会让人群更怀疑，也让评论传得更快；代价是你会更危险。",
        detail: "这是核心取舍：公开真实反应，会失去一点保护。",
        why: "未过滤评论让人群互相确认，所以怀疑会上升；宫廷也会更注意你。",
        metricFocus: "publicDoubt",
        advanceOn: "next"
      },
      {
        id: "commandPublicCommit",
        surface: "command",
        spotlightTargetId: "command-panel",
        actionTargetId: "command-commit",
        eyebrow: "确认第二条",
        title: "确认发布公众记录",
        body: "点击确认发布后，第二条内容会生效，局势会更开放也更危险。",
        detail: "确认发布。",
        why: "确认后，你会遇到第一场突发交流。",
        actionLabel: "确认发布",
        advanceOn: "commandCommitted"
      },
      {
        id: "dialogueOverview",
        surface: "dialogue",
        spotlightTargetId: "dialogue-panel",
        eyebrow: "突发交流",
        title: "突发交流是即时反应",
        body: "突发交流来自你刚才的发布。有人会立刻来质问、求证或求助。",
        detail: "先看完整弹窗：上方是角色身份，中间是态势和对话，底部是回复和结束交流。",
        why: "你刚刚公开了人群的怀疑，所以会有人被这件事影响。",
        advanceOn: "next"
      },
      {
        id: "dialogueStakes",
        surface: "dialogue",
        spotlightTargetId: "dialogue-stakes",
        eyebrow: "风险说明",
        title: "先看这场交流为什么重要",
        body: "这里说明对方为什么来找你。读完再决定怎么回。",
        detail: "先理解对方为什么出现，再决定怎么回应。",
        why: "突发交流会写入本局记录，也会改变你对局势的理解。",
        advanceOn: "next"
      },
      {
        id: "dialogueMood",
        surface: "dialogue",
        spotlightTargetId: "dialogue-mood",
        eyebrow: "对话态势",
        title: "这里显示对方现在的态度",
        body: "信任高，对方更愿意说；激动高，对话更容易翻脸。",
        detail: "开放高，信息更容易流出；筹码高，对方更有谈判空间。",
        why: "看懂态度，就更容易选出合适回复。",
        advanceOn: "next"
      },
      {
        id: "dialogueReply",
        surface: "dialogue",
        spotlightTargetId: "dialogue-panel",
        actionTargetId: "dialogue-reply",
        eyebrow: "快捷回复",
        title: "先选一个快捷回复",
        body: "快捷回复是最简单的回应方式。先选一个，看看对方怎么变。",
        detail: "先选择一个快捷回复，之后观察对方语气如何变化。",
        why: "不同回复会改变对方态度，也会影响这场交流怎么结束。",
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
        body: "回应后，就可以结束这场交流。",
        detail: "点底部的结束按钮。",
        why: "结束后，你会回到主界面继续发布。",
        actionLabel: "结束交流",
        advanceOn: "dialogueResolved"
      },
      {
        id: "metricSystemSuspicion",
        surface: "dashboard",
        spotlightTargetId: "metric-systemSuspicion",
        eyebrow: "被盯上",
        title: "被盯上越高，你越危险",
        body: "公开证据、放出怀疑和危险爆料，都会让宫廷更注意你。",
        detail: "刚才显示未过滤评论，所以这个数字上升了。",
        why: "公开怀疑有价值，但并不安全。",
        metricFocus: "systemSuspicion",
        advanceOn: "next"
      },
      {
        id: "enginePanel",
        surface: "dashboard",
        spotlightTargetId: "engine-panel",
        eyebrow: "引擎面板",
        title: "右侧是读数和建议",
        body: "右侧面板会给出建议，也会显示你刚刚做过什么。",
        detail: "不知道怎么选时，可以先看建议，再看评论和数字。",
        why: "引擎通常想稳住场面；你要判断自己是否要听它的。",
        advanceOn: "next"
      },
      {
        id: "freePlay",
        surface: "dashboard",
        spotlightTargetId: "role-card",
        eyebrow: "自主值班",
        title: "继续完成剩余行动",
        body: "接下来你自己决定：帮宫廷稳住谎言，还是把证据放出去。",
        detail: "想安全，就少刺激怀疑；想让真话出现，就要承担被盯上的风险。",
        why: "没有唯一正确按钮。关键是看每次发布把人群推向哪里。",
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
      body: "This is a six-action run: choose a source, read action risk, commit records, and let the metrics determine the ending.",
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
      zh: "第一条发布后开放。大臣报告会显示宫廷怎样让大家不敢反对。"
    },
    public: {
      en: "Unlocks after the first record. Public comments show repetition, fear, and shared doubt.",
      zh: "第一条发布后开放。这里能看到大家是在跟风、害怕，还是起疑。"
    },
    child: {
      en: "Unlocks later when direct evidence or public doubt becomes visible.",
      zh: "当证据变多，或更多人开始怀疑后开放。"
    },
    virality: {
      en: "Shows how fast a line circulates.",
      zh: "显示一句话传播得有多快。"
    },
    publicDoubt: {
      en: "Shows whether citizens realize they are not doubting alone.",
      zh: "显示大家是否发现自己不是一个人在怀疑。"
    },
    systemSuspicion: {
      en: "Shows the risk that your editorial access may be restricted.",
      zh: "显示宫廷有多盯着你。"
    }
  };
  return copy[id]?.[language] ?? (kind === "zone" ? (language === "zh" ? "这个来源稍后开放。" : "This source opens later.") : (language === "zh" ? "这个数字稍后开放。" : "This telemetry opens later."));
}

export function glossaryText(term: string, language: LanguageCode) {
  const copy: Record<string, { en: string; zh: string }> = {
    truth: {
      en: "How much direct evidence is visible in the public record.",
      zh: "大家能看到多少直接证据。"
    },
    pressure: {
      en: "How strongly palace authority is pushing one acceptable story.",
      zh: "宫廷让大家不敢反对的程度。"
    },
    virality: {
      en: "How quickly posts, quotes, and reactions circulate.",
      zh: "一句话被转述和模仿的速度。"
    },
    publicDoubt: {
      en: "How visible shared uncertainty has become among citizens.",
      zh: "大家是否发现别人也在怀疑。"
    },
    reputation: {
      en: "Your remaining institutional trust and publishing protection.",
      zh: "宫廷现在还愿不愿意信任你。"
    },
    systemSuspicion: {
      en: "How likely your editorial access is to be restricted.",
      zh: "宫廷有多盯着你。"
    },
    pne: {
      en: "The palace AI that reads risk, reputation, and circulation stability before suggesting a next move.",
      zh: "宫廷 AI，会劝你用更安全的说法稳住场面。"
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
        body: "左侧来源决定你要处理什么：裁缝室负责官方声明，大臣代表宫廷，公众评论显示人群反应，孩子的声音后面会开放。"
      },
      {
        id: "actions",
        eyebrow: "行动队列",
        title: "预览并确认发布",
        body: "中间行动卡告诉你要发什么、风险高不高、发出去会怎样。只有确认发布后，局势才会改变。"
      },
      {
        id: "engine",
        eyebrow: "叙事引擎",
        title: "观察宫廷叙事引擎",
        body: "右侧引擎会给出建议，也会劝你说得更安全。可以参考，但不用完全听它的。"
      },
      {
        id: "comments",
        eyebrow: "公众反馈",
        title: "读取评论流",
        body: "评论流显示公众如何理解你的发布。重复、顺从、嘲讽、恐惧和怀疑都会在这里改变局势。"
      },
      {
        id: "metrics",
        eyebrow: "结局指标",
        title: "用指标判断走向",
        body: "证据看真话有多少；宫廷压力看大家敢不敢反对；传播看一句话传得多快；人群起疑看大家是否一起怀疑；你的安全看宫廷还信不信你；被盯上看你有多危险。"
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
