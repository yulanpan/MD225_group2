<div align="center">

# The Emperor's Feed / 皇帝的信息流

### An Interactive Web Game on Information Power and Media Convergence

**MD225FZ, Coding Media Convergences · Group Digital Project**

[Abstract](#abstract) · [Demo Flow](#suggested-demo-flow--建议演示流程) · [Code](https://github.com/yulanpan/MD225_group2) · [Local Setup](#quick-start--本地运行)

**Pan Yulan · Huang Xuanning · Wu Sitong · Du Sihan · Wang Zhiran**

</div>

---

## Abstract

*The Emperor's Feed* reimagines Hans Christian Andersen's **The Emperor's New Clothes** as a contemporary social-feed control system. Instead of retelling the fairy tale as a linear story, the project turns it into a playable palace publishing desk: the player becomes the **Palace Feed Editor**, making six editorial decisions before the royal parade begins.

Each action changes what the public can see, repeat, doubt, archive, or lose access to. The system tracks Evidence, Palace Pressure, Spread, Public Doubt, Safety, and Palace Alert, transforming the fairy tale's central question into a media-system problem: truth does not win simply because it exists; it needs visibility, circulation, shared recognition, and protection from institutional rewriting.

The project combines Next.js, React, TypeScript, local rule-based game logic, bilingual interface writing, optional OpenAI-compatible generation, deterministic fallback text, audio scenes, accounts, cloud saves, achievements, archives, and multiple endings. AI appears inside the story as the **Palace Narrative Engine**, a fictional system that can advise, rewrite, generate comments, and produce reports, while final outcomes remain controlled by deterministic local rules.

## 摘要

《皇帝的信息流》把安徒生童话 **《皇帝的新衣》** 重新设计成一个当代信息流控制系统。它不是线性复述原故事，而是让玩家进入“宫廷发布台”：玩家扮演 **宫廷发布编辑**，在皇帝游行开始前完成六次发布行动。

每次行动都会改变公众能看见什么、重复什么、怀疑什么、保存什么，或失去什么发布权限。游戏追踪证据、宫廷压力、传播、群众怀疑、你的安全和宫廷警戒等指标，把童话中的核心问题转化为一个媒介系统问题：真相不会因为存在就自动胜利，它需要可见性、传播、共同确认，也需要不被制度化语言和平台机制改写。

项目使用 Next.js、React、TypeScript、本地规则系统、中英双语界面、可选 OpenAI-compatible 生成、确定性 fallback 文案、音频场景、账号存档、成就、档案和多结局。AI 在故事内部被设计成 **宫廷叙事引擎**，可以生成建议、改写、评论和报告；但结局始终由本地规则计算，保证体验稳定、可复现、可测试。

---

## Key Contributions

1. **A fairy tale remediated as a platform interface.**
   The project turns the Emperor's court into a publishing backend, replacing linear narration with dashboards, metrics, comments, AI advice, pop-ups, archives, and player decisions.

2. **A six-action narrative control loop.**
   Each run gives the player six editorial actions before the parade. These actions influence public evidence, palace pressure, viral spread, public doubt, player safety, and palace alert.

3. **AI as an in-world narrative force.**
   The Palace Narrative Engine is not presented as a neutral assistant. It acts as a fictional institutional system that recommends safer wording, reframes evidence, monitors risk, and tries to stabilize the palace story.

4. **Bilingual design, not only translation.**
   English and Chinese versions preserve the same mechanics and themes while adjusting tone, labels, tutorial text, and narrative framing for each language.

5. **Playable with or without live AI.**
   OpenAI-compatible generation can enrich comments, rewrites, dialogue, and final reports, but deterministic fallback content keeps the full game playable offline.

6. **Replayable endings and archive memory.**
   The project includes multiple endings, achievements, archive records, hidden engine fragments, and replay objectives so players can gradually understand what the system protects.

## 核心贡献

1. **把童话重新媒介化为平台界面。**
   项目把皇帝的宫廷转化为一个发布后台，用 dashboard、指标、评论、AI 建议、弹窗、档案和玩家操作替代线性叙事。

2. **六次行动的叙事控制循环。**
   每一局中，玩家在游行前只有六次发布机会。行动会影响证据、宫廷压力、传播、群众怀疑、你的安全和宫廷警戒。

3. **把 AI 设计成故事内部的权力机制。**
   宫廷叙事引擎不是中立助手，而是一个虚构的制度系统：它会建议更安全的话术、改写证据、监控风险，并试图稳住宫廷叙事。

4. **中英双语不是附加翻译。**
   中文和英文版本共享机制与主题，但在语气、标签、教程和叙事表达上分别打磨，使两种语言都能自然进入游戏语境。

5. **在线 AI 与离线 fallback 并存。**
   配置 OpenAI-compatible endpoint 后，游戏可以生成评论、改写、对话和报告；没有 API key 时，本地 fallback 仍能支持完整体验。

6. **可复玩的结局与档案记忆。**
   项目包含多结局、成就、历史档案、隐藏引擎碎片和复玩目标，鼓励玩家逐步理解系统真正保护的是什么。

---

## Game Overview / 游戏概览

| Area | Description |
|---|---|
| Role | Palace Feed Editor / 宫廷发布编辑 |
| Core Loop | Choose source → preview consequence → publish or accept rewrite → observe metrics → reach ending |
| Action Limit | Six editorial actions before the parade |
| Metrics | Evidence, Palace Pressure, Spread, Public Doubt, Safety, Palace Alert |
| AI Role | In-world Palace Narrative Engine for advice, rewrites, comments, dialogue, and reports |
| Languages | English and Simplified Chinese |
| Save System | Guest localStorage saves and optional account/cloud saves through SQLite |

## Suggested Demo Flow / 建议演示流程

1. Open the title screen and switch between English and Chinese.
2. Start a new shift and enter the tutorial.
3. Publish one palace-friendly action and one evidence-forward action.
4. Show how metrics, comments, AI guidance, and Palace Alert respond.
5. Trigger or show a dialogue interruption.
6. Continue to an ending and open the archive page.

1. 打开标题页，展示中英文切换。
2. 开始新值班，进入新手教程。
3. 发布一次偏宫廷安全的行动，再发布一次推进证据的行动。
4. 展示指标、评论、AI 指引和宫廷警戒如何变化。
5. 展示突发交流机制。
6. 进入结局，并打开档案页面查看记录。

---

## Quick Start / 本地运行

```bash
pnpm install
pnpm dev --hostname 127.0.0.1 --port 7987
```

Open:

```text
http://127.0.0.1:7987
```

打开：

```text
http://127.0.0.1:7987
```

The app also works without an AI key. Server routes return deterministic fallback content where live generation is unavailable.

没有 AI key 也可以运行。在线生成不可用时，服务端路由会返回确定性的 fallback 文案。

## Environment Variables / 环境变量

Copy `.env.example` to `.env.local` if live AI or persistent account data is needed:

如果需要在线 AI 或本地账号数据库，复制 `.env.example`：

```bash
cp .env.example .env.local
```

Important variables:

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Server-side API key. Do not commit real keys. |
| `OPENAI_BASE_URL` | OpenAI-compatible API base URL. |
| `OPENAI_MODEL` | Model used by AI-assisted routes. |
| `OPENAI_PROVIDER_MODE` | `responses` or `chat`. |
| `OPENAI_HTTP_TRANSPORT` | `fetch` by default; `curl` can help with local network compatibility. |
| `DATA_DIR` | SQLite data directory. |
| `AUTH_COOKIE_SECURE` | Use `false` for local HTTP, `true` for HTTPS deployment. |

Endpoint diagnostic:

```bash
OPENAI_API_KEY=... pnpm ai:diagnose
```

## Build, Test, and Run / 构建与测试

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Install Playwright's browser before the first E2E run:

```bash
pnpm exec playwright install chromium
```

Production run:

```bash
pnpm build
pnpm start --hostname 0.0.0.0 --port 7987
```

Docker:

```bash
docker compose up --build
```

---

## Tech Stack / 技术栈

- **Framework:** Next.js 16 App Router
- **Interface:** React 19, TypeScript
- **Animation:** GSAP, Motion
- **Validation:** Zod and structured JSON schemas
- **Storage:** localStorage for guest play; SQLite for account/cloud saves
- **AI Integration:** OpenAI-compatible server routes with fallback behavior
- **Testing:** Vitest and Playwright
- **Deployment Support:** Docker and Docker Compose

## Project Structure / 项目结构

```text
src/app/                    App Router pages, layout, providers, and API routes
src/app/dashboard/           Main game dashboard and six-action loop
src/app/ending/              Ending page and final report display
src/app/archive/             Archive, achievements, endings, and engine fragments
src/lib/game-rules.ts        Deterministic state changes and ending calculation
src/lib/game-data.ts         Source zones, action definitions, and effects
src/lib/dialogue.ts          Interruption mechanics and dialogue outcomes
src/lib/i18n.ts              Bilingual UI copy, glossary, metrics, and endings
src/lib/ai.ts                OpenAI-compatible client, retries, parsing, transports
src/lib/auth.ts              Account sessions and SQLite persistence
public/audio/                Runtime music and tension assets
public/images/               Runtime visual assets
e2e/                         Playwright flow and visual checks
docs/                        Handoff and copy-review notes
```

## Team Contributions / 小组分工

| Member | Main Role | Workload |
|---|---|---:|
| Pan Yulan | Team leader, creative direction, architecture, main development, final polish | 40% |
| Huang Xuanning | Development support, UI improvement, technical demo preparation | 20% |
| Wu Sitong | Content organization, story logic review, route testing, player-flow feedback | 15% |
| Du Sihan | Visual references, media support, presentation assets, demo recording/editing | 15% |
| Wang Zhiran | Documentation, report drafting, references, proofreading, formatting | 10% |

## Design Statement / 设计说明

The project argues that public truth is not only a matter of one brave statement. It depends on the media environment that decides whether evidence is visible, whether doubt can circulate, whether people recognize one another's uncertainty, and whether the system allows the record to remain open.

本项目想表达的是：公共真相并不只取决于某个人是否勇敢开口。它还取决于媒介环境是否允许证据可见、怀疑传播、群体彼此确认，以及系统是否允许公共记录继续保持开放。

---

## Repository Notes / 仓库说明

This repository is the final submission repository for **MD225 Group 2**. Real API keys, local databases, `.env.local`, build output, coverage output, and Playwright reports are intentionally excluded.

本仓库是 **MD225 Group 2** 的最终提交仓库。真实 API key、本地数据库、`.env.local`、构建产物、coverage 和 Playwright report 均不会提交。
