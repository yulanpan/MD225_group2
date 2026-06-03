# Repository Guidelines

## Project Structure

This repository contains *The Emperor's Feed*, a Next.js interactive narrative game.

- `src/app/` - App Router pages, layout, providers, and API routes.
- `src/app/dashboard/dashboard-client.tsx` - main game interface and client-side game loop.
- `src/lib/` - domain logic, schemas, AI helpers, i18n copy, narrative state, and tests.
- `src/hooks/` - small shared client hooks.
- `public/` - runtime images, icons, and audio assets used by the app.
- `e2e/` - Playwright smoke and visual-flow tests.
- `docs/AI_HANDOFF.md` - project map for future AI coding agents.

Keep root-level files limited to app configuration, contributor guidance, and essential setup docs. Put supporting notes in `docs/`.

## Development Commands

Use `pnpm`.

- `pnpm install` - install dependencies.
- `pnpm dev` - run the development server on the default Next.js port.
- `pnpm dev --hostname 100.100.10.10 --port 6677` - run dev server on the preferred shared URL.
- `pnpm build` - create a production build.
- `pnpm start --hostname 100.100.10.10 --port 6677` - serve the production build on the shared URL.
- `pnpm lint` - run ESLint.
- `pnpm test` - run Vitest unit/API tests.
- `pnpm test:e2e` - run Playwright tests.

## Environment

Copy `.env.example` to `.env.local` for local live AI behavior. Never commit `.env.local` or real API keys.

The app works without an OpenAI key by returning deterministic fallbacks for AI-driven routes. Live AI behavior is controlled by:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`
- `OPENAI_MAX_OUTPUT_TOKENS`
- `OPENAI_PROVIDER_MODE`

## Coding Guidelines

- Prefer small, focused files and typed data structures.
- Validate API request bodies with Zod schemas from `src/lib/schemas.ts`.
- Keep bilingual user-facing copy in `src/lib/i18n.ts` unless a component has a strong reason to own local copy.
- Preserve the story-world tone: in-world, bureaucratic, platform-like, and centered on the Palace Narrative Engine.
- Keep public runtime assets under `public/`; do not reference root-level local design files.
- Do not hardcode secrets, credentials, private prompts, or unpublished research data.

## Testing

For code changes, run at least:

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`

Run `pnpm test:e2e` when changing routing, dashboard flow, onboarding, ending logic, or layout-sensitive UI.

## Git

Use Conventional Commits, for example:

- `feat: add dialogue interruption flow`
- `fix: stabilize dashboard tutorial scroll`
- `docs: update ai handoff`
- `test: cover narrative thresholds`

Before pushing, check `git status --short` and confirm ignored local artifacts remain untracked.
