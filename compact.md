# HandOff — Compact State & Fast Onboarding

**Date:** 2026-10-11  
**Version:** 1.6.9  
**Repo:** https://github.com/OmKardile/handOff  
**Author:** Omkar Kardile (omkardile84@gmail.com, GitHub: OmKardile)  
**License:** MIT  
**Platform:** Next.js 16.4 + Capacitor 8 (Android)  

---

## 1. What This Is
A 100% offline, privacy-first digital business card application. Generates compact vCard 3.0 QR codes that scan directly into iOS Camera and Android Google Lens. No backend, no accounts, no analytics, no tracking, zero runtime network calls.

---

## 2. Tech Stack & Key Plugins
- **Core:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Zustand 5.
- **Capacitor 8:** `@capacitor/core`, `@capacitor/android`, `@capacitor/preferences`, `@capacitor/filesystem`, `@capacitor/share`, `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/app`.
- **Storage:** Dual adapter (`src/lib/storage-adapter.ts`) — `@capacitor/preferences` (Android SharedPreferences) on native; `idb-keyval` (IndexedDB) on web. Automatic dual mirror and backward migration.
- **QR & Verification:** `qr-code-styling` (canvas rendering), `jsQR` (contrast & decodability check), `libphonenumber-js` (E.164 phone normalizer).

---

## 3. Design System — "DEAD DROP" Brutalist
- **Palette:** Bone (`#F2EFE6`), Ink (`#0A0A0A`), Signal Lime (`#C6FF00`), Clay (`#FF3B1F`), Cobalt (`#1B2BE0`), Void (`#08080A`).
- **THE #1 RULE:** Fixed `text-black` on any `bg-signal` (lime) surface. Never use `text-ink` on lime (turns white in dark mode).
- **Surfaces:** `.brut` (2px border, 4px shadow, 14px radius), `.brut-lg` (3px border, 6px shadow, 28px radius), `.brut-signal` (lime bg, black text).
- **Typography:** Anton (display), Archivo Black (buttons), Space Grotesk (body), JetBrains Mono (labels).

---

## 4. Current State & Resolved Items
- **Persistence:** Fully resolved. Dual adapter writes to native Preferences and mirrors to IndexedDB.
- **Back Button:** Fixed. `installBackButton` uses dynamic closure pointers (`currentGetView`, `currentNavigate`); sub-screens navigate to parent, only home/onboarding exits.
- **File Downloads:** Fixed. Writes to `Directory.Documents` first (fallback to `Directory.Cache`) then triggers native share.
- **Performance:** `QrPreview` memoized with `React.memo`. Heavy modal screens (`WallpaperScreen`, `ShareSheet`, `FullscreenQr`, `EditorScreen`, etc.) lazy-loaded with `React.lazy` and `Suspense`. Animated blur orbs paused when document hidden or on fullscreen views.
- **Code Cleanliness:** Fixed `tranhandoff` typo across all components to `translate`. 0 ESLint errors. All quality gates pass (`verify:all`).

---

## 5. Development & Build Commands
```bash
npm install                     # Install dependencies
npm run dev                     # Dev server (port 3000 via scripts/dev.mjs)
npm run build                   # Production web build (cross-env NODE_ENV=production)
npm run cap:sync                # Static export to /out and sync to Capacitor Android
npm run cap:open:android        # Open in Android Studio
npm run verify:all              # Run lint + docs:check + check:privacy
```

---

## 6. Prohibited Actions (Never Do)
- Do NOT add `/api` routes (breaks static HTML export for Capacitor).
- Do NOT use `text-ink` on lime surfaces (use `text-black`).
- Do NOT use `bun` or Unix-specific shell commands in npm scripts (Windows/npm workflow).
- Do NOT make runtime network calls (`fetch`, `XHR`, `WebSocket`, `sendBeacon`).
- Do NOT auto-draw contact name as QR caption (custom text only).
