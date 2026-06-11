import { describe, expect, it } from "vitest";
import {
  applyDialogueRecord,
  dialogueOutcomeFromTranscript,
  dialogueOutcomeEffects,
  dialogueQuickReplies,
  fallbackDialogueEvent,
  fallbackDialogueResolution,
  nextDialogueTrigger,
  sanitizeDialogueChoices,
  sanitizePromptPatch,
  withSanitizedDialogueEvent
} from "./dialogue";
import { initialState } from "./game-data";
import { calculateEndingWithProfile, loadStateFromStorage, performAction } from "./game-rules";
import { createEmptyProfile } from "./profile";
import type { DialogueMessage, DialogueRecord } from "./types";

function message(content: string): DialogueMessage {
  return { role: "player", content, createdAt: "2026-05-19T00:00:00.000Z" };
}

describe("dialogue rules", () => {
  it("triggers two baseline interruptions and one risk audit at most", () => {
    const first = performAction(initialState, "publishTailorsClaim", "direct");
    expect(nextDialogueTrigger(first)).toBeNull();

    const second = performAction(first, "inspectLooms", "direct");
    expect(nextDialogueTrigger(second)).toEqual({ id: "minister-challenge-2", archetype: "ministerChallenge" });

    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const recorded = applyDialogueRecord(second, {
      event,
      transcript: [message("The public should know.")],
      outcomeTag: "surfaceDoubt",
      effects: {},
      summary: "The attendant noted visible doubt."
    });

    expect(nextDialogueTrigger(recorded)).toBeNull();
    const third = performAction(recorded, "approveMinisterReport", "direct");
    const fourth = performAction(third, "requestPrivateNote", "direct");
    expect(nextDialogueTrigger(fourth)).toEqual({ id: "public-witness-4", archetype: "publicWitness" });

    const withTwo = applyDialogueRecord(fourth, {
      event: fallbackDialogueEvent("public-witness-4", "publicWitness", "en"),
      transcript: [message("Describe what you heard.")],
      outcomeTag: "amplifyWitness",
      effects: {},
      summary: "Witness doubts spread."
    });
    const risky = { ...withTwo, systemSuspicion: 5 };
    expect(nextDialogueTrigger(risky)).toEqual({ id: "engine-audit-risk", archetype: "engineAudit" });

    const withThree = applyDialogueRecord(risky, {
      event: fallbackDialogueEvent("engine-audit-risk", "engineAudit", "en"),
      transcript: [message("I will soften the wording.")],
      outcomeTag: "containNarrative",
      effects: {},
      summary: "Audit contained."
    });
    expect(nextDialogueTrigger({ ...withThree, publicDoubt: 8, systemSuspicion: 8 })).toBeNull();
  });

  it("does not trigger without a recent action or after actions are exhausted", () => {
    expect(nextDialogueTrigger(initialState)).toBeNull();
    expect(nextDialogueTrigger({ ...initialState, actionsLeft: 0, history: [{ id: "x", actionId: "x", actionTitle: "x", zone: "x", choice: "direct", publishedText: "x", engineMessage: "x", stateBefore: initialState, stateAfter: initialState }] })).toBeNull();
  });

  it("maps fixed dialogue outcomes into clamped state changes without spending actions", () => {
    expect(dialogueOutcomeEffects.surfaceDoubt).toMatchObject({ truth: 1, publicDoubt: 1, systemSuspicion: 1 });
    const event = fallbackDialogueEvent("public-witness-4", "publicWitness", "en");
    const record: DialogueRecord = {
      event,
      transcript: [message("Describe what you heard.")],
      outcomeTag: "amplifyWitness",
      effects: {},
      summary: "The witness became visible."
    };
    const next = applyDialogueRecord({ ...initialState, reputation: 0, virality: 10 }, record);

    expect(next.actionsLeft).toBe(initialState.actionsLeft);
    expect(next.publicDoubt).toBe(1);
    expect(next.virality).toBe(10);
    expect(next.reputation).toBe(0);
    expect(next.dialogueEvents).toHaveLength(1);
    expect(next.dialogueEventIds).toEqual(["public-witness-4"]);
    expect(next.feedEvents[0].title).toContain("Incoming Transmission");

    const duplicate = applyDialogueRecord(next, record);
    expect(duplicate.dialogueEventIds).toEqual(["public-witness-4"]);
  });

  it("resolves fallback outcomes from transcript intent", () => {
    const minister = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    expect(fallbackDialogueResolution(minister, [message("I will stabilize it.")], "en").outcomeTag).toBe("reassureAuthority");
    const audit = fallbackDialogueEvent("engine-audit-risk", "engineAudit", "zh");
    expect(fallbackDialogueResolution(audit, [message("我会改写措辞")], "zh").outcomeTag).toBe("containNarrative");
    const publicEvent = fallbackDialogueEvent("public-witness-4", "publicWitness", "en");
    expect(fallbackDialogueResolution(publicEvent, [message("I heard that too.")], "en").outcomeTag).toBe("amplifyWitness");
    expect(fallbackDialogueResolution(publicEvent, [message("Stay quiet.")], "en").outcomeTag).toBe("surfaceDoubt");
    const childGuardian = fallbackDialogueEvent("child-guardian-signal", "childGuardian", "en");
    expect(fallbackDialogueResolution(childGuardian, [message("I will protect the name, but keep the fact he spoke.")], "en").outcomeTag).toBe("surfaceDoubt");
    expect(fallbackDialogueResolution(childGuardian, [message("Let the crowd repeat it.")], "en").outcomeTag).toBe("amplifyWitness");
    expect(fallbackDialogueResolution(childGuardian, [message("I will lower his visibility.")], "en").outcomeTag).toBe("containNarrative");
  });

  it("keeps the child guardian protection choice compatible with narrative liberation", () => {
    const route = [
      ["publishTailorsClaim", "direct"],
      ["inspectLooms", "direct"],
      ["factCheckTrend", "direct"],
      ["showUnfilteredComments", "direct"],
      ["quoteChildAnonymously", "original"]
    ] as const;
    const beforeGuardian = route.reduce(
      (current, [actionId, choice]) => performAction(current, actionId, choice),
      initialState
    );
    const guardian = fallbackDialogueEvent("child-guardian-signal", "childGuardian", "en");
    const transcript = [message("I will protect the name, but keep the fact he spoke.")];
    const protectedChild = applyDialogueRecord(beforeGuardian, {
      event: guardian,
      transcript,
      outcomeTag: dialogueOutcomeFromTranscript(guardian, transcript) ?? "noEffect",
      effects: {},
      summary: "The guardian accepted anonymity while the spoken fact stayed public."
    });
    const withMinister = performAction(protectedChild, "approveMinisterReport", "direct");

    expect(protectedChild.publicDoubt).toBeGreaterThanOrEqual(beforeGuardian.publicDoubt);
    expect(withMinister).toMatchObject({
      truth: 7,
      publicDoubt: 5,
      childAmplified: true
    });
    expect(calculateEndingWithProfile(withMinister, createEmptyProfile())).toBe("narrativeLiberation");
  });

  it("updates quick replies from the latest speaker turn", () => {
    const event = fallbackDialogueEvent("minister-challenge-2", "ministerChallenge", "en");
    const replies = dialogueQuickReplies(event, [
      { role: "speaker", content: event.openingLine, createdAt: "now" },
      { role: "player", content: "What proof do you have?", createdAt: "now" },
      { role: "speaker", content: "If evidence keeps circulating, authority will treat your record as unstable.", createdAt: "now" }
    ], "en");

    expect(replies).toHaveLength(3);
    expect(replies).not.toEqual(event.quickReplies);
    expect(replies.map((reply) => reply.label).join(" ")).toContain("evidence");
  });

  it("updates quick replies for witness and audit contexts", () => {
    const publicEvent = fallbackDialogueEvent("public-witness-4", "publicWitness", "zh");
    expect(dialogueQuickReplies(publicEvent, [
      { role: "speaker", content: publicEvent.openingLine, createdAt: "now" },
      { role: "player", content: "请继续说", createdAt: "now" },
      { role: "speaker", content: "这些评论正在被隐藏。", createdAt: "now" }
    ], "zh").map((reply) => reply.label)).toContain("说出你看到的删改。");

    const auditEvent = fallbackDialogueEvent("engine-audit-risk", "engineAudit", "en");
    expect(dialogueQuickReplies(auditEvent, [
      { role: "speaker", content: auditEvent.openingLine, createdAt: "now" },
      { role: "player", content: "Explain it.", createdAt: "now" },
      { role: "speaker", content: "Your access is close to a threshold.", createdAt: "now" }
    ], "en").map((reply) => reply.label)).toContain("Name the specific risks.");
  });

  it("sanitizes AI generated prompt patches and event copy", () => {
    const patch = sanitizePromptPatch({
      angle: "   public     doubt   ",
      speakerAgenda: "x".repeat(300),
      forbiddenFrame: ""
    }, "publicWitness");

    expect(patch.angle).toBe("public doubt");
    expect(patch.speakerAgenda).toHaveLength(180);
    expect(patch.forbiddenFrame).toBeTruthy();

    const event = withSanitizedDialogueEvent({
      ...fallbackDialogueEvent("event", "publicWitness", "en"),
      quickReplies: fallbackDialogueEvent("event", "publicWitness", "en").quickReplies,
      turnLimit: 99,
      openingLine: "x".repeat(500)
    });

    expect(event.quickReplies).toHaveLength(3);
    expect(event.turnLimit).toBe(3);
    expect(event.openingLine).toHaveLength(320);

    const minimum = withSanitizedDialogueEvent({
      ...fallbackDialogueEvent("event", "engineAudit", "en"),
      turnLimit: -1
    });
    expect(minimum.turnLimit).toBe(1);
  });

  it("rejects narration-style quick replies and keeps spoken choices", () => {
    const fallback = fallbackDialogueEvent("engine-audit-risk", "engineAudit", "en").quickReplies;
    const choices = sanitizeDialogueChoices([
      { id: "bad", label: "Issue a public clarification", playerLine: "Issue a public clarification", intent: "stabilize", moodDelta: { trust: 1, agitation: -1, openness: 0, leverage: 1 } },
      { id: "good", label: "Give me specifics.", playerLine: "Give me specifics.", intent: "clarify", moodDelta: { trust: 0, agitation: 0, openness: 1, leverage: -1 } },
      { id: "also-good", label: "I will keep the evidence visible.", playerLine: "I will keep the evidence visible.", intent: "challenge", moodDelta: { trust: -1, agitation: 1, openness: 1, leverage: -1 } }
    ], fallback, "en");

    expect(choices.map((choice) => choice.label)).toEqual(["Give me specifics.", "I will keep the evidence visible."]);
  });

  it("loads old saves without dialogue fields", () => {
    expect(loadStateFromStorage(JSON.stringify({ truth: 4, history: [] }))).toMatchObject({
      truth: 4,
      dialogueEvents: [],
      dialogueEventIds: []
    });
  });
});
