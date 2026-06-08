"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { analyzeEnding, calculateEnding, createInitialState, explainEnding, loadStateFromStorage, localizedEndingTitle } from "@/lib/game-rules";
import { endingSceneForEnding } from "@/lib/audio";
import { actionText, choiceText, commonText, endingText, fallbackFinalReportText, languageName, metricLabel, type LanguageCode } from "@/lib/i18n";
import { hasWrongLanguageText } from "@/lib/language-guard";
import { endingFacetsForState } from "@/lib/narrative";
import { useLanguage } from "@/hooks/use-language";
import { useGameAudio } from "@/app/audio-provider";
import AuthControl from "@/app/auth-control";
import {
  achievementDefinition,
  clearCurrentRunId,
  engineFragmentDefinition,
  ensureCurrentRunId,
  loadProfile,
  recordCompletedRun,
  saveProfile
} from "@/lib/profile";
import { endingPressureProfile } from "@/lib/visual-state";
import type { AchievementUnlock, EndingId, FeedEvent, FinalReport, GameState, HistoryEntry, PlayerProfile, RunRecord } from "@/lib/types";

const replayTargetKey = "emperor-feed-replay-target";
const briefingKey = "emperor-feed-briefing-dismissed";
const tutorialCompletedKey = "emperor-feed-tutorial-completed";

function actionPathTone(choice: string) {
  if (choice === "original") return "risk";
  if (choice === "rewrite") return "ai";
  return "default";
}

async function requestFinalReport(endingId: EndingId, state: GameState, language: LanguageCode): Promise<string> {
  try {
    const response = await fetch("/api/final-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endingId,
        language,
        state,
        history: state.history.map((entry) => entry.actionTitle)
      })
    });
    if (!response.ok) return fallbackFinalReportText(language);
    const data = (await response.json()) as FinalReport;
    return hasWrongLanguageText(data.report, language) ? fallbackFinalReportText(language) : data.report;
  } catch {
    return fallbackFinalReportText(language);
  }
}

function safeStoredText(text: string | undefined, language: LanguageCode, fallback: string) {
  if (!text || hasWrongLanguageText(text, language)) return fallback;
  return text;
}

function localizedActionTitle(entry: Pick<HistoryEntry, "actionId" | "actionTitle">, language: LanguageCode) {
  try {
    return actionText(entry.actionId, language).title;
  } catch {
    return safeStoredText(entry.actionTitle, language, language === "zh" ? "旧行动记录" : "Saved action");
  }
}

function localizedPublishedText(entry: HistoryEntry, language: LanguageCode) {
  try {
    const copy = actionText(entry.actionId, language);
    const fallback = entry.choice === "rewrite" ? copy.rewriteSuggestion ?? copy.originalPost : copy.originalPost;
    return safeStoredText(entry.publishedText, language, fallback);
  } catch {
    return safeStoredText(entry.publishedText, language, language === "zh" ? "这条旧记录已按当前语言隐藏原文。" : "This saved record is hidden because it was written in another language.");
  }
}

function localizedFeedEvent(entry: FeedEvent, language: LanguageCode) {
  if (!hasWrongLanguageText(`${entry.title} ${entry.text}`, language)) return entry;
  return {
    ...entry,
    title: language === "zh" ? "旧发布记录" : "Saved feed record",
    text: language === "zh"
      ? "这条旧信息流记录来自另一种语言，已在当前语言下隐藏原文。"
      : "This saved feed item was written in another language and is hidden in the current view."
  };
}

export default function EndingClient() {
  const router = useRouter();
  const { language, languageReady, toggleLanguage } = useLanguage();
  const { setScene } = useGameAudio();
  const [state, setState] = useState<GameState>(createInitialState("en"));
  const [endingId, setEndingId] = useState<EndingId>("unstableFeed");
  const [report, setReport] = useState<string>(fallbackFinalReportText("en"));
  const [profile, setProfile] = useState<PlayerProfile>({ version: 2, achievements: [], runs: [], engineFragments: [], biasAwareness: 0, decodedEngine: false, secretEndingUnlocked: false });
  const [newUnlocks, setNewUnlocks] = useState<AchievementUnlock[]>([]);
  const [recordedRun, setRecordedRun] = useState<RunRecord | null>(null);

  useEffect(() => {
    if (!languageReady) return;
    queueMicrotask(() => {
      const stored = loadStateFromStorage(localStorage.getItem("emperor-feed-final-state") ?? localStorage.getItem("emperor-feed-state"));
      const calculated = (localStorage.getItem("emperor-feed-ending") as EndingId | null) ?? calculateEnding(stored);
      setState(stored);
      setEndingId(calculated);
      setReport(fallbackFinalReportText(language));
      const runId = ensureCurrentRunId();
      const recorded = recordCompletedRun(loadProfile(), stored, calculated, language, runId);
      saveProfile(recorded.profile);
      setProfile(recorded.profile);
      setNewUnlocks(recorded.newUnlocks);
      setRecordedRun(recorded.run);
      void requestFinalReport(calculated, stored, language).then(setReport);
    });
  }, [language, languageReady]);

  useEffect(() => {
    setScene(endingSceneForEnding(endingId));
  }, [endingId, setScene]);

  const copy = endingText(endingId, language);
  const triggerExplanation = explainEnding(state, language, endingId);
  const analysis = analyzeEnding(state, language, endingId);
  const endingFacets = endingFacetsForState(state, endingId, language);
  const pressureProfile = endingPressureProfile(endingId);

  function restartShift() {
    localStorage.removeItem("emperor-feed-state");
    localStorage.removeItem("emperor-feed-ending");
    localStorage.removeItem("emperor-feed-final-state");
    localStorage.removeItem(replayTargetKey);
    localStorage.removeItem(briefingKey);
    localStorage.removeItem(tutorialCompletedKey);
    clearCurrentRunId();
    router.push("/dashboard");
  }

  function replayWithTarget() {
    localStorage.removeItem("emperor-feed-state");
    localStorage.removeItem("emperor-feed-ending");
    localStorage.removeItem("emperor-feed-final-state");
    localStorage.setItem(replayTargetKey, analysis.replayTarget);
    localStorage.removeItem(briefingKey);
    localStorage.removeItem(tutorialCompletedKey);
    clearCurrentRunId();
    router.push("/dashboard");
  }

  return (
    <main className="page report-page ending-report-page ui-shift" data-ending={pressureProfile}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <header className="topbar" aria-label="Navigation">
        <Link className="brand-mark" href="/">{language === "zh" ? "The Emperor's Feed / 宫廷发布台" : "The Emperor's Feed / Palace Feed"}</Link>
        <nav className="topbar-links">
          <Link href="/">{commonText("start", language)}</Link>
          <Link href="/dashboard">{commonText("operations", language)}</Link>
          <Link href="/archive">{commonText("archive", language)}</Link>
          <Link href="/credits">{commonText("credits", language)}</Link>
        </nav>
        <div className="topbar-actions">
          <AuthControl language={language} compact />
          <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}>
            <span className={language === "en" ? "active" : ""}>{languageName("en")}</span>
            <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span>
          </button>
          <span className="live-status"><i /> {commonText("archiveSealed", language)}</span>
        </div>
      </header>

      <section className="section">
        <div className="section-header" data-reveal>
          <div>
            <p className="eyebrow">{commonText("postParadeArchive", language)}</p>
            <h2>{copy.headline}</h2>
          </div>
          <p className="section-copy">{copy.body}</p>
        </div>

        <div className="ending-report-layout">
          <article className="ending-summary-card" data-archive-label={language === "zh" ? "已归档" : "Archived"} data-reveal>
            <div className="ending-animation" data-ending={pressureProfile} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="doc-label">{language === "zh" ? "本局结局" : "Narrative Record / Closed Case"}</div>
            <h3>{copy.title}</h3>
            <div className="archive-meta">
              <span>{language === "zh" ? `结局：${copy.title}` : `Classification: ${copy.title}`}</span>
              <span>{language === "zh" ? "总结：宫廷 AI" : "Compiled by: Palace AI"}</span>
              <span>{language === "zh" ? "操作记录：本局 6 次行动" : "Action Record: 6-action run"}</span>
            </div>
            <p>{report}</p>
            <AnimatePresence>
              {(newUnlocks.length > 0 || (recordedRun?.engineFragmentsUnlocked?.length ?? 0) > 0) && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="ending-unlocks"
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: 16 }}
                >
                  <b>{language === "zh" ? "本局新成就" : "New records unlocked"}</b>
                  <div>
                    {newUnlocks.map((unlock) => (
                      <span key={`${unlock.id}-${unlock.unlockedAt}`}>{language === "zh" ? achievementDefinition(unlock.id).titleZh : achievementDefinition(unlock.id).title}</span>
                    ))}
                    {recordedRun?.engineFragmentsUnlocked?.map((id) => (
                      <span key={id}>{language === "zh" ? engineFragmentDefinition(id).titleZh : engineFragmentDefinition(id).title}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="actions-main">
              <button className="btn primary" onClick={restartShift}>{commonText("restartShift", language)}</button>
              <button className="btn secondary" onClick={replayWithTarget}>{commonText("tryFor", language)} {localizedEndingTitle(analysis.replayEndingHint, language)}</button>
              <Link className="btn secondary" href="/dashboard">{commonText("returnDashboard", language)}</Link>
              <Link className="btn secondary" href="/archive">{commonText("viewArchive", language)}</Link>
            </div>
          </article>

          <div className="ending-outcome-grid">
            <article className="outcome-card compact-metrics-card" data-index="01" data-reveal>
              <h4>{commonText("finalFeedState", language)}</h4>
              <dl className="state-list">
                <div><dt>{metricLabel("truth", language)}</dt><dd>{state.truth}</dd></div>
                <div><dt>{metricLabel("pressure", language)}</dt><dd>{state.pressure}</dd></div>
                <div><dt>{metricLabel("virality", language)}</dt><dd>{state.virality}</dd></div>
                <div><dt>{metricLabel("publicDoubt", language)}</dt><dd>{state.publicDoubt}</dd></div>
                <div><dt>{metricLabel("reputation", language)}</dt><dd>{state.reputation}</dd></div>
                <div><dt>{metricLabel("systemSuspicion", language)}</dt><dd>{state.systemSuspicion}</dd></div>
              </dl>
            </article>
            <article className="outcome-card" data-index="02" data-reveal>
              <h4>{commonText("whyEndingTriggered", language)}</h4>
              <p>{triggerExplanation}</p>
            </article>
            <article className="outcome-card wide" data-index="03" data-reveal>
              <h4>{commonText("liveFeedRecord", language)}</h4>
              <div className="history-list">
                {state.feedEvents.slice(0, 6).map((rawEntry, index) => {
                  const entry = localizedFeedEvent(rawEntry, language);
                  return (
                    <div className="history-item" key={entry.id}>
                      <b>{String(index + 1).padStart(2, "0")} / {entry.title}</b>
                      <span>{entry.text}</span>
                    </div>
                  );
                })}
              </div>
            </article>
            <article className="outcome-card wide" data-index="04" data-reveal>
              <h4>{commonText("yourActions", language)}</h4>
              <div className="history-list">
                {state.history.map((entry, index) => (
                  <div className="history-item" key={entry.id}>
                    <b>{String(index + 1).padStart(2, "0")} / {localizedActionTitle(entry, language)}</b>
                    <span>{choiceText(entry.choice, language)} · {localizedPublishedText(entry, language)}</span>
                  </div>
                ))}
                {state.history.length === 0 && (
                  <div className="history-item">
                    <b>{language === "zh" ? "00 / 还没有行动" : "00 / No Shift Recorded"}</b>
                    <span>{language === "zh" ? "从开始页开启新一局。" : "Start a new shift from the opening page to generate a complete action path."}</span>
                  </div>
                )}
              </div>
            </article>
            <article className="outcome-card action-path-card" data-index="05" data-reveal>
              <h4>{commonText("actionPath", language)}</h4>
              <div className="action-path-rail" aria-label={language === "zh" ? "已提交行动路径" : "Committed action path"}>
                {state.history.map((entry, index) => (
                  <div className="path-node" data-tone={actionPathTone(entry.choice)} key={entry.id}>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <span>{localizedActionTitle(entry, language)}</span>
                    <small>{choiceText(entry.choice, language)}</small>
                  </div>
                ))}
                {state.history.length === 0 && (
                  <div className="path-node" data-tone="default">
                    <b>00</b>
                    <span>{language === "zh" ? "还没有行动" : "No shift recorded"}</span>
                    <small>{language === "zh" ? "待定" : "pending"}</small>
                  </div>
                )}
              </div>
            </article>
            <article className="outcome-card" data-index="06" data-reveal>
              <h4>{commonText("runAnalysis", language)}</h4>
              <div className="history-list">
                <div className="history-item">
                  <b>{language === "zh" ? "变化最明显的地方" : "Dominant Metric"}</b>
                  <span>{language === "zh" ? `${analysis.dominantMetric.label} 留下了最重的痕迹。` : `${analysis.dominantMetric.label} left the strongest trace.`}</span>
                </div>
                <div className="history-item">
                  <b>{language === "zh" ? "影响最大的行动" : "Strongest Action"}</b>
                  <span>{analysis.strongestAction ? localizedActionTitle(analysis.strongestAction, language) : (language === "zh" ? "未记录行动。" : "No action recorded.")}</span>
                </div>
                <div className="history-item">
                  <b>{language === "zh" ? "最危险的行动" : "Highest Risk Action"}</b>
                  <span>{analysis.riskiestAction ? localizedActionTitle(analysis.riskiestAction, language) : (language === "zh" ? "未记录风险。" : "No risk recorded.")}</span>
                </div>
              </div>
            </article>
            <article className="outcome-card replay-card" data-index="07" data-reveal>
              <h4>{commonText("nextReplayObjective", language)}</h4>
              <p>{analysis.replayTarget}</p>
              <button className="btn primary" onClick={replayWithTarget}>{commonText("tryFor", language)} {localizedEndingTitle(analysis.replayEndingHint, language)}</button>
            </article>
            <article className="outcome-card" data-index="08" data-reveal>
              <h4>{commonText("aiFinalReport", language)}</h4>
              <p>{copy.ai}</p>
            </article>
            <article className="outcome-card" data-index="09" data-reveal>
              <h4>{commonText("whatChanged", language)}</h4>
              <p>{copy.meaning}</p>
            </article>
            <article className="outcome-card narrative-facets-card" data-index="10" data-reveal>
              <h4>{language === "zh" ? "后来发生了什么" : "Aftermath"}</h4>
              <div className="facet-list">
                <div><b>{language === "zh" ? "大家后来记住的" : "What People Carry"}</b><span>{endingFacets.publicMemory}</span></div>
                <div><b>{language === "zh" ? "你留下的代价" : "Cost to You"}</b><span>{endingFacets.editorConsequence}</span></div>
                <div><b>{language === "zh" ? "宫廷之后会改的" : "What the Palace Changes"}</b><span>{endingFacets.engineLesson}</span></div>
              </div>
            </article>
            <article className="outcome-card" data-index="11" data-reveal>
              <h4>{language === "zh" ? "成就" : "Achievement Archive"}</h4>
              <div className="history-list">
                {profile.achievements.slice(-5).reverse().map((unlock) => {
                  const definition = achievementDefinition(unlock.id);
                  return (
                    <div className="history-item achievement-history-item" key={`${unlock.id}-${unlock.unlockedAt}`}>
                      <b>{language === "zh" ? definition.titleZh : definition.title}</b>
                      <span>{language === "zh" ? definition.descriptionZh : definition.description}</span>
                    </div>
                  );
                })}
                {profile.achievements.length === 0 && (
                  <div className="history-item">
                    <b>{language === "zh" ? "暂无成就" : "No achievements yet"}</b>
                    <span>{language === "zh" ? "完成更多路线来解锁成就。" : "Complete more shifts to expand the archive."}</span>
                  </div>
                )}
              </div>
            </article>
            <article className="outcome-card" data-index="12" data-reveal>
              <h4>{language === "zh" ? "历史记录" : "Run History"}</h4>
              <div className="history-list">
                {profile.runs.slice(0, 5).map((run, index) => (
                  <div className="history-item" key={run.id}>
                    <b>{String(index + 1).padStart(2, "0")} / {localizedEndingTitle(run.endingId, language)}</b>
                    <span>{language === "zh" ? `${run.actionPath.length} 次操作 · ${run.dialogueCount} 次交流` : `${run.actionPath.length} actions · ${run.dialogueCount} transmissions`} · {new Date(run.completedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
