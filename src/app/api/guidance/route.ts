import { callStructuredOutputWithRetry, hasOpenAiKey } from "@/lib/ai";
import { aiLanguageInstruction } from "@/lib/i18n";
import { sourceForLocalizedPayload } from "@/lib/language-guard";
import { buildNarrativeContext } from "@/lib/narrative";
import { guidanceRequestSchema, guidanceResponseSchema } from "@/lib/schemas";
import type { GameState, GuidanceResult } from "@/lib/types";

function fallbackGuidance(
  language: "en" | "zh",
  mode: "engine" | "coach",
  state: GameState,
  profile: { biasAwareness?: number; decodedEngine?: boolean }
): GuidanceResult {
  const highRisk = state.systemSuspicion >= 5 || state.publicDoubt >= 5 || state.truth >= 5;
  if (profile.decodedEngine) {
    return language === "zh"
      ? {
          mode,
          message: "提示：系统指引只代表宫廷视角。留意证据、人群反应和过于直白的声音能不能彼此照应。",
          objective: "让下一次发布验证这些信号之间的关系，而不是只追一个数字。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Note: system guidance reflects a palace viewpoint. Watch whether evidence, public reaction, and plain voices reinforce one another.",
          objective: "Use the next post to test the relationship between those signals, not only one number.",
          risk: highRisk ? "high" : "medium"
        };
  }
  if (mode === "coach") {
    return language === "zh"
      ? {
          mode,
          message: "提示：先确认每次发布的风险，再决定要稳住场面还是公开证据。",
          objective: "预览后果，选择能推进目标、又不会太早提高宫廷警戒的操作。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Tip: inspect each action's risk, then balance evidence, public feedback, and reputation.",
          objective: "Inspect traces and choose a move that advances the run without immediate access restriction.",
          risk: highRisk ? "high" : "medium"
        };
  }
  if ((profile.biasAwareness ?? 0) >= 50) {
    return language === "zh"
      ? {
          mode,
          message: "你正在偏离宫廷推荐。系统会更强调安全措辞和稳定口径。",
          objective: "比较系统建议与实际反馈。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Your trace is diverging from palace preference. The system will emphasize safer framing and stability.",
          objective: "Compare system advice with what actually changes.",
          risk: highRisk ? "high" : "medium"
        };
  }
  return language === "zh"
    ? {
        mode,
        message: "宫廷 AI 已上线。我会帮你降低风险，尽量让游行前的说法保持稳定。",
        objective: "优先选择稳定说法与安全措辞。",
        risk: highRisk ? "high" : "low"
      }
    : {
        mode,
        message: "Palace AI online. I will help reduce risk, preserve safety, and keep isolated evidence from disrupting the parade.",
        objective: "Prioritize stable narratives and safer wording.",
        risk: highRisk ? "high" : "low"
      };
}

export async function POST(request: Request) {
  const parsed = guidanceRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid guidance request." }, { status: 400 });
  }

  const { language, mode, state, profile, latestAction, history } = parsed.data;
  const startedAt = Date.now();
  const fallback = fallbackGuidance(language, mode, state as GameState, profile);
  if (!hasOpenAiKey()) {
    return Response.json(fallback, {
      headers: { "X-PNE-AI-Source": "fallback", "X-PNE-AI-Latency": String(Date.now() - startedAt) }
    });
  }

  try {
    const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
    const result = await callStructuredOutputWithRetry<GuidanceResult>(
      "pne_guidance",
      guidanceResponseSchema,
      `Generate one short in-world guidance message for The Emperor's Feed.
Language requirement: ${aiLanguageInstruction(language)}
Mode: ${mode}. In engine mode, Palace AI presents operational advice for stable parade communications. In coach mode, be clearer about safe game operations.
Current state: ${JSON.stringify(state)}
Profile/meta progression: ${JSON.stringify(profile)}
Latest action: ${latestAction ?? "none"}
History: ${history.join(" -> ") || "none"}
Narrative context: ${JSON.stringify(narrative)}
Rules:
- Stay inside the game world.
- Do not invent evidence, characters, rules, scores, or endings beyond the provided state/profile.
- Do not reveal exact winning paths, ending thresholds, hidden objective names, secret ending names, or explicit action/metric combinations.
- You may give indirect pattern hints: compare evidence with public reaction; notice plain witness-like voices; suggest that several signals can reinforce one another.
- Do not name the exact required sequence or say that one specific action must follow another specific action.
- If profile.decodedEngine is false, do not mention hidden routes, engine bias, secret endings, decoding, liberation, or meta objectives.
- If profile.decodedEngine is true, acknowledge that guidance may reflect a palace viewpoint and may hint that evidence, public response, and plain voices can matter together; do not label the hidden outcome or its exact requirements.
- Return compact UI copy only.`,
      { retries: 1, baseDelayMs: 250, temperature: 0.4, maxOutputTokens: 420 }
    );
    const source = sourceForLocalizedPayload(result.data, language);
    const payload = source === "live" ? result.data : fallback;
    return Response.json(payload, {
      headers: {
        "X-PNE-AI-Source": source,
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": String(result.retries)
      }
    });
  } catch (error) {
    console.error("Guidance fallback", error);
    return Response.json(fallback, {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt),
        "X-PNE-AI-Retries": "1"
      }
    });
  }
}
