# Repository Guidelines

This guide helps contributors navigate, develop, test, and submit changes efficiently for this Expo + TypeScript project.

## Project Structure & Module Organization
- `app/`: Expo Router screens/layouts (e.g., `app/(tabs)`, `_layout.tsx`).
- `components/`, `hooks/`, `store/`: UI components, reusable hooks, Zustand state.
- `api/`: Client APIs and config (Supabase in `api/config/supabase.ts`).
- `data/`, `types/`, `config/`: Domain data, shared TS types, app config.
- `server/pdf-service/`: PDF microservice (Express + Puppeteer).
- `scripts/`: Tooling (scale importers, icon generation).
- `__tests__/`: Jest tests; assets in `assets/`; DB migrations in `supabase/migrations/`.

## Build, Test, and Development Commands
- `npm run dev`: Start Expo dev server (web/native).
- `npm run build:web`: Export static web build to `dist/`.
- `npm run pdf:dev` / `npm run pdf:build`: Run/build the PDF microservice.
- `npm test` | `npm run test:watch` | `npm run test:coverage`: Run Jest via `jest-expo`.
- `npm run lint`: Lint with Expo’s ESLint config.
- `npm run typecheck`: TypeScript compile checks (no emit).
- `npm run import:scales`: Import scales from `scripts/massScaleImporter.ts`.

## Coding Style & Naming Conventions
- Language: TypeScript (strict); 2-space indentation.
- Components: PascalCase in `components/` (e.g., `ScaleEvaluation.tsx`).
- Hooks: camelCase `useXxx` in `hooks/` (e.g., `useScaleDetails.ts`).
- Imports: Use path alias `@/*` (e.g., `import x from '@/api'`).
- Quality: Fix ESLint warnings; keep PRs type-clean (`npm run typecheck`).

## Testing Guidelines
- Framework: Jest + `jest-expo`.
- Location: `__tests__/` or colocated `*.test.ts(x)`.
- Coverage: ≥70% lines/branches/functions/statements. Use `npm run test:coverage`.
- Example: See `__tests__/components/ScaleEvaluation.test.tsx`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`). Keep scope clear.
- PRs: Include description, linked issues, tests, and screenshots for UI changes.
- Required checks: `npm test`, `npm run lint`, and `npm run typecheck` must pass.

## Security & Configuration Tips
- Node: Use Node 20.x (see `engines`).
- Secrets: Do not commit keys. Provide Supabase via `SUPABASE_URL`/`SUPABASE_ANON_KEY` or `EXPO_PUBLIC_*` env vars.
- PDF Service: Run separately when generating PDFs (`npm run pdf:dev`); Puppeteer may require OS deps in CI.

