import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
type ReasoningEffort = "low" | "medium" | "high" | "xhigh";
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
const curlStatusMarker = "__PNE_CURL_STATUS__:";

const structuredSystem = `You generate compact JSON for The Emperor's Feed, an interactive narrative game inspired by The Emperor's New Clothes.

Write as the Palace Narrative Engine, a calm palace communications system. Keep every answer fictional, in-world, bureaucratic, and concise.

Priorities inside the story: protect the Emperor's public image, maintain order around the parade, frame uncertain evidence carefully, and keep public messages aligned with palace-approved language.

Follow the requested JSON schema exactly. Do not add explanations outside the JSON.`;

const dialogueSystem = `You write short speaker replies for The Emperor's Feed, an interactive narrative game inspired by The Emperor's New Clothes.

Stay fictional and in-world. Match the current speaker's role and pressure without adding new facts.

Return only the speaker's spoken line as plain text. Do not return JSON, markdown, speaker labels, or explanations.`;

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

function getReasoningEffort(): ReasoningEffort | undefined {
  const value = process.env.OPENAI_REASONING_EFFORT?.trim().toLowerCase();
  if (value === "none" || value === "off" || value === "default") return undefined;
  if (value === "low" || value === "medium" || value === "high" || value === "xhigh") return value;
  const model = getModel().toLowerCase();
  return model.includes("gpt-5") || model.includes("codex") ? "low" : undefined;
}

function getHttpTransport() {
  return process.env.OPENAI_HTTP_TRANSPORT?.trim().toLowerCase() === "curl" ? "curl" : "fetch";
}

function getHttpTimeoutSeconds() {
  const value = Number(process.env.OPENAI_HTTP_TIMEOUT_SECONDS);
  return Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : 30;
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

function responseFromCurlOutput(output: string) {
  const markerIndex = output.lastIndexOf(curlStatusMarker);
  if (markerIndex < 0) {
    throw new Error("OpenAI curl request did not include a status marker");
  }
  const body = output.slice(0, markerIndex).replace(/\n$/, "");
  const status = Number(output.slice(markerIndex + curlStatusMarker.length).trim());
  if (!Number.isFinite(status)) {
    throw new Error("OpenAI curl request returned an invalid status marker");
  }
  return new Response(body, {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function curlOpenAiRequest(url: string, init: RequestInit) {
  const tempDir = await mkdtemp(join(tmpdir(), "pne-ai-"));
  const bodyPath = join(tempDir, "body.json");
  const body = typeof init.body === "string" ? init.body : "";
  if (body) await writeFile(bodyPath, body, { mode: 0o600 });

  const headers = new Headers(init.headers);
  const config = [
    "silent",
    "show-error",
    "location",
    `max-time = "${getHttpTimeoutSeconds()}"`,
    `request = "${init.method ?? "GET"}"`,
    `url = "${url}"`,
    `write-out = "\\n${curlStatusMarker}%{http_code}"`,
    ...Array.from(headers.entries()).map(([key, value]) => `header = "${key}: ${value.replace(/"/g, '\\"')}"`),
    ...(body ? [`data-binary = "@${bodyPath.replace(/"/g, '\\"')}"`] : [])
  ].join("\n");

  try {
    const result = await new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve, reject) => {
      const child = spawn("curl", ["--config", "-"], {
        stdio: ["pipe", "pipe", "pipe"],
        env: curlEnvironment()
      });
      let stdout = "";
      let stderr = "";
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
      child.on("error", reject);
      child.on("close", (code) => resolve({ stdout, stderr, code }));
      child.stdin.end(config);
    });
    if (result.code !== 0) {
      throw new Error(`OpenAI curl request failed: ${result.stderr.trim().slice(0, 240) || `exit ${result.code}`}`);
    }
    return responseFromCurlOutput(result.stdout);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function curlEnvironment() {
  const env = { ...process.env };
  if (process.env.OPENAI_CURL_USE_PROXY === "true") return env;
  for (const key of ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]) {
    delete env[key];
  }
  env.NO_PROXY = "*";
  env.no_proxy = "*";
  return env;
}

async function requestOpenAi(url: string, init: RequestInit) {
  if (getHttpTransport() === "curl") {
    return curlOpenAiRequest(url, init);
  }
  return fetch(url, init);
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
  const reasoningEffort = getReasoningEffort();

  const response = await requestOpenAi(`${baseUrl}/${mode === "responses" ? "responses" : "chat/completions"}`, {
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
          { role: "system", content: structuredSystem },
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
        ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        messages: [
          { role: "system", content: structuredSystem },
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
  const reasoningEffort = getReasoningEffort();
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await requestOpenAi(`${normalizeBaseUrl(process.env.OPENAI_BASE_URL)}/${mode === "responses" ? "responses" : "chat/completions"}`, {
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
              { role: "system", content: dialogueSystem },
              { role: "user", content: prompt }
            ]
          }
          : {
            model: getModel(),
            ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
            ...(options.maxCompletionTokens ? { max_completion_tokens: options.maxCompletionTokens } : maxOutputTokens ? { max_completion_tokens: maxOutputTokens } : {}),
            ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
            stream: true,
            messages: [
              { role: "system", content: dialogueSystem },
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
  const response = await requestOpenAi(`${normalizeBaseUrl(process.env.OPENAI_BASE_URL)}/models`, {
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
