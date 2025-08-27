# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens and layouts (e.g., `app/(tabs)`, `_layout.tsx`).
- `components/`, `hooks/`, `store/`: UI, reusable hooks, and Zustand state.
- `api/`: Client APIs and config (Supabase in `api/config/supabase.ts`).
- `data/`, `types/`, `config/`: Domain data, TypeScript types, and app config.
- `server/pdf-service/`: Node service for PDF export (Express + Puppeteer).
- `scripts/`: Maintenance tooling (e.g., scale importers, icon generation).
- `__tests__/`: Jest tests. Assets under `assets/`. Database migrations in `supabase/migrations/`.

## Build, Test, and Development Commands
- `npm run dev`: Start the Expo dev server (web/native).
- `npm run build:web`: Export static web build to `dist`.
- `npm run pdf:dev` / `npm run pdf:build`: Run/build the PDF microservice.
- `npm test` | `npm run test:watch` | `npm run test:coverage`: Run Jest tests.
- `npm run lint`: Lint with Expo’s ESLint config.
- `npm run typecheck`: TypeScript compile checks (no emit).
- `npm run import:scales` (`scripts/massScaleImporter.ts`): Import scales data.

## Coding Style & Naming Conventions
- Language: TypeScript with strict mode (see `tsconfig.json`).
- Indentation: 2 spaces; keep lines focused and typed.
- Components: PascalCase files in `components/` (e.g., `ScaleEvaluation.tsx`).
- Hooks: `useXxx` camelCase in `hooks/` (e.g., `useScaleDetails.ts`).
- Paths: Use alias `@/*` per `tsconfig.json` (e.g., `import x from '@/api'`).

## Testing Guidelines
- Framework: Jest + `jest-expo`. Tests in `__tests__/` or `*.test.ts(x)`.
- Coverage: Global thresholds 70% lines/branches/functions/statements.
- Example: `__tests__/components/ScaleEvaluation.test.tsx`.
- Run locally: `npm test` or `npm run test:watch`.

## Commit & Pull Request Guidelines
- Commits: Prefer Conventional Commits (`feat:`, `fix:`, `chore:`). Write clear, scoped messages.
- PRs: Include a concise description, linked issues, test updates, and screenshots for UI changes.
- Checks: Ensure `npm test`, `npm run lint`, and `npm run typecheck` pass.

## Security & Configuration Tips
- Node 20.x required (see `engines`). Do not commit secrets.
- Supabase keys loaded from env: `SUPABASE_URL`/`SUPABASE_ANON_KEY` or `EXPO_PUBLIC_*`.
- PDF service uses Puppeteer; run `npm run pdf:dev` separately when working on exports.
