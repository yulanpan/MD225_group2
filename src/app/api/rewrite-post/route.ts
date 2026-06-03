import { fallbackRewriteForLanguage, hasOpenAiKey, missingApiKeyResponse, callStructuredOutput } from "@/lib/ai";
import { rewriteRequestSchema, rewriteResponseSchema } from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import { buildNarrativeContext } from "@/lib/narrative";
import type { GameState, RewriteResult } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = rewriteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid rewrite request." }, { status: 400 });
  }
  if (!hasOpenAiKey()) return missingApiKeyResponse();

  const { actionId, language, originalPost, state } = parsed.data;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const startedAt = Date.now();
  try {
    const result = await callStructuredOutput<RewriteResult>(
      "rewrite_post",
      rewriteResponseSchema,
      `Rewrite this risky palace feed post into safer palace-approved language.
Language requirement: ${aiLanguageInstruction(language)}
Action: ${actionId}
Original post: ${originalPost}
Current state: ${JSON.stringify(state)}
Narrative context: ${JSON.stringify(narrative)}
Rules:
- rewrittenPost: one public-feed post, maximum 260 characters.
- strategy: one operational phrase, maximum 140 characters.
- Do not directly say the Emperor is naked or the cloth is fake.
- Use only allowedFacts from narrative context; do not invent new proof, witnesses, garment details, or palace procedures.
- Preserve a small trace of the issue while making the post safer.`
    );
    return Response.json(result, {
      headers: {
        "X-PNE-AI-Source": "live",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  } catch {
    return Response.json(fallbackRewriteForLanguage(language), {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
}
