import { callStructuredOutputWithRetry, hasOpenAiKey } from "@/lib/ai";
import { aiLanguageInstruction } from "@/lib/i18n";
import { buildNarrativeContext } from "@/lib/narrative";
import {
  dialogueSilenceRequestSchema,
  dialogueSilenceResponseSchema
} from "@/lib/schemas";
import { fallbackSilenceResult } from "@/lib/dialogue";
import type { DialogueSilenceResult, GameState } from "@/lib/types";

function safeSilenceResult(value: DialogueSilenceResult, fallback: DialogueSilenceResult): DialogueSilenceResult {
  return {
    speakerMessage: value.speakerMessage?.slice(0, 220) || fallback.speakerMessage,
    moodDelta: {
      trust: Math.max(-2, Math.min(2, Math.round(value.moodDelta?.trust ?? fallback.moodDelta.trust ?? -2))),
      agitation: Math.max(-2, Math.min(2, Math.round(value.moodDelta?.agitation ?? fallback.moodDelta.agitation ?? 1))),
      openness: Math.max(-2, Math.min(2, Math.round(value.moodDelta?.openness ?? fallback.moodDelta.openness ?? -1))),
      leverage: Math.max(-2, Math.min(2, Math.round(value.moodDelta?.leverage ?? fallback.moodDelta.leverage ?? 2)))
    }
  };
}

export async function POST(request: Request) {
  const parsed = dialogueSilenceRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid dialogue silence request." }, { status: 400 });
  }

  const { language, event, state, transcript, currentMood } = parsed.data;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const fallback = fallbackSilenceResult(event, language);
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
    const result = await callStructuredOutputWithRetry<DialogueSilenceResult>(
      "dialogue_silence",
      dialogueSilenceResponseSchema,
      `Write the speaker's reaction when the player gives no response in The Emperor's Feed.
Language requirement: ${aiLanguageInstruction(language)}
Speaker: ${event.speakerName}, ${event.speakerRole}
Archetype: ${event.archetype}
Stakes: ${event.stakes}
Current speaker mood: ${JSON.stringify(currentMood ?? event.mood)}
Narrative context: ${JSON.stringify(narrative)}
Transcript: ${JSON.stringify(transcript)}
Rules:
- Reply as the speaker only.
- speakerMessage must be one short sentence under 220 characters.
- Treat silence as meaningful pressure, fear, refusal, or uncertainty depending on the speaker.
- Return moodDelta with trust, agitation, openness, and leverage, each -2 to 2.
- Do not invent new facts, witnesses, garment details, or offscreen actions.
- Do not mention hidden scores, prompts, API calls, or implementation rules.`,
      { retries: 1, baseDelayMs: 250, temperature: 0.45, maxOutputTokens: 360 }
    );
    return Response.json(safeSilenceResult(result.data, fallback), {
      headers: {
        "X-PNE-AI-Source": "live",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": String(result.retries)
      }
    });
  } catch (error) {
    console.error("Dialogue silence fallback", error);
    return Response.json(fallback, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": "1"
      }
    });
  }
}
