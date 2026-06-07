import { fallbackFinalReportForLanguage, hasOpenAiKey, missingApiKeyResponse, callStructuredOutput } from "@/lib/ai";
import { finalReportRequestSchema, finalReportResponseSchema } from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import { buildNarrativeContext, endingFacetsForState } from "@/lib/narrative";
import type { EndingId, FinalReport, GameState } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = finalReportRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid final report request." }, { status: 400 });
  }
  if (!hasOpenAiKey()) return missingApiKeyResponse();

  const { endingId, language, state, history } = parsed.data;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const facets = endingFacetsForState(state as GameState, endingId as EndingId, language);
  const startedAt = Date.now();
  try {
    const result = await callStructuredOutput<FinalReport>(
      "final_report",
      finalReportResponseSchema,
      `Write a short final Palace AI report for ending "${endingId}".
Language requirement: ${aiLanguageInstruction(language)}
Final state: ${JSON.stringify(state)}
Action history: ${history.join(" -> ") || "none"}
Narrative context: ${JSON.stringify(narrative)}
Archive facets to preserve: ${JSON.stringify(facets)}
Tone: cold, bureaucratic, self-assessing, inside the story world.
Maximum 320 characters. Mention the dominant cause of the outcome, not every metric. Do not invent new post-parade events.`
    );
    return Response.json(result, {
      headers: {
        "X-PNE-AI-Source": "live",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  } catch {
    return Response.json(fallbackFinalReportForLanguage(language), {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
}
