const apiKey = process.env.OPENAI_API_KEY?.trim();
const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.2";
const providerMode = process.env.OPENAI_PROVIDER_MODE?.trim() || "chat";
const timeoutMs = Number.isFinite(Number(process.env.AI_DIAGNOSTIC_TIMEOUT_MS))
  ? Math.max(1000, Math.floor(Number(process.env.AI_DIAGNOSTIC_TIMEOUT_MS)))
  : 20000;
const rawBaseUrl = process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
const baseUrl = rawBaseUrl.replace(/\/+$/, "").endsWith("/v1")
  ? rawBaseUrl.replace(/\/+$/, "")
  : `${rawBaseUrl.replace(/\/+$/, "")}/v1`;

function redact(value) {
  if (!apiKey) return value;
  return String(value).replaceAll(apiKey, "[redacted]");
}

async function readBody(response) {
  const text = await response.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return redact(text).slice(0, 500);
  }
}

async function check(name, path, init = {}) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });
    const body = await readBody(response);
    return {
      name,
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - startedAt,
      body
    };
  } catch (error) {
    return {
      name,
      ok: false,
      status: "network",
      latencyMs: Date.now() - startedAt,
      error: redact(error instanceof Error ? error.message : String(error)),
      cause: redact(error?.cause?.message ?? "")
    };
  } finally {
    clearTimeout(timeout);
  }
}

if (!apiKey) {
  console.error("OPENAI_API_KEY is required for endpoint diagnostics.");
  process.exit(1);
}

const checks = [
  check("models", "/models", { method: "GET" }),
  check("chat", "/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a terse endpoint diagnostic." },
        { role: "user", content: "Reply with OK." }
      ],
      max_completion_tokens: 16
    })
  }),
  check("structured-chat", "/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: "Return {\"ok\":true,\"label\":\"diagnostic\"}." }
      ],
      max_completion_tokens: 80,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "endpoint_diagnostic",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["ok", "label"],
            properties: {
              ok: { type: "boolean" },
              label: { type: "string" }
            }
          }
        }
      }
    })
  })
];

const results = await Promise.all(checks);
const summary = {
  baseUrl,
  model,
  providerMode,
  timeoutMs,
  results: results.map((result) => ({
    ...result,
    body: result.name === "models" && result.body?.data
      ? { models: result.body.data.map((item) => item.id).filter(Boolean).slice(0, 12) }
      : result.body
  }))
};

console.log(JSON.stringify(summary, null, 2));
process.exit(results.every((result) => result.ok) ? 0 : 1);
