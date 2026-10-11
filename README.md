# HandOff

> One card. One scan. Nothing leaves your phone.

HandOff is a privacy-first digital business card application that generates offline vCard QR codes. The app runs as a Next.js 16 web application and as an Android native hybrid application via Capacitor 8.

Everything operates 100% locally on the user's device: zero runtime network requests, no servers, no accounts, no tracking.

Built with Next.js 16 (App Router, Turbopack, TypeScript 5), Capacitor 8, Tailwind CSS 4, shadcn/ui, Zustand, dual storage adapters (`@capacitor/preferences` on native, IndexedDB via `idb-keyval` on web), `qr-code-styling`, and `jsQR`. MIT licensed.

---

## The Promise

- **No accounts. No servers. No analytics. No tracking. No cloud backup.**
- All contact information and styles live securely on the local device. Data is shared only when the user presents their QR code or initiates an export.
- The `check:privacy` quality gate (`npm run check:privacy`) enforces zero network calls across all application code.

---

## Quick Start (Windows & npm)

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm 10+
- Android Studio (for native Android builds)

### Development Server
```bash
git clone https://github.com/OmKardile/handOff.git
cd handOff
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Production Web Build
```bash
npm run build
npm run start
```

### Capacitor Android Build
```bash
# Add Android platform (first time only)
npm run cap:add:android

# Build static bundle (/out) and sync to native Android project
npm run cap:sync

# Open Android Studio to build APK/AAB or run on device/emulator
npm run cap:open:android
```

---

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `node scripts/dev.mjs` | Starts Next.js dev server on port 3000 with cross-platform host mapping |
| `build` | `cross-env NODE_ENV=production next build` | Compiles optimized Next.js standalone build |
| `build:web` | `cross-env NODE_ENV=production next build` | Standard web production build |
| `start` | `next start` | Starts Next.js production server |
| `lint` | `eslint .` | Runs ESLint across TypeScript, React, and script sources |
| `docs:check` | `node scripts/docs-check.ts` | Validates required documentation, links, and script coverage |
| `check:privacy` | `node scripts/check-privacy.ts` | Statically audits codebase for prohibited network calls |
| `verify:all` | `npm run lint && npm run docs:check && npm run check:privacy` | Complete automated release verification gate |
| `cap:sync` | `cross-env NODE_ENV=production NEXT_STATIC_EXPORT=1 next build && cap sync` | Builds static export to `/out` and syncs Capacitor Android |
| `cap:add:android` | `cap add android` | Initializes the Capacitor Android project |
| `cap:open:android` | `cap open android` | Launches Android Studio for testing and deployment |
| `db:*` | `prisma db ...` | Scaffolding for Prisma compatibility; unused at runtime |

---

## Design System — "DEAD DROP" Brutalist Aesthetic

HandOff uses a high-contrast industrial brutalist visual language:

- **Bone (`#F2EFE6`):** Canvas background wash.
- **Ink (`#0A0A0A`):** High-contrast text, sharp 2px–3px borders, and hard drop shadows.
- **Signal Lime (`#C6FF00`):** Acid lime primary accent for active navigation, hero badges, and primary actions.
- **Clay (`#FF3B1F`):** Vermilion alert and eye indicator accent.
- **Cobalt (`#1B2BE0`):** Secondary data accent.
- **Void (`#08080A`):** Deepest black.

### The #1 Rule
**Black text on yellow.** On any `bg-signal` (lime) surface, always use fixed `text-black` (`#000000`), never `text-ink` (which flips to light bone in dark mode).

### Surface Classes
- `.brut`: 2px ink border, 4px hard offset shadow, 14px radius, white background.
- `.brut-lg`: 3px ink border, 6px shadow, 28px radius (hero cards).
- `.brut-sm`: 1.5px border, 2px shadow, 10px radius (chips).
- `.brut-signal`: Lime background with fixed `#0A0A0A` black text.
- `.brut-ink`: Ink background with bone text.

---

## Architecture Summary

```
src/
  app/                     Next.js 16 App Router shell (layout.tsx, page.tsx, globals.css)
  shared/                  Pure types, brand constants, limits (brand.ts, types.ts, limits.ts)
  lib/
    store.ts               Zustand reactive store (card, style, settings, presets)
    storage.ts             Schema-versioned store persistence with backup rotation
    storage-adapter.ts     Dual storage layer (@capacitor/preferences native / idb-keyval web)
    native-bridge.ts       Hardware back button, Documents file export, status bar
    haptics.ts             Capacitor Haptics + Web Vibration API
    qr.ts, qr-render.ts    Compact vCard builder, canvas rendering, watermark
    scan-check.ts          jsQR decode and WCAG contrast ratio scoring
    export.ts              Multi-format exports (PNG, SVG, vCard .vcf, Wallpaper, Wallet, Share)
    style-presets.ts       36 style presets across 5 groups
  components/handoff/
    app-shell.tsx          Responsive brutalist shell, bottom navigation, animated field
    qr-preview.tsx         Memoized live QR canvas preview
    scan-badge.tsx         Real-time scan contrast indicator
    screens/               Onboarding, Home, Studio, Settings, FullscreenQr, Wallpaper,
                           ShareSheet, Editor, Wallet, Backup, Privacy, Showcase, Help
design-system/             Full tokens, primitives, components, and patterns documentation
```

---

## Author & License

- **Developer:** Omkar Kardile ([omkardile84@gmail.com](mailto:omkardile84@gmail.com) / [GitHub](https://github.com/OmKardile))
- **License:** MIT
