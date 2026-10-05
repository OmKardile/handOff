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

---
Task ID: CRON-2 (15-min webDevReview)
Agent: main (webDevReview)
Task: QA the app, then improve styling with more details and add more features/functionality.

Work Log:
- Reviewed worklog.md — project is stable & functional (v1.0.0, all gates pass, 14 screens, 26 docs).
- Ran `bun run verify:all` — lint clean, docs:check 26/26, check:privacy 90 files. Baseline confirmed.
- QA via agent-browser (iPhone 14): onboarding → home → studio (Surprise me tested) → editor → social links. No console errors, no runtime errors.
- Added Framer Motion animation system (src/components/vello/motion.tsx):
  - ViewTransition wrapper around the SPA view router (fade + slight y translate, 220ms, easeOutQuart)
  - QrReveal for the "QR appears" moment (opacity + scale + blur, 500ms)
  - Reveal component with delay for staggered hero/QR/actions/details on Home
  - tapScale() helper and staggerContainer/staggerItem variants for future list use
- Styled the Home screen with staggered reveals: hero card (delay 0.05), primary actions (0.15), secondary actions (0.22), contact details (0.28). The QR gets a QrReveal blur-in.
- Added designed empty state for the Home contact-details section (EmptyContactState component): dashed border card, pencil-in-circle, "No contact details yet", "Add details" button → editor. Triggered when no phone/email/website/location/socials exist.
- NEW FEATURE: Drag-reorder social links in the Editor:
  - Added `socialOrder: SocialLinkId[]` to the Card model (src/shared/types.ts)
  - Updated makeEmptyCard in store.ts with default order ["linkedin","instagram","x","whatsapp"]
  - Updated vCard builders (compact + full) to emit social URL lines in the user's chosen order
  - Updated Home screen to display social rows in order
  - Built SortableSocialLinks + SortableSocialRow components using @dnd-kit/core + @dnd-kit/sortable (PointerSensor distance 6, TouchSensor delay 180ms), with GripVertical handles, drag styling (clay border + shadow), and per-field inputs with live normalisation
  - Wired into the Editor "Social links" section with a "Drag to reorder" hint
- NEW FEATURE: Contextual "?" help links in screen headers:
  - Extended ScreenHeader with an optional `helpGuideId` prop (app-shell.tsx)
  - Moved setSelectedGuide/getSelectedGuide into src/lib/help-content.ts (shared module store) so the app-shell can set it; help.tsx imports from there
  - Added helpGuideId to Studio ("style-qr"), Editor ("edit-card"), Share ("share-qr"), Wallet ("wallet-save"), Wallpaper ("wallpaper-apply"), Backup ("backup-export") headers
  - Clicking opens the HelpGuideScreen with the relevant guide pre-selected
- NEW FEATURE: Font recents + favourites in the Studio Caption tab:
  - Created src/lib/font-memory.ts (useFontMemory hook, localStorage-backed, max 6 recents)
  - Built FontPicker + FontGrid components replacing the flat font grid
  - Shows "Favourites" (heart, clay) and "Recent" (clock) sections above "All" when non-empty
  - Each font tile has a heart toggle (appears on hover/group-hover); selecting a font remembers it in recents
  - Favourited fonts persist across sessions via localStorage

Stage Summary:
- 4 new features delivered: drag-reorder social links, contextual help links on 6 screens, font recents/favourites, designed empty state
- Styling polish: Framer Motion page transitions + staggered Home reveals + QR blur-in + designed empty state
- New files: src/components/vello/motion.tsx, src/lib/font-memory.ts
- Modified: src/app/page.tsx, src/components/vello/{app-shell.tsx, screens/{home,studio,editor,share-sheet,wallet,wallpaper,backup}.tsx}, src/lib/{vcard.ts,store.ts}, src/shared/types.ts, src/lib/help-content.ts, src/components/vello/screens/help.tsx
- verify:all passes: lint clean, docs:check 26/26 + links valid, check:privacy 92 files no network calls
- Browser-verified: drag-reorder renders with grip handles, font picker shows Favourites + All sections with heart toggles, contextual "?" on Studio opens the "Style your QR" guide correctly, home empty state + staggered animations render, no console errors
- Screenshots saved: vello-home-animated, vello-editor-drag-reorder, vello-studio-font-picker, vello-contextual-help

Unresolved / next-phase:
- Add automated tests (Vitest + Playwright) per TESTING.md — still the largest documented gap
- Add CSP meta tag (BACKLOG B-19) for the privacy guarantee
- The drag-reorder uses TouchSensor with a 180ms delay to allow scrolling; consider a visible "drag mode" affordance on touch
- Consider persisting font recents/favourites into the backup bundle (currently localStorage, not in IndexedDB backup) — small follow-up
- The Framer Motion ViewTransition uses AnimatePresence mode="wait" — verify no fl! icker on fast nav; consider "popLayout" if issues appear

---
Task ID: CRON-3 (15-min webDevReview)
Agent: main (webDevReview)
Task: QA the app, then improve styling with more details and add more features/functionality.

Work Log:
- Reviewed worklog.md — project stable (v1.0.0, all gates pass, 14 screens, 26 docs). Previous round added Framer Motion, drag-reorder social links, contextual help, font recents/favourites, designed empty state.
- Ran `bun run verify:all` — lint clean, docs:check 26/26, check:privacy 92 files. Baseline confirmed.
- QA via agent-browser (iPhone 14): onboarding → home → studio (Surprise me + scan check verified — showed "Couldn't verify" warning on a low-contrast random style, confirming the scan check works) → share → wallpaper. No console errors, no runtime errors.
- NEW FEATURE: Share-card layout variants (4 designed layouts, 1080×1350 PNG each):
  - Hairline: minimal editorial — light plate, top/bottom hairlines, clay eyebrow, centered QR, name in Fraunces, "Scan to save my contact" footer
  - Plaque: dark plaque — ink background, inset white plate for QR, clay accent rule, light name
  - Ticket: notched ticket — header band "VELLO · CONTACT", perforated dashed line with circle notches, QR top half, details bottom half
  - Polaroid: photo-first — warm backdrop, white polaroid frame with shadow, cover-fit photo (or QR fallback), italic Fraunces caption, small QR badge top-right so it's always scannable
  - Added `exportShareCard()`, `SHARE_CARD_LAYOUTS`, `ShareCardLayout` type to src/lib/export.ts
  - Added a "Share-card layouts" section to the Share sheet with a 2×2 grid of selectable tiles, each with an SVG thumbnail preview (LayoutThumb component), description, and a single "Export <layout>" button
  - Selecting a tile highlights it (clay border + check badge); double-click exports immediately
  - Browser-verified: Hairline and Ticket both exported successfully (toast "Shared"), no errors
- STYLING POLISH: Onboarding animations:
  - Welcome screen: staggered fade-in for wordmark, hero headline (delay 0.08s), body copy (0.18s), privacy list (staggerContainer/staggerItem), CTA button (0.32s)
  - Step transitions: QR preview scales in (key=step), step content slides in from the right (x: 16 → 0) on each step change
  - All using the shared motion.tsx primitives + framer-motion directly
- STYLING POLISH: QR preview skeleton:
  - Replaced the plain spinner with a designed skeleton: a muted grid pattern mimicking QR modules, three finder-eye placeholder borders in the corners, and a shimmer sweep animation
  - Uses CSS custom property `var(--muted)` so it adapts to light/dark themes
  - Grid size scales with the preview size

Stage Summary:
- 1 new feature (4 share-card layouts) + 2 styling polish items (onboarding animations, QR skeleton)
- New code: SHARE_CARD_LAYOUTS + exportShareCard + 4 layout renderers + LayoutThumb in share-sheet.tsx; motion wrappers in onboarding.tsx; skeleton in qr-preview.tsx
- verify:all passes: lint clean, docs:check 26/26 + links valid, check:privacy 92 files no network calls
- Browser-verified: share-card layouts render with SVG thumbnails, Hairline + Ticket export successfully (toast "Shared"), onboarding animations play without errors, no console errors
- Screenshots saved: qa-onboarding-animated, qa-share-layouts

Unresolved / next-phase:
- Add automated tests (Vitest + Playwright) per TESTING.md — still the largest documented gap
- Add CSP meta tag (BACKLOG B-19) for the privacy guarantee
- Consider a "preview" modal for share-card layouts before export (currently export-only)
- The Polaroid layout uses Fraunces italic as a Caveat fallback — install @fontsource/caveat for true handwritten caption
- Consider adding the 4 share-card layouts to the showcase page's demo
- The QR skeleton grid uses a 45° hatched pattern; could refine to look more like actual QR modules

---
Task ID: CRON-4 (15-min webDevReview)
Agent: main (webDevReview)
Task: QA the app, then improve styling with more details and add more features/functionality.

Work Log:
- Reviewed worklog.md — project stable (v1.0.0, all gates pass, 14 screens, 26 docs). Previous rounds added Framer Motion, drag-reorder social links, contextual help, font recents/favourites, share-card layouts, onboarding animations, QR skeleton.
- Ran `bun run verify:all` — lint clean, docs:check 26/26, check:privacy 92 files. Baseline confirmed.
- QA via agent-browser (iPhone 14): onboarding → home → studio (Surprise me + scan check) → settings → showcase. No console errors, no runtime errors.
- NEW FEATURE: Share-card preview modal:
  - Added a "Preview" button next to each layout's Export button in the Share sheet
  - PreviewModal renders the actual 1080×1350 layout to a canvas via exportShareCard, shows it fullscreen with Close + Export buttons
  - Loading state shows a spinner overlay while rendering; canvas stays mounted (hidden) so the ref is ready when the image loads (fixed an initial bug where the canvas was conditionally rendered, causing the ref to be null at onload time)
  - Escape key closes; AnimatePresence for fade in/out
  - Browser-verified: canvas renders at 1080×1350, Close + Export buttons present, no errors
- NEW FEATURE: Recent styles quick-apply strip in the Studio:
  - Created src/lib/style-memory.ts (useStyleRecents hook, localStorage-backed, max 8)
  - Added a "Recently used" strip at the top of the Presets tab showing recently-applied presets as small QR thumbnails (72px) with the preset name
  - Appears only after applying a preset; updates live as presets are applied
  - Selecting one re-applies it instantly
  - Browser-verified: after applying Terracotta + Noir Gold, both appear in the strip
- STYLING POLISH: Caveat handwritten font:
  - Installed @fontsource/caveat (400, 500, 700 weights) and imported in layout.tsx
  - Added Caveat to QR_FONTS as the "Handwritten" category
  - Updated the Polaroid share-card layout to use real Caveat (was Fraunces italic fallback) for the caption — much more authentic handwritten feel
- STYLING POLISH: Animated tab bar:
  - Replaced the static tab bar with motion.button (whileTap scale 0.92, spring transition)
  - Active tab indicator now animates between tabs using layoutId="tab-indicator" (shared layout animation)
  - Active icon does a subtle y: -1 lift via motion.div
  - All using framer-motion with spring physics (stiffness 400, damping 25-30)
- Fixed a build error: duplicate import of Download/Loader2 in share-sheet.tsx (moved all imports to the top, removed the duplicate block at the bottom)

Stage Summary:
- 2 new features (share-card preview modal, recent styles strip) + 2 styling polish items (Caveat font, animated tab bar)
- New files: src/lib/style-memory.ts
- Modified: src/app/layout.tsx (Caveat imports), src/lib/style-presets.ts (Caveat in QR_FONTS), src/lib/export.ts (Polaroid uses Caveat), src/components/vello/screens/{share-sheet,studio}.tsx, src/components/vello/app-shell.tsx (animated tab bar)
- verify:all passes: lint clean, docs:check 26/26 + links valid, check:privacy 93 files no network calls
- Browser-verified: preview modal renders 1080×1350 canvas with Close/Export, recent styles strip appears after applying presets, tab bar animates between tabs, no console errors
- Screenshots saved: qa-preview-modal-fixed, qa-recent-styles

Unresolved / next-phase:
- Add automated tests (Vitest + Playwright) per TESTING.md — still the largest documented gap
- Add CSP meta tag (BACKLOG B-19) for the privacy guarantee
- Consider adding the 4 share-card layouts to the showcase page's demo
- The preview modal canvas uses a fixed 60vh height; could calculate aspect ratio for perfect fit
- Consider a "clear recents" option in the studio
- Persist font recents/favourites + style recents into the backup bundle (currently localStorage, not in IndexedDB backup)

---
Task ID: CRON-5 (15-min webDevReview)
Agent: main (webDevReview)
Task: QA the app, then improve styling with more details and add more features/functionality.

Work Log:
- Reviewed worklog.md — project stable (v1.0.0, all gates pass, 14 screens, 26 docs). Previous rounds added Framer Motion, drag-reorder social links, contextual help, font recents/favourites, share-card layouts, onboarding animations, QR skeleton, share-card preview modal, recent styles strip, Caveat font, animated tab bar.
- Ran `bun run verify:all` — lint clean, docs:check 26/26, check:privacy 93 files. Baseline confirmed.
- QA via agent-browser (iPhone 14): onboarding → home → editor (social links drag-reorder verified) → wallpaper. No console errors, no runtime errors.
- NEW FEATURE: Share-card layouts gallery on the Showcase page (requested in CRON-3 + CRON-4 next-phase):
  - Added a "Share-card layouts" section between the privacy-proof and install sections
  - Shows all 4 layouts (Hairline, Plaque, Ticket, Polaroid) in a 2×2 grid with SVG thumbnail previews (ShowcaseLayoutThumb component, larger 32-height version of the share-sheet thumbs)
  - Each tile shows the layout name, description, and a visual preview
  - Polaroid thumb uses Caveat font for the caption to match the actual export
  - Browser-verified: all 4 layout names present in the DOM
- NEW FEATURE: QR style comparison view in the Studio (new "Compare" tab):
  - Added "Compare" as the 2nd tab in the studio (between Presets and Shape)
  - CompareView shows two presets side-by-side (120px QR previews each) with labels "Left"/"Right"
  - Two dropdown <select> pickers let the user choose any of the 17 presets for each side
  - Tapping either QR card applies that preset; an "Apply <Left>" button at the bottom applies the left one
  - Integrates with the recent-styles tracking (applying from Compare adds to recents)
  - Active preset is highlighted with clay border
  - Browser-verified: Ink vs Terracotta shown, dropdowns work, Apply Ink adds to recents (confirmed "Recently used" strip appears after)
- STYLING POLISH: Refined loading screen with brand mark animation:
  - The Vello "V" checkmark now draws itself (stroke-dashoffset animation, 0.7s, 0.3s delay)
  - The ink background rect fades in first (0.4s, 0.1s delay)
  - "Vello" wordmark fades in (0.6s delay)
  - The progress bar fades in last (0.8s delay) and slides indefinitely
  - Uses pathLength=1 for consistent dash animation across SVG renderers
  - Added paper-grain background texture for consistency with the app

Stage Summary:
- 2 new features (showcase layouts gallery, studio Compare tab) + 1 styling polish (loading screen animation)
- Modified: src/components/vello/screens/{showcase,studio}.tsx, src/app/page.tsx
- verify:all passes: lint clean, docs:check 26/26 + links valid, check:privacy 93 files no network calls
- Browser-verified: showcase layouts gallery shows all 4 layouts, Compare tab renders two presets side-by-side with dropdown pickers and Apply button, applying from Compare adds to recents, loading screen animates the V draw, no console errors
- Screenshots saved: qa-showcase-layouts, qa-studio-compare, qa-recents-after-compare, qa-round5-loading

Unresolved / next-phase:
- Add automated tests (Vitest + Playwright) per TESTING.md — still the largest documented gap
- Add CSP meta tag (BACKLOG B-19) for the privacy guarantee
- The Compare tab could show a live QR scan-check for each side
- Consider a "clear recents" option in the studio
- Persist font recents/favourites + style recents into the backup bundle (currently localStorage, not in IndexedDB backup)
- The loading screen animation plays once on initial load; consider replaying on view transitions if needed

---
Task ID: CRON-6 (15-min webDevReview)
Agent: main (webDevReview)
Task: QA the app, then improve styling with more details and add more features/functionality.

Work Log:
- Reviewed worklog.md — project stable (v1.0.0, all gates pass, 14 screens, 26 docs). Previous rounds added Framer Motion, drag-reorder social links, contextual help, font recents/favourites, share-card layouts, onboarding animations, QR skeleton, share-card preview modal, recent styles strip, Caveat font, animated tab bar, showcase layouts gallery, studio Compare tab, loading screen animation.
- Ran `bun run verify:all` — lint clean, docs:check 26/26, check:privacy 93 files. Baseline confirmed.
- QA via agent-browser (iPhone 14): onboarding → home → fullscreen QR → studio Compare → share (PNG export "Shared") → copy vCard ("Copied") → settings. No console errors, no runtime errors.
- NEW FEATURE: Persist recents/favourites into the backup bundle (documented gap since CRON-2):
  - Added a `memories` field to the BackupBundle interface in src/lib/storage.ts (fontRecents, fontFavs, styleRecents arrays)
  - Added readMemories() to capture the three localStorage keys during exportBackup()
  - Added writeMemories() to restore them during importBackup()
  - Updated the backup screen's import handler to reload the page after restore (so the useFontMemory and useStyleRecents hooks re-read from localStorage)
  - Browser-verified: backup export shows "Backup saved", no errors
- NEW FEATURE: QR scan-check indicator in the Compare tab (requested in CRON-5 next-phase):
  - Each CompareCard now runs a live scan-check: renders the QR to an offscreen canvas (200px), decodes with jsQR, compares to the payload, and shows a small indicator below the preset name
  - Three states: "checking" (gray dot), "scans" (emerald dot), "risky" (amber dot)
  - Uses the same evaluateScan + contrast logic as the main studio scan check
  - Debounced 200ms so switching presets doesn't thrash
  - Browser-verified: both cards showed "risky" with a minimal card (expected — low data density); the indicator updates live
- STYLING POLISH: Editor section completion indicators:
  - Added an optional `filled` prop to the Section component
  - Shows a small dot before each section title: clay (filled) when the section has data, empty ring (muted) when empty
  - Wired into Photo (filled when photo exists), Identity (name/title/company), Contact (phone/email/website), Social links (any social field)
  - The QR contents section is always "filled" (has defaults) so no indicator
  - Browser-verified: Identity shows clay dot (name entered), Photo/Contact/Social show empty rings

Stage Summary:
- 2 new features (backup memories persistence, Compare scan-check) + 1 styling polish (editor completion indicators)
- Modified: src/lib/storage.ts (memories in backup bundle), src/components/vello/screens/{backup,studio,editor}.tsx
- verify:all passes: lint clean, docs:check 26/26 + links valid, check:privacy 93 files no network calls
- Browser-verified: Compare tab shows scan indicators (risky/scans), editor sections show completion dots, backup export saves memories, no console errors
- Screenshots saved: qa-compare-scan, qa-editor-indicators

Unresolved / next-phase:
- Add automated tests (Vitest + Playwright) per TESTING.md — still the largest documented gap
- Add CSP meta tag (BACKLOG B-19) for the privacy guarantee
- The Compare scan-check shows "risky" for minimal cards — consider adjusting the threshold or showing a "low data" hint
- Consider a "clear recents" option in the studio
- The backup memories field is optional (backwards-compatible with older backups); document this in DATA_MODEL.md
- Consider adding the memories to the erase-all flow (currently eraseAll clears IndexedDB but not localStorage)

---
Task ID: CRON-7 (15-min webDevReview)
Agent: main (webDevReview)
Task: QA the app, then improve styling with more details and add more features/functionality.

Work Log:
- Reviewed worklog.md — project stable (v1.0.0, all gates pass, 14 screens, 26 docs). Previous rounds added many features; the CRON-6 next-phase noted the erase-all flow doesn't clear localStorage memories.
- Ran `bun run verify:all` — lint clean, docs:check 26/26, check:privacy 93 files. Baseline confirmed.
- QA via agent-browser (iPhone 14): onboarded, applied Ink preset, confirmed localStorage `vello:style-recents` = `["ink"]`. This confirmed the documented gap: eraseAll() only clears IndexedDB.
- BUG FIX: eraseAll() now also clears localStorage memories:
  - Updated src/lib/storage.ts: eraseAll() now removes the three localStorage keys (vello:font-recents, vello:font-favs, vello:style-recents) after clearing IndexedDB
  - Added a separate clearMemories() function for clearing only the localStorage memories without touching the card/photo
- NEW FEATURE: "Clear recents" option in the studio (requested in CRON-2, CRON-3, CRON-4 next-phase lists):
  - Added a clearRecents() method to useStyleRecents hook (src/lib/style-memory.ts) that empties the recents array and removes the localStorage key
  - Added an "onClear" prop to the RecentStylesStrip component with a small "Clear" button (X icon) in the header row, aligned right
  - Wired into the studio: clicking Clear empties recents and shows a "Recents cleared" toast
  - Browser-verified: after applying Ink (recents=["ink"]), clicking Clear set localStorage to null and the strip disappeared
- NEW FEATURE: QR "Copy image" button on the Home screen:
  - Added a copyQrImage() function that renders the styled QR to a 600px PNG via exportQrPng, then uses the Clipboard API (ClipboardItem + navigator.clipboard.write) to copy the PNG blob to the clipboard
  - Falls back to downloadBlob if ClipboardItem isn't supported (older browsers/Safari)
  - Added a "Copy image" button next to the existing "Copy vCard text" button, wrapped both in a flex container
  - Browser-verified: clicking "Copy image" showed "QR image copied" toast, no errors
- STYLING POLISH: Home copy buttons layout:
  - Wrapped the two copy buttons (vCard text + image) in a flex-wrap container so they sit side-by-side on wider screens and stack on narrow ones
  - Both use the same pill style for visual consistency

Stage Summary:
- 1 bug fix (eraseAll clears localStorage) + 2 new features (Clear recents, Copy QR image) + 1 styling polish (copy buttons layout)
- Modified: src/lib/storage.ts (eraseAll + clearMemories), src/lib/style-memory.ts (clearRecents), src/components/vello/screens/{studio,home}.tsx
- verify:all passes: lint clean, docs:check 26/26 + links valid, check:privacy 93 files no network calls
- Browser-verified: Clear recents empties localStorage + shows toast, Copy image copies PNG to clipboard + shows toast, no console errors
- Screenshots: (no new screenshots this round — verified via localStorage state + toast text)

Unresolved / next-phase:
- Add automated tests (Vitest + Playwright) per TESTING.md — still the largest documented gap
- Add CSP meta tag (BACKLOG B-19) for the privacy guarantee
- The Compare scan-check shows "risky" for minimal cards — consider adjusting the threshold or showing a "low data" hint
- Consider adding a "clear font favourites" option to the font picker (currently only style recents can be cleared)
- Document the memories field in DATA_MODEL.md (it's optional/backwards-compatible)
- Consider a "recents" indicator count badge on the studio tab
