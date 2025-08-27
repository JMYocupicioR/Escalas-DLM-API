# Repository Guidelines

This document summarizes how to navigate, build, and contribute to this repository.

## Project Structure & Module Organization
- `app/`: Expo Router screens and layouts (e.g., `app/(tabs)`, `_layout.tsx`).
- `components/`, `hooks/`, `store/`: UI components, reusable hooks, Zustand state.
- `api/`: Client APIs and config (Supabase in `api/config/supabase.ts`).
- `data/`, `types/`, `config/`: Domain data, TypeScript types, app config.
- `server/pdf-service/`: PDF microservice (Express + Puppeteer).
- `scripts/`: Tooling (scale importers, icon generation).
- `__tests__/`: Jest tests; assets in `assets/`; migrations in `supabase/migrations/`.

## Build, Test, and Development Commands
- `npm run dev`: Start Expo dev server (web/native).
- `npm run build:web`: Export static web build to `dist`.
- `npm run pdf:dev` / `npm run pdf:build`: Run/build PDF microservice.
- `npm test` | `npm run test:watch` | `npm run test:coverage`: Run Jest tests.
- `npm run lint`: Lint with Expo’s ESLint config.
- `npm run typecheck`: TypeScript compile checks (no emit).
- `npm run import:scales`: Import scales data from `scripts/massScaleImporter.ts`.

## Coding Style & Naming Conventions
- **Language**: TypeScript (strict mode).
- **Indentation**: 2 spaces; keep lines small and typed.
- **Components**: PascalCase in `components/` (e.g., `ScaleEvaluation.tsx`).
- **Hooks**: `useXxx` camelCase in `hooks/` (e.g., `useScaleDetails.ts`).
- **Imports**: Use path alias `@/*` (e.g., `import x from '@/api'`).
- **Linting/Types**: Fix ESLint warnings; ensure `npm run typecheck` passes.

## Testing Guidelines
- **Framework**: Jest + `jest-expo`.
- **Location**: `__tests__/` or `*.test.ts(x)` beside source.
- **Coverage**: ≥70% lines/branches/functions/statements (`npm run test:coverage`).
- **Examples**: See `__tests__/components/ScaleEvaluation.test.tsx`.

## Commit & Pull Request Guidelines
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`). Scope clearly and keep messages concise.
- **PRs**: Include description, linked issues, tests, and screenshots for UI changes.
- **Checks**: Ensure `npm test`, `npm run lint`, and `npm run typecheck` pass.

## Security & Configuration Tips
- **Node**: Use Node 20.x (see `engines`).
- **Secrets**: Do not commit secrets. Supabase keys via env: `SUPABASE_URL`/`SUPABASE_ANON_KEY` or `EXPO_PUBLIC_*`.
- **PDF Service**: Puppeteer requires the PDF service running separately (`npm run pdf:dev`).

