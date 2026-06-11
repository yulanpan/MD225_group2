import { fallbackFinalReportForEnding, hasOpenAiKey, callStructuredOutput } from "@/lib/ai";
import { finalReportRequestSchema, finalReportResponseSchema } from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import { sourceForLocalizedPayload } from "@/lib/language-guard";
import { buildNarrativeContext, endingFacetsForState } from "@/lib/narrative";
import type { EndingId, FinalReport, GameState } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = finalReportRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid final report request." }, { status: 400 });
  }
  const { endingId, language, state, history } = parsed.data;
  const resolvedEndingId = endingId as EndingId;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const facets = endingFacetsForState(state as GameState, resolvedEndingId, language);
  const fallbackReport = fallbackFinalReportForEnding(resolvedEndingId, language);
  const hiddenEndingInstruction = resolvedEndingId === "narrativeLiberation"
    ? "\nFor this ending, do not describe the record as unresolved or palace-controlled. Acknowledge that evidence, shared doubt, and the child's plain sentence remained public, and that Palace AI can no longer close the record for everyone."
    : "";
  const startedAt = Date.now();
  if (!hasOpenAiKey()) {
    return Response.json(fallbackReport, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
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
Maximum 320 characters. Mention the dominant cause of the outcome, not every metric. Do not invent new post-parade events.${hiddenEndingInstruction}`
    );
    const source = sourceForLocalizedPayload(result, language);
    const payload = source === "live" ? result : fallbackReport;
    return Response.json(payload, {
      headers: {
        "X-PNE-AI-Source": source,
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  } catch {
    return Response.json(fallbackReport, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
}
