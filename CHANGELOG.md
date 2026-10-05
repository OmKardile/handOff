# Changelog

All notable changes to Vello are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-15

Initial release of Vello — a privacy-first digital business card web app. Everything lives on the device; the app makes zero network requests at runtime.

### Added

- **Onboarding** — 3-step guided flow: welcome → identity & contact → photo → finish, with a live QR preview that updates as you type.
- **QR engine** — compact vCard 3.0 payload builder (`src/lib/vcard.ts`), UTF-8 byte-aware 75-octet line folding, CRLF, `\\`/`;`/`,`/`/newline escaping, SHA-256 `qrFingerprint` (first 8 bytes hex) for change detection.
- **QR payload + size meter** (`src/lib/qr.ts`) — byte counting, thresholded status: green ≤ 250 B, amber ≤ 450 B, red ≤ 700 B, overflow > 700 B, with QR version estimation against the standard byte-mode capacity table at ECC M.
- **17 QR style presets** (`src/lib/style-presets.ts`) grouped by mood — Quiet (Ink, Midnight Press, Sunday Linen, Paper & Pine, Graphite Mono, Noir Gold), Warm (Terracotta, Saffron Line, Ember, Dusk Rose, Plum Hours), Cool (Monsoon, Glacier, Sage Room, Cobalt Edit), Social (Afterglow, Open Sky). 7 self-hosted caption fonts (Fraunces, Newsreader, DM Serif Display, Cormorant Garamond, Instrument Sans, Space Grotesk, JetBrains Mono) and 6 named swatch rows.
- **QR rendering engine** (`src/lib/qr-render.ts`) — `qr-code-styling` adapter for 6 module shapes, 3 eye shapes, gradients, centre element (none/initials/photo/emoji), ring, caption, plate radius and padding.
- **Scan-check** (`src/lib/scan-check.ts`) — jsQR decode of the rendered canvas, WCAG-style contrast ratio between module and background colours, "Scans well" indicator that warns but never blocks.
- **Field normalizers** (`src/lib/normalizers.ts`) — phone (libphonenumber-js, IN default region), email (RFC 5322 simplified), website (rejects `javascript:`/`data:`/`file:`/`vbscript:`), LinkedIn/Instagram/X/WhatsApp canonicalisation, control-character stripping, ASCII-safe filenames.
- **Storage adapter** (`src/lib/storage.ts`) — IndexedDB via `idb-keyval`, debounced writes, `.bak` fallback for the card, schema-versioned wraps, persistence requests, full backup export/import (JSON), `eraseAll`.
- **Zustand store** (`src/lib/store.ts`) — single source of truth, auto-persist, draft/restore, QR-change detection, custom preset management.
- **Exports** (`src/lib/export.ts`) — PNG (≥ 1200 px), SVG, `.vcf` (full vCard 3.0 with photo, `itemN.URL` + `itemN.X-ABLabel` socials, `UID:urn:uuid:`), Story image (1080×1920), Square (1080×1080), Print card (1050×600, ECC H), Wallet image (1080×1350, pure light plate). Web Share API where available, file download fallback.
- **Photo processing** (`src/lib/photo.ts`) — `createImageBitmap` (orientation-aware), centre-crop square, canvas re-encode strips EXIF/GPS, JPEG q0.82 at 512 px + 256 px thumb.
- **9 screens** — onboarding, home (QR hero + 6 actions), editor (collapsible sections, QR toggles, size meter, draft restore), fullscreen-qr (wake lock), studio (presets + Shape/Colour/Centre/Frame/Caption tabs + scan indicator), share (7 export formats), wallet, wallpaper (4 backdrops), settings (theme/haptics/storage/privacy/erase), privacy (6 facts + promise), backup (export/import JSON), showcase (client-side SPA view), help centre + help-guide (mirrors `src/lib/help-content.ts`).
- **App shell** — bottom tab bar (Card/Studio/Settings), sticky footer, hidden on fullscreen/onboarding, safe-area aware.
- **Design system** — editorial serif (Fraunces) + sans (Instrument Sans) + mono (JetBrains Mono) via `next/font`; warm paper palette (`#F6F3EE` paper, `#161619` ink, `#B0533A` clay accent); full light/dark themes via CSS custom properties in `src/app/globals.css`.
- **PWA** — `manifest.webmanifest`, installable, offline-capable (no runtime network requests).
- **Docs quality gate** — `scripts/docs-check.ts` (`bun run docs:check`): fails on missing/empty required docs, broken relative links, scripts not mentioned anywhere, or a missing CHANGELOG entry for the current `package.json` version.
- **Privacy enforcement gate** — `scripts/check-privacy.ts` (`bun run check:privacy`): fails on `fetch()`/`XMLHttpRequest`/`WebSocket`/`sendBeacon`/`EventSource` or non-allowlisted absolute URLs in `src/` and `scripts/`.
- **Combined verify** — `bun run verify:all` runs `lint` → `docs:check` → `check:privacy` in sequence.
- **Showcase + Help centre** — implemented as client-side SPA views inside the existing view router (reachable from Settings), not as separate Next.js routes (see [docs/DECISIONS.md](docs/DECISIONS.md), D2).
- **Help content** — `src/lib/help-content.ts` powers the in-app help centre and mirrors [docs/USER_GUIDE.md](docs/USER_GUIDE.md), [docs/FAQ.md](docs/FAQ.md), [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).
- **Documentation set** — README, CHANGELOG, CONTRIBUTING, LICENSE, THIRD_PARTY_LICENSES, and 21 `docs/` files.

### Known limitations (documented, not blocking)

- No native iOS/Android builds in this environment. Wallet and direct wallpaper setting use web fallbacks.
- No CSP meta tag in `index.html` yet (the app makes zero runtime network requests regardless).
- No automated test suite yet (Vitest + Playwright planned).
- Caption fonts are Latin-only; Devanagari names fall back to a system font.
- The `appId` is a placeholder (`com.example.vello`) and must be changed before store submission.

See [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) for the full list.
