# AI Handoff

## Current State

This is a playable Next.js implementation of *The Emperor's Feed*. Treat the repository as an application codebase, not a proposal-only document repository.

The game is a six-action narrative control experience:

1. Player starts on `/`.
2. Player enters `/dashboard` as the Palace Feed Editor.
3. Each editorial action changes deterministic game state.
4. Some actions trigger Palace AI reactions, public comments, dialogue interruptions, or guidance.
5. After the action budget is exhausted, the app stores final state and moves to `/ending`.

The app remains usable without a live AI key because API routes fall back to deterministic copy.

## Important Files

- `src/app/page.tsx` - title screen, language toggle, run initialization.
- `src/app/dashboard/dashboard-client.tsx` - main game surface; largest and highest-risk file.
- `src/app/ending/ending-client.tsx` - ending display and final-state readback.
- `src/app/audio-provider.tsx` - global audio scene/SFX orchestration.
- `src/app/api/ai-reaction/route.ts` - structured AI reaction for player actions.
- `src/app/api/dialogue/*` - dialogue event lifecycle.
- `src/app/api/generate-comments/route.ts` - public comment generation.
- `src/app/api/rewrite-post/route.ts` - post rewrite endpoint.
- `src/app/api/final-report/route.ts` - ending report endpoint.
- `src/lib/ai.ts` - OpenAI-compatible client, retries, response parsing, and fallback exports.
- `src/lib/game-rules.ts` - deterministic rule engine.
- `src/lib/dialogue.ts` - dialogue triggers, fallback events, prompt patch sanitization.
- `src/lib/narrative.ts` - prompt-safe narrative context.
- `src/lib/i18n.ts` - bilingual labels and fallback copy.
- `src/lib/schemas.ts` - request and structured output schemas.
- `src/lib/types.ts` - shared domain types.
- `e2e/full-flow.spec.ts` - critical user-flow coverage.
- `e2e/visual-audit.spec.ts` - layout/visual checks.

## Runtime State

The app uses browser local storage for current run state. Common keys include:

- `emperor-feed-state`
- `emperor-feed-ending`
- `emperor-feed-final-state`
- `emperor-feed-briefing-dismissed`

Starting a new shift from the title screen clears the prior run and creates a new run id through `src/lib/profile.ts`.

## AI Integration

All live generation should go through `src/lib/ai.ts`. Do not call provider APIs directly from components or routes.

Environment variables:

- `OPENAI_API_KEY` - required only for live AI generation.
- `OPENAI_BASE_URL` - defaults to `https://api.openai.com/v1`.
- `OPENAI_MODEL` - defaults to `gpt-5.2`.
- `OPENAI_MAX_OUTPUT_TOKENS` - optional numeric cap.
- `OPENAI_PROVIDER_MODE` - `chat` by default, or `responses`.

For the Xiaomi Mimo OpenAI-compatible endpoint, use chat mode:

```sh
OPENAI_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
OPENAI_MODEL=mimo-v2.5-pro
OPENAI_PROVIDER_MODE=chat
```

Do not commit real API keys. To check a local endpoint/key without writing secrets to the repo, run:

```sh
OPENAI_API_KEY=... OPENAI_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1 OPENAI_MODEL=mimo-v2.5-pro OPENAI_PROVIDER_MODE=chat pnpm ai:diagnose
```

The diagnostic uses Node `fetch` with a default 20 second request timeout. Override with `AI_DIAGNOSTIC_TIMEOUT_MS=30000` if needed. The app uses Node/Next `fetch`; if the diagnostic times out while curl works, treat it as a local network or provider protocol compatibility issue rather than adding a curl fallback to the game runtime.

Route behavior:

- Routes validate inputs with Zod before doing work.
- Missing keys should return fallback content or an explicit unavailable response, depending on the route.
- Live AI failures should log server-side and degrade to fallback where possible.
- Prompts must stay in-world and must not invent witnesses, garment details, or external facts beyond the provided narrative context.

## Product And UX Constraints

- Preserve bilingual behavior. Prefer updating `src/lib/i18n.ts` instead of scattering translated strings.
- Keep the dashboard dense and operational. It should feel like a control surface, not a marketing page.
- Keep the Palace AI tone bureaucratic, calm, and risk-management oriented.
- Tutorial scrolling is sensitive. `dashboard-client.tsx` contains a safe scroll helper that avoids centering oversized dashboard panels and leaving blank space above the active target.
- Audio is user-gesture gated by browser policy; unlock happens when the player starts a shift.

## Verification Checklist

Run these after ordinary code changes:

```bash
pnpm lint
pnpm test
pnpm build
```

Run this after dashboard, routing, layout, onboarding, or ending-flow changes:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

For manual production verification on this workspace:

```bash
pnpm build
pnpm start --hostname 100.100.10.10 --port 6677
```

Open `http://100.100.10.10:6677`.

## Known Cleanup Opportunities

- `src/app/dashboard/dashboard-client.tsx` is large. Future work can split tutorial, action feed, metrics, and dialogue panels into focused components, but only after tests cover the affected flow.
- Keep generated screenshots, Playwright reports, `.next/`, coverage, and local env files out of Git.
- Root-level design artifacts are intentionally local-only unless they become runtime assets under `public/`.
