---
name: local-gates
description: Run the local quality gates for whichever apps exist in the monorepo (web, api, ios). Path-scoped — only runs gates for apps whose directory is present. Reports concise pass/fail per gate. Use when answering "run the gates", "check before I push", or before authoring a commit.
---

# local-gates

Run the local quality gates for each app that exists. Concise output.

## When to use

- Before committing a non-trivial change.
- When Luk says "run the gates", "check before I push".
- After a non-trivial change to any app.

Single-file documentation tweaks don't need this. Pitch-note edits, design-doc tweaks, and CHANGELOG cleanups skip the gates entirely.

## Monorepo shape

Three apps under `apps/` ([[../../../docs/architecture/001-stack-decisions#Monorepo structure]]):

- `apps/web/` — Next.js (TypeScript)
- `apps/api/` — FastAPI (Python, uv-managed)
- `apps/ios/` — SwiftUI (Xcode project, not in npm workspace)

The skill **auto-skips** any app whose directory doesn't exist yet. Early in the project most gates will be no-ops; that's fine.

## Steps

For each app whose directory exists, run its gates **in order, sequentially**. Continue to the next gate on failure so the full picture surfaces in one report. Collect failures at the end.

### `apps/web/` — Next.js + TypeScript

Run from repo root using npm workspaces:

1. `npm --workspace apps/web run lint` — ESLint
2. `npm --workspace apps/web run typecheck` — `tsc --noEmit`
3. `npm --workspace apps/web run build` — `next build` (catches build-time errors the dev server misses)
4. `npm --workspace apps/web test --if-present` — vitest or playwright if configured; skip silently if no `test` script

If a script is missing from `apps/web/package.json`, report `✗ <gate> — script not found in package.json` and move on. Don't invent commands.

### `apps/api/` — FastAPI + Python (uv)

Run from `apps/api/`:

1. `uv run ruff check .` — Python lint
2. `uv run ruff format --check .` — Python format check (verify only; don't auto-format)
3. `uv run mypy .` — Python type check
4. `uv run pytest` — tests

If `apps/api/pyproject.toml` exists but `uv` isn't installed locally, report that and stop the api gates (don't fall back to bare `ruff`/`mypy` — keep tool resolution consistent).

### `apps/ios/` — SwiftUI

1. `swiftlint --strict apps/ios/` — Swift lint

**`xcodebuild` is intentionally NOT in the default gate set.** Full builds are slow (30s+ cold) and Luk already builds in Xcode during dev. If Luk asks for "full gates" or "all gates including ios build", add:

2. `xcodebuild -workspace apps/ios/Runtime.xcworkspace -scheme Runtime -destination 'generic/platform=iOS Simulator' build -quiet`

(Swap the workspace/scheme names for whatever exists in `apps/ios/`.)

## Reporting shape

Successful run with all three apps present:

```
web
  ✓ lint
  ✓ typecheck
  ✓ build
  ✓ test — 42 passed

api
  ✓ ruff check
  ✓ ruff format
  ✓ mypy
  ✓ pytest — 28 passed

ios
  ✓ swiftlint

All gates passed.
```

With some apps missing (early-project reality):

```
web
  ✓ lint
  ✓ typecheck
  ✓ build

api — skipped (apps/api/ not present yet)
ios — skipped (apps/ios/ not present yet)

All gates passed.
```

With failures:

```
web
  ✓ lint
  ✗ typecheck — 2 errors in apps/web/src/components/Wordmark.tsx
  ✓ build
  ✓ test — 42 passed

api
  ✓ ruff check
  ✗ ruff format — 1 file would be reformatted
  ✓ mypy
  ✗ pytest — 1 failed, 27 passed (see apps/api/tests/test_intake.py::test_claim_code)

ios
  ✓ swiftlint

3 gates failed. Run `npm --workspace apps/web run typecheck` for the type detail; `uv run ruff format apps/api/` to fix formatting; `uv run pytest apps/api/tests/test_intake.py::test_claim_code -v` for the test detail.
```

Always end with one line: either `All gates passed.` or `N gates failed.` plus the most useful next commands.

## Don't

- Don't auto-fix lint or format errors. Luk wants to know what's broken, not have it silently corrected.
- Don't run gates one-at-a-time stopping at the first failure. Run them all, report together.
- Don't run gates in parallel — they share working state (typecheck, mypy, pytest especially) and interleaved output is hard to read.
- Don't run gates for apps whose directory doesn't exist. Skip silently with a one-line note.
- Don't run `xcodebuild` by default. Too slow for the every-commit loop.
- Don't run `pytest -v`, `pytest --cov`, `mypy --verbose`, or `next build --debug` by default. Concise output. If Luk wants verbose, he'll ask.
- Don't suggest code fixes after the report. This skill reports, period. Acting on failures is a separate decision.
- Don't run network-dependent tests, migrations, or Playwright tests that hit external services. Local gates only.
- Don't run gates against `packages/*` directly — they're built transitively when `apps/web` builds. Touching them shows up in the web gates.
