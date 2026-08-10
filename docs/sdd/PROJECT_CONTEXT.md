# SDD Project Context

Project Pet is ready for spec-driven delivery of a local, demonstrable MVP. The repository has executable quality gates and a hybrid SDD record: OpenSpec files are versioned with the project, while Engram stores recoverable operational context.

## Quick path

1. Start the next change from `docs/sdd/EXECUTION_PLAN.md`.
2. Create or update its OpenSpec artifacts under `openspec/changes/<change-name>/`.
3. Work test-first, then run the required verification commands before closing the milestone.

## Current baseline

| Topic | Verified state |
| --- | --- |
| Application | React 19.2 SPA built with Vite 8 |
| Language | TypeScript 6 with `strict: true`, no emit, and unused-code checks |
| Architecture | Local-first modular monolith with feature modules and domain contracts |
| Remote boundary | `@supabase/supabase-js` is isolated to `src/lib/supabase/` |
| Current product scope | Local demonstrable MVP; remote auth, database, RLS, and deployment are deferred |
| Delivery | Automatic execution on `main`, with milestone commits and no task branches |
| Review guard | Split work before a milestone exceeds 800 changed lines |

## Testing capabilities

**Strict TDD mode:** enabled. A test runner exists and `openspec/config.yaml` explicitly enables it.

| Layer | Available | Tooling and evidence |
| --- | --- | --- |
| Unit and type contracts | Yes | Vitest 4.1.10; domain and Supabase guard tests |
| Component | Yes | React Testing Library 16.3.2 with file-level jsdom |
| Integration | Not yet | No browser, persistence-adapter, or network integration suite |
| End-to-end | Not yet | No Playwright, Cypress, or equivalent runner |
| Coverage | Yes | V8 provider through `@vitest/coverage-v8` |

| Quality tool | Available | Command |
| --- | --- | --- |
| Tests | Yes | `npm run test:run` |
| Coverage | Yes | `npm run test:coverage` |
| Linter | Yes | `npm run lint` |
| Type check and production build | Yes | `npm run build` |
| Formatter | No dedicated command | — |

The initialization refresh on 2026-08-10 directly verified: 3 test files and 20 tests passed; coverage completed at 77.41% statements and lines, 91.66% branches, and 100% functions; lint and production build passed.

## Architecture constraints

- Feature modules own their components, hooks, types, and services under `src/modules/`.
- Cross-module contracts belong in `src/types/` and `src/utils/`.
- UI must not access `localStorage` or Supabase directly; use module-facing repositories or services.
- The local adapter is the active persistence path. Supabase adapters must remain replaceable and satisfy the same contracts when productization starts.
- Browser bundles must never receive `service_role` or `sb_secret_` keys.

## SDD persistence

| Store | Role |
| --- | --- |
| `openspec/config.yaml` | Project rules and current testing configuration |
| `openspec/changes/` | Versioned change artifacts and archive trail |
| Engram `sdd-init/project-pet` | Current project context for recovery across sessions |
| Engram `sdd/project-pet/testing-capabilities` | Separately recoverable testing capability record |
| `.atl/skill-registry.md` | Index of available skills; each listed `SKILL.md` remains authoritative |

## Known scope boundary

`openspec/changes/admin-managed-email-auth/` is an existing unarchived change. The local-MVP backlog marks it paused rather than cancelled; do not resume it until productization is explicitly prioritized. It must not be mixed into local persistence or MVP feature milestones.

## Verification checklist

- [ ] Behavior started with a failing test when it is testable.
- [ ] The milestone remains within the 800 changed-line review guard.
- [ ] `npm run test:run` passes.
- [ ] `npm run test:coverage` is reviewed against the applicable scope goal.
- [ ] `npm run lint` and `npm run build` pass.
- [ ] OpenSpec, the execution plan, and Engram progress are updated before handoff.
