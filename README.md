<div align="center">

# The Emperor's Feed

### An Interactive Web Game on Information Power and Media Convergence

**MD225FZ, Coding Media Convergences · Group Digital Project**

**Language:** [EN](README.md) · [CN](README.zh-CN.md)

[Code](https://github.com/yulanpan/MD225_group2) · [Demo Flow](#suggested-demo-flow) · [Local Setup](#quick-start) · [Project Structure](#project-structure)

**Pan Yulan · Huang Xuanning · Wu Sitong · Du Sihan · Wang Zhiran**

</div>

---

## Abstract

*The Emperor's Feed* reimagines Hans Christian Andersen's **The Emperor's New Clothes** as a contemporary social-feed control system. Instead of retelling the fairy tale as a linear story, the project turns it into a playable palace publishing desk: the player becomes the **Palace Feed Editor**, making six editorial decisions before the royal parade begins.

Each action changes what the public can see, repeat, doubt, archive, or lose access to. The system tracks Evidence, Palace Pressure, Spread, Public Doubt, Safety, and Palace Alert, transforming the fairy tale's central question into a media-system problem: truth does not win simply because it exists; it needs visibility, circulation, shared recognition, and protection from institutional rewriting.

The project combines Next.js, React, TypeScript, local rule-based game logic, bilingual interface writing, optional OpenAI-compatible generation, deterministic fallback text, audio scenes, accounts, cloud saves, achievements, archives, and multiple endings. AI appears inside the story as the **Palace Narrative Engine**, a fictional system that can advise, rewrite, generate comments, and produce reports, while final outcomes remain controlled by deterministic local rules.

## Key Contributions

1. **A fairy tale remediated as a platform interface.**
   The project turns the Emperor's court into a publishing backend, replacing linear narration with dashboards, metrics, comments, AI advice, pop-ups, archives, and player decisions.

2. **A six-action narrative control loop.**
   Each run gives the player six editorial actions before the parade. These actions influence public evidence, palace pressure, viral spread, public doubt, player safety, and palace alert.

3. **AI as an in-world narrative force.**
   The Palace Narrative Engine is not presented as a neutral assistant. It acts as a fictional institutional system that recommends safer wording, reframes evidence, monitors risk, and stabilizes the palace story.

4. **Bilingual interface design.**
   English and Simplified Chinese are both supported in the game interface, tutorial, dashboard copy, endings, achievements, and fallback AI text.

5. **Playable with or without live AI.**
   OpenAI-compatible generation can enrich comments, rewrites, dialogue, and final reports, while deterministic fallback content keeps the full game playable offline.

6. **Replayable endings and archive memory.**
   Multiple endings, achievements, archive records, hidden engine fragments, and replay objectives help players gradually understand what the system protects.

## Game Overview

| Area | Description |
|---|---|
| Role | Palace Feed Editor |
| Core Loop | Choose source -> preview consequence -> publish or accept rewrite -> observe metrics -> reach ending |
| Action Limit | Six editorial actions before the parade |
| Metrics | Evidence, Palace Pressure, Spread, Public Doubt, Safety, Palace Alert |
| AI Role | In-world Palace Narrative Engine for advice, rewrites, comments, dialogue, and reports |
| Languages | English and Simplified Chinese |
| Save System | Guest localStorage saves and optional account/cloud saves through SQLite |

## Suggested Demo Flow

1. Open the title screen and switch between English and Chinese.
2. Start a new shift and enter the tutorial.
3. Publish one palace-friendly action and one evidence-forward action.
4. Show how metrics, comments, AI guidance, and Palace Alert respond.
5. Trigger or show a dialogue interruption.
6. Continue to an ending and open the archive page.

## Quick Start

```bash
pnpm install
pnpm dev --hostname 127.0.0.1 --port 7987
```

Open:

```text
http://127.0.0.1:7987
```

The app also works without an AI key. Server routes return deterministic fallback content where live generation is unavailable.

## Environment Variables

Copy `.env.example` to `.env.local` if live AI or persistent account data is needed:

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

## Build, Test, and Run

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

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Interface:** React 19, TypeScript
- **Animation:** GSAP, Motion
- **Validation:** Zod and structured JSON schemas
- **Storage:** localStorage for guest play; SQLite for account/cloud saves
- **AI Integration:** OpenAI-compatible server routes with fallback behavior
- **Testing:** Vitest and Playwright
- **Deployment Support:** Docker and Docker Compose

## Project Structure

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

## Team Contributions

| Member | Main Role |
|---|---|
| Pan Yulan | Team leader, creative direction, architecture, main development, final polish |
| Huang Xuanning | Development support, UI improvement, technical demo preparation |
| Wu Sitong | Content organization, story logic review, route testing, player-flow feedback |
| Du Sihan | Visual references, media support, presentation assets, demo recording/editing |
| Wang Zhiran | Documentation, report drafting, references, proofreading, formatting |

## Design Statement

The project argues that public truth is shaped by media conditions: whether evidence is visible, whether doubt can circulate, whether people recognize one another's uncertainty, and whether the system allows the record to remain open.

## Repository Notes

This repository is the final submission repository for **MD225 Group 2**. Real API keys, local databases, `.env.local`, build output, coverage output, and Playwright reports are intentionally excluded.
