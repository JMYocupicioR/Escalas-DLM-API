# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens/layouts (e.g., `app/(tabs)`, `_layout.tsx`).
- `components/`, `hooks/`, `store/`: UI components, reusable hooks, Zustand state.
- `api/`: Client APIs and config (see `api/config/supabase.ts`).
- `api/export/templates/`: Shared PDF templates and dispatcher.
- `data/`, `types/`, `config/`: Domain data, shared TS types, app config.
- `scripts/`, `__tests__/`, `assets/`, `supabase/migrations/`.
- Imports: use `@/*` path alias (e.g., `import x from '@/api'`).

## Build, Test, and Development Commands
- `npm run dev`: Start the Expo dev server (web/native).
- `npm run build:web`: Export static web build to `dist/`.
- `npm run build:functions`: Build Netlify Functions (incl. `pdf-export`).
- `npm test` | `npm run test:watch` | `npm run test:coverage`: Run Jest via `jest-expo` (coverage report).
- `npm run lint`: Lint with Expo’s ESLint config.
- `npm run typecheck`: TypeScript compile checks (no emit).
- `npm run import:scales`: Import scales from `scripts/massScaleImporter.ts`.
- Local PDF export: `netlify dev` to proxy `/api/pdf/export`.

## Coding Style & Naming Conventions
- Language: TypeScript (strict), 2‑space indentation.
- Components: PascalCase in `components/` (e.g., `ScaleEvaluation.tsx`).
- Hooks: camelCase `useXxx` in `hooks/` (e.g., `useScaleDetails.ts`).
- Fix ESLint warnings; keep PRs type‑clean (`npm run typecheck`).

## Testing Guidelines
- Framework: Jest + `jest-expo`.
- Location: `__tests__/` or colocated `*.test.ts(x)`.
- Coverage: ≥70% lines/branches/functions/statements.
- Example: `__tests__/components/ScaleEvaluation.test.tsx`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`) with clear scope.
- PRs: Include description, linked issues, and screenshots for UI changes.
- Required checks: `npm test`, `npm run lint`, and `npm run typecheck` must pass.

## Security & Configuration Tips
- Node: Use Node 20.x (`engines`).
- Secrets: Do not commit keys. Provide Supabase via `SUPABASE_URL`/`SUPABASE_ANON_KEY` or `EXPO_PUBLIC_*` env vars.
- PDF Generation: Served by Netlify Function `pdf-export` (Puppeteer). Use `netlify dev` for local proxying.

