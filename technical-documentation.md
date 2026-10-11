# Technical Documentation — HandOff

**Version:** 1.6.9  
**Updated:** 2026-10-11  
**Architecture:** Next.js 16 App Router (Web SPA) + Capacitor 8 (Android Hybrid App)

---

## 1. Stack & System Specifications

- **Framework:** Next.js 16.4 (App Router, Turbopack, TypeScript 5.8)
- **Native Runtime:** Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/preferences`, `@capacitor/filesystem`, `@capacitor/share`, `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/splash-screen`)
- **Styling:** Tailwind CSS 4, shadcn/ui (New York style), Lucide React
- **State Management:** Zustand v5 client store with local persistence
- **Storage:** Dual adapter:
  - **Native (Android/iOS):** `@capacitor/preferences` (SharedPreferences/NSUserDefaults)
  - **Web:** IndexedDB via `idb-keyval` (database: `handoff-db`, store: `handoff-store`)
  - **Resilience:** Dual-mirroring writes and automatic backward-migration from IndexedDB to Preferences on cold load
- **QR Code Engine:** `qr-code-styling` for high-resolution vector/canvas drawing; `jsQR` for scan decodability analysis and WCAG contrast check
- **Contact Protocol:** vCard 3.0 specification (`vcard.ts`), RFC 5322 email validation, E.164 phone canonicalization via `libphonenumber-js`

---

## 2. Directory Layout & Layer Boundaries

```
src/
├── app/                  # Next.js App Router root
│   ├── layout.tsx        # Global fonts (Anton, Space Grotesk, Fraunces), ThemeProvider, Toaster
│   ├── page.tsx          # Client-side SPA screen coordinator, lazy loaded sub-screens
│   └── globals.css       # DEAD DROP Brutalist design tokens, utility classes
├── shared/               # Leaf layer (pure constants & types, NO imports from lib/components)
│   ├── brand.ts          # Identity constants (HandOff, v1.6.9, tagline, developer info)
│   ├── types.ts          # Type schemas (Card, QrStyle, Settings, ThemePref, etc.)
│   └── limits.ts         # Byte caps, field length limits, QR error correction thresholds
├── lib/                  # Pure utility and domain modules
│   ├── store.ts          # Zustand store (single source of truth for card, style, settings)
│   ├── storage.ts        # Schema versioning (v1), backup rotation (.bak), data isolation
│   ├── storage-adapter.ts# Unified storage abstraction (native Preferences vs web IndexedDB)
│   ├── native-bridge.ts  # Capacitor hardware back button, status bar, Documents export
│   ├── haptics.ts        # Dynamic Capacitor Haptics with Web Vibration API fallback
│   ├── vcard.ts          # Compact vCard 3.0 builder, 75-octet line folding, escaping
│   ├── qr.ts             # Byte calculation, payload formatting, QR version estimation
│   ├── qr-render.ts      # Canvas QR renderer, transparent plate support, canvas watermark
│   ├── scan-check.ts     # jsQR decoding and WCAG contrast verification
│   ├── export.ts         # PNG, SVG, vCard (.vcf), Wallpaper, Wallet image generator
│   └── style-presets.ts  # 36 curated style presets across 5 groups
└── components/handoff/   # React presentation layer
    ├── app-shell.tsx     # Brutalist shell, bottom navigation dock, performance-managed background
    ├── view-context.tsx  # In-memory screen router (home, studio, config, editor, wallpaper, etc.)
    ├── qr-preview.tsx    # Memoized live QR preview with concentric border radii
    ├── scan-badge.tsx    # Real-time scan quality meter
    ├── motion.tsx        # Framer Motion transitions and stagger wrappers
    └── screens/          # Screen modules (Home, Studio, Settings, Wallpaper, Share, Editor, etc.)
```

---

## 3. Data Flow & Lifecycle

```
User Input (Editor / Studio)
       │
       ▼
Zustand Store (`store.ts`)
       │
       ├─► Dual Storage Adapter (`storage-adapter.ts`)
       │     ├─► Native: @capacitor/preferences
       │     └─► Web: IndexedDB (idb-keyval) + .bak safety copy
       │
       ├─► vCard Engine (`vcard.ts`)
       │     └─► Compact UTF-8 payload (escaped, no cloud URL)
       │
       ├─► QR Render Pipeline (`qr-render.ts`)
       │     ├─► qr-code-styling canvas generation
       │     ├─► Concentric corner clipping
       │     └─► Anti-screenshot "HandOff" watermark
       │
       └─► Export Pipeline (`export.ts` + `native-bridge.ts`)
             ├─► High-res PNG (≥1200px) / SVG / .vcf / 1080x1920 Wallpaper
             └─► Saved to Filesystem Documents / System Share Sheet
```

---

## 4. Native Bridge Specifics

1. **Back Button Listener:**
   - Registered once via `@capacitor/app`.
   - Uses dynamic module-level closure variables to track active view and navigate functions without stale state bugs.
   - On `home` or `onboarding`: calls `App.exitApp()`.
   - On sub-screens (`editor`, `share`, `wallet`, `wallpaper`, `fullscreen-qr`): routes to `home`.
   - On settings sub-screens (`privacy`, `backup`, `help`, `showcase`): routes to `settings`.

2. **File Persistence:**
   - Files are written to `Directory.Documents` first (fallback to `Directory.Cache`).
   - Enables native Android file manager visibility and seamless sharing via `@capacitor/share`.

3. **Status Bar:**
   - Set to `#F2EFE6` bone background with dark icons on light theme to match app chrome.

---

## 5. Automated Verification Gates

- **`npm run lint`**: ESLint 9 validation across all source files.
- **`npm run check:privacy`**: Static scan guaranteeing 0 network calls (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`).
- **`npm run docs:check`**: Markdown link verification, required documentation presence, and script coverage check.
- **`npm run verify:all`**: Sequential execution of all gates before git commit.
