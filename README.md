# RabbitCV

Multi-version resume builder. Clone an existing resume, tailor it for a new
position, export a clean PDF — instead of starting from scratch every time.

This is the ground-up rebuild of [rabbitcv.com](https://www.rabbitcv.com/),
run using [Shape Up](https://basecamp.com/shapeup) (see the project's Shape
Up Playbook doc for how we run it as a small team).

## Structure

This is a pnpm + Turborepo monorepo:

```
apps/
  web/    Next.js marketing site (rabbitcv.com) — SEO-critical, mostly static
  app/    Vite + React SPA — the actual product, behind auth
packages/
  ui/     Shared design system: tokens, components used by both apps
  config/ Shared config (tsconfig base, etc.)
```

## Stack

- **Frontend:** TypeScript everywhere. Next.js (web), Vite + React 19 (app).
- **Backend:** Firebase — Auth, Firestore, Storage, Cloud Functions, Hosting.
- **Package manager:** pnpm workspaces, orchestrated with Turborepo.

## Getting started

```
pnpm install
pnpm dev       # runs both apps in dev mode
pnpm build     # builds both apps
```

## Status

Early scaffolding — see Jira for active Shape Up cycles and bets.
