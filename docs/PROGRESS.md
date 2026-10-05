# Progress

Current status of Vello as of v1.0.0.

## Status: STABLE & FUNCTIONAL

- Dev server runs cleanly on port 3000, lint passes (0 errors, 0 warnings).
- Full onboarding → home → studio → share flow verified end-to-end via `agent-browser` (iPhone 14 emulation).
- All 9 screens implemented and rendering (onboarding, home, editor, fullscreen-qr, studio, share, wallet, wallpaper, settings) plus showcase and help/help-guide as SPA views.
- QR generation, styling (17 presets), and exports (PNG/SVG/.vcf/story/square/print/wallet) all working.
- Dark mode + theme switching verified.
- No runtime errors in browser console.
- `bun run verify:all` passes.

## Completed features

- **Brand identity** — Name "Vello", tagline "One card. One scan. Nothing leaves your phone.", editorial design system (Fraunces serif + Instrument Sans, warm paper palette, clay accent). See [BRAND.md](BRAND.md) and [DESIGN.md](DESIGN.md).
- **Design tokens** — Full light/dark theme via CSS custom properties in `src/app/globals.css`.
- **Core types & limits** — `src/shared/` (brand.ts, types.ts, limits.ts). See [DATA_MODEL.md](DATA_MODEL.md).
- **Normalizers** — phone (libphonenumber-js, IN default region), email, website, LinkedIn/Instagram/X/WhatsApp canonicalisation, control-char stripping.
- **vCard builder** — compact (QR) + full (.vcf) modes, 75-octet byte-aware folding, CRLF, escaping, `itemN.X-ABLabel` socials, SHA-256 fingerprint.
- **QR payload + size meter** — byte counting, green/amber/red/overflow thresholds, QR version estimation, 700-byte hard cap.
- **QR style engine** — 17 presets across Quiet/Warm/Cool/Social groups, 6 module shapes, 3 eye shapes, gradients, centre elements (initials/photo/emoji), ring, caption, 7 fonts. See [TECHNICAL.md](TECHNICAL.md).
- **Scan-check** — jsQR decode + WCAG contrast ratio, "Scans well" indicator, warn-not-block.
- **Storage adapter** — IndexedDB (idb-keyval), debounced writes, `.bak` fallback, schema-versioned wraps, backup export/import, erase-all, persistence requests.
- **Zustand store** — single source of truth, auto-persist, draft/restore, QR-change detection.
- **9 screens** — onboarding, home, editor, fullscreen-qr, studio, share, wallet, wallpaper, settings — plus privacy, backup, showcase, help centre, help-guide as SPA views.
- **PWA** — `manifest.webmanifest`, installable.
- **App shell** — bottom tab bar (Card/Studio/Settings), sticky footer, hidden on fullscreen/onboarding, safe-area aware.
- **Quality gates** — `scripts/docs-check.ts`, `scripts/check-privacy.ts`, `scripts/verify:all`.
- **Documentation set** — README, CHANGELOG, CONTRIBUTING, LICENSE, THIRD_PARTY_LICENSES, and 21 `docs/` files.

## Verification results (manual)

From the worklog, agent-browser iPhone 14 emulation:

- ✅ Onboarding: welcome → identity → contact → photo → finish → home (all steps, live QR preview updating).
- ✅ Home: QR hero renders, name/title/company, all 6 action buttons, contact details list, QR changed banner logic.
- ✅ Style Studio: all 17 presets render with live QR previews, tabs (Presets/Shape/Colour/Centre/Frame/Caption), scan indicator, apply preset, reset, surprise.
- ✅ Share: all 7 export options trigger without errors (PNG 1200px, SVG, .vcf, story 1080×1920, square, print card, wallet).
- ✅ Editor: grouped collapsible sections, photo upload/remove, QR content toggles, size meter, draft restore, sticky save bar.
- ✅ Settings: theme switch (Light/Dark/Auto), haptics toggle, persistence status, backup/privacy/erase navigation.
- ✅ Privacy: 6 fact cards + promise + static-QR limitation notice.
- ✅ Dark mode: full theme switch verified via screenshot.
- ✅ Fullscreen QR: large QR + name + close button + wake lock.
- ✅ No console errors, no runtime errors, lint clean.

## In progress

- **Documentation** — this set is the current task (DOCS-1). Files written, `docs:check` to pass.

## Next steps

From the worklog's "priority recommendations" and the [BACKLOG.md](BACKLOG.md):

1. **Polish: animations** — Framer Motion page transitions, staggered reveals, press feedback (B-01, B-02).
2. **Polish: empty states** — Onboarding no-photo and Home empty-fields designed illustrations (B-05, B-06).
3. **Feature: i18n scaffolding** — Extract strings, ship English, scaffold Hindi/Marathi (B-17, B-18).
4. **Feature: custom font import** — Let users import `.ttf`/`.woff2` for captions (B-16).
5. **Hardening: CSP meta tag** + privacy-check (already done) + Playwright network test (B-19, B-20).
6. **Hardening: photo EXIF runtime test** — confirm canvas re-encoding strips metadata (B-21).
7. **Detail: wallpaper safe-zone overlay** (B-23), studio scan-check debounce (B-24).
8. **Tests** — unit tests for normalizers, vCard folding, QR size meter, storage round-trip; e2e for the full onboarding → export flow (B-30).

See [BACKLOG.md](BACKLOG.md) for the full prioritised list and acceptance criteria.

## Version history

- **1.0.0** — 2025-01-15 — initial release. See [CHANGELOG.md](../CHANGELOG.md).
