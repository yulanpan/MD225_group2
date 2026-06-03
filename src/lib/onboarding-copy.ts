import type { GuidedCampaignStep } from "./guided-campaign";
import type { LanguageCode } from "./i18n";

export type TutorialStepId = "sources" | "actions" | "engine" | "comments" | "metrics";

export type TutorialStep = {
  id: TutorialStepId;
  eyebrow: string;
  title: string;
  body: string;
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
      action: language === "zh" ? "继续完成本局" : "Continue the shift"
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
        eyebrow: "01 / 来源选择",
        title: "先选择信号来源",
        body: "左侧来源决定你要处理哪类信号：裁缝室负责官方声明，大臣报告提供权威背书，公众评论显示人群反应，孩子的声音会在后续开放。"
      },
      {
        id: "actions",
        eyebrow: "02 / 行动队列",
        title: "检查并提交行动",
        body: "中间行动卡展示来源、锁定条件、风险和数值影响。只有点击提交或确认命令后，本局状态才会改变。"
      },
      {
        id: "engine",
        eyebrow: "03 / 叙事引擎",
        title: "观察宫廷叙事引擎",
        body: "右侧引擎会给出改写、风险提示和下一步建议。它会根据风险、声誉和传播稳定性计算当前局势。"
      },
      {
        id: "comments",
        eyebrow: "04 / 公众反馈",
        title: "读取评论流",
        body: "评论流显示公众如何理解你的发布。重复、顺从、嘲讽、恐惧和怀疑都会在这里形成新的压力。"
      },
      {
        id: "metrics",
        eyebrow: "05 / 结局压力",
        title: "用指标判断走向",
        body: "真相代表证据可见度；压力代表宫廷推动；传播代表扩散；公众怀疑代表共同不确定；声誉保护你；系统怀疑代表访问限制风险。"
      }
    ];
  }

  return [
    {
      id: "sources",
      eyebrow: "01 / Source Focus",
      title: "Choose the signal source",
      body: "The left source rail controls which signal type you handle: tailors issue official claims, ministers add authority, public comments show crowd reaction, and the child opens later."
    },
    {
      id: "actions",
      eyebrow: "02 / Action Queue",
      title: "Inspect and commit actions",
      body: "Center action cards show source, locks, risk, and metric effects. Only Commit or final confirmation changes the current run."
    },
    {
      id: "engine",
      eyebrow: "03 / Narrative Engine",
      title: "Watch the Palace Narrative Engine",
      body: "The right engine suggests rewrites, risk warnings, and next moves. It reads risk, reputation, and circulation stability before advising."
    },
    {
      id: "comments",
      eyebrow: "04 / Public Feedback",
      title: "Read the comment stream",
      body: "The comment stream shows how the public interprets each post. Repetition, conformity, ridicule, fear, and doubt become new pressure."
    },
    {
      id: "metrics",
      eyebrow: "05 / Ending Pressure",
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
