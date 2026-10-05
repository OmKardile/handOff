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
