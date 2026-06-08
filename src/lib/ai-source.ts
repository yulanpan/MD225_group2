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

export function pairedAiSourceLabel(
  first: AiSource,
  second: AiSource,
  language: LanguageCode,
  labels: { first: string; second: string } = language === "zh"
    ? { first: "开场", second: "回复" }
    : { first: "opening", second: "replies" }
) {
  if (first === second) return aiSourceLabel(first, language);
  const separator = language === "zh" ? "：" : ": ";
  return `${labels.first}${separator}${aiSourceLabel(first, language)} / ${labels.second}${separator}${aiSourceLabel(second, language)}`;
}
