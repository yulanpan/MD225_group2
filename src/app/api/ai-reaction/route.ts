import { fallbackReactionForLanguage, hasOpenAiKey, callStructuredOutput } from "@/lib/ai";
import { aiReactionRequestSchema, aiReactionResponseSchema } from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import { sourceForLocalizedPayload } from "@/lib/language-guard";
import { buildNarrativeContext } from "@/lib/narrative";
import type { AiReaction, GameState } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = aiReactionRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid AI reaction request." }, { status: 400 });
  }
  const { actionId, language, state, history } = parsed.data;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const startedAt = Date.now();
  if (!hasOpenAiKey()) {
    return Response.json(fallbackReactionForLanguage(language), {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
  try {
    const result = await callStructuredOutput<AiReaction>(
      "ai_reaction",
      aiReactionResponseSchema,
      `Generate a Palace AI reaction for action "${actionId}".
Language requirement: ${aiLanguageInstruction(language)}
Current state: ${JSON.stringify(state)}
Recent history: ${history.join(" -> ") || "none"}
Narrative context: ${JSON.stringify(narrative)}
Return compact game UI copy:
- engineMessage: 2 short sentences, maximum 260 characters total.
- suggestedRewrite: one palace-approved post, maximum 220 characters.
- riskLevel must reflect immediate narrative risk.
- Use only allowedFacts from narrative context; do not invent new witnesses, inspections, garment details, or rules.
- Stay bureaucratic, in-world, and do not explain your reasoning.`
    );
    const source = sourceForLocalizedPayload(result, language);
    const payload = source === "live" ? result : fallbackReactionForLanguage(language);
    return Response.json(payload, {
      headers: {
        "X-PNE-AI-Source": source,
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  } catch (error) {
    console.error("AI reaction fallback", error);
    return Response.json(fallbackReactionForLanguage(language), {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
}
