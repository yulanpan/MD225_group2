"use client";

import Link from "next/link";
import { commonText, languageName } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import AuthControl from "@/app/auth-control";

export default function CreditsPage() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <main className="page report-page ui-shift">
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <header className="topbar" aria-label="Navigation">
        <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link>
        <nav className="topbar-links">
          <Link href="/">{commonText("start", language)}</Link>
          <Link href="/dashboard">{commonText("operations", language)}</Link>
          <Link href="/credits">{commonText("credits", language)}</Link>
        </nav>
        <div className="topbar-actions">
          <AuthControl language={language} compact />
          <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}>
            <span className={language === "en" ? "active" : ""}>{languageName("en")}</span>
            <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span>
          </button>
          <span className="live-status"><i /> {language === "zh" ? "来源" : "Source register"}</span>
        </div>
      </header>

      <section className="section">
        <div className="section-header" data-reveal>
          <div>
            <p className="eyebrow">{language === "zh" ? "鸣谢" : "Credits and Sources"}</p>
            <h1>{language === "zh" ? "故事来源" : "Source Register"}</h1>
          </div>
          <p className="section-copy">
            {language === "zh" ? "这里记录故事来源、AI 使用说明和素材来源。" : "This page keeps story sources, AI usage, and visual references visible."}
          </p>
        </div>

        <div className="report-layout">
          <article className="archive-card" data-reveal>
            <div className="doc-label">{language === "zh" ? "来源说明" : "Source Notes"}</div>
            <h3>{language === "zh" ? "这个游戏改编自《皇帝的新衣》" : "Adapted from The Emperor's New Clothes"}</h3>
            <div className="archive-meta">
              <span>{language === "zh" ? "原始童话：汉斯·克里斯蒂安·安徒生" : "Original tale: Hans Christian Andersen"}</span>
              <span>{language === "zh" ? "主题：信息流、沉默和共同说出的真话" : "Theme: feeds, silence, and shared truth"}</span>
              <span>{language === "zh" ? "玩法：六次发布决定游行前的局势" : "Play: six posts shape the parade"}</span>
            </div>
            <p>{language === "zh" ? "游戏把童话里的沉默变成一次信息流值班：你决定哪些话能被看见。" : "The game turns the tale's public silence into a feed shift: you decide which words become visible."}</p>
          </article>

          <div className="outcome-stack">
            <article className="outcome-card" data-index="01" data-reveal>
              <h4>{language === "zh" ? "原始童话" : "Original Tale"}</h4>
              <p>{language === "zh" ? "汉斯·克里斯蒂安·安徒生，《皇帝的新衣》。文本参考使用公版版本。" : <>Hans Christian Andersen, <em>The Emperor&apos;s New Clothes</em>. Use public-domain editions for text references.</>}</p>
            </article>
            <article className="outcome-card" data-index="02" data-reveal>
              <h4>{language === "zh" ? "视觉来源" : "Visual Sources"}</h4>
              <p>{language === "zh" ? "童话图像、空织布机和游行素材应来自可公开使用的插画与图片来源。" : "Fairy-tale imagery, empty looms, and parade material should come from reusable illustration and image sources."}</p>
            </article>
            <article className="outcome-card" data-index="03" data-reveal>
              <h4>{language === "zh" ? "AI 披露" : "AI Disclosure"}</h4>
              <p>{language === "zh" ? "游戏会使用故事内的“宫廷叙事引擎”生成建议、改写、评论和结局报告。结局由玩家行动决定。" : "The game uses the in-world Palace Narrative Engine for advice, rewrites, comments, and ending reports. Player actions determine the ending."}</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
