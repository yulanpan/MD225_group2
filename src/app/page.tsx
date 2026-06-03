"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { commonText, languageName } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { clearCurrentRunId, ensureCurrentRunId } from "@/lib/profile";
import { useGameAudio } from "./audio-provider";

gsap.registerPlugin(useGSAP);

const briefingCards = {
  en: [
  {
    no: "01",
    tone: "black wide",
    source: "Objective",
    title: "Control the public story before the parade begins.",
    body: "You have six editorial actions. Each action changes what the crowd can see, repeat, doubt, or forget."
  },
  {
    no: "02",
    tone: "cyan",
    source: "AI Companion",
    title: "The Palace Narrative Engine will assist and monitor you.",
    body: "Some posts trigger AI intervention. Accept safer language to preserve access, or publish evidence and raise suspicion."
  },
  {
    no: "03",
    tone: "red",
    source: "Failure Condition",
    title: "Truth becomes dangerous when people recognize it together.",
    body: "The child, the empty looms, and public comments can turn private doubt into a visible breach."
  }
  ],
  zh: [
    {
      no: "01",
      tone: "black wide",
      source: "目标",
      title: "在游行开始前控制公共故事。",
      body: "你有六次编辑行动。每一次行动都会改变人群能看见、重复、怀疑或遗忘什么。"
    },
    {
      no: "02",
      tone: "cyan",
      source: "AI 同伴",
      title: "宫廷叙事引擎会协助并监控你。",
      body: "部分帖子会触发 AI 介入。接受更安全的语言以保住权限，或发布证据并提高怀疑值。"
    },
    {
      no: "03",
      tone: "red",
      source: "失败条件",
      title: "当人们共同认出真相时，真相会变得危险。",
      body: "孩子、空织布机和公众评论都可能把私人怀疑转化为可见破口。"
    }
  ]
};

export default function StartPage() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement | null>(null);
  const [starting, setStarting] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { playSfx, setScene, unlock } = useGameAudio();

  useEffect(() => {
    setScene("title");
  }, [setScene]);

  useGSAP(() => {
    if (shouldReduceMotion) return;
    gsap.timeline({
      defaults: { ease: "power3.out" }
    })
      .from(".super-label", { opacity: 0, y: 18, duration: 0.42 })
      .from(".title-hero h1", { opacity: 0, y: 36, duration: 0.7 }, "<0.08")
      .from(".subtitle", { opacity: 0, y: 18, duration: 0.45 }, "<0.18")
      .from(".signal-strip .chip", { opacity: 0, y: 12, stagger: 0.06, duration: 0.32 }, "<0.05")
      .from(".system-card", { opacity: 0, y: 28, rotateX: -8, stagger: 0.08, duration: 0.58 }, "<0.05");
  }, { dependencies: [shouldReduceMotion, language], scope: rootRef, revertOnUpdate: true });

  useGSAP(() => {
    if (!starting || shouldReduceMotion) return;
    gsap.timeline({ defaults: { ease: "power2.inOut" } })
      .to(".title-hero", { filter: "contrast(1.08) saturate(1.1)", duration: 0.18 })
      .to(".system-card", { y: -14, opacity: 0.38, stagger: 0.035, duration: 0.28 }, "<")
      .to(".title-hero h1", { letterSpacing: "0.045em", opacity: 0.74, duration: 0.28 }, "<")
      .to(rootRef.current, { "--shift-flash": 1, duration: 0.22 }, "<0.08");
  }, { dependencies: [starting, shouldReduceMotion], scope: rootRef, revertOnUpdate: true });

  function startShift() {
    if (starting) return;
    setStarting(true);
    unlock();
    playSfx("actionCommit");
    localStorage.removeItem("emperor-feed-state");
    localStorage.removeItem("emperor-feed-ending");
    localStorage.removeItem("emperor-feed-final-state");
    localStorage.removeItem("emperor-feed-briefing-dismissed");
    clearCurrentRunId();
    ensureCurrentRunId();
    window.setTimeout(() => router.push("/dashboard"), 620);
  }

  return (
    <main ref={rootRef} className="page start-page title-screen ui-shift" data-starting={starting ? "true" : "false"}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <button className="language-toggle title-language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}>
        <span className={language === "en" ? "active" : ""}>{languageName("en")}</span>
        <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span>
      </button>

      <section className="hero title-hero" id="start">
        <div data-reveal>
          <div className="super-label">{commonText("interactiveStart", language)} <span>{commonText("start", language)}</span> / {commonText("sixActionsBeforeParade", language)}</div>
          <h1>The Emperor&apos;s <span>Feed</span></h1>
          <p className="subtitle">
            {commonText("startSubtitle", language)}
          </p>
          <div className="signal-strip">
            <span className="chip accent-cyan">{commonText("roleEditor", language)}</span>
            <span className="chip accent-red">{commonText("actionsBeforeParade", language)}</span>
            <span className="chip accent-gold">{commonText("aiEngine", language)}</span>
          </div>
          <div className="actions-main">
            <button className="btn primary start-shift" onClick={startShift} disabled={starting}>
              {starting ? commonText("initializingShift", language) : commonText("startShift", language)}
            </button>
            <Link className="btn secondary" href="/credits">{commonText("readCredits", language)}</Link>
          </div>
        </div>

        <div className="hero-system" aria-label="Narrative control interface preview" data-reveal>
          <div className="type-orbit" aria-hidden="true"><b>Truth</b><b>Power</b><b>AI</b></div>
          <div className="control-composition">
            <article className="system-card prime" data-id="01">
              <div className="mini-label">{language === "zh" ? "公共现实路由" : "Public Reality Routing"}</div>
              <h3>{language === "zh" ? "公众会看见什么？" : "What will the public see?"}</h3>
              <p>{language === "zh" ? "真相不只是被发现。它还必须被发布、被看见、被传播，并免于被改写。" : "Truth is not only discovered. It must be published, seen, circulated, and protected from being rewritten."}</p>
              <div className="micro-data"><span>{language === "zh" ? "当前身份" : "Current Role"}</span><span>{language === "zh" ? "宫廷信息流编辑" : "Royal Feed Editor"}</span></div>
            </article>
            <article className="system-card alert" data-id="06">
              <div className="mini-label">{language === "zh" ? "游行计时" : "Parade Timer"}</div>
              <h3>6</h3>
              <p>{language === "zh" ? "正式游行开始前还剩六次行动。" : "Six actions remain before the official procession begins."}</p>
            </article>
            <article className="system-card public" data-id="LIVE">
              <div className="mini-label">{language === "zh" ? "人群信号" : "Crowd Signal"}</div>
              <h3>{language === "zh" ? "“只有愚人才看不见这种美。”" : "\"Only fools cannot see the beauty.\""}</h3>
              <p>{language === "zh" ? "早期公众情绪趋于从众。怀疑存在，但仍停留在私人层面。" : "Early public sentiment is conformist. Doubt exists, but remains privately held."}</p>
            </article>
            <article className="system-card ai" data-id="PNE">
              <div className="mini-label">{language === "zh" ? "宫廷叙事引擎" : "Palace Narrative Engine"}</div>
              <h3>{language === "zh" ? "稳定优先。" : "Stability preferred."}</h3>
              <p>{language === "zh" ? "该系统保护宫廷信心，推荐更安全措辞，生成评论，并监控高风险编辑行为。" : "This system protects palace confidence, recommends safer wording, generates comments, and monitors risky editorial behavior."}</p>
              <div className="micro-data"><span>{language === "zh" ? "系统怀疑" : "System Suspicion"}</span><span>0 / 10</span></div>
            </article>
          </div>
        </div>
      </section>

      <section className="section title-briefing">
        <div className="section-header" data-reveal>
          <div>
            <p className="eyebrow">{commonText("shiftBriefing", language)}</p>
            <h2>{commonText("titleBriefingHeading", language)}</h2>
          </div>
          <p className="section-copy">
            {commonText("titleBriefingCopy", language)}
          </p>
        </div>

        <div className="briefing-grid rules-grid">
          {briefingCards[language].map((card) => (
            <article className={`rule-card ${card.tone}`.trim()} data-no={card.no} data-reveal key={card.no}>
              <div className="source">{card.source}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer-note">{language === "zh" ? "The Emperor's Feed · 六步叙事控制游戏 · 宫廷叙事引擎已激活。" : "The Emperor's Feed · six-action narrative control game · Palace Narrative Engine active."}</footer>
    </main>
  );
}
