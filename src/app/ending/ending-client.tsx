"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { analyzeEnding, calculateEnding, createInitialState, explainEnding, loadStateFromStorage, localizedEndingTitle } from "@/lib/game-rules";
import { endingSceneForEnding } from "@/lib/audio";
import { choiceText, commonText, endingText, fallbackFinalReportText, languageName, metricLabel, type LanguageCode } from "@/lib/i18n";
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
import type { AchievementUnlock, EndingId, FinalReport, GameState, PlayerProfile, RunRecord } from "@/lib/types";

const replayTargetKey = "emperor-feed-replay-target";
const briefingKey = "emperor-feed-briefing-dismissed";

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
    return data.report;
  } catch {
    return fallbackFinalReportText(language);
  }
}

export default function EndingClient() {
  const router = useRouter();
  const { language, languageReady, toggleLanguage } = useLanguage();
  const { playSfx, setScene } = useGameAudio();
  const [state, setState] = useState<GameState>(createInitialState("en"));
  const [endingId, setEndingId] = useState<EndingId>("unstableFeed");
  const [report, setReport] = useState<string>(fallbackFinalReportText("en"));
  const [profile, setProfile] = useState<PlayerProfile>({ version: 2, achievements: [], runs: [], engineFragments: [], biasAwareness: 0, decodedEngine: false, secretEndingUnlocked: false });
  const [newUnlocks, setNewUnlocks] = useState<AchievementUnlock[]>([]);
  const [recordedRun, setRecordedRun] = useState<RunRecord | null>(null);
  const endingCuePlayed = useRef(false);
  const unlockCueKey = useRef("");
  const newUnlockKey = newUnlocks.map((unlock) => unlock.id).join(",");
  const fragmentUnlockKey = recordedRun?.engineFragmentsUnlocked?.join(",") ?? "";

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
    if (endingCuePlayed.current) return;
    endingCuePlayed.current = true;
    playSfx("endingTrigger");
  }, [endingId, playSfx, setScene]);

  useEffect(() => {
    const key = `${newUnlockKey}|${fragmentUnlockKey}`;
    if (!key || key === "|" || key === unlockCueKey.current) return;
    unlockCueKey.current = key;
    if (newUnlocks.length > 0) playSfx("achievementUnlock");
    if (fragmentUnlockKey) playSfx("fragmentUnlock");
  }, [fragmentUnlockKey, newUnlockKey, newUnlocks.length, playSfx]);

  const copy = endingText(endingId, language);
  const triggerExplanation = explainEnding(state, language);
  const analysis = analyzeEnding(state, language);
  const endingFacets = endingFacetsForState(state, endingId, language);
  const pressureProfile = endingPressureProfile(endingId);

  function restartShift() {
    localStorage.removeItem("emperor-feed-state");
    localStorage.removeItem("emperor-feed-ending");
    localStorage.removeItem("emperor-feed-final-state");
    localStorage.removeItem(replayTargetKey);
    localStorage.removeItem(briefingKey);
    clearCurrentRunId();
    router.push("/dashboard");
  }

  function replayWithTarget() {
    localStorage.removeItem("emperor-feed-state");
    localStorage.removeItem("emperor-feed-ending");
    localStorage.removeItem("emperor-feed-final-state");
    localStorage.setItem(replayTargetKey, analysis.replayTarget);
    localStorage.removeItem(briefingKey);
    clearCurrentRunId();
    router.push("/dashboard");
  }

  return (
    <main className="page report-page ui-shift" data-ending={pressureProfile}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <header className="topbar" aria-label="Navigation">
        <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link>
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
            <h2>{commonText("archiveHeading", language)}</h2>
          </div>
          <p className="section-copy">{copy.body}</p>
        </div>

        <div className="ending-layout">
          <article className="archive-card" data-reveal>
            <div className="ending-animation" data-ending={pressureProfile} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="doc-label">{language === "zh" ? "本局结局" : "Narrative Record / Closed Case"}</div>
            <h3>{copy.title}</h3>
            <div className="archive-meta">
              <span>{language === "zh" ? `结局：${copy.title}` : `Classification: ${copy.title}`}</span>
              <span>{language === "zh" ? "总结：宫廷叙事引擎" : "Compiled by: Palace Narrative Engine"}</span>
              <span>{language === "zh" ? "操作记录：本局 6 次行动" : "Action Trace: 6-action run"}</span>
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

          <div className="outcome-stack">
            <article className="outcome-card" data-index="01" data-reveal>
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
            <article className="outcome-card" data-index="03" data-reveal>
              <h4>{commonText("liveFeedRecord", language)}</h4>
              <div className="history-list">
                {state.feedEvents.slice(0, 6).map((entry, index) => (
                  <div className="history-item" key={entry.id}>
                    <b>{String(index + 1).padStart(2, "0")} / {entry.title}</b>
                    <span>{entry.text}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="outcome-card" data-index="04" data-reveal>
              <h4>{commonText("yourActions", language)}</h4>
              <div className="history-list">
                {state.history.map((entry, index) => (
                  <div className="history-item" key={entry.id}>
                    <b>{String(index + 1).padStart(2, "0")} / {entry.actionTitle}</b>
                    <span>{choiceText(entry.choice, language)} · {entry.publishedText}</span>
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
                    <span>{entry.actionTitle}</span>
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
                  <b>{language === "zh" ? "最明显的变化" : "Dominant Metric"}</b>
                  <span>{language === "zh" ? `${analysis.dominantMetric.label} 最终为 ${analysis.dominantMetric.value}/10。` : `${analysis.dominantMetric.label} ended at ${analysis.dominantMetric.value}/10.`}</span>
                </div>
                <div className="history-item">
                  <b>{language === "zh" ? "影响最大的行动" : "Strongest Action"}</b>
                  <span>{analysis.strongestAction?.actionTitle ?? (language === "zh" ? "未记录行动。" : "No action recorded.")}</span>
                </div>
                <div className="history-item">
                  <b>{language === "zh" ? "最危险的行动" : "Highest Risk Action"}</b>
                  <span>{analysis.riskiestAction?.actionTitle ?? (language === "zh" ? "未记录风险。" : "No risk recorded.")}</span>
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
              <h4>{language === "zh" ? "后果" : "Narrative Consequences"}</h4>
              <div className="facet-list">
                <div><b>{language === "zh" ? "大家记住了什么" : "Public Memory"}</b><span>{endingFacets.publicMemory}</span></div>
                <div><b>{language === "zh" ? "你付出了什么" : "Editor Consequence"}</b><span>{endingFacets.editorConsequence}</span></div>
                <div><b>{language === "zh" ? "宫廷学会了什么" : "Engine Lesson"}</b><span>{endingFacets.engineLesson}</span></div>
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
            <article className="outcome-card" data-index="11" data-reveal>
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
