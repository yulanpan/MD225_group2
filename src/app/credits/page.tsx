"use client";

import Link from "next/link";
import { commonText, languageName, type LanguageCode } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import AuthControl from "@/app/auth-control";

type SourceLink = {
  href: string;
  label: Record<LanguageCode, string>;
  note: Record<LanguageCode, string>;
};

const sourceGroups: Array<{
  index: string;
  title: Record<LanguageCode, string>;
  body: Record<LanguageCode, string>;
  links: SourceLink[];
}> = [
  {
    index: "01",
    title: { en: "Original Tale", zh: "原始童话" },
    body: {
      en: "The game adapts Andersen's fairy tale rather than retelling it line by line.",
      zh: "本游戏改编安徒生童话，不逐句复述原文。"
    },
    links: [
      {
        href: "https://andersen.sdu.dk/vaerk/hersholt/TheEmperorsNewClothes_e.html?oph=1",
        label: {
          en: "Hans Christian Andersen Center: Jean Hersholt translation",
          zh: "汉斯·克里斯蒂安·安徒生中心：Jean Hersholt 英译"
        },
        note: {
          en: "English reference text for The Emperor's New Clothes.",
          zh: "《皇帝的新衣》的英文参考文本。"
        }
      },
      {
        href: "https://andersen.sdu.dk/vaerk/register/info_e.html?vid=17",
        label: {
          en: "Hans Christian Andersen Center: work register",
          zh: "汉斯·克里斯蒂安·安徒生中心：作品登记页"
        },
        note: {
          en: "Records the tale's first publication on 7 April 1837.",
          zh: "记录该童话于 1837 年 4 月 7 日首次出版。"
        }
      },
      {
        href: "https://samlinger.museumodense.dk/HCA/XVIII-58-B",
        label: {
          en: "Museum Odense: manuscript record",
          zh: "欧登塞博物馆：手稿记录"
        },
        note: {
          en: "Museum record for the manuscript of Kejserens nye Klæder.",
          zh: "《皇帝的新衣》丹麦原题手稿的博物馆记录。"
        }
      }
    ]
  },
  {
    index: "02",
    title: { en: "Public-domain Text References", zh: "公版文本参考" },
    body: {
      en: "Public-domain editions were used to check story details and wording.",
      zh: "这些公版文本用于核对故事情节和措辞。"
    },
    links: [
      {
        href: "https://www.gutenberg.org/ebooks/1597",
        label: {
          en: "Project Gutenberg: Andersen's Fairy Tales",
          zh: "Project Gutenberg：《安徒生童话》"
        },
        note: {
          en: "Public-domain ebook collection including The Emperor's New Clothes.",
          zh: "包含《皇帝的新衣》的公版电子书合集。"
        }
      },
      {
        href: "https://en.wikisource.org/wiki/The_Emperor%27s_New_Clothes",
        label: {
          en: "Wikisource: translation index",
          zh: "Wikisource：英文译本索引"
        },
        note: {
          en: "Index of English-language public-domain translations.",
          zh: "英文公版译本索引。"
        }
      }
    ]
  },
  {
    index: "03",
    title: { en: "Visual References", zh: "视觉参考" },
    body: {
      en: "These links document fairy-tale visual references. The current interface images and music are local project/generated assets.",
      zh: "这些链接用于说明童话视觉参考。当前界面图像和音乐为项目本地制作或生成资产。"
    },
    links: [
      {
        href: "https://commons.wikimedia.org/wiki/Category:The_Emperor%27s_New_Clothes",
        label: {
          en: "Wikimedia Commons: The Emperor's New Clothes category",
          zh: "Wikimedia Commons：《皇帝的新衣》分类"
        },
        note: {
          en: "Reusable image category for the fairy tale.",
          zh: "该童话相关可复用图片分类。"
        }
      },
      {
        href: "https://commons.wikimedia.org/wiki/File:Edmund_Dulac_-_The_Emperors_New_Clothes_-_empty_loom.jpg",
        label: {
          en: "Wikimedia Commons: Edmund Dulac empty loom illustration",
          zh: "Wikimedia Commons：Edmund Dulac 空织布机插画"
        },
        note: {
          en: "Public-domain-marked visual reference for the empty loom scene.",
          zh: "空织布机场景的公有领域标记视觉参考。"
        }
      }
    ]
  },
  {
    index: "04",
    title: { en: "AI Disclosure", zh: "AI 披露" },
    body: {
      en: "The in-world Palace AI can generate advice, rewrites, comments, and final reports. Endings are still calculated by local game rules and player actions.",
      zh: "故事内的宫廷 AI 可生成建议、改写、评论和结局报告。结局仍由本地游戏规则和玩家行动决定。"
    },
    links: [
      {
        href: "https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat",
        label: {
          en: "OpenAI docs: Structured Outputs",
          zh: "OpenAI 文档：结构化输出"
        },
        note: {
          en: "Reference for schema-shaped model output.",
          zh: "用于说明模型如何按结构返回内容。"
        }
      },
      {
        href: "https://platform.openai.com/docs/models",
        label: {
          en: "OpenAI docs: Models",
          zh: "OpenAI 文档：模型"
        },
        note: {
          en: "Reference for available OpenAI models.",
          zh: "用于说明可连接的 OpenAI 模型服务。"
        }
      }
    ]
  }
];

function SourceLinks({ items, language }: { items: SourceLink[]; language: LanguageCode }) {
  return (
    <div className="source-link-list">
      {items.map((item) => (
        <a href={item.href} key={item.href} rel="noreferrer" target="_blank">
          <b>{item.label[language]}</b>
          <span>{item.note[language]}</span>
        </a>
      ))}
    </div>
  );
}

export default function CreditsPage() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <main className="page report-page ui-shift">
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <header className="topbar" aria-label="Navigation">
        <Link className="brand-mark" href="/">{language === "zh" ? "The Emperor's Feed / 宫廷发布台" : "The Emperor's Feed / Palace Feed"}</Link>
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
            {language === "zh" ? "这里记录故事来源、视觉参考、本地素材说明和 AI 使用说明。" : "This page keeps story sources, visual references, local asset notes, and AI usage visible."}
          </p>
        </div>

        <div className="report-layout">
          <article className="archive-card" data-archive-label={language === "zh" ? "已归档" : "Archived"} data-reveal>
            <div className="doc-label">{language === "zh" ? "来源说明" : "Source Notes"}</div>
            <h3>{language === "zh" ? "这个游戏改编自《皇帝的新衣》" : "Adapted from The Emperor's New Clothes"}</h3>
            <div className="archive-meta">
              <span>{language === "zh" ? "原始童话：汉斯·克里斯蒂安·安徒生" : "Original tale: Hans Christian Andersen"}</span>
              <span>{language === "zh" ? "主题：信息流、沉默和共同说出的真话" : "Theme: feeds, silence, and shared truth"}</span>
              <span>{language === "zh" ? "玩法：六次发布决定游行前的局势" : "Play: six posts shape the parade"}</span>
            </div>
            <p>{language === "zh" ? "游戏把童话里的沉默、从众和真话传播，改写成一次宫廷信息流值班：你决定哪些话能被看见。" : "The game turns the tale's silence, conformity, and public truth into a palace feed shift: you decide which words become visible."}</p>
          </article>

          <div className="outcome-stack">
            {sourceGroups.map((group) => (
              <article className="outcome-card source-card" data-index={group.index} data-reveal key={group.index}>
                <h4>{group.title[language]}</h4>
                <p>{group.body[language]}</p>
                <SourceLinks items={group.links} language={language} />
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
