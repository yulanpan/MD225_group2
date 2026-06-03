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
          <span className="live-status"><i /> {language === "zh" ? "来源登记" : "Source register"}</span>
        </div>
      </header>

      <section className="section">
        <div className="section-header" data-reveal>
          <div>
            <p className="eyebrow">{language === "zh" ? "鸣谢与来源" : "Credits and Sources"}</p>
            <h1>{language === "zh" ? "来源登记" : "Source Register"}</h1>
          </div>
          <p className="section-copy">
            {language === "zh" ? "原型保留故事来源、AI 披露与视觉参考，便于审查。" : "The prototype keeps story sources, AI disclosure, and visual references visible for review."}
          </p>
        </div>

        <div className="report-layout">
          <article className="archive-card" data-reveal>
            <div className="doc-label">{language === "zh" ? "项目文件 / 参考集" : "Project Files / Reference Set"}</div>
            <h3>{language === "zh" ? "实现档案" : "Implementation Archive"}</h3>
            <div className="archive-meta">
              <span>{language === "zh" ? "原始童话：汉斯·克里斯蒂安·安徒生" : "Original tale: Hans Christian Andersen"}</span>
              <span>{language === "zh" ? "视觉参考：仓库 HTML 原型" : "Visual reference: repository HTML prototype"}</span>
              <span>{language === "zh" ? "设计简报：叙事控制系统" : "Design brief: narrative control system"}</span>
            </div>
            <p>{language === "zh" ? "实现遵循仓库中的项目方案、设计方向说明与 HTML 视觉参考。" : "The implementation follows the proposal, design direction brief, and HTML visual reference stored in this repository."}</p>
          </article>

          <div className="outcome-stack">
            <article className="outcome-card" data-index="01" data-reveal>
              <h4>{language === "zh" ? "原始童话" : "Original Tale"}</h4>
              <p>{language === "zh" ? "汉斯·克里斯蒂安·安徒生，《皇帝的新衣》。文本参考使用公版版本。" : <>Hans Christian Andersen, <em>The Emperor&apos;s New Clothes</em>. Use public-domain editions for text references.</>}</p>
            </article>
            <article className="outcome-card" data-index="02" data-reveal>
              <h4>{language === "zh" ? "视觉来源" : "Visual Sources"}</h4>
              <p>{language === "zh" ? "童话图像、空织布机参考与游行素材应使用公版插画档案。最终提交前记录每个素材 URL 与许可。" : "Use public-domain illustration archives for fairy-tale imagery, empty loom references, and parade material. Record each asset URL and license before final submission."}</p>
            </article>
            <article className="outcome-card" data-index="03" data-reveal>
              <h4>{language === "zh" ? "AI 披露" : "AI Disclosure"}</h4>
              <p>{language === "zh" ? "在线原型使用故事内 AI 人格“宫廷叙事引擎”生成系统建议、改写、评论与最终报告。规则与结局由 JavaScript 控制。" : "The live prototype uses an in-world AI persona, Palace Narrative Engine, to generate system advice, rewrites, comments, and final reports. JavaScript controls rules and endings."}</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
