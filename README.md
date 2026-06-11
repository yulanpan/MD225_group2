# The Emperor's Feed

*The Emperor's Feed* is an interactive narrative web game based on "The Emperor's New Clothes." The player acts as the Royal Feed Editor, making six editorial decisions before the parade while the Palace Narrative Engine monitors risk, rewrites posts, generates public reactions, and tries to preserve palace legitimacy.

The app is bilingual (`en` / `zh`) and can run with or without a live OpenAI-compatible API key. Without a key, API routes return deterministic fallback content so the full game remains playable.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- SQLite account and cloud-save storage
- GSAP and Motion for interface animation
- Zod for request validation
- Vitest for unit/API tests
- Playwright for E2E and visual-flow checks

## Quick Start

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

For the shared development URL used in this workspace:

```bash
pnpm dev --hostname 100.100.10.10 --port 6677
```

## Production Run

```bash
pnpm build
pnpm start --hostname 100.100.10.10 --port 6677
```

Then open:

```text
http://100.100.10.10:6677
```

## Environment Variables

Create `.env.local` from `.env.example` when live AI generation is needed:

```bash
cp .env.example .env.local
```

Supported variables:

```text
OPENAI_API_KEY=
OPENAI_BASE_URL=https://ai.exit0.link/v1
OPENAI_MODEL=gpt-5.3-codex-spark
OPENAI_MAX_OUTPUT_TOKENS=1000
OPENAI_PROVIDER_MODE=responses
DATA_DIR=.data
AUTH_COOKIE_SECURE=false
AUTH_SESSION_DAYS=30
```

`OPENAI_PROVIDER_MODE` supports:

- `chat` - sends requests to `/v1/chat/completions`
- `responses` - sends requests to `/v1/responses`

Do not commit `.env.local` or real API keys.

For deployment, set these same variables in the hosting platform's environment settings. Visitors do not need their own API key; the app's server-side API routes call the provider with the deployed secret.

`DATA_DIR` stores the SQLite database at `DATA_DIR/the-emperors-feed.sqlite`. Use `AUTH_COOKIE_SECURE=false` for plain HTTP local/shared testing, and set it to `true` when serving through HTTPS.

## Accounts and Cloud Saves

The game supports guest play and optional email/password accounts. Guests keep using browser `localStorage`; logged-in players sync profile, current run, endings, achievements, and engine fragments to SQLite through httpOnly session cookies. Passwords are hashed with `scrypt`; session tokens are stored only as server-side hashes.

## Docker

The included Docker setup runs the Next.js app and stores SQLite data in a persistent `/data` volume:

```bash
docker compose up --build
```

Open:

```text
http://100.100.10.10:6677
```

The compose file maps host port `6677` to container port `3000` and mounts `emperors-feed-data:/data`. To back up account data, export the volume or copy `/data/the-emperors-feed.sqlite` from the running container.

## Scripts

```bash
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm test:e2e
```

Install Playwright's browser once before the first E2E run:

```bash
pnpm exec playwright install chromium
```

The Playwright config starts a keyless dev server on `localhost:3027`, so E2E tests should pass without live AI credentials. If a custom Chromium binary is required, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Main Routes

- `/` - title screen and briefing
- `/login` - login, registration, and save-conflict resolution
- `/dashboard` - core six-action editorial game
- `/ending` - final outcome and report
- `/archive` - post-run archive view
- `/credits` - credits screen

## Project Map

- `src/app/dashboard/dashboard-client.tsx` - main dashboard UI, tutorial flow, local game state, action handling, AI route calls, and ending transition.
- `src/app/api/*` - OpenAI-backed or fallback API routes for reactions, dialogue, comments, rewrites, guidance, and final reports.
- `src/lib/game-rules.ts` - deterministic state changes from player actions.
- `src/lib/dialogue.ts` - interruption/dialogue mechanics and sanitization.
- `src/lib/narrative.ts` - narrative context exposed to AI prompts.
- `src/lib/i18n.ts` - bilingual UI and fallback copy.
- `src/lib/schemas.ts` - Zod schemas for route validation and structured AI output.
- `public/audio/` - music and layered tension audio.
- `public/images/` - runtime background imagery.

See `docs/AI_HANDOFF.md` for a more detailed handoff for future AI coding agents.
