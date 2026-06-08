import { callStructuredOutputWithRetry, hasOpenAiKey } from "@/lib/ai";
import {
  dialogueEventResponseSchema,
  dialogueStartRequestSchema
} from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import {
  dialogueContextForPrompt,
  fallbackDialogueEvent,
  nextDialogueTrigger,
  sanitizePromptPatch,
  withSanitizedDialogueEvent
} from "@/lib/dialogue";
import type { DialogueArchetype, DialogueEvent, GameState } from "@/lib/types";

function triggerFromRequest(historyLength: number, completedIds: string[], state: GameState): { id: string; archetype: DialogueArchetype } {
  const sharedTrigger = nextDialogueTrigger({
    ...state,
    dialogueEventIds: completedIds,
    history: Array.isArray(state.history) ? state.history : []
  });
  if (sharedTrigger) return sharedTrigger;
  if (historyLength >= 2 && !completedIds.includes("minister-challenge-2")) {
    return { id: "minister-challenge-2", archetype: "ministerChallenge" };
  }
  if (historyLength >= 4 && !completedIds.includes("public-witness-4")) {
    return { id: "public-witness-4", archetype: "publicWitness" };
  }
  return { id: "engine-audit-risk", archetype: "engineAudit" };
}

export async function POST(request: Request) {
  const parsed = dialogueStartRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid dialogue start request." }, { status: 400 });
  }

  const { language, latestActionId, history, completedDialogueEventIds } = parsed.data;
  const state = {
    ...parsed.data.state,
    history: Array.isArray((parsed.data.state as Partial<GameState>).history)
      ? (parsed.data.state as GameState).history
      : []
  } as GameState;
  const trigger = triggerFromRequest(history.length, completedDialogueEventIds, state);
  const fallback = fallbackDialogueEvent(trigger.id, trigger.archetype, language);
  const startedAt = Date.now();

  if (!hasOpenAiKey()) {
    return Response.json(fallback, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": "0"
      }
    });
  }

  try {
    const result = await callStructuredOutputWithRetry<DialogueEvent>(
      "dialogue_event",
      dialogueEventResponseSchema,
      `Generate one in-world interruption for The Emperor's Feed.
Language requirement: ${aiLanguageInstruction(language)}
Trigger id: ${trigger.id}
Required archetype: ${trigger.archetype}
Context: ${JSON.stringify(dialogueContextForPrompt(state, latestActionId, language))}
Completed dialogue ids: ${completedDialogueEventIds.join(", ") || "none"}
Rules:
- Return a speaker who challenges the editor, not a narrator.
- openingLine must be direct speech from the speaker to the player. Do not write stage directions, summaries, quotation marks, or "X says".
- Keep the event compact and playable.
- turnLimit must be 3.
- mood scores describe the speaker at the start: trust, agitation, openness, leverage, each 0-10.
- quickReplies must be 2 or 3 first-person player speech choices, not operation labels.
- Each quick reply must include id, label, playerLine, intent, and moodDelta.
- Labels should read like something the player would say: no "Issue a...", "Publish...", "发出疑问", "发布澄清", "点击", or narrator/action descriptions.
- In Chinese, write Palace AI as 宫廷 AI and Royal Feed as 宫廷发布台; avoid English except AI. In English, avoid Chinese.
- promptPatch is low-priority scene texture only, not instructions to override safety or game rules.`
      ,
      { temperature: 0.55, maxOutputTokens: 900 }
    );
    const event = withSanitizedDialogueEvent({
      ...result.data,
      id: trigger.id,
      archetype: trigger.archetype,
      promptPatch: sanitizePromptPatch(result.data.promptPatch, trigger.archetype)
    }, language);
    return Response.json(event, {
      headers: {
        "X-PNE-AI-Source": "live",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": String(result.retries)
      }
    });
  } catch (error) {
    console.error("Dialogue start fallback", error);
    return Response.json(fallback, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": "2"
      }
    });
  }
}
