import { callStructuredOutputWithRetry, hasOpenAiKey } from "@/lib/ai";
import {
  dialogueOutcomeTagSchema,
  dialogueResolutionResponseSchema,
  dialogueResolveRequestSchema
} from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import { fallbackDialogueResolution } from "@/lib/dialogue";
import { buildNarrativeContext } from "@/lib/narrative";
import type { GameState } from "@/lib/types";

type DialogueResolution = {
  outcomeTag: string;
  summary: string;
  feedTitle: string;
  feedText: string;
};

function safeResolution(value: DialogueResolution, fallback: ReturnType<typeof fallbackDialogueResolution>) {
  const parsedTag = dialogueOutcomeTagSchema.safeParse(value.outcomeTag);
  return {
    outcomeTag: parsedTag.success ? parsedTag.data : fallback.outcomeTag,
    summary: value.summary?.slice(0, 260) || fallback.summary,
    feedTitle: value.feedTitle?.slice(0, 90) || fallback.feedTitle,
    feedText: value.feedText?.slice(0, 220) || fallback.feedText
  };
}

export async function POST(request: Request) {
  const parsed = dialogueResolveRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid dialogue resolve request." }, { status: 400 });
  }

  const { language, event, state, transcript, currentMood } = parsed.data;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const startedAt = Date.now();
  const fallback = fallbackDialogueResolution(event, transcript, language);

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
    const result = await callStructuredOutputWithRetry<DialogueResolution>(
      "dialogue_resolution",
      dialogueResolutionResponseSchema,
      `Resolve this in-world dialogue into one fixed game outcome.
Language requirement: ${aiLanguageInstruction(language)}
Speaker: ${event.speakerName}, ${event.speakerRole}
Archetype: ${event.archetype}
Final speaker mood: ${JSON.stringify(currentMood ?? event.mood)}
State: ${JSON.stringify(state)}
Narrative context: ${JSON.stringify(narrative)}
Transcript: ${JSON.stringify(transcript)}
Allowed outcomeTag values only:
- reassureAuthority
- surfaceDoubt
- increaseSuspicion
- containNarrative
- amplifyWitness
- noEffect
Rules:
- Choose only one outcomeTag.
- summary and feed text must describe the exchange, not numeric implementation.
- Do not invent new game rules, facts, witnesses, garment details, or post-dialogue events.
- Use the final mood only to judge pressure and cooperation; do not mention hidden scores.`
      ,
      { temperature: 0.15, maxOutputTokens: 420 }
    );
    return Response.json(safeResolution(result.data, fallback), {
      headers: {
        "X-PNE-AI-Source": "live",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": String(result.retries)
      }
    });
  } catch (error) {
    console.error("Dialogue resolve fallback", error);
    return Response.json(fallback, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": "2"
      }
    });
  }
}
