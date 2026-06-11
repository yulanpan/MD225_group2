"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  achievementDefinitions,
  engineFragmentDefinition,
  engineFragmentDefinitions,
  loadProfile
} from "@/lib/profile";
import { localizedEndingTitle } from "@/lib/game-rules";
import { choiceText, commonText, languageName, localizedActionTitle, metricLabel } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { useGameAudio } from "@/app/audio-provider";
import AuthControl from "@/app/auth-control";
import type { PlayerProfile } from "@/lib/types";

function emptyProfile(): PlayerProfile {
  return {
    version: 2,
    achievements: [],
    runs: [],
    engineFragments: [],
    biasAwareness: 0,
    decodedEngine: false,
    secretEndingUnlocked: false
  };
}

function achievementArchiveCopy(
  achievement: (typeof achievementDefinitions)[number],
  unlocked: boolean,
  language: "en" | "zh"
) {
  if (unlocked || !["engineDecoded", "narrativeLiberation"].includes(achievement.id)) {
    return language === "zh"
      ? { title: achievement.titleZh, description: achievement.descriptionZh }
      : { title: achievement.title, description: achievement.description };
  }
  return language === "zh"
    ? { title: "隐藏线索", description: "继续完成不同路线，更多信息会在这里开放。" }
    : { title: "Sealed Archive Signal", description: "Complete more shifts to open this archive record." };
}

export default function ArchivePage() {
  const { language, languageReady, toggleLanguage } = useLanguage();
  const { setScene } = useGameAudio();
  const [profile, setProfile] = useState<PlayerProfile>(emptyProfile);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    setScene("archive");
  }, [setScene]);

  useEffect(() => {
    if (!languageReady) return;
    queueMicrotask(() => {
      const loaded = loadProfile();
      setProfile(loaded);
      setSelectedRunId(loaded.runs[0]?.id ?? null);
    });
  }, [languageReady]);

  const selectedRun = useMemo(
    () => profile.runs.find((run) => run.id === selectedRunId) ?? profile.runs[0] ?? null,
    [profile.runs, selectedRunId]
  );
  const achievementIds = new Set(profile.achievements.map((item) => item.id));
  const fragmentIds = new Set(profile.engineFragments.map((item) => item.id));

  return (
    <main className="page archive-page ui-shift">
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
          <span className="live-status"><i /> {commonText("archive", language)}</span>
        </div>
      </header>

      <section className="section">
        <div className="section-header" data-reveal>
          <div>
            <p className="eyebrow">{language === "zh" ? "历史记录" : "Cross-Run Archive"}</p>
            <h1>{language === "zh" ? "档案室" : "Archive Room"}</h1>
          </div>
          <p className="section-copy">
            {language === "zh"
              ? "这里保存你完成过的结局和成就。当前这一局的操作仍在行动台处理。"
              : "This room stores completed runs, achievements, and cross-run archive signals. Current-run controls stay out of the dashboard archive."}
          </p>
        </div>

        <div className="archive-dashboard">
          <article className="archive-summary-panel">
            <span>{profile.decodedEngine ? commonText("decodeProgress", language) : (language === "zh" ? "隐藏线索" : "Archive Signal")}</span>
            <strong>{profile.biasAwareness}%</strong>
            <p>{profile.decodedEngine
              ? (language === "zh" ? "你已经看见宫廷 AI 总把稳定放在真实之前。下一局，它仍会给建议；你也可以让证据、人群和孩子的话留在同一处。" : "You have seen how Palace AI favors stability before truth. In the next shift, it will still advise you; you can also keep evidence, public doubt, and the child's words in the same record.")
              : (language === "zh" ? "完成不同路线，会看到更多隐藏线索。" : "Complete varied shifts to recover more archive signals.")}</p>
          </article>
          <article className="archive-summary-panel">
            <span>{language === "zh" ? "历史值班" : "Run History"}</span>
            <strong>{profile.runs.length}</strong>
            <p>{language === "zh" ? "最近 30 局会保留在这里。" : "The latest 30 completed shifts are retained locally."}</p>
          </article>
          <article className="archive-summary-panel">
            <span>{language === "zh" ? "成就" : "Achievements"}</span>
            <strong>{profile.achievements.length}/{achievementDefinitions.length}</strong>
            <p>{language === "zh" ? "完成特殊路线会解锁成就。" : "Achievements persist across runs."}</p>
          </article>
        </div>

        <div className="archive-room-grid">
          <section className="module archive-module">
            <div className="module-head"><h3>{profile.decodedEngine ? (language === "zh" ? "宫廷偏向" : "Palace Pattern") : (language === "zh" ? "隐藏线索" : "Archive Signals")}</h3></div>
            <div className="module-body fragment-grid">
              {engineFragmentDefinitions.map((fragment) => {
                const unlocked = fragmentIds.has(fragment.id);
                return (
                  <article className={unlocked ? "fragment-card unlocked" : "fragment-card"} key={fragment.id}>
                    <b>{language === "zh" ? fragment.titleZh : fragment.title}</b>
                    <p>{unlocked ? (language === "zh" ? fragment.clueZh : fragment.clue) : (language === "zh" ? fragment.unlockHintZh : fragment.unlockHint)}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="module archive-module">
            <div className="module-head"><h3>{language === "zh" ? "历史记录" : "Run History"}</h3></div>
            <div className="module-body run-list">
              {profile.runs.map((run, index) => (
                <button
                  className={selectedRun?.id === run.id ? "run-row active" : "run-row"}
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                >
                  <b>{String(index + 1).padStart(2, "0")} / {localizedEndingTitle(run.endingId, language)}</b>
                  <span>{language === "zh" ? `${run.actionPath.length} 次操作 · ${run.dialogueCount} 次交流` : `${run.actionPath.length} actions · ${run.dialogueCount} transmissions`} · {new Date(run.completedAt).toLocaleDateString()}</span>
                </button>
              ))}
              {profile.runs.length === 0 && (
                <div className="history-item">
                  <b>{language === "zh" ? "暂无历史值班" : "No completed shifts"}</b>
                  <span>{language === "zh" ? "完成一局后，这里会显示结果。" : "Complete a shift to create the first archive record."}</span>
                </div>
              )}
            </div>
          </section>

          <section className="module archive-module wide">
            <div className="module-head"><h3>{language === "zh" ? "这局详情" : "Record Detail"}</h3></div>
            <div className="module-body">
              {selectedRun ? (
                <div className="archive-detail">
                  <div className="archive-detail-head">
                    <b>{localizedEndingTitle(selectedRun.endingId, language)}</b>
                    <span>{new Date(selectedRun.completedAt).toLocaleString()}</span>
                  </div>
                  <div className="state-list archive-state-list">
                    {Object.entries(selectedRun.finalMetrics).map(([key, value]) => (
                      <div key={key}><dt>{metricLabel(key as Parameters<typeof metricLabel>[0], language)}</dt><dd>{value}</dd></div>
                    ))}
                  </div>
                  <div className="history-list">
                    {selectedRun.actionPath.map((action, index) => (
                      <div className="history-item" key={`${action.actionId}-${index}`}>
                        <b>{String(index + 1).padStart(2, "0")} / {localizedActionTitle(action.actionId, language, action.title)}</b>
                        <span>{choiceText(action.choice, language)}</span>
                      </div>
                    ))}
                    {selectedRun.engineFragmentsUnlocked?.map((id) => (
                      <div className="history-item" key={id}>
                        <b>{language === "zh" ? "发现线索" : "Fragment unlocked"}</b>
                        <span>{language === "zh" ? engineFragmentDefinition(id).titleZh : engineFragmentDefinition(id).title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="history-item">
                  <b>{language === "zh" ? "未选择记录" : "No record selected"}</b>
                  <span>{language === "zh" ? "完成一局后查看详情。" : "Complete a shift to inspect details."}</span>
                </div>
              )}
            </div>
          </section>

          <section className="module archive-module wide">
            <div className="module-head"><h3>{language === "zh" ? "成就" : "Achievement Archive"}</h3></div>
            <div className="module-body achievement-archive-grid">
              {achievementDefinitions.map((achievement) => {
                const unlocked = achievementIds.has(achievement.id);
                const copy = achievementArchiveCopy(achievement, unlocked, language);
                return (
                  <article className={unlocked ? "achievement-row unlocked" : "achievement-row"} data-rarity={achievement.rarity} key={achievement.id}>
                    <b>{copy.title}</b>
                    <span>{copy.description}</span>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
