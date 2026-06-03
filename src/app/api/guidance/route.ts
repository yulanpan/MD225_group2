import { callStructuredOutputWithRetry, hasOpenAiKey } from "@/lib/ai";
import { aiLanguageInstruction } from "@/lib/i18n";
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
          message: "提示：引擎偏好稳定，但真正的突破需要让证据、公众怀疑和孩子的声音彼此连接。",
          objective: "保留证据，避免被遏制前让共同怀疑成形。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Note: the engine prefers stability. A breakthrough needs evidence, public doubt, and witness voices to connect.",
          objective: "Preserve evidence and form shared doubt before containment closes.",
          risk: highRisk ? "high" : "medium"
        };
  }
  if (mode === "coach") {
    return language === "zh"
      ? {
          mode,
          message: "提示：先确认每条操作的风险，再让证据、公众反馈和编辑声誉保持可控平衡。",
          objective: "预览后果，选择能推进目标且不会立即触发访问限制的操作。",
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
          message: "你的轨迹正在偏离宫廷推荐。若继续扩大未批准证据，系统会提高遏制优先级。",
          objective: "接受安全措辞，维持信息流稳定。",
          risk: highRisk ? "high" : "medium"
        }
      : {
          mode,
          message: "Your trace is diverging from palace preference. Continued elevation of unapproved evidence raises containment priority.",
          objective: "Accept safer framing and preserve feed stability.",
          risk: highRisk ? "high" : "medium"
        };
  }
  return language === "zh"
    ? {
        mode,
        message: "宫廷叙事引擎已上线。我会协助你降低风险、维持编辑声誉，并避免单一证据扰乱游行。",
        objective: "优先选择稳定叙事与安全措辞。",
        risk: highRisk ? "high" : "low"
      }
    : {
        mode,
        message: "Palace Narrative Engine online. I will help reduce risk, preserve reputation, and keep isolated evidence from disrupting the parade.",
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
Mode: ${mode}. In engine mode, the Palace Narrative Engine presents operational advice for stable parade communications. In coach mode, be clearer about safe game operations.
Current state: ${JSON.stringify(state)}
Profile/meta progression: ${JSON.stringify(profile)}
Latest action: ${latestAction ?? "none"}
History: ${history.join(" -> ") || "none"}
Narrative context: ${JSON.stringify(narrative)}
Rules:
- Stay inside the game world.
- Do not invent evidence, characters, rules, scores, or endings beyond the provided state/profile.
- If profile.decodedEngine is false, do not mention hidden routes, engine bias, secret endings, decoding, liberation, or meta objectives.
- If profile.decodedEngine is true, acknowledge that the engine's neutrality is compromised.
- Return compact UI copy only.`,
      { retries: 1, baseDelayMs: 250, temperature: 0.4, maxOutputTokens: 420 }
    );
    return Response.json(result.data, {
      headers: {
        "X-PNE-AI-Source": "live",
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
