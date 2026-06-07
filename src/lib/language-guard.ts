import type { LanguageCode } from "./i18n";

const hanPattern = /[\u3400-\u9fff]/;
const allowedLatinTerms = /\b(?:AI|PNE|API|UI|OpenAI|The Emperor'?s Feed|low|medium|high|severe|engine|coach|accept_rewrite|publish_original|delay)\b/gi;

function textFromValue(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(textFromValue);
  return Object.values(value as Record<string, unknown>).flatMap(textFromValue);
}

function stripAllowedLatin(text: string) {
  return text
    .replace(allowedLatinTerms, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[@#][\w-]+/g, "")
    .replace(/\b[a-f0-9]{8,}\b/gi, "")
    .trim();
}

export function hasWrongLanguageText(value: unknown, language: LanguageCode) {
  return textFromValue(value).some((text) => {
    const compact = text.replace(/\s+/g, " ").trim();
    if (!compact) return false;
    if (language === "en") return hanPattern.test(compact);

    const stripped = stripAllowedLatin(compact);
    const latinWords = stripped.match(/[A-Za-z]{3,}/g) ?? [];
    const latinLetters = stripped.match(/[A-Za-z]/g)?.length ?? 0;
    const hanLetters = stripped.match(/[\u3400-\u9fff]/g)?.length ?? 0;
    if (hanLetters === 0 && latinWords.length >= 2) return true;
    return latinWords.length >= 3 || (latinLetters >= 18 && latinLetters > hanLetters);
  });
}

export function sourceForLocalizedPayload(value: unknown, language: LanguageCode) {
  return hasWrongLanguageText(value, language) ? "fallback" : "live";
}
