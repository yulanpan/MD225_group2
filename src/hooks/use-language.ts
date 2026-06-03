"use client";

import { useEffect, useState } from "react";
import { languageStorageKey, normalizeLanguage, type LanguageCode } from "@/lib/i18n";

export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setLanguageState(normalizeLanguage(localStorage.getItem(languageStorageKey)));
      setLanguageReady(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  function setLanguage(nextLanguage: LanguageCode) {
    setLanguageState(nextLanguage);
    localStorage.setItem(languageStorageKey, nextLanguage);
  }

  function toggleLanguage() {
    setLanguage(language === "en" ? "zh" : "en");
  }

  return { language, languageReady, setLanguage, toggleLanguage };
}
