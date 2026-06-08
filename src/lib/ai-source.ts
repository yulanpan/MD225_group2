import { commonText, type LanguageCode } from "./i18n";

export type AiSource = "live" | "fallback" | "unavailable";

export function normalizeAiSource(value: string | null | undefined, fallback: AiSource = "fallback"): AiSource {
  return value === "live" || value === "fallback" || value === "unavailable" ? value : fallback;
}

export function aiSourceLabel(source: AiSource, language: LanguageCode) {
  if (source === "live") return commonText("aiLive", language);
  if (source === "unavailable") return commonText("aiUnavailable", language);
  return commonText("aiFallback", language);
}

export function combinedAiSourceLabel(sources: AiSource[], language: LanguageCode) {
  if (sources.includes("live")) return aiSourceLabel("live", language);
  if (sources.includes("fallback")) return aiSourceLabel("fallback", language);
  return aiSourceLabel("unavailable", language);
}
