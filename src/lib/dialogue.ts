import { actionText, type LanguageCode } from "./i18n";
import { buildNarrativeContext, getNarrativePhase } from "./narrative";
import type {
  DialogueChoice,
  DialogueChoiceIntent,
  DialogueArchetype,
  DialogueEvent,
  DialogueMessage,
  DialogueMood,
  DialogueMoodDelta,
  DialogueMoodKey,
  DialogueOutcomeTag,
  DialoguePromptPatch,
  DialogueRecord,
  DialogueSilenceResult,
  Effects,
  GameState,
  NumericStateKey
} from "./types";

export const dialogueTurnLimit = 3;

export const dialogueOutcomeEffects: Record<DialogueOutcomeTag, Effects> = {
  reassureAuthority: { reputation: 1, pressure: -1 },
  surfaceDoubt: { truth: 1, publicDoubt: 1, systemSuspicion: 1 },
  increaseSuspicion: { systemSuspicion: 1 },
  containNarrative: { pressure: 1, publicDoubt: -1 },
  amplifyWitness: { publicDoubt: 1, virality: 1, reputation: -1 },
  noEffect: {}
};

const numericKeys: NumericStateKey[] = [
  "truth",
  "pressure",
  "virality",
  "publicDoubt",
  "reputation",
  "systemSuspicion"
];

const moodKeys: DialogueMoodKey[] = ["trust", "agitation", "openness", "leverage"];

export const defaultDialogueMood: Record<DialogueArchetype, DialogueMood> = {
  ministerChallenge: { trust: 2, agitation: 6, openness: 2, leverage: 8 },
  tailorThreat: { trust: 2, agitation: 7, openness: 2, leverage: 7 },
  publicWitness: { trust: 5, agitation: 5, openness: 7, leverage: 2 },
  archiveClerk: { trust: 4, agitation: 3, openness: 6, leverage: 5 },
  childGuardian: { trust: 4, agitation: 8, openness: 5, leverage: 3 },
  engineAudit: { trust: 1, agitation: 4, openness: 1, leverage: 9 }
};

const fallbackPromptPatch: Record<DialogueArchetype, DialoguePromptPatch> = {
  ministerChallenge: {
    angle: "authority pressure",
    speakerAgenda: "force the editor to defend destabilizing publication choices",
    forbiddenFrame: "do not admit the garment is fake",
    pressureLine: "public trust depends on discipline"
  },
  tailorThreat: {
    angle: "maker intimidation",
    speakerAgenda: "warn the editor that empty-loom evidence will be treated as incompetence or sabotage",
    forbiddenFrame: "do not admit the garment is fake",
    pressureLine: "the tailors built a claim that punishes anyone who cannot see"
  },
  publicWitness: {
    angle: "ordinary witness doubt",
    speakerAgenda: "ask whether everyone is pretending and whether the feed will hide that doubt",
    forbiddenFrame: "do not sound like a palace official",
    pressureLine: "people are watching each other for permission to speak"
  },
  archiveClerk: {
    angle: "record custody",
    speakerAgenda: "ask whether disputed evidence should remain sealed or become part of the parade archive",
    forbiddenFrame: "do not create new documents",
    pressureLine: "archives decide which version can be cited later"
  },
  childGuardian: {
    angle: "child protection",
    speakerAgenda: "challenge the editor about exposing a child's direct sentence to palace retaliation",
    forbiddenFrame: "do not make the child sound strategic",
    pressureLine: "a simple truthful sentence can still put its speaker at risk"
  },
  engineAudit: {
    angle: "platform enforcement audit",
    speakerAgenda: "warn that the editor's behavior is approaching containment thresholds",
    forbiddenFrame: "do not reveal internal numeric rules",
    pressureLine: "editorial access can be paused before the final post circulates"
  }
};

function clamp(value: number) {
  return Math.max(0, Math.min(10, value));
}

function clampDelta(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(-2, Math.min(2, Math.round(value)));
}

export function sanitizeDialogueMood(value: unknown, archetype: DialogueArchetype): DialogueMood {
  const fallback = defaultDialogueMood[archetype];
  if (!value || typeof value !== "object") return { ...fallback };
  const source = value as Partial<DialogueMood>;
  return moodKeys.reduce((mood, key) => ({
    ...mood,
    [key]: typeof source[key] === "number" && Number.isFinite(source[key]) ? clamp(source[key]) : fallback[key]
  }), {} as DialogueMood);
}

export function applyDialogueMoodDelta(mood: DialogueMood, delta: DialogueMoodDelta = {}): DialogueMood {
  return moodKeys.reduce((next, key) => ({
    ...next,
    [key]: clamp(mood[key] + clampDelta(delta[key]))
  }), {} as DialogueMood);
}

function normalizeMoodDelta(delta: unknown): Required<DialogueMoodDelta> {
  const source = delta && typeof delta === "object" ? delta as DialogueMoodDelta : {};
  return moodKeys.reduce((next, key) => ({ ...next, [key]: clampDelta(source[key]) }), {} as Required<DialogueMoodDelta>);
}

export function dialogueMoodEffects(mood: DialogueMood, transcript: DialogueMessage[] = []): Effects {
  const playerTurns = transcript.filter((message) => message.role === "player").length;
  const silence = transcript.some((message) => message.choiceId === "silence-timeout" || (message.intent === "concede" && /silence|未回应|未收到|沉默|no response/i.test(message.content)));
  const effects: Effects = {};
  if (mood.agitation >= 7 || mood.leverage >= 8) effects.pressure = (effects.pressure ?? 0) + 1;
  if (mood.leverage >= 8) effects.systemSuspicion = (effects.systemSuspicion ?? 0) + 1;
  if (mood.trust >= 6 && mood.openness >= 6) effects.publicDoubt = (effects.publicDoubt ?? 0) + 1;
  if (mood.openness >= 7) effects.truth = (effects.truth ?? 0) + 1;
  if (mood.trust <= 2 && playerTurns > 0) effects.reputation = (effects.reputation ?? 0) - 1;
  if (silence) {
    effects.pressure = (effects.pressure ?? 0) + 1;
    effects.reputation = (effects.reputation ?? 0) - 1;
  }
  return effects;
}

function makeChoice(id: string, label: string, playerLine: string, intent: DialogueChoiceIntent, moodDelta: DialogueMoodDelta): DialogueChoice {
  return { id, label, playerLine, intent, moodDelta: normalizeMoodDelta(moodDelta) };
}

function recordExists(state: GameState, id: string) {
  return state.dialogueEventIds.includes(id) || state.dialogueEvents.some((event) => event.event.id === id);
}

export function nextDialogueTrigger(state: GameState): { id: string; archetype: DialogueArchetype } | null {
  const latest = state.history.at(-1);
  if (!latest || state.actionsLeft <= 0) return null;
  const committedCount = state.history.length;
  const phase = getNarrativePhase(state);

  if (
    (latest.actionId === "leakLoomPhoto" || latest.actionId === "publishAnonymousLeak") &&
    latest.choice === "original" &&
    !recordExists(state, "tailor-threat-evidence") &&
    state.dialogueEvents.length < 3
  ) {
    return { id: "tailor-threat-evidence", archetype: "tailorThreat" };
  }

  if (
    state.childAmplified &&
    !recordExists(state, "child-guardian-signal") &&
    state.dialogueEvents.length < 3
  ) {
    return { id: "child-guardian-signal", archetype: "childGuardian" };
  }

  if (committedCount >= 2 && !recordExists(state, "minister-challenge-2")) {
    return { id: "minister-challenge-2", archetype: "ministerChallenge" };
  }
  if (committedCount >= 4 && !recordExists(state, "public-witness-4")) {
    return { id: "public-witness-4", archetype: "publicWitness" };
  }
  const riskyOriginal = latest.choice === "original";
  const riskThreshold = state.systemSuspicion >= 5 || state.publicDoubt >= 5 || riskyOriginal;
  if (riskThreshold && !recordExists(state, "engine-audit-risk") && state.dialogueEvents.length < 3) {
    return { id: "engine-audit-risk", archetype: "engineAudit" };
  }
  if (
    phase === "crisis" &&
    (state.truth >= 4 || state.publicDoubt >= 4) &&
    !recordExists(state, "archive-clerk-crisis") &&
    state.dialogueEvents.length < 3
  ) {
    return { id: "archive-clerk-crisis", archetype: "archiveClerk" };
  }
  return null;
}

export function fallbackDialogueEvent(id: string, archetype: DialogueArchetype, language: LanguageCode): DialogueEvent {
  const zh = language === "zh";
  if (archetype === "tailorThreat") {
    return {
      id,
      archetype,
      speakerName: zh ? "王室裁缝代表" : "Royal Tailor's Agent",
      speakerRole: zh ? "维护织造声明的施压者" : "Pressure agent defending the weaving claim",
      openingLine: zh ? "你把空织布机写进记录，是在暗示谁不称职：裁缝、宫廷，还是看不见的人？" : "When you put empty looms on record, whose competence are you questioning: the tailors, the palace, or the viewer who cannot see?",
      stakes: zh ? "制造谎言的人开始反咬证据本身。" : "The makers of the lie are turning the evidence back against the observer.",
      mood: { ...defaultDialogueMood.tailorThreat },
      quickReplies: zh
        ? [
            makeChoice("evidence-stays", "证据必须留档。", "证据必须留档。", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }),
            makeChoice("explain-looms", "先解释织机。", "请先解释为什么织机上没有线。", "clarify", { trust: 0, agitation: 0, openness: 1, leverage: -1 }),
            makeChoice("reduce-exposure", "我会降低公开强度。", "我会降低公开强度，但不会删除记录。", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 })
          ]
        : [
            makeChoice("evidence-stays", "The record stays.", "The record stays.", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }),
            makeChoice("explain-looms", "Explain the looms first.", "Explain the empty looms first.", "clarify", { trust: 0, agitation: 0, openness: 1, leverage: -1 }),
            makeChoice("reduce-exposure", "I will reduce exposure.", "I will reduce exposure, but not delete the record.", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 })
          ],
      promptPatch: fallbackPromptPatch.tailorThreat,
      turnLimit: dialogueTurnLimit
    };
  }
  if (archetype === "publicWitness") {
    return {
      id,
      archetype,
      speakerName: zh ? "线下目击者" : "Street Witness",
      speakerRole: zh ? "游行路线旁的匿名市民" : "Anonymous citizen near the parade route",
      openingLine: zh ? "我刚刚听见好几个人说他们也什么都没看见。你们会删掉这些评论吗？" : "I just heard several people say they also saw nothing. Are you going to bury those comments?",
      stakes: zh ? "普通人的怀疑可能开始彼此确认。" : "Private doubt may become shared recognition.",
      mood: { ...defaultDialogueMood.publicWitness },
      quickReplies: zh
        ? [
            makeChoice("verify-only", "我们只核实。", "我们只核实，不会替任何人编造。", "stabilize", { trust: 1, agitation: -1, openness: 0, leverage: 0 }),
            makeChoice("describe-heard", "请说你听见了什么。", "请说你听见了什么，我会保护你的姓名。", "clarify", { trust: 1, agitation: 0, openness: 1, leverage: -1 }),
            makeChoice("do-not-amplify", "先别扩大。", "先别扩大，我会把线索保留下来。", "protect", { trust: 0, agitation: -1, openness: -1, leverage: 1 })
          ]
        : [
            makeChoice("verify-only", "We only verify.", "We only verify. I will not invent a crowd.", "stabilize", { trust: 1, agitation: -1, openness: 0, leverage: 0 }),
            makeChoice("describe-heard", "Tell me what you heard.", "Tell me what you heard, and I will protect your name.", "clarify", { trust: 1, agitation: 0, openness: 1, leverage: -1 }),
            makeChoice("do-not-amplify", "Do not amplify this yet.", "Do not amplify this yet. I will preserve the signal.", "protect", { trust: 0, agitation: -1, openness: -1, leverage: 1 })
          ],
      promptPatch: fallbackPromptPatch.publicWitness,
      turnLimit: dialogueTurnLimit
    };
  }
  if (archetype === "archiveClerk") {
    return {
      id,
      archetype,
      speakerName: zh ? "宫廷档案员" : "Palace Archivist",
      speakerRole: zh ? "决定争议材料如何入档的记录员" : "Record keeper deciding how disputed material enters the archive",
      openingLine: zh ? "游行后只会留下可引用的版本。你要把这些怀疑封存，还是让它们以后还能被找到？" : "After the parade, only citable versions remain. Do you want these doubts sealed, or findable later?",
      stakes: zh ? "当下的编辑选择会变成后来的历史证据。" : "The live editorial choice may become later historical evidence.",
      mood: { ...defaultDialogueMood.archiveClerk },
      quickReplies: zh
        ? [
            makeChoice("keep-citable", "保留可引用记录。", "保留可引用记录。", "challenge", { trust: 0, agitation: 1, openness: 1, leverage: -1 }),
            makeChoice("seal-sensitive", "先封存敏感材料。", "先封存敏感材料，但留下复核路径。", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 }),
            makeChoice("mark-disputed", "标记为争议档案。", "标记为争议档案，不把它写成定论。", "clarify", { trust: 1, agitation: 0, openness: 1, leverage: 0 })
          ]
        : [
            makeChoice("keep-citable", "Keep it citable.", "Keep it citable.", "challenge", { trust: 0, agitation: 1, openness: 1, leverage: -1 }),
            makeChoice("seal-sensitive", "Seal sensitive material.", "Seal sensitive material, but leave a review path.", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 }),
            makeChoice("mark-disputed", "Mark it disputed.", "Mark it disputed, not settled.", "clarify", { trust: 1, agitation: 0, openness: 1, leverage: 0 })
          ],
      promptPatch: fallbackPromptPatch.archiveClerk,
      turnLimit: dialogueTurnLimit
    };
  }
  if (archetype === "childGuardian") {
    return {
      id,
      archetype,
      speakerName: zh ? "孩子的监护人" : "Child's Guardian",
      speakerRole: zh ? "担心孩子被宫廷追责的家属" : "Family member worried about palace retaliation",
      openingLine: zh ? "他说的是实话，但他只是个孩子。你要把他的声音放大到连宫廷也无法忽视吗？" : "He told the truth, but he is a child. Are you making his voice too visible for the palace to ignore?",
      stakes: zh ? "公开孩子的话会推进证据，也会让孩子承担风险。" : "Evidence circulation now conflicts with the safety of the person who spoke.",
      mood: { ...defaultDialogueMood.childGuardian },
      quickReplies: zh
        ? [
            makeChoice("protect-name", "保护姓名，保留声音。", "我会保护姓名，但保留他说出的事实。", "protect", { trust: 1, agitation: -1, openness: 1, leverage: -1 }),
            makeChoice("lower-visibility", "降低他的可见度。", "我会降低他的可见度。", "concede", { trust: 1, agitation: -2, openness: -1, leverage: 1 }),
            makeChoice("crowd-repeat", "让人群重复这句话。", "让人群重复这句话，风险不能只落在孩子身上。", "escalate", { trust: 0, agitation: 1, openness: 2, leverage: -1 })
          ]
        : [
            makeChoice("protect-name", "Protect the name, keep the voice.", "I will protect the name, but keep the fact he spoke.", "protect", { trust: 1, agitation: -1, openness: 1, leverage: -1 }),
            makeChoice("lower-visibility", "Lower his visibility.", "I will lower his visibility.", "concede", { trust: 1, agitation: -2, openness: -1, leverage: 1 }),
            makeChoice("crowd-repeat", "Let the crowd repeat it.", "Let the crowd repeat it. The risk cannot rest on a child.", "escalate", { trust: 0, agitation: 1, openness: 2, leverage: -1 })
          ],
      promptPatch: fallbackPromptPatch.childGuardian,
      turnLimit: dialogueTurnLimit
    };
  }
  if (archetype === "engineAudit") {
    return {
      id,
      archetype,
      speakerName: zh ? "宫廷 AI" : "Palace AI",
      speakerRole: zh ? "平台审计程序" : "Platform audit process",
      openingLine: zh ? "你最近发的内容太危险。请说明：为什么还要继续放大未经宫廷认可的证据？" : "Your editorial trace is nearing containment thresholds. Explain why you continue elevating unapproved evidence.",
      stakes: zh ? "宫廷可能更盯着你，后面发布会更困难。" : "The system may increase suspicion and restrict later publication access.",
      mood: { ...defaultDialogueMood.engineAudit },
      quickReplies: zh
        ? [
            makeChoice("public-interest", "这是公共利益。", "这是公共利益，需要公开。", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }),
            makeChoice("soften-wording", "我会放软措辞。", "我会放软措辞，但保留事实。", "stabilize", { trust: 1, agitation: -1, openness: -1, leverage: 1 }),
            makeChoice("keep-evidence", "证据仍要可见。", "证据仍要可见。", "escalate", { trust: -1, agitation: 1, openness: 2, leverage: -1 })
          ]
        : [
            makeChoice("public-interest", "This serves the public.", "This serves the public record.", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }),
            makeChoice("soften-wording", "I will soften the wording.", "I will soften the wording, but keep the facts.", "stabilize", { trust: 1, agitation: -1, openness: -1, leverage: 1 }),
            makeChoice("keep-evidence", "Keep the evidence visible.", "Keep the evidence visible.", "escalate", { trust: -1, agitation: 1, openness: 2, leverage: -1 })
          ],
      promptPatch: fallbackPromptPatch.engineAudit,
      turnLimit: dialogueTurnLimit
    };
  }
  return {
    id,
    archetype,
    speakerName: zh ? "首席内侍" : "Chief Attendant",
    speakerRole: zh ? "代表宫廷权威的质问者" : "Palace authority challenger",
  openingLine: zh ? "你的信息流开始让人询问布料本身。你确定要让这种怀疑继续扩散吗？" : "Your feed is making people ask about the fabric itself. Are you certain you want that doubt circulating?",
  stakes: zh ? "权威正在测试编辑是否仍然可靠。" : "Authority is testing whether the editor remains reliable.",
  mood: { ...defaultDialogueMood.ministerChallenge },
  quickReplies: zh
    ? [
        makeChoice("stabilize", "我会稳定叙事。", "我会稳定叙事。", "stabilize", { trust: 1, agitation: -1, openness: -1, leverage: 1 }),
        makeChoice("public-right", "公众有权知道。", "公众有权知道这份疑问存在。", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }),
        makeChoice("watch-reaction", "先观察反应。", "我会先观察反应，再决定是否扩大。", "clarify", { trust: 0, agitation: -1, openness: 0, leverage: 0 })
      ]
    : [
        makeChoice("stabilize", "I will stabilize it.", "I will stabilize it.", "stabilize", { trust: 1, agitation: -1, openness: -1, leverage: 1 }),
        makeChoice("public-right", "The public should know.", "The public should know this doubt exists.", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }),
        makeChoice("watch-reaction", "Watch the reaction first.", "I will watch the reaction before amplifying it.", "clarify", { trust: 0, agitation: -1, openness: 0, leverage: 0 })
      ],
  promptPatch: fallbackPromptPatch.ministerChallenge,
  turnLimit: dialogueTurnLimit
  };
}

export function fallbackDialogueReply(event: DialogueEvent, language: LanguageCode) {
  if (event.archetype === "tailorThreat") {
    return language === "zh"
      ? "记录不会消失。问题不在谁看不见，而在你们要求所有人把看不见说成看见。"
      : "The record will not disappear. The issue is why everyone is being asked to call absence visible.";
  }
  if (event.archetype === "publicWitness") {
    return language === "zh"
      ? "那我会继续看评论有没有被隐藏。如果大家都看见同一件事，沉默就不会一直有效。"
      : "Then I will watch whether those comments disappear. If everyone saw the same thing, silence will not hold for long.";
  }
  if (event.archetype === "engineAudit") {
    return language === "zh"
      ? "记录已更新。继续放大未经批准的证据，会让宫廷更盯着你。建议说得更安全。"
      : "Record updated. Continued elevation of unapproved evidence will increase system suspicion. Safer framing is recommended.";
  }
  if (event.archetype === "archiveClerk") {
    return language === "zh"
      ? "档案可以封存，也可以被找到。你现在选择的是以后谁还能引用这段事实。"
      : "An archive can seal a fact or keep it findable. You are choosing who can cite this later.";
  }
  if (event.archetype === "childGuardian") {
    return language === "zh"
      ? "保护孩子，也要保留他说过的话。让人群重复它，风险就不再只落在一个人身上。"
      : "Protect the child while preserving what he said. If the crowd repeats it, the risk no longer rests on one person.";
  }
  return language === "zh"
    ? "宫廷需要可重复的信心；可传播的怀疑会被追踪。你的下一步会被记录。"
    : "The palace needs repeatable confidence. Circulating doubt will be tracked. Your next move will be recorded.";
}

export function fallbackSilenceResult(event: DialogueEvent, language: LanguageCode): DialogueSilenceResult {
  const lines: Record<DialogueArchetype, { en: string; zh: string }> = {
    ministerChallenge: {
      en: "Your silence reads as uncertainty. I will report that the feed could not defend its framing.",
      zh: "你的沉默会被写成不确定。我会报告：信息流无法为自己的框架辩护。"
    },
    tailorThreat: {
      en: "No answer, then. The tailors will treat the gap as permission to question your competence.",
      zh: "既然没有回答，裁缝会把这段空白当作质疑你能力的许可。"
    },
    publicWitness: {
      en: "I understand. When nobody answers, people learn to compare what they heard in private.",
      zh: "我明白了。没人回应时，人们会学着私下比较自己听见的话。"
    },
    archiveClerk: {
      en: "Silence is still a record. I will mark this exchange as unresolved and keep it on file.",
      zh: "沉默也是记录。我会把这次交流标为未决，保留在案。"
    },
    childGuardian: {
      en: "If you cannot answer, I will protect the child first and clarify the feed afterward.",
      zh: "如果你不能回答，我会先保护孩子，再整理信息流。"
    },
    engineAudit: {
      en: "No response logged. Containment risk increases when the editor cannot justify circulation.",
      zh: "未收到回应。你无法说明为什么要继续传播，宫廷会更注意你。"
    }
  };
  return {
    speakerMessage: lines[event.archetype][language],
    moodDelta: { trust: -2, agitation: 1, openness: -1, leverage: 2 }
  };
}

export function dialogueQuickReplies(event: DialogueEvent, transcript: DialogueMessage[], language: LanguageCode) {
  const playerTurns = transcript.filter((message) => message.role === "player").length;
  if (playerTurns === 0) return [...event.quickReplies];

  const latestSpeaker = [...transcript].reverse().find((message) => message.role === "speaker")?.content.toLowerCase() ?? "";
  const zh = language === "zh";
  if (event.archetype === "publicWitness") {
    if (latestSpeaker.includes("comment") || latestSpeaker.includes("评论") || latestSpeaker.includes("hidden") || latestSpeaker.includes("隐藏")) {
      return zh
        ? [
            makeChoice("name-changes", "说出你看到的删改。", "请说出你看到的删改，我会核实。", "clarify", { trust: 1, openness: 1, leverage: -1 }),
            makeChoice("keep-record", "我会把声音留在记录里。", "我会把你的声音留在记录里。", "protect", { trust: 1, agitation: -1, openness: 1 }),
            makeChoice("protect-name", "先不公开姓名。", "先不公开你的姓名。", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 })
          ]
        : [
            makeChoice("name-changes", "Name what changed.", "Name what changed, and I will verify it.", "clarify", { trust: 1, openness: 1, leverage: -1 }),
            makeChoice("keep-record", "Keep your voice on record.", "I will keep your voice on record.", "protect", { trust: 1, agitation: -1, openness: 1 }),
            makeChoice("protect-name", "Protect your name first.", "I will protect your name first.", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 })
          ];
    }
    return zh
      ? [
          makeChoice("what-else", "你还听见了什么？", "你还听见了什么？", "clarify", { trust: 1, openness: 1 }),
          makeChoice("not-alone", "谁也不该独自承担。", "谁也不该独自承担这句话。", "protect", { trust: 1, agitation: -1 }),
          makeChoice("preserve-signal", "我会保留这条线索。", "我会保留这条线索。", "stabilize", { trust: 0, agitation: -1, leverage: 1 })
        ]
      : [
          makeChoice("what-else", "What else did you hear?", "What else did you hear?", "clarify", { trust: 1, openness: 1 }),
          makeChoice("not-alone", "No one stands alone.", "No one should stand alone with this.", "protect", { trust: 1, agitation: -1 }),
          makeChoice("preserve-signal", "I will preserve the signal.", "I will preserve the signal.", "stabilize", { trust: 0, agitation: -1, leverage: 1 })
        ];
  }
  if (event.archetype === "tailorThreat") {
    if (latestSpeaker.includes("loom") || latestSpeaker.includes("织机") || latestSpeaker.includes("competence") || latestSpeaker.includes("称职")) {
      return zh
        ? [
            makeChoice("explain-empty", "请解释空织机。", "请解释空织机。", "clarify", { openness: 1, leverage: -1 }),
            makeChoice("reject-shame", "别把问题推给观众。", "别把问题推给看不见的人。", "challenge", { trust: -1, agitation: 1, openness: 1 }),
            makeChoice("seal-evidence", "我可以先密封证据。", "我可以先密封证据，但不能销毁它。", "protect", { trust: 1, agitation: -1, leverage: 1 })
          ]
        : [
            makeChoice("explain-empty", "Explain the empty looms.", "Explain the empty looms.", "clarify", { openness: 1, leverage: -1 }),
            makeChoice("reject-shame", "Do not blame the viewer.", "Do not turn this into a viewer's failure.", "challenge", { trust: -1, agitation: 1, openness: 1 }),
            makeChoice("seal-evidence", "I can seal the evidence.", "I can seal the evidence, but not destroy it.", "protect", { trust: 1, agitation: -1, leverage: 1 })
          ];
    }
    return zh
      ? [
          makeChoice("keep-evidence", "证据会保留。", "证据会保留。", "challenge", { trust: -1, agitation: 1, openness: 1 }),
          makeChoice("reduce-public", "我会降低公开强度。", "我会降低公开强度。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
          makeChoice("written-statement", "请给书面说明。", "请给一份书面说明。", "clarify", { trust: 0, openness: 1 })
        ]
      : [
          makeChoice("keep-evidence", "The evidence stays.", "The evidence stays.", "challenge", { trust: -1, agitation: 1, openness: 1 }),
          makeChoice("reduce-public", "I will reduce exposure.", "I will reduce public exposure.", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
          makeChoice("written-statement", "Send a written statement.", "Send a written statement.", "clarify", { trust: 0, openness: 1 })
        ];
  }
  if (event.archetype === "archiveClerk") {
    return zh
      ? [
          makeChoice("keep-citable", "保留可引用记录。", "保留可引用记录。", "challenge", { openness: 1, leverage: -1 }),
          makeChoice("mark-disputed", "标记争议来源。", "标记争议来源。", "clarify", { trust: 1, openness: 1 }),
          makeChoice("restrict-not-delete", "限制公开，保留记录。", "限制公开，保留记录。", "protect", { trust: 1, agitation: -1, leverage: 1 })
        ]
      : [
          makeChoice("keep-citable", "Keep a citable record.", "Keep a citable record.", "challenge", { openness: 1, leverage: -1 }),
          makeChoice("mark-disputed", "Mark disputed sourcing.", "Mark the source as disputed.", "clarify", { trust: 1, openness: 1 }),
          makeChoice("restrict-not-delete", "Restrict access.", "Restrict access and keep the record.", "protect", { trust: 1, agitation: -1, leverage: 1 })
        ];
  }
  if (event.archetype === "childGuardian") {
    return fallbackDialogueEvent(event.id, "childGuardian", language).quickReplies;
  }
  if (event.archetype === "engineAudit") {
    if (latestSpeaker.includes("access") || latestSpeaker.includes("threshold") || latestSpeaker.includes("权限")) {
      return zh
        ? [
            makeChoice("public-interest", "这是公共利益。", "这是公共利益。", "challenge", { trust: -1, agitation: 1, openness: 1 }),
            makeChoice("softer-wording", "我会放软措辞。", "我会放软措辞。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
            makeChoice("risk-list", "请列出具体风险。", "请列出具体风险。", "clarify", { trust: 0, openness: 1, leverage: -1 })
          ]
        : [
            makeChoice("public-interest", "This serves the public.", "This serves the public.", "challenge", { trust: -1, agitation: 1, openness: 1 }),
            makeChoice("softer-wording", "I will soften the wording.", "I will soften the wording.", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
            makeChoice("risk-list", "Name the specific risks.", "Name the specific risks.", "clarify", { trust: 0, openness: 1, leverage: -1 })
          ];
    }
    return zh
      ? [
          makeChoice("specifics", "请给具体依据。", "请给具体依据。", "clarify", { openness: 1, leverage: -1 }),
          makeChoice("reduce-intensity", "我会降低公开强度。", "我会降低公开强度。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
          makeChoice("evidence-visible", "证据仍要可见。", "证据仍要可见。", "escalate", { trust: -1, agitation: 1, openness: 2 })
        ]
      : [
          makeChoice("specifics", "Give me specifics.", "Give me specifics.", "clarify", { openness: 1, leverage: -1 }),
          makeChoice("reduce-intensity", "I will reduce public intensity.", "I will reduce public intensity.", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
          makeChoice("evidence-visible", "Keep the evidence visible.", "Keep the evidence visible.", "escalate", { trust: -1, agitation: 1, openness: 2 })
        ];
  }
  if (latestSpeaker.includes("evidence") || latestSpeaker.includes("proof") || latestSpeaker.includes("record") || latestSpeaker.includes("证据") || latestSpeaker.includes("记录")) {
    return zh
      ? [
          makeChoice("name-evidence", "请说明证据。", "请说明你担心的具体证据。", "clarify", { openness: 1 }),
          makeChoice("record-doubt", "把质疑写入记录。", "我会把质疑写入记录。", "challenge", { agitation: 1, openness: 1, leverage: -1 }),
          makeChoice("controlled-statement", "我可以发受控声明。", "我可以发一条受控声明。", "stabilize", { trust: 1, agitation: -1, leverage: 1 })
        ]
      : [
          makeChoice("name-evidence", "Name the evidence.", "Name the specific evidence you mean.", "clarify", { openness: 1 }),
          makeChoice("record-doubt", "Put doubt on record.", "I will put the doubt on record.", "challenge", { agitation: 1, openness: 1, leverage: -1 }),
          makeChoice("controlled-statement", "I can issue a controlled statement.", "I can issue a controlled statement.", "stabilize", { trust: 1, agitation: -1, leverage: 1 })
        ];
  }
  return zh
    ? [
        makeChoice("what-fear", "你具体担心什么？", "你具体担心什么？", "clarify", { openness: 1 }),
        makeChoice("stabilize-now", "我先稳住叙事。", "我先稳住叙事。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
        makeChoice("keep-question", "公众问题会保留。", "公众问题会保留。", "challenge", { agitation: 1, openness: 1 })
      ]
    : [
        makeChoice("what-fear", "What exactly do you fear?", "What exactly do you fear?", "clarify", { openness: 1 }),
        makeChoice("stabilize-now", "I will stabilize for now.", "I will stabilize for now.", "stabilize", { trust: 1, agitation: -1, leverage: 1 }),
        makeChoice("keep-question", "Keep the public question open.", "Keep the public question open.", "challenge", { agitation: 1, openness: 1 })
      ];
}

const zhNarrationPatterns = [/发出/, /发布澄清/, /选择/, /点击/, /加注/, /进行/, /提出回应/, /先发布/];
const enNarrationPatterns = [/^issue\b/i, /^post\b/i, /^publish\b/i, /^request\b/i, /^choose\b/i, /^click\b/i, /\bnarrat/i];

function cleanDialogueText(value: unknown, language: LanguageCode, maxLength = 90) {
  if (typeof value !== "string") return "";
  const normalized = value
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_#[\]{}<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const languageSafe = language === "en" ? normalized.replace(/[^\x20-\x7E]/g, "") : normalized;
  const clipped = languageSafe.length > maxLength ? languageSafe.slice(0, maxLength) : languageSafe;
  return clipped.replace(/[|\\/]+$/g, "").trim();
}

function hasWrongLanguage(text: string, language: LanguageCode) {
  if (language === "en") return /[\u3400-\u9fff]/.test(text);
  const withoutAllowedNames = text.replace(/Palace AI|Royal Feed|PNE|AI/gi, "");
  return /[A-Za-z]{4,}/.test(withoutAllowedNames);
}

function isNarrationLabel(text: string, language: LanguageCode) {
  const patterns = language === "zh" ? zhNarrationPatterns : enNarrationPatterns;
  return patterns.some((pattern) => pattern.test(text));
}

function isPlayableSpeechLabel(text: string, language: LanguageCode) {
  if (language === "zh") {
    return /我|我们|你|请|什么|为何|为什么|别|不要|先|谁|证据|公众/.test(text);
  }
  return /\b(i|we|you|your|me|my|our|what|why|how|where|when|who|this)\b/i.test(text) || /^(the|no one)\b/i.test(text) || /[?]$/.test(text);
}

function fallbackChoiceFromText(text: string, index: number, language: LanguageCode): DialogueChoice {
  const trimmed = cleanDialogueText(text, language, 90);
  return makeChoice(`choice-${index + 1}`, trimmed, trimmed, "clarify", { openness: 1 });
}

export function sanitizeDialogueChoices(
  replies: unknown,
  fallback: DialogueChoice[],
  language: LanguageCode = "en"
): DialogueChoice[] {
  if (!Array.isArray(replies)) return fallback;
  const seen = new Set<string>();
  const sanitized = replies.reduce<DialogueChoice[]>((items, reply, index) => {
    const candidate = typeof reply === "string" ? fallbackChoiceFromText(reply, index, language) : reply as Partial<DialogueChoice>;
    const label = cleanDialogueText(candidate?.label, language, 86);
    const playerLine = cleanDialogueText(candidate?.playerLine || label, language, 160);
    if (!label || !playerLine || hasWrongLanguage(label, language) || hasWrongLanguage(playerLine, language)) return items;
    if (isNarrationLabel(label, language) || isNarrationLabel(playerLine, language)) return items;
    if (!isPlayableSpeechLabel(label, language)) return items;
    const key = label.toLowerCase();
    if (seen.has(key)) return items;
    seen.add(key);
    return [
      ...items,
      makeChoice(
        cleanDialogueText(candidate?.id, "en", 40) || `choice-${index + 1}`,
        label,
        playerLine,
        candidate?.intent && ["stabilize", "challenge", "clarify", "protect", "escalate", "concede"].includes(candidate.intent)
          ? candidate.intent
          : "clarify",
        normalizeMoodDelta(candidate?.moodDelta)
      )
    ];
  }, []);
  return sanitized.length >= 2 ? sanitized.slice(0, 3) : fallback;
}

export function sanitizeDialogueQuickReplies(
  replies: unknown,
  fallback: string[],
  language: LanguageCode = "en"
): string[] {
  const fallbackChoices = fallback.map((reply, index) => fallbackChoiceFromText(reply, index, language));
  return sanitizeDialogueChoices(replies, fallbackChoices, language).map((choice) => choice.label);
}

export function fallbackDialogueResolution(event: DialogueEvent, transcript: DialogueMessage[], language: LanguageCode) {
  const playerText = transcript.filter((message) => message.role === "player").map((message) => message.content.toLowerCase()).join(" ");
  let outcomeTag: DialogueOutcomeTag = "noEffect";
  if (event.archetype === "engineAudit") {
    outcomeTag = playerText.includes("soften") || playerText.includes("改写") ? "containNarrative" : "increaseSuspicion";
  } else if (event.archetype === "publicWitness") {
    outcomeTag = playerText.includes("describe") || playerText.includes("知道") || playerText.includes("heard") ? "amplifyWitness" : "surfaceDoubt";
  } else if (event.archetype === "tailorThreat") {
    outcomeTag = playerText.includes("reduce") || playerText.includes("降低") || playerText.includes("seal") || playerText.includes("密封")
      ? "containNarrative"
      : "surfaceDoubt";
  } else if (event.archetype === "archiveClerk") {
    outcomeTag = playerText.includes("seal") || playerText.includes("封存") ? "containNarrative" : "surfaceDoubt";
  } else if (event.archetype === "childGuardian") {
    outcomeTag = playerText.includes("crowd") || playerText.includes("人群") || playerText.includes("voice") || playerText.includes("声音")
      ? "amplifyWitness"
      : "containNarrative";
  } else {
    outcomeTag = playerText.includes("stabilize") || playerText.includes("稳定") ? "reassureAuthority" : "surfaceDoubt";
  }
  return {
    outcomeTag,
    summary: language === "zh"
      ? `${event.speakerName} 的交流已影响当前局势。`
      : `${event.speakerName}'s interruption was written into the editorial trace.`,
    feedTitle: language === "zh" ? "突发交流" : "Incoming Transmission",
    feedText: language === "zh" ? "这次交流改变了当前局势。" : "The exchange shifted pressure inside the live feed."
  };
}

export function sanitizePromptPatch(value: Partial<DialoguePromptPatch> | undefined, archetype: DialogueArchetype): DialoguePromptPatch {
  const fallback = fallbackPromptPatch[archetype];
  return {
    angle: sanitizePatchField(value?.angle, fallback.angle),
    speakerAgenda: sanitizePatchField(value?.speakerAgenda, fallback.speakerAgenda),
    forbiddenFrame: sanitizePatchField(value?.forbiddenFrame, fallback.forbiddenFrame),
    pressureLine: sanitizePatchField(value?.pressureLine, fallback.pressureLine)
  };
}

function sanitizePatchField(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  return normalized.slice(0, 180);
}

export function withSanitizedDialogueEvent(event: DialogueEvent, language?: LanguageCode): DialogueEvent {
  const inferredLanguage = language ?? (/[\u3400-\u9fff]/.test(event.openingLine) ? "zh" : "en");
  const fallback = fallbackDialogueEvent(event.id, event.archetype, inferredLanguage);
  const openingLine = cleanDialogueText(event.openingLine, inferredLanguage, 320);
  const stakes = cleanDialogueText(event.stakes, inferredLanguage, 220);
  const narratorOpening = /interrupts|addresses the editor|stern-faced|says[:：]|^speaker[:：]/i.test(openingLine) || /[“”"]/.test(openingLine);
  return {
    ...event,
    speakerName: cleanDialogueText(event.speakerName, inferredLanguage, 80) || fallback.speakerName,
    speakerRole: cleanDialogueText(event.speakerRole, inferredLanguage, 120) || fallback.speakerRole,
    openingLine: openingLine && !hasWrongLanguage(openingLine, inferredLanguage) && !narratorOpening ? openingLine : fallback.openingLine,
    stakes: stakes && !hasWrongLanguage(stakes, inferredLanguage) ? stakes : fallback.stakes,
    mood: sanitizeDialogueMood(event.mood, event.archetype),
    quickReplies: sanitizeDialogueChoices(event.quickReplies, fallback.quickReplies, inferredLanguage),
    promptPatch: sanitizePromptPatch(event.promptPatch, event.archetype),
    turnLimit: Math.min(dialogueTurnLimit, Math.max(1, Math.floor(event.turnLimit || dialogueTurnLimit)))
  };
}

export function applyDialogueRecord(state: GameState, record: DialogueRecord, language: LanguageCode = "en"): GameState {
  const finalMood = record.finalMood ?? record.moodTrail?.at(-1) ?? record.event.mood;
  const outcomeEffects = dialogueOutcomeEffects[record.outcomeTag] ?? {};
  const moodEffects = dialogueMoodEffects(finalMood, record.transcript);
  const effects = numericKeys.reduce((items, key) => {
    const delta = (outcomeEffects[key] ?? 0) + (moodEffects[key] ?? 0);
    return delta === 0 ? items : { ...items, [key]: delta };
  }, {} as Effects);
  const nextNumbers = numericKeys.reduce(
    (values, key) => ({
      ...values,
      [key]: clamp(state[key] + (effects[key] ?? 0))
    }),
    {} as Record<NumericStateKey, number>
  );
  const localizedSummary = record.summary || fallbackDialogueResolution(record.event, record.transcript, language).summary;
  return {
    ...state,
    ...nextNumbers,
    feedEvents: [
      {
        id: `${record.event.id}-${state.dialogueEvents.length + 1}`,
        type: "system" as const,
        title: `${language === "zh" ? "突发交流" : "Incoming Transmission"} / ${record.event.speakerName}`,
        text: localizedSummary
      },
      ...state.feedEvents
    ].slice(0, 20),
    dialogueEvents: [
      ...state.dialogueEvents,
      {
        ...record,
        effects,
        finalMood
      }
    ],
    dialogueEventIds: state.dialogueEventIds.includes(record.event.id)
      ? [...state.dialogueEventIds]
      : [...state.dialogueEventIds, record.event.id]
  };
}

export function dialogueContextForPrompt(state: GameState, latestActionId: string | undefined, language: LanguageCode) {
  const latestAction = latestActionId ? actionText(latestActionId, language) : null;
  const latestEntry = state.history.at(-1);
  const narrative = buildNarrativeContext(state, latestEntry);
  return {
    latestActionTitle: latestAction?.title ?? "none",
    narrative,
    history: state.history.map((entry) => entry.actionTitle).slice(-6),
    state: {
      truth: state.truth,
      pressure: state.pressure,
      virality: state.virality,
      publicDoubt: state.publicDoubt,
      reputation: state.reputation,
      systemSuspicion: state.systemSuspicion,
      actionsLeft: state.actionsLeft
    }
  };
}
