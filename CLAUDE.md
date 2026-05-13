# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
SSAju/
├── ssaju-frontend/     # Next.js app — all dev commands run here
├── skils/              # Detailed guides (architecture, code style, git)
└── specs/001-ssaju-frontend/   # Feature spec, plan, tasks
```

All commands below must be run from **`ssaju-frontend/`**.

## Commands

```bash
npm run dev       # Dev server on :3000
npm run build     # Production build — runs TypeScript + ESLint; MUST pass before commit
npm run start     # Serve the production build
npm run lint      # ESLint only
```

> There is no `type-check` script. Use `npm run build` to catch type errors.

**Build before every commit.** `[Build Passed]` must appear in the commit message.

## Architecture

Four strict layers — never skip or reverse:

```
Page (app/**/page.tsx)      ← thin: assembles hook + components, 50–100 lines max
  ↓
Component (components/)     ← UI rendering + user interaction only
  ↓
Hook (hooks/)               ← all state, business logic, API orchestration
  ↓
API fn (lib/api/)           ← fetch calls; throws on failure, returns typed data
```

All pages use `"use client"` (Phase 1 simplification — Server Components later).

### Key files

| Path | Purpose |
|------|---------|
| `lib/api/client.ts` | Central `apiFetch<T>()` wrapper — reads `NEXT_PUBLIC_API_BASE_URL` |
| `lib/api/career.ts` | `fetchCareerTiming()`, `fetchConsultation()` |
| `lib/api/company.ts` | `fetchCompatibility()` |
| `lib/api/feedback.ts` | `submitFeedback()` |
| `hooks/useCareerTiming.ts` | `{ data, loading, error, submit }` pattern |
| `types/api.ts` | `ApiResponse<T>`, all request/response types |
| `types/domain.ts` | `FavoredPeriod`, `FeedbackType`, `SajuData` |

### Backend API (Spring Boot on `:8080`)

All endpoints are `POST`, wrapped in `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; requestId: string } | null;
  timestamp: number;
}
```

| Endpoint | Hook | Timeout |
|----------|------|---------|
| `POST /api/career/timing` | `useCareerTiming` | 10 s |
| `POST /api/career/consultation` | `useConsultation` | 15 s (AI) |
| `POST /api/company/compatibility` | `useCompatibility` | 10 s |
| `POST /api/feedback/satisfaction` | `useFeedback` | 10 s |

## Constraints (Phase 1 — hard rules)

- **전역 상태**: Zustand 사용 (Constitution IV — Redux/Recoil 금지, `useState` + props lifting은 로컬 상태용)
- **No** axios, React Query, or SWR — use the `apiFetch` wrapper in `lib/api/client.ts`
- **No** shadcn/ui, MUI, or any component library — build components directly
- **Styling**: Tailwind CSS only — no CSS Modules
- **Forms**: `useState` only — no react-hook-form
- `sessionStorage` is used to persist `sajuResultId` across page refresh (client only)

## Environment Variables

```bash
# .env.local (git-ignored)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

`.env.example` is committed with the key but empty value.

## Commit Convention (Korean, Conventional Commits)

```
feat: 관운 분석 페이지 추가

[Build Passed]
```

Prefixes: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `ui`  
WIP commits (build failing): add `[WIP]` in title — **do not push**.

Branches: `feat/career-timing-page`, `fix/form-validation`, etc. — English, kebab-case.

## Detailed Guides

| Topic | File |
|-------|------|
| Architecture & API patterns | [`skils/architecture-guide.md`](skils/architecture-guide.md) |
| TypeScript, React, Tailwind style | [`skils/code-style-guide.md`](skils/code-style-guide.md) |
| Git workflow & PR rules | [`skils/git-workflow.md`](skils/git-workflow.md) |
| Feature spec | [`specs/001-ssaju-frontend/spec.md`](specs/001-ssaju-frontend/spec.md) |
| Implementation tasks | [`specs/001-ssaju-frontend/tasks.md`](specs/001-ssaju-frontend/tasks.md) |

<!-- SPECKIT START -->
**Implementation Plan**: [`specs/001-ssaju-complete/plan.md`](specs/001-ssaju-complete/plan.md)

Key architectural decisions:
- **Zustand** for global state (AI consultation tab caching, 0.2s instant switching)
- **Recharts** for visualization (Bar Chart, Progress Bar, Calendar UI)
- **HttpOnly Cookie** for authentication security
- **Zod** for runtime validation of all inputs
- **Error Boundary + ErrorMessage** for adaptive error recovery UI

Git workflow: All commits must have `[Build Passed]` tag only after:
1. `npm test` passes (80% coverage minimum)
2. `npm run build` succeeds with no errors
3. `npm run lint` shows no violations

For full technical design, see the implementation plan.
<!-- SPECKIT END -->
