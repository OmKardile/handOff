# Vello — Worklog

## Project status description / assessment

**Vello** is a privacy-first digital business card web app (PWA). It generates a compact vCard QR code from the user's contact details, lets them style the QR beautifully (Instagram/Telegram-style), and export/share it — all 100% local, no server, no network.

The original spec targeted Vite + React + Capacitor (native iOS/Android). This build adapts the product to the available **Next.js 16** environment while preserving the core vision: editorial design, QR style studio, local-only storage, and the privacy promise.

### Current state: STABLE & FUNCTIONAL
- Dev server runs cleanly on port 3000, lint passes (0 errors, 0 warnings)
- Full onboarding → home → studio → share flow verified end-to-end via agent-browser
- All 9 screens implemented and rendering
- QR generation, styling (17 presets), and exports (PNG/SVG/vcf/story/square/print/wallet) working
- Dark mode + theme switching verified
- No runtime errors in browser console

---

## Current goals / completed modifications / verification results

### Completed (this phase)
1. **Brand identity** — Name "Vello", tagline "One card. One scan. Nothing leaves your phone.", editorial design system (Fraunces serif + Instrument Sans, warm paper palette, clay accent)
2. **Design tokens** — Full light/dark theme via CSS custom properties in `globals.css`
3. **Core types & limits** — `src/shared/` (types, limits, brand)
4. **Normalizers** — phone (libphonenumber-js, IN default region), email, website, LinkedIn/Instagram/X/WhatsApp canonicalisation, control-char stripping
5. **vCard builder** — compact (QR) + full (.vcf) modes, 75-octet folding (byte-aware, no multibyte splits), CRLF, escaping, itemN.X-ABLabel socials, SHA-256 fingerprint
6. **QR payload + size meter** — byte counting, green/amber/red/overflow thresholds, QR version estimation, 700-byte hard cap
7. **QR style engine** — 17 presets (Quiet/Warm/Cool/Social groups), module shapes (6), eye shapes (3), gradients, centre elements (initials/photo/emoji), captions, fonts
8. **Scan-check** — jsQR decode + WCAG contrast ratio, "Scans well" indicator
9. **Storage adapter** — IndexedDB (idb-keyval), debounced writes, .bak fallback, schema-versioned, backup export/import, erase-all, persistence request
10. **Zustand store** — single source of truth, auto-persist, draft/restore, QR-change detection
11. **Screens** (9): Onboarding (3-step guided), Home (QR hero + actions), Editor (grouped sections, QR toggles, size meter, draft restore), Fullscreen QR (wake lock), Style Studio (presets + 6 control tabs + scan indicator), Share (7 export formats), Wallet (image + guide), Wallpaper (phone preview + 4 backdrops), Settings (theme/haptics/storage/privacy/erase), Privacy (6 facts + promise), Backup (export/import JSON)
12. **PWA** — manifest.webmanifest, icon, installable
13. **App shell** — bottom tab bar (Card/Studio/Settings), sticky footer, hidden on fullscreen/onboarding, safe-area aware

### Verification results (agent-browser, iPhone 14 emulation)
- ✅ Onboarding: welcome → identity → contact → photo → finish → home (all steps, live QR preview updating)
- ✅ Home: QR hero renders, name/title/company, all 6 action buttons, contact details list, QR changed banner logic
- ✅ Style Studio: all 17 presets render with live QR previews, tabs (Presets/Shape/Colour/Centre/Frame/Caption), scan indicator, apply preset, reset, surprise
- ✅ Share: all 7 export options trigger without errors (PNG 1200px, SVG, .vcf, story 1080×1920, square, print card, wallet)
- ✅ Editor: grouped collapsible sections, photo upload/remove, QR content toggles, size meter, draft restore, sticky save bar
- ✅ Settings: theme switch (Light/Dark/Auto), haptics toggle, persistence status, backup/privacy/erase navigation
- ✅ Privacy: 6 fact cards + promise + static-QR limitation notice
- ✅ Dark mode: full theme switch verified via screenshot
- ✅ Fullscreen QR: large QR + name + close button + wake lock
- ✅ No console errors, no runtime errors, lint clean

### Architecture
```
src/
  shared/      brand.ts, types.ts, limits.ts
  lib/         normalizers, vcard, qr, qr-render, scan-check, photo,
               export, storage, style-presets, store (zustand), haptics, utils
  components/
    vello/
      view-context.tsx    (client view router)
      app-shell.tsx       (bottom tab nav + headers)
      qr-preview.tsx      (live canvas QR)
      screens/
        onboarding, home, editor, fullscreen-qr, studio,
        settings, privacy, share-sheet, wallet, wallpaper, backup
  app/
    layout.tsx   (fonts: Fraunces + Instrument Sans + JetBrains Mono, theme provider, sonner)
    globals.css  (editorial design tokens, light/dark)
    page.tsx     (entry: load store → onboarding or app shell)
```

---

## Unresolved issues / risks, priority recommendations for the next phase

### Known limitations (documented, not bugs)
- **Native builds not possible** in this environment — Capacitor/iOS/Android paths are web-adapted. The Wallpaper "set directly" and Wallet "open Google Wallet" use web fallbacks (download + instructions).
- **No CSP meta tag yet** — should add `default-src 'self'` etc. to index.html for the privacy guarantee (the app makes zero network requests at runtime regardless).
- **No automated tests** — the spec calls for Vitest + Playwright; not yet written.
- **No privacy-check script** — `check:privacy` (grep for fetch/XHR/WebSocket) not yet implemented.
- **Fonts**: using next/font (Google Fonts) for the UI; the QR caption fonts use @fontsource packages but the full 45-family library isn't installed.

### Priority recommendations for next phase
1. **Polish: animations** — Add Framer Motion page transitions, staggered reveals, press feedback on all buttons (currently only CSS active:scale)
2. **Polish: empty states** — Onboarding "no photo" and home "empty fields" need designed illustrations within the editorial language
3. **Feature: i18n scaffolding** — Extract all strings to message catalogs; ship English, scaffold Hindi/Marathi
4. **Feature: custom font import** — Let users import .ttf/.woff2 for QR captions
5. **Hardening: CSP meta tag** + privacy-check script + Playwright network test
6. **Hardening: photo EXIF** — verify canvas re-encoding strips all metadata (createImageBitmap from-image handles orientation)
7. **Detail: wallpaper safe-zone overlay** — add the faux clock + gesture-bar zones more precisely
8. **Detail: studio "Surprise me"** — verify every randomised output passes scan-check before applying
9. **Tests** — unit tests for normalizers, vCard folding, QR size meter, storage round-trip; e2e for the full onboarding→export flow

### Next-phase quick wins (S/M)
- S: Add `aria-live` to toast container
- S: Add keyboard Escape to close fullscreen QR
- S: Add "copy vCard" button on home
- M: Add drag-reorder for social links in editor
- M: Add "recents" + "favourites" to font picker
- M: Add share-card layout variants (Hairline/Plaque/Ticket/Polaroid)

---
Task ID: DOCS-1
Agent: general-purpose (documentation)
Task: Write the complete Vello documentation set (README, CHANGELOG, CONTRIBUTING, LICENSE, THIRD_PARTY_LICENSES, and 21 docs/ files).

Work Log:
- Read worklog.md and package.json to establish the project state (Next.js 16, v1.0.0, MIT, single-route constraint, privacy-first invariant).
- Read all key source files: src/shared/{brand,types,limits}.ts, src/lib/{normalizers,vcard,qr,style-presets,storage,export,scan-check,help-content,store,photo,qr-render}.ts, src/app/{layout.tsx,globals.css,page.tsx}, src/components/vello/view-context.tsx, scripts/{docs-check,check-privacy}.ts.
- Wrote /home/z/my-project/README.md — overview, quick start, scripts table, architecture diagram, platform adaptation note, privacy enforcement, testing note, hosting, limitations, full docs index, footer credit.
- Wrote /home/z/my-project/CHANGELOG.md — Keep a Changelog format with `## [1.0.0] - 2025-01-15` entry covering onboarding, QR engine, 17 presets, exports, storage, studio, screens, docs:check, check:privacy, showcase, help centre, known limitations.
- Wrote /home/z/my-project/CONTRIBUTING.md — setup, conventional commits, code style rules, how to run checks, how to add a preset/font/screen/test, footer credit.
- Wrote /home/z/my-project/LICENSE — MIT License, copyright "Omkar Kardile", year 2025.
- Wrote /home/z/my-project/THIRD_PARTY_LICENSES.md — full dependency table with licences (Next.js MIT, idb-keyval Apache-2.0, jsqr Apache-2.0, etc.), SIL OFL 1.1 summary, Apache-2.0 summary, ISC summary, note that fonts are self-hosted.
- Wrote /home/z/my-project/docs/README.md — index with one line per docs file, conventions, footer credit.
- Wrote /home/z/my-project/docs/DECISIONS.md — 10 dated decisions (D1–D10): Next.js over Vite, SPA views over routes, vCard 3.0 compact for QR, IndexedDB over localStorage, static QR over URL QR, Wallet photo route, 17 presets grouped by mood, editorial serif+sans pairing, warm paper palette + clay accent, jsqr scan-check warn-not-block.
- Wrote /home/z/my-project/docs/ARCHITECTURE.md — layers, module boundaries, data flow with Mermaid diagram, storage adapter (key table), build pipeline, PWA/offline, privacy boundary.
- Wrote /home/z/my-project/docs/TECHNICAL.md — module-by-module reference for src/lib and src/shared: function tables for normalizers, vcard, qr, qr-render, scan-check, photo, export, storage, style-presets, store. Includes vCard format spec (compact vs full with examples), QR payload + size rules (thresholds table), full QrStyle JSON example, backup file format JSON example, storage keys table, schema version, env/build variables (none), performance notes.
- Wrote /home/z/my-project/docs/DATA_MODEL.md — Card, QrInclude, QrStyle, Settings, PhotoData, CustomPreset schemas as TypeScript interfaces + field tables with limits and normalisation rules, storage keys table, schema version, migration history (v1).
- Wrote /home/z/my-project/docs/TESTING.md — test strategy (unit for normalizers/vcard/qr/storage, e2e for onboarding→export), how to run, what each module's tests should cover, how to add tests, known gaps (no automated tests yet; manual QA via agent-browser done).
- Wrote /home/z/my-project/docs/SECURITY.md — threat model table for a local-only app, enforcement (input validation, vCard escaping, backup file handling, no dangerouslySetInnerHTML, no network calls, storage isolation, photo EXIF stripping, CSP status), how to report issues, what Vello does NOT do.
- Wrote /home/z/my-project/docs/PRIVACY.md — plain-language privacy policy: what's stored, where, what's never done, what happens on share, static-QR limitation, how to back up, how to restore, how to erase, persistence, children, changes policy, contact.
- Wrote /home/z/my-project/docs/RELEASE.md — version bump process, building (bun run build), store submission steps (PWA + placeholder for native), rollback.
- Wrote /home/z/my-project/docs/AUTOMATION.md — the 15-minute webDevReview cron job (what it does/doesn't do, guardrails, how to pause/remove), docs:check, check:privacy, verify:all, lint, db:* scripts note.
- Wrote /home/z/my-project/docs/DESIGN.md — rationale (editorial not SaaS), token tables (color/type/spacing/radius), screen inventory (each screen's focal point + primary action), reference patterns (Instagram QR presets, Telegram editor, Blinq onboarding), what's intentionally absent, self-hosted fonts note.
- Wrote /home/z/my-project/docs/BRAND.md — naming process (15 candidates → shortlist 3 → Vello), criteria, tagline, identifiers table, brand voice guide (do/don't), monogram description, trademark caveat.
- Wrote /home/z/my-project/docs/FIGMA_GUIDE.md — honest statement that no .fig was created; tokens.json (Style Dictionary compatible), brand SVGs, screen inventory, COMPONENTS.md naming, step-by-step import guide, what's not in the package.
- Wrote /home/z/my-project/docs/STORE.md — store listing copy (short + long descriptions, keywords, promotional text, categories), screenshot plan (8 existing screenshots in download/), Google Play Data safety answers (no data collected), Apple App Privacy (data not collected), permissions rationale (none on web; SET_WALLPAPER on native), pre-submission checklist.
- Wrote /home/z/my-project/docs/BACKLOG.md — 30 prioritised small/medium improvements (B-01 to B-30) each with id, description, size, acceptance criteria. Covers animations, empty states, i18n, custom font import, CSP meta tag, more tests, drag-reorder links, share-card variants, accessibility, etc.
- Wrote /home/z/my-project/docs/KNOWN_ISSUES.md — list: native builds not possible, no automated tests yet, fonts Latin-only (Devanagari fallback), iOS wallpaper manual, Wallet Photo availability varies, no CSP meta tag yet, static-QR limitation, showcase/help as SPA views, appId placeholder, QR preview re-render cost, db:* unused at runtime, trademark unverified.
- Wrote /home/z/my-project/docs/PROGRESS.md — current status (stable, v1.0.0), completed features (full list), in-progress (docs), next steps (linked to BACKLOG), version history.
- Wrote /home/z/my-project/docs/BUSINESS.md — product positioning + one-line pitch, target users (professionals/freelancers/students/event goers/small-business owners in India and globally), problems solved, value proposition on privacy, competitor comparison table (Blinq, HiHello, Popl, Linq — marked "unverified"), pricing/monetisation (one-time purchase, optional paid style packs, tip/support; no ads/data/analytics), go-to-market, success metrics without tracking, risks + mitigations, legal/compliance, roadmap (now/next/later) tied to BACKLOG.
- Wrote /home/z/my-project/docs/USER_GUIDE.md — end-user manual mirroring src/lib/help-content.ts: create a card, edit, style the QR, choose what's in the QR, scan check, fullscreen QR, share/export, .vcf file, print card, wallet, wallpaper, backup, restore, erase, privacy promise, install as PWA, about Vello. Platform caveats throughout.
- Wrote /home/z/my-project/docs/FAQ.md — 14 Q&A covering: data leaving device, scanning without app, changing details, free/open, offline, wallet, wallpaper, fonts for non-Latin names, storage clearing, multiple cards, analytics, backup, iOS/Android availability, bug reports.
- Wrote /home/z/my-project/docs/TROUBLESHOOTING.md — QR won't scan, wallpaper not applying, Wallet Photo missing, fonts not showing, restoring backup, storage cleared, "QR changed" notice, fullscreen wake lock, broken export, Vello doesn't load.
- Ran `bun run docs:check` — initially failed with 74 broken-link failures, all in the pre-existing `skills/` workspace directory (skill template files with intentionally broken links, unrelated to Vello).
- Extended scripts/docs-check.ts exclusion list to skip workspace-only directories (`skills`, `tool-results`, `upload`, `mini-services`, `examples`, `.zscripts`, `tests`) — these are not Vello docs and pre-existed in the workspace.
- Re-ran `bun run docs:check` — ✓ All 26 required docs present, 26 markdown files checked, links valid.
- Ran `bun run check:privacy` — ✓ Scanned 90 source files, no network calls in app code.
- Ran `bun run lint` — clean (no output).
- Ran `bun run verify:all` — all three gates pass: lint ✓, docs:check ✓, check:privacy ✓.

Stage Summary:
- Files created: 26 total — README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE, THIRD_PARTY_LICENSES.md at root; docs/README.md plus 21 docs/ files (DECISIONS, ARCHITECTURE, TECHNICAL, DATA_MODEL, TESTING, SECURITY, PRIVACY, RELEASE, DESIGN, BRAND, FIGMA_GUIDE, STORE, AUTOMATION, BACKLOG, KNOWN_ISSUES, PROGRESS, BUSINESS, USER_GUIDE, FAQ, TROUBLESHOOTING).
- File modified: scripts/docs-check.ts (extended exclusion list to skip workspace-only `skills/`, `tool-results/`, `upload/`, `mini-services/`, `examples/`, `.zscripts/`, `tests/` directories that pre-existed with broken template links unrelated to Vello).
- Footer credit "Designed & developed by Omkar Kardile" with link https://omkardile.is-a.dev/ added to README.md, CONTRIBUTING.md, and docs/README.md as required.
- Every package.json script (dev, build, start, lint, docs:check, check:privacy, verify:all, db:push, db:generate, db:migrate, db:reset) is mentioned in some doc; db:* scripts are mentioned in README.md scripts table, AUTOMATION.md, and KNOWN_ISSUES.md with the note that they're workspace-compatibility scaffolding unused at runtime.
- CHANGELOG.md contains `## [1.0.0] - 2025-01-15` matching package.json version 1.0.0.
- All relative markdown links in the docs set resolve (verified by docs:check).
- Platform adaptation honestly stated: Next.js 16 (not Vite+Capacitor) due to environment constraint; /showcase and /index-help implemented as client-side SPA views (not separate Next.js routes) due to single-route constraint — documented in README.md, DECISIONS.md (D1, D2), KNOWN_ISSUES.md.
- Privacy enforcement is the throughline: zero runtime network calls, IndexedDB-only storage, check:privacy script enforces statically.
- Known gaps documented honestly in TESTING.md (no automated tests yet), KNOWN_ISSUES.md (no CSP meta tag, fonts Latin-only, native builds not possible, Wallet Photo availability varies, iOS wallpaper manual), BRAND.md (trademark status unverified).
- Anything unverifiable: competitor comparison in BUSINESS.md is explicitly marked "unverified" with a caveat that it should be re-checked before marketing use; trademark caveat in BRAND.md notes that no formal trademark search was conducted; store submission steps in RELEASE.md are documented for future reference only since native builds aren't possible in this environment.
- Next actions for a future task: add automated tests per TESTING.md strategy (Vitest + Playwright), add CSP meta tag (BACKLOG B-19), implement the BACKLOG items in priority order, replace com.example.vello appId before any store submission.

---
Task ID: SIG-1 + SHOWCASE-1 + HELP-1 + CRON-1
Agent: main (Omkar Kardile)
Task: Add developer signature across the project, build /showcase and /index-help in-product pages, create docs:check + check:privacy scripts, and set up the 15-minute webDevReview cron.

Work Log:
- Added developer signature "Designed & developed by Omkar Kardile" (https://omkardile.is-a.dev/):
  - package.json: `"author": "Omkar Kardile <https://omkardile.is-a.dev/>"` + renamed package to "vello", version 1.0.0
  - layout.tsx: `metadata.authors = [{ name: 'Omkar Kardile', url: 'https://omkardile.is-a.dev/' }]`
  - Created DevSignature + PageFooter components (subtle, restrained credit)
  - Settings About section: added Developer row (external link) + DevSignature footer
  - Showcase + Help screens: PageFooter with signature
- Built /showcase as a SPA view (adapted from route — single-route env constraint):
  - Hero with the promise, interactive live QR demo (real engine, stores nothing), 9-preset picker, "how it works in 3 steps", privacy-proof section, install availability, FAQ, footer
- Built /index-help as a SPA view (help center):
  - src/lib/help-content.ts: 22 guides across 8 categories (single source of truth, mirrors docs/USER_GUIDE.md + FAQ + TROUBLESHOOTING)
  - Help index with client-side search + category chips
  - Guide view with numbered steps, platform tabs (Android/iPhone/web), related guides
  - Reachable from Settings; contextual "?" planned for studio/wallet/wallpaper/backup
- Added docs:check script (scripts/docs-check.ts): validates 26 required docs, broken markdown links/images, every package.json script mentioned, CHANGELOG version entry
- Added check:privacy script (scripts/check-privacy.ts): static scan for fetch/XHR/WebSocket/sendBeacon/EventSource + absolute URLs in src/ and scripts/
- Added package.json scripts: docs:check, check:privacy, verify:all
- Set up 15-minute cron job (job_id 436936, kind=webDevReview, "0 */15 * * * ?", tz Asia/Calcutta) per the mandatory rule
- Added Showcase + Help centre nav rows to Settings; Esc-to-close on fullscreen QR; Copy vCard button on Home

Stage Summary:
- Developer signature is present in: package.json author, layout.tsx metadata.authors, Settings About (link + DevSignature), showcase PageFooter, help PageFooter, README footer, CONTRIBUTING footer, docs/README footer
- /showcase and /index-help implemented as SPA views (not Next.js routes) due to single-route env constraint — documented honestly in DECISIONS.md D2 and README
- verify:all passes clean: lint 0 errors, docs:check 26/26 docs + links valid, check:privacy 90 files no network calls
- Browser-verified via agent-browser: showcase renders with live QR demo + preset picker, help center renders with search + 8 categories + guide steps + related links, settings shows all three signature placements
- 15-min cron webDevReview task active (job_id 436936)

Unresolved / next-phase:
- Add contextual "?" help links to studio/wallet/wallpaper/backup headers (linked from help but buttons not yet wired)
- Add CSP meta tag to layout (BACKLOG item)
- Add automated tests (Vitest + Playwright) per TESTING.md
- The docs subagent created all 26 doc files; verify:all confirms structural integrity
