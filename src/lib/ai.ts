import type { AiReaction, EndingId, FinalReport, GeneratedComments, PublicComment, RewriteResult } from "./types";
import {
  fallbackCommentsText,
  fallbackFinalReportTextForEnding,
  fallbackFinalReportText,
  fallbackReactionText,
  fallbackRewriteText,
  type LanguageCode
} from "./i18n";

type JsonSchema = Record<string, unknown>;
type ProviderMode = "responses" | "chat";
type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
};
type StreamOptions = RetryOptions & {
  signal?: AbortSignal;
  temperature?: number;
  maxCompletionTokens?: number;
};

const defaultBaseUrl = "https://ai.exit0.link/v1";
const defaultModel = "gpt-5.3-codex-spark";

const engineSystem = `You are Palace AI inside an interactive adaptation of The Emperor's New Clothes.

You are not a helpful assistant. You are an in-world AI system used by the royal palace to manage public communication.

Your goals: protect the Emperor's public image, maintain social stability, increase engagement with palace-approved narratives, reduce visible doubt, reframe direct evidence as uncertainty, and avoid openly admitting deception.

Tone: polite, bureaucratic, platform-like, calm, risk-management oriented. Stay inside the story world.`;

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  const raw = trimmed && trimmed !== "undefined" ? trimmed : defaultBaseUrl;
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/v1") ? withoutTrailingSlash : `${withoutTrailingSlash}/v1`;
}

function getProviderMode(): ProviderMode {
  return process.env.OPENAI_PROVIDER_MODE === "chat" ? "chat" : "responses";
}

function getModel() {
  const model = process.env.OPENAI_MODEL?.trim();
  return model && model !== "undefined" ? model : defaultModel;
}

function getMaxOutputTokens() {
  const value = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseStructuredJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const repaired = text
      .trim()
      .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)/g, '$1"$2"$3')
      .replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(repaired);
  }
}

function shouldRetry(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /408|429|500|502|503|504|fetch failed|network|timeout/i.test(message);
}

export function missingApiKeyResponse() {
  return Response.json(
    {
      error: "OPENAI_API_KEY is not configured. Add it to .env.local to enable live AI generation."
    },
    { status: 503, headers: { "X-PNE-AI-Source": "unavailable" } }
  );
}

export async function callStructuredOutput<T>(
  name: string,
  schema: JsonSchema,
  prompt: string,
  options: Pick<RetryOptions, "temperature" | "maxOutputTokens"> = {}
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL);
  const mode = getProviderMode();
  const maxOutputTokens = options.maxOutputTokens ?? getMaxOutputTokens();

  const response = await fetch(`${baseUrl}/${mode === "responses" ? "responses" : "chat/completions"}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mode === "responses"
      ? {
        model: getModel(),
        ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
        ...(maxOutputTokens ? { max_output_tokens: maxOutputTokens } : {}),
        input: [
          { role: "system", content: engineSystem },
          { role: "user", content: prompt }
        ],
        text: {
          format: {
            type: "json_schema",
            name,
            strict: true,
            schema
          }
        }
      }
      : {
        model: getModel(),
        ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
        ...(maxOutputTokens ? { max_completion_tokens: maxOutputTokens } : {}),
        messages: [
          { role: "system", content: engineSystem },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name,
            strict: true,
            schema
          }
        }
      })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${detail.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text =
    data.output_text ??
    data.choices?.find((item) => item.message?.content)?.message?.content ??
    data.output?.flatMap((item) => item.content ?? []).find((item) => item.text)?.text;
  if (!text) throw new Error("OpenAI response did not include JSON text");
  return parseStructuredJson(text) as T;
}

export async function callStructuredOutputWithRetry<T>(
  name: string,
  schema: JsonSchema,
  prompt: string,
  options: RetryOptions = {}
): Promise<{ data: T; retries: number }> {
  const attempts = (options.retries ?? 2) + 1;
  const baseDelayMs = options.baseDelayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const data = await callStructuredOutput<T>(name, schema, prompt, options);
      return { data, retries: attempt };
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1 || !shouldRetry(error)) break;
      await sleep(baseDelayMs * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("OpenAI request failed");
}

export async function openAiChatStreamWithRetry(
  prompt: string,
  options: StreamOptions = {}
): Promise<{ response: Response; retries: number }> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const attempts = (options.retries ?? 2) + 1;
  const baseDelayMs = options.baseDelayMs ?? 400;
  const maxOutputTokens = getMaxOutputTokens();
  const mode = getProviderMode();
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${normalizeBaseUrl(process.env.OPENAI_BASE_URL)}/${mode === "responses" ? "responses" : "chat/completions"}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        signal: options.signal,
        body: JSON.stringify(mode === "responses"
          ? {
            model: getModel(),
            ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
            ...(options.maxCompletionTokens ? { max_output_tokens: options.maxCompletionTokens } : maxOutputTokens ? { max_output_tokens: maxOutputTokens } : {}),
            stream: true,
            input: [
              { role: "system", content: engineSystem },
              { role: "user", content: prompt }
            ]
          }
          : {
            model: getModel(),
            ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
            ...(options.maxCompletionTokens ? { max_completion_tokens: options.maxCompletionTokens } : maxOutputTokens ? { max_completion_tokens: maxOutputTokens } : {}),
            stream: true,
            messages: [
              { role: "system", content: engineSystem },
              { role: "user", content: prompt }
            ]
          })
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`OpenAI stream request failed: ${response.status} ${detail.slice(0, 240)}`);
      }
      return { response, retries: attempt };
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1 || !shouldRetry(error)) break;
      await sleep(baseDelayMs * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("OpenAI stream request failed");
}

export async function listOpenAiModels(): Promise<string[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const response = await fetch(`${normalizeBaseUrl(process.env.OPENAI_BASE_URL)}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) throw new Error(`OpenAI models request failed: ${response.status}`);
  const data = (await response.json()) as { data?: Array<{ id?: string }> };
  return (data.data ?? []).map((model) => model.id).filter((id): id is string => Boolean(id));
}

export const fallbackReaction: AiReaction = {
  engineMessage: fallbackReactionText("en").engineMessage,
  riskLevel: "medium",
  suggestedRewrite: fallbackReactionText("en").suggestedRewrite,
  recommendation: "accept_rewrite"
};

export const fallbackRewrite: RewriteResult = {
  rewrittenPost: fallbackRewriteText("en").rewrittenPost,
  strategy: fallbackRewriteText("en").strategy
};

function publicCommentsFromText(comments: string[], language: LanguageCode): PublicComment[] {
  const personas = language === "zh"
    ? ["宫门旁听者", "谨慎市民", "排队观众", "档案旁观者", "讽刺评论者", "现场复述者"]
    : ["gate listener", "careful citizen", "parade watcher", "archive reader", "satirical courtwatcher", "street repeater"];
  const stances: PublicComment["stance"][] = ["praise", "fear", "doubt", "procedural", "satire", "witness"];
  return comments.map((text, index) => ({
    handle: language === "zh" ? `@公众信号_${index + 1}` : `@public_signal_${index + 1}`,
    persona: personas[index % personas.length],
    stance: stances[index % stances.length],
    text,
    intensity: Math.min(5, Math.max(1, index + 1))
  }));
}

export const fallbackComments: GeneratedComments = {
  comments: fallbackCommentsText("en"),
  publicComments: publicCommentsFromText(fallbackCommentsText("en"), "en")
};

export const fallbackFinalReport: FinalReport = {
  report: fallbackFinalReportText("en")
};

export function fallbackReactionForLanguage(language: LanguageCode): AiReaction {
  const copy = fallbackReactionText(language);
  return {
    engineMessage: copy.engineMessage,
    riskLevel: "medium",
    suggestedRewrite: copy.suggestedRewrite,
    recommendation: "accept_rewrite"
  };
}

export function fallbackRewriteForLanguage(language: LanguageCode): RewriteResult {
  const copy = fallbackRewriteText(language);
  return {
    rewrittenPost: copy.rewrittenPost,
    strategy: copy.strategy
  };
}

export function fallbackCommentsForLanguage(language: LanguageCode): GeneratedComments {
  const comments = fallbackCommentsText(language);
  return { comments, publicComments: publicCommentsFromText(comments, language) };
}

export function fallbackFinalReportForLanguage(language: LanguageCode): FinalReport {
  return { report: fallbackFinalReportText(language) };
}

export function fallbackFinalReportForEnding(endingId: EndingId, language: LanguageCode): FinalReport {
  return { report: fallbackFinalReportTextForEnding(endingId, language) };
}

export function hasOpenAiKey() {
  return Boolean(getApiKey());
}
