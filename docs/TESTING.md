# Testing

## Strategy

Vello's test strategy is unit-first for pure logic, E2E for the user-facing flow. The target coverage is:

| Layer | What to test | Tool |
| --- | --- | --- |
| `src/lib/normalizers.ts` | Each normaliser's accept/reject behaviour, edge cases (empty, control chars, IDN hosts, mixed-case handles) | Vitest (unit) |
| `src/lib/vcard.ts` | `escapeVcardText`, `foldLine` (byte-aware: emoji, CJK, multi-byte folding), `buildCompactVcard`, `buildFullVcard` (line counts, itemN numbering, photo presence) | Vitest (unit) |
| `src/lib/qr.ts` | `byteLength`, `getQrSizeInfo` at every threshold boundary (250, 450, 700, 701), `isQrOverflow`, version estimation | Vitest (unit) |
| `src/lib/storage.ts` | `exportBackup` → `importBackup` round-trip; `importBackup` rejects invalid/hostile files; `saveCard` rotates `.bak` correctly | Vitest (unit, with a fake-indexeddb shim) |
| `src/lib/scan-check.ts` | `contrastRatio` for known pairs; `evaluateScan` decision matrix | Vitest (unit) |
| End-to-end | Onboarding (all steps) → home → studio (apply preset, scan indicator green) → editor (toggle a QR field, see size meter change) → share (PNG, SVG, .vcf, story, square, print, wallet) → settings (theme switch) → backup export → erase | Playwright |

## How to run

> **Known gap:** there is no automated test suite yet. The scripts below are the *intended* commands once tests are written. Today verification is manual via `agent-browser` (iPhone 14 emulation), covering the full onboarding → home → studio → share → export flow, theme switching, and the fullscreen QR view. Lint, `docs:check`, and `check:privacy` are the only automated gates today; run them with `bun run verify:all`.

When the suite exists, the commands will be:

```bash
bun run test           # Vitest, unit tests
bun run test:e2e       # Playwright, needs dev server on :3000
bun run verify:all     # lint + docs:check + check:privacy (existing)
```

## What each module's tests should cover

### `normalizers.test.ts`

- `cleanText`: strips `\x00`–`\x08`, `\x0B`, `\x0C`, `\x0E`–`\x1F`, `\x7F`; preserves `\t`/`\n` input but trims them; slices to `max`.
- `normalizePhone`: accepts `+91 98765 43210`, `9876543210` (defaults to IN), `+1 415 555 2671`; rejects `12345`, letters, `+`.
- `normalizeEmail`: accepts `Jane.Doe@Example.co.uk`; rejects `jane@`, `jane@localhost`, `jane..doe@x.com`.
- `normalizeWebsite`: prepends `https://` if missing; rejects `javascript:alert(1)`, `data:text/html,...`; lowercases host; strips trailing slash.
- `normalizeLinkedin` / `normalizeInstagram` / `normalizeX`: accept full URL, `in/handle`, `@handle`; reject invalid chars.
- `sanitizeFilename`: ASCII-fies, kebab-cases, falls back to `"contact"`.

### `vcard.test.ts`

- `escapeVcardText`: escapes `\\`, `;`, `,`, newlines.
- `foldLine`: folds at 75 octets; never splits a multibyte sequence (assert with an emoji and a CJK string).
- `buildCompactVcard`: emits the expected line set given a known card; respects `qrInclude`; emits `FN:` even if name is excluded but title/company present.
- `buildFullVcard`: counts social `itemN.URL`/`itemN.X-ABLabel` pairs correctly; emits `UID:urn:uuid:`; emits `PHOTO;ENCODING=b;TYPE=JPEG:` only when photo is provided.

### `qr.test.ts`

- `getQrPayload`: matches `buildCompactVcard`.
- `getQrSizeInfo`: status is `green` at 250, `amber` at 251, `red` at 451, `overflow` at 701.
- `isQrOverflow`: true at 701 bytes.
- Version estimation: payload ≤ 14 bytes → version 1; payload > 700 → version 40.

### `storage.test.ts`

- `exportBackup` produces JSON with `app: "vello"`, the current `schemaVersion`, and all five record keys.
- `importBackup` of that JSON restores all records.
- `importBackup` rejects `{}`, `null`, a non-`"vello"` bundle, and a bundle missing `schemaVersion`.
- `saveCard` rotates the previous card into `vello:card.bak` before writing.

### `scan-check.test.ts`

- `contrastRatio("#000", "#fff")` ≈ 21.
- `contrastRatio("#161619", "#F6F3EE")` ≥ 4.5 (the Vello Ink/Paper pair).
- `evaluateScan` decision matrix: covers all four cells of the (decode × contrast) table.

### E2E (Playwright)

1. Cold start → onboarding → enter identity → enter contact → optional photo → finish.
2. Home: QR hero renders, name/title/company visible, all 6 action buttons tappable.
3. Studio: tap a preset (e.g. Open Sky), assert scan indicator is green.
4. Editor: toggle `linkedin` on in QR contents, assert size meter shows a byte count > previous.
5. Share: trigger each of the 7 exports, assert no console errors.
6. Settings: switch theme to dark, assert `html` has class `dark`.
7. Backup: export backup, assert file downloads; erase all; assert onboarding reappears.

## How to add tests

1. Place unit tests next to the module: `src/lib/vcard.test.ts`.
2. Use Vitest. The repo has no Vitest config yet — when adding it, set `environment: 'node'` for `normalizers`/`vcard`/`qr`/`storage` (storage will need a fake-indexeddb shim), and `environment: 'jsdom'` for `scan-check` (canvas) and `qr-render`.
3. Place E2E tests under `e2e/` with Playwright. The dev server must be running on port 3000 (`bun run dev` in a separate process or via Playwright's webServer config).
4. Add `test` and `test:e2e` scripts to `package.json`, mention them in this file and in [README.md](../README.md) so `docs:check` keeps passing.

## Known gaps

- No automated tests today. Lint, `docs:check`, and `check:privacy` are the only gates.
- Manual QA via `agent-browser` (iPhone 14 emulation) has been done for the full flow; results recorded in [PROGRESS.md](PROGRESS.md).
- No visual regression tests for the 17 presets.
- No network-level test (e.g. Playwright routing assertions) confirming zero outbound requests at runtime — `check:privacy` covers this statically today; a runtime assertion is on the [BACKLOG.md](BACKLOG.md).
