# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Biome check (linter)
npm run format       # Biome format (auto-fix formatting)
npm run migrate      # Generate + apply DB migrations
npm run migration:generate  # Generate migration files only
npm run migration:push      # Apply migrations only
```

There are no tests configured yet.

## Architecture

**Wordy App** is a dictionary/vocabulary learning app built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Drizzle ORM, Supabase (PostgreSQL), and Stripe.

### Route Groups

- `src/app/(auth)/` — unauthenticated pages (login)
- `src/app/(main)/` — authenticated app pages with shared `Header` layout
- `src/app/api/` — API route handlers

### Key App Routes

- `/dictionary/[word]` — word detail page with senses, translations, examples, synonyms
- `/bookmarks` — user's bookmarked translations, organized into collections
- `/collection/[id]` — single collection view
- `/profile` — user profile

### Data Layer

- `src/db/schema.ts` — Drizzle schema (single source of truth for all types)
- `src/db/index.ts` — singleton `db` export using a pooled `pg` connection
- `src/db/migrations/` — generated SQL migrations; run via `drizzle-kit`
- `drizzle.config.ts` — points at `src/db/schema.ts`, reads `DATABASE_URL` from `.env.local`

**Schema overview:** `words` -> `senses` -> `translations`. Users can `bookmark` a `translation`. Bookmarks can be grouped into `collections` via the `collection_bookmarks` join table. Users have a `subscriptions` table linked to Stripe.

### Services vs API Routes

- `src/services/` — thin client-side fetch wrappers (called from client components)
- `src/app/api/` — Next.js route handlers that talk directly to `db`
- Server components (pages) query `db` directly without going through the API

### Auth Status (In Progress)

Supabase auth is installed but not yet wired up. `userId` is currently hardcoded as `"4500fc50-30c6-4a0d-bae8-2558bb0b234b"` in API routes and server pages. The intent is to replace these with the Supabase session user ID.

### Theme

`ThemeContext` (`src/context/ThemeContext.tsx`) manages light/dark mode via `localStorage` and a `data-theme` attribute on `<html>`. Theme is persisted in localStorage under the key `"theme"`.

### Tooling

- **Linter/Formatter:** Biome (not ESLint/Prettier) — configured in `biome.json` with 2-space indent, import organization on save
- **Path alias:** `@/` maps to `src/`
- **React Compiler:** enabled in `next.config.ts`
- **Icons:** `@phosphor-icons/react` (tree-shaken via `optimizePackageImports`)

### Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string (Supabase)
- `STRIPE_SECRET_KEY` — Stripe secret key
