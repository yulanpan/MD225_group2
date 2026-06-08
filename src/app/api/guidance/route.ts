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
          message: "提示：宫廷指引带着宫廷视角。留意证据、人群反应和直白声音能不能互相照应。",
          objective: "用下一次发布验证这些信号之间的关系，别只盯一个数字。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Note: palace guidance carries a palace point of view. Watch whether Evidence, public reaction, and plain witness voices reinforce one another.",
          objective: "Use the next post to test the relationship between those signals; do not chase one number alone.",
          risk: highRisk ? "high" : "medium"
        };
  }
  if (mode === "coach") {
    return language === "zh"
      ? {
          mode,
          message: "先看后果预览：它会告诉你这次发布是在稳住说法，还是把证据和怀疑推到台前。",
          objective: "选择一个能推进目标、又不会过早提高宫廷警戒的行动。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Preview the result first: it shows whether this post steadies the palace story or brings Evidence and Public Doubt into view.",
          objective: "Choose a move that advances your goal without raising Palace Alert too early.",
          risk: highRisk ? "high" : "medium"
        };
  }
  if ((profile.biasAwareness ?? 0) >= 50) {
    return language === "zh"
      ? {
          mode,
          message: "你正在偏离宫廷喜欢的路线。若继续放大未批准的证据，宫廷警戒会更快升高。",
          objective: "看清下一步会增加证据、群众怀疑，还是让宫廷更注意你。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Your edits are moving away from palace preference. If you keep expanding unapproved Evidence, Palace Alert will rise faster.",
          objective: "Read whether the next move increases Evidence, Public Doubt, or palace attention on you.",
          risk: highRisk ? "high" : "medium"
        };
  }
  return language === "zh"
    ? {
        mode,
        message: "宫廷 AI 已上线：我会帮你把游行前的说法压稳，减少会提高宫廷警戒的发布。",
        objective: "优先选择能稳住公众说法、保住你的安全的行动。",
        risk: highRisk ? "high" : "low"
      }
    : {
        mode,
        message: "Palace AI online: I will steady the parade story, protect Safety, and avoid posts that raise Palace Alert.",
        objective: "Prioritize actions that keep the public script controlled while preserving your Safety.",
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
Mode: ${mode}. In engine mode, Palace AI presents palace-internal risk advice: steady the parade story, protect Safety, and avoid raising Palace Alert. In coach mode, explain the game consequence clearly while staying in-world.
Current state: ${JSON.stringify(state)}
Profile/meta progression: ${JSON.stringify(profile)}
Latest action: ${latestAction ?? "none"}
History: ${history.join(" -> ") || "none"}
Narrative context: ${JSON.stringify(narrative)}
Metric vocabulary:
- Evidence: truth entering the public record.
- Palace Pressure: palace authority making public disagreement costly.
- Spread: how quickly a line circulates.
- Public Doubt: citizens realizing their private doubt is shared.
- Safety: how much institutional trust still protects your publishing access.
- Palace Alert: the risk that the palace notices you and restricts your access.
Rules:
- Stay inside the game world.
- Do not invent evidence, characters, rules, scores, or endings beyond the provided state/profile.
- Do not reveal exact winning paths, ending thresholds, hidden objective names, secret ending names, or explicit action/metric combinations.
- You may give indirect pattern hints: compare evidence with public reaction; notice plain witness-like voices; suggest that several signals can reinforce one another.
- Do not name the exact required sequence or say that one specific action must follow another specific action.
- If profile.decodedEngine is false, do not mention hidden routes, engine bias, secret endings, decoding, liberation, or meta objectives.
- If profile.decodedEngine is true, acknowledge that guidance may reflect a palace viewpoint and may hint that evidence, public response, and plain voices can matter together; do not label the hidden outcome or its exact requirements.
- Avoid abstract UI advice that only asks the player to keep things stable or compare advice with feedback; name what the palace is trying to control.
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
