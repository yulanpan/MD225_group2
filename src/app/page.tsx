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
import AuthControl from "./auth-control";

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
    title: "Palace AI will assist and monitor you.",
    body: "Some posts trigger AI intervention. Use safer language to preserve access, or publish evidence and raise palace alert."
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
      title: "游行前，你只能发布六次。",
      body: "每次发布都会改变大家看见什么、跟着说什么、还敢不敢怀疑。"
    },
    {
      no: "02",
      tone: "cyan",
      source: "宫廷建议",
      title: "宫廷 AI 会劝你说得更安全。",
      body: "你可以听它的，帮宫廷稳住场面；也可以把证据放出去，让更多人起疑。"
    },
    {
      no: "03",
      tone: "red",
      source: "失败条件",
      title: "怀疑找到同伴，就会变危险。",
      body: "危险在于大家发现：原来别人也看不见那件新衣。"
    }
  ]
};

export default function StartPage() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement | null>(null);
  const [starting, setStarting] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { setScene, unlock } = useGameAudio();

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
    localStorage.removeItem("emperor-feed-state");
    localStorage.removeItem("emperor-feed-ending");
    localStorage.removeItem("emperor-feed-final-state");
    localStorage.removeItem("emperor-feed-briefing-dismissed");
    localStorage.removeItem("emperor-feed-tutorial-completed");
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
      <div className="title-auth-control">
        <AuthControl language={language} compact />
      </div>

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
          <div className="type-orbit" aria-hidden="true"><b>Evidence</b><b>Power</b><b>AI</b></div>
          <div className="control-composition">
            <article className="system-card prime" data-id="01">
              <div className="mini-label">{language === "zh" ? "大家会看到什么" : "Public Reality Routing"}</div>
              <h3>{language === "zh" ? "公众会看见什么？" : "What will the public see?"}</h3>
              <p>{language === "zh" ? "真话被发现还不够。它必须被发出去，被大家看见。" : "Truth is not only discovered. It must be published, seen, circulated, and protected from being rewritten."}</p>
              <div className="micro-data"><span>{language === "zh" ? "行动限制" : "Action Limit"}</span><span>{language === "zh" ? "游行前 6 次" : "6 before parade"}</span></div>
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
              <div className="mini-label">{language === "zh" ? "宫廷 AI" : "Palace AI"}</div>
              <h3>{language === "zh" ? "稳定优先。" : "Stability preferred."}</h3>
              <p>{language === "zh" ? "它会建议你说得更稳，也会在你太直接时提醒宫廷。" : "This system protects palace confidence, recommends safer wording, generates comments, and monitors risky editorial behavior."}</p>
              <div className="micro-data"><span>{language === "zh" ? "宫廷警戒" : "Palace Alert"}</span><span>0 / 10</span></div>
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

      <footer className="footer-note">{language === "zh" ? "The Emperor's Feed · 六次发布 · 看见真话的人能不能一起开口。" : "The Emperor's Feed · six-action story game · Palace AI active."}</footer>
    </main>
  );
}
