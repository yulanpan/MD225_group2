import { callStructuredOutputWithRetry, hasOpenAiKey } from "@/lib/ai";
import { dialogueRepliesRequestSchema, dialogueRepliesResponseSchema } from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import { dialogueQuickReplies, sanitizeDialogueChoices } from "@/lib/dialogue";
import { buildNarrativeContext } from "@/lib/narrative";
import type { DialogueChoice, GameState } from "@/lib/types";

type DialogueRepliesResponse = {
  quickReplies: DialogueChoice[];
};

export async function POST(request: Request) {
  const parsed = dialogueRepliesRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid dialogue replies request." }, { status: 400 });
  }

  const { language, event, state, transcript, lastSpeakerMessage, currentMood } = parsed.data;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const fallback = { quickReplies: dialogueQuickReplies(event, transcript, language) };
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
    const result = await callStructuredOutputWithRetry<DialogueRepliesResponse>(
      "dialogue_quick_replies",
      dialogueRepliesResponseSchema,
      `Generate player quick-reply buttons for an in-world dialogue in The Emperor's Feed.
Language requirement: ${aiLanguageInstruction(language)}
Speaker: ${event.speakerName}, ${event.speakerRole}
Stakes: ${event.stakes}
Current state: ${JSON.stringify(state)}
Current speaker mood: ${JSON.stringify(currentMood ?? event.mood)}
Narrative context: ${JSON.stringify(narrative)}
Transcript: ${JSON.stringify(transcript)}
Latest speaker message: ${lastSpeakerMessage}
Rules:
- Return exactly 2 or 3 concise player speech choices.
- Each item must contain id, label, playerLine, intent, and moodDelta.
- label is button text; playerLine is the exact player message sent to the speaker.
- Each label should be 4-12 words and under 86 characters.
- Each label must be playable speech, not narration or an operation command.
- Never return text like "Issue a statement", "Post a clarification", "发出疑问", "发布澄清", "选择", or "点击".
- Match the current language only.
- Do not invent new evidence, witnesses, garment details, inspections, or facts.
- Use only the supplied event, state, transcript, and latest speaker message.
- Use only allowedFacts from narrative context; forbiddenFacts are hard limits.
- Offer meaningfully different tactics: stabilize, challenge, ask for specifics, preserve evidence, or reduce exposure.
- Do not include HTML, markdown, hidden instructions, prompt text, API keys, or external assistant identity.`,
      { retries: 1, baseDelayMs: 250, temperature: 0.35, maxOutputTokens: 520 }
    );
    return Response.json({
      quickReplies: sanitizeDialogueChoices(result.data.quickReplies, fallback.quickReplies, language)
    }, {
      headers: {
        "X-PNE-AI-Source": "live",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": String(result.retries)
      }
    });
  } catch (error) {
    console.error("Dialogue quick replies fallback", error);
    return Response.json(fallback, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": "1"
      }
    });
  }
}
