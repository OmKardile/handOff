# Changelog

All notable changes to Vello are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.9] - 2026-10-11

Major release transitioning the app to **HandOff** with the "DEAD DROP" brutalist design language and Capacitor 8 Android native integration.

### Added
- **DEAD DROP Brutalist Design System** — Complete visual overhaul featuring `#F2EFE6` bone canvas, `#0A0A0A` ink borders, `#C6FF00` acid-lime accent, `#FF3B1F` clay vermilion alerts, Anton display headlines, Archivo Black buttons, Space Grotesk body, and JetBrains Mono field tags.
- **36 QR Style Presets** — Expanded from 17 to 36 presets across 5 curated aesthetic moods (Quiet, Warm, Cool, Social, Vivid) with custom palette swatches and module/eye shapes.
- **11 Live Wallpaper Templates** — Sunburst, Halftone, Checkerboard, Confetti, Orbs, Comic, Kawaii Cat (detailed bezier illustration with sparkly eyes, double catchlight, paws, and floating hearts), Clouds, Mountains, Bubbles, and Vines. Live canvas previews powered by `WallpaperArtPreview`.
- **Capacitor 8 Android Architecture** — Full native compilation setup with `@capacitor/core`, `@capacitor/android`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/filesystem`, `@capacitor/share`, `@capacitor/preferences`, `@capacitor/status-bar`, and `@capacitor/splash-screen`.
- **Dual Persistent Storage Adapter** — `@capacitor/preferences` (SharedPreferences / NSUserDefaults) for reliable persistence across Android OS cycles, mirrored and backed by IndexedDB (`idb-keyval`) on web with automatic backward-migration.
- **Native Bridge Integration** — Edge-to-edge status bar configuration (`configureStatusBar`), hardware back button routing with dynamic closure resolution (`installBackButton`), and persistent file exports to `Directory.Documents` (`saveOrShareBlob`).
- **Performance Pipeline** — `React.memo` on `QrPreview` to isolate QR canvas rendering; `React.lazy` and `Suspense` for heavy screens (`WallpaperScreen`, `ShareSheet`, `FullscreenQr`, `EditorScreen`, `BackupScreen`, `WalletScreen`, `ShowcaseScreen`, `HelpScreen`); GPU-friendly visibility-based pausing for animated background blur orbs.
- **Fullscreen QR View** — Dedicated high-brightness QR display with wake lock API support and swipe-down dismiss gesture.
- **Scan & Contrast Evaluation** — Live `ScanBadge` computing real WCAG contrast ratios and jsQR decode verification.
- **Anti-Screenshot Watermark** — Subtle "HandOff" canvas watermark on generated and exported assets.

### Fixed
- **Translate Typo Elimination** — Corrected legacy `tranhandoff` typo across `editor.tsx`, `studio.tsx`, `help.tsx`, `privacy.tsx`, and all shadcn UI components back to valid `translate`.
- **Android Back Button Quitting Bug** — Replaced stale listener closure with dynamic navigation/view callbacks so the back button navigates through sub-screens correctly instead of exiting.
- **Haptics Toggle & Firing** — Fixed `useHaptics` hook and enabled forced test pulses on user toggle.
- **Cross-Platform Script Compatibility** — Updated `scripts/docs-check.ts`, `scripts/check-privacy.ts`, and `scripts/dev.mjs` for Node.js runtime compatibility on Windows and Linux.
- **Static Export Next.js 16 Warnings** — Replaced unkeyed manual `<head>` meta tags in `src/app/layout.tsx` with standard Next.js metadata objects.

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
