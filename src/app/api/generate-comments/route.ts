import { fallbackCommentsForLanguage, hasOpenAiKey, callStructuredOutputWithRetry } from "@/lib/ai";
import { commentsRequestSchema, commentsResponseSchema } from "@/lib/schemas";
import { aiLanguageInstruction } from "@/lib/i18n";
import { sourceForLocalizedPayload } from "@/lib/language-guard";
import { buildNarrativeContext } from "@/lib/narrative";
import type { GameState, GeneratedComments, PublicComment } from "@/lib/types";

const stances: PublicComment["stance"][] = ["praise", "fear", "doubt", "satire", "procedural", "witness"];
const generatedCommentCount = 10;

function sanitizeCommentText(value: unknown, language: "en" | "zh") {
  if (typeof value !== "string") return "";
  const text = value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (language === "en" && /[\u3400-\u9fff]/.test(text)) return "";
  if (language === "zh" && /[A-Za-z]{4,}/.test(text.replace(/PNE|AI/gi, ""))) return "";
  return text;
}

function safeGeneratedComments(value: GeneratedComments, fallback: GeneratedComments, language: "en" | "zh"): GeneratedComments {
  const comments = Array.isArray(value.comments)
    ? value.comments.map((item) => sanitizeCommentText(item, language)).filter(Boolean)
    : [];
  const publicComments = Array.isArray(value.publicComments)
    ? value.publicComments.reduce<PublicComment[]>((items, item, index) => {
        const text = sanitizeCommentText(item?.text, language);
        if (!text) return items;
        return [
          ...items,
          {
            handle: sanitizeCommentText(item?.handle, language) || (language === "zh" ? `@公众信号_${index + 1}` : `@public_signal_${index + 1}`),
            persona: sanitizeCommentText(item?.persona, language) || (language === "zh" ? "市民" : "citizen"),
            stance: stances.includes(item?.stance) ? item.stance : stances[index % stances.length],
            text,
            intensity: Math.max(1, Math.min(5, Math.round(item?.intensity ?? 2)))
          }
        ];
      }, [])
    : [];
  const distinctStances = new Set(publicComments.map((comment) => comment.stance));
  if (comments.length >= generatedCommentCount && publicComments.length >= generatedCommentCount && distinctStances.size >= 3) {
    return {
      comments: comments.slice(0, generatedCommentCount),
      publicComments: publicComments.slice(0, generatedCommentCount)
    };
  }
  return fallback;
}

export async function POST(request: Request) {
  const parsed = commentsRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid comments request." }, { status: 400 });
  }
  const { language, state, latestPost } = parsed.data;
  const narrative = buildNarrativeContext(state as GameState, (state as Partial<GameState>).history?.at?.(-1));
  const startedAt = Date.now();
  if (!hasOpenAiKey()) {
    return Response.json(fallbackCommentsForLanguage(language), {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
  try {
    const result = await callStructuredOutputWithRetry<GeneratedComments>(
      "generated_comments",
      commentsResponseSchema,
      `Generate ${generatedCommentCount} short public comments for a fictional royal social media feed.
Language requirement: ${aiLanguageInstruction(language)}
Current state: ${JSON.stringify(state)}
Narrative context: ${JSON.stringify(narrative)}
Latest post: ${latestPost}
If pressure is high, include fear and conformity. If public doubt is high, include uncertainty, witness comparison, satire, or quiet truth.
Return comments plus matching publicComments.
Rules:
- Return exactly ${generatedCommentCount} comments and ${generatedCommentCount} publicComments.
- publicComments must include at least 3 different stances from praise, fear, doubt, satire, procedural, witness.
- Text must sound like different feed users, not officials and not a narrator.
- Include messy social texture: hesitation, mimicry, jokes, fear, and cautious observation.
- Each comment text must be under 120 characters.
- Use only allowedFacts from narrative context; do not add new events, witnesses, garment details, or offscreen scenes.`
      ,
      { retries: 1, baseDelayMs: 300, temperature: 0.75, maxOutputTokens: 1300 }
    );
    const fallback = fallbackCommentsForLanguage(language);
    const payload = safeGeneratedComments(result.data, fallback, language);
    const source = payload === fallback || sourceForLocalizedPayload(payload, language) === "fallback"
      ? "fallback"
      : "live";
    return Response.json(payload, {
      headers: {
        "X-PNE-AI-Source": source,
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  } catch {
    return Response.json(fallbackCommentsForLanguage(language), {
      headers: {
        "X-PNE-AI-Source": "fallback",
        "X-PNE-AI-Latency": String(Date.now() - startedAt)
      }
    });
  }
}
