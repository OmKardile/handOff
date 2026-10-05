# Automation

This file documents the automated jobs and quality gates that run on the Vello project.

## The 15-minute `webDevReview` cron

A scheduled job runs every 15 minutes with `kind = webDevReview`. It is the automated "developer in the loop" review of the project's state.

**What it does:**

1. Picks up the latest worklog and any new tool results since the last run.
2. Re-reads the project facts (name, version, stack, scripts, privacy invariant).
3. Runs a short, scoped review pass on the project — checking for drift between worklog claims and the actual source code (e.g. scripts in `package.json`, files under `src/`, the contents of `docs/`).
4. Updates `worklog.md` with a `Stage Summary` entry if anything changed during the run.
5. Optionally runs `bun run verify:all` (lint + docs:check + check:privacy) and records the result.

**What it does NOT do:**

- It does not push code. It edits files in the working tree only.
- It does not modify `src/` source logic without an explicit user task.
- It does not make network calls from app code. (It may use the SDK for tooling, but the runtime app in `src/` remains network-free; `check:privacy` enforces this.)

### Guardrails

- The job works **only on this project**. It must not touch files outside the repo root.
- It updates `worklog.md` (append-only) on every meaningful step.
- It runs `bun run verify:all` after any code or doc change. If the verification fails, the failure is recorded in the worklog and the change is reverted.
- It honours the system constraint of a single user-facing Next.js route — it does not add new routes.
- It honours the privacy invariant — it does not add `fetch()`/`XMLHttpRequest`/`WebSocket`/`sendBeacon`/`EventSource` to `src/`.

### How to pause or remove

- The cron is configured outside this repository (in the surrounding workspace / cron host). To pause, disable the schedule at the host. The repo itself has no cron config to edit.
- To remove the cron permanently, delete the schedule entry at the host. No code change in this repo is required.
- The `webDevReview` job is idempotent. If it runs twice in a row, the second run is a no-op (the worklog already reflects the latest state).

## `docs:check` — `bun run docs:check`

Runs `scripts/docs-check.ts`. Validates:

1. Every required doc exists and is non-empty (the list is in the script's `REQUIRED` constant — README, CHANGELOG, CONTRIBUTING, LICENSE, THIRD_PARTY_LICENSES, and 21 `docs/` files).
2. Every relative markdown link or image in every `.md` file resolves to an existing file. Absolute `http(s)://` and `mailto:` links and in-page anchors are skipped.
3. Every script in `package.json` is mentioned in some markdown file (as `` `script` ``, `npm run script`, or `bun run script`). `db:*` scripts are skipped because they're framework defaults.
4. `CHANGELOG.md` contains an entry for the current `package.json` version (e.g. `## [1.0.0]`).

Exits non-zero on any failure. The script lives at [`scripts/docs-check.ts`](../scripts/docs-check.ts).

## `check:privacy` — `bun run check:privacy`

Runs `scripts/check-privacy.ts`. Walks every `.ts`/`.tsx`/`.js`/`.jsx` file under `src/` and `scripts/`. Fails on:

- `fetch(`
- `XMLHttpRequest`
- `new WebSocket`
- `navigator.sendBeacon`
- `new EventSource`
- Any absolute `http(s)://` URL not on the allow-list (the author link `omkardile.is-a.dev`, `localhost`, `example.com`, `linkedin.com`, `instagram.com`, `x.com`, `wa.me`, `fonts.googleapis`, `chat.z.ai`, `z-cdn.chatglm`). Comments are stripped before the URL check to avoid false positives.

Exempt files: `scripts/check-privacy.ts` itself (it's the checker) and `src/lib/qr-render.ts` (only has `crossOrigin` comments, not actual network code).

Exits non-zero on any failure. The script lives at [`scripts/check-privacy.ts`](../scripts/check-privacy.ts).

## `verify:all` — `bun run verify:all`

Runs the three gates in sequence:

1. `bun run lint` (ESLint across the repo)
2. `bun run docs:check`
3. `bun run check:privacy`

If any step fails, the whole command fails and the later steps do not run. Use this before every commit that touches code or docs.

## The `db:*` scripts

The `package.json` includes four Prisma scripts: `db:push`, `db:generate`, `db:migrate`, `db:reset`. They are included for compatibility with the surrounding workspace and operate on `prisma/schema.prisma`. **The runtime app does not use Prisma** — Vello stores data in IndexedDB only. The `db:*` scripts are not part of the privacy enforcement and are excluded from the "every script must be mentioned" check (the `docs:check` script explicitly skips `db:*`).

## `lint` — `bun run lint`

Runs `eslint .` across the whole repo using the flat config in `eslint.config.mjs` (with `eslint-config-next`). Zero errors and zero warnings is the baseline; the worklog records the most recent lint state.

## Adding a new automation

If you add a new script to `package.json`, mention it in some `.md` file (the `docs:check` script will warn otherwise). Convention: add a section here, in [AUTOMATION.md](AUTOMATION.md), and reference it from [README.md](../README.md) if it's user-facing.

If you add a new cron, document it here with the same structure: what it does, what it doesn't do, guardrails, how to pause or remove.
