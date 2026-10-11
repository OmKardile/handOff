# HandOff — AI Studio Handover Prompt

> Copy everything below this line into Google AI Studio as the system prompt / first message.

---

You are continuing development on **HandOff** — a privacy-first digital business card app that generates offline vCard QR codes. The app runs as a Next.js 16 web app AND as a Capacitor Android app. Your job is to fix bugs, add features, and push all changes to GitHub.

## Project Identity

- **Name:** HandOff
- **Version:** 1.6.9
- **Tagline:** "One card. One scan. Nothing leaves your phone."
- **Developer:** Omkar Kardile (omkardile84@gmail.com, GitHub: OmKardile)
- **Repo:** https://github.com/OmKardile/handOff
- **Git token:** <YOUR_GITHUB_TOKEN>
- **License:** MIT
- **Platform:** Next.js 16 + Capacitor (Android)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, TypeScript 5)
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **State:** Zustand (client state)
- **Storage:** Dual adapter — @capacitor/preferences (native) / IndexedDB via idb-keyval (web)
- **QR:** qr-code-styling + jsQR (scan-check)
- **Native:** Capacitor 8 (@capacitor/core, app, haptics, filesystem, share, preferences, status-bar, splash-screen, android)
- **Fonts:** Anton (display), Archivo Black (heavy), Space Grotesk (body), JetBrains Mono (mono), Fraunces/Instrument Sans (QR captions)
- **Build:** `NEXT_STATIC_EXPORT=1 next build` for Capacitor (generates /out), `next build` for dev

## Design System — "DEAD DROP" Brutalist Aesthetic

### Palette
| Token | Hex | Role |
|-------|-----|------|
| bone | `#F2EFE6` | Canvas background |
| ink | `#0A0A0A` | Text + all borders (flips to bone in dark mode) |
| signal | `#C6FF00` | Acid lime — primary accent |
| clay | `#FF3B1F` | Vermilion — alerts/QR eyes |
| cobalt | `#1B2BE0` | Data accent (rare) |
| void | `#08080A` | Deepest black |

### THE #1 RULE
**Black text on yellow. Always.** On any `bg-signal` (lime) surface, use `text-black` (fixed #000), NEVER `text-ink` (which flips to bone in dark mode → white-on-lime).

### Typography
- Display titles: `font-display` (Anton), uppercase, 30px, tracking -0.01em
- Button text: `font-heavy` (Archivo Black), uppercase, tracking-wide
- Body: `font-sans` (Space Grotesk)
- Mono tags: `field-label` (JetBrains Mono), 10px, tracking 0.12em, uppercase

### Surfaces
- `.brut` — 2px ink border, 4px hard offset shadow, 14px radius, white bg
- `.brut-lg` — 3px ink border, 6px shadow, 28px radius (hero cards)
- `.brut-sm` — 1.5px border, 2px shadow, 10px radius (chips)
- `.brut-signal` — lime bg, FIXED black text (`color: #0A0A0A`)
- `.brut-ink` — ink bg, bone text

### Layout
- Fixed `h-[100dvh]` shell, single `<main>` scroll area with `.no-scrollbar`
- Content: `mx-auto max-w-md px-5`
- Bottom nav: brutalist pill, 3 tabs (CARD/STUDIO/CONFIG), lime active tab, `text-black`
- All screen titles at `paddingTop: max(env(safe-area-inset-top, 0px), 44px)` via `ScreenHeader`

### QR Corners (concentric)
- Card radius: 28px (--radius-xl)
- QR plate radius: 20px (card radius - 8px padding)
- Small thumbnails: `Math.max(6, Math.min(20, Math.round(size * 0.1)))`
- QrPreview wrapper has `border-2 border-ink overflow-hidden` + CSS `borderRadius`

## Architecture

```
src/
  app/           layout.tsx, page.tsx, globals.css
  shared/        brand.ts, types.ts, limits.ts
  lib/
    store.ts              — Zustand store (card, style, settings, photo, presets)
    storage.ts            — Dual storage adapter (native Preferences / web IndexedDB)
    storage-adapter.ts    — Unified get/set/del/clear for native + web
    native-bridge.ts     — isNative(), installBackButton(), configureStatusBar(),
                           saveOrShareBlob() (Filesystem+Share on native, <a download> on web),
                           ensurePersistentStorage()
    haptics.ts            — useHaptics() hook + haptic() fn (Capacitor Haptics + Web Vibration)
    qr.ts                 — getQrPayload(), getQrSizeInfo()
    qr-render.ts          — renderQrToCanvas() (qr-code-styling + canvas clip + signature)
    qr-insights.ts        — byte breakdown by field
    scan-check.ts         — evaluateScan() (decode + WCAG contrast ratio)
    export.ts             — PNG/SVG/vcf/wallet/story/square/share-card exports
    style-presets.ts      — 36 QR presets (quiet/warm/cool/social/vivid)
    photo.ts, vcard.ts, normalizers.ts, font-memory.ts, style-memory.ts
  components/handoff/
    app-shell.tsx         — shell + ScreenHeader + Wordmark + DockItem
    view-context.tsx      — view state (onboarding/home/studio/settings/etc)
    qr-preview.tsx        — canvas QR with transparentBg prop
    scan-badge.tsx        — "Scans well" + real contrast ratio
    motion.tsx            — Reveal/stagger wrappers
    dev-signature.tsx     — developer credit
    screens/
      onboarding.tsx, home.tsx, studio.tsx, settings.tsx, fullscreen-qr.tsx,
      wallpaper.tsx, share-sheet.tsx, editor.tsx, wallet.tsx, backup.tsx,
      privacy.tsx, showcase.tsx, help.tsx
  components/ui/          — shadcn/ui (switch, dialog, etc.)
design-system/           — full documentation (tokens, primitives, components, patterns)
public/                  — icon.svg, logo.svg, splash.svg, icon-foreground.svg
resources/               — icon.png, splash.png (512px PNGs for Capacitor)
```

## Key Files to Know

### src/lib/native-bridge.ts
- `isNative()` — checks Capacitor platform
- `installBackButton(getView, navigate)` — Android back button: home→exit, sub-screens→navigate back
- `configureStatusBar()` — bone bg + dark icons
- `saveOrShareBlob(blob, filename, title, text)` — Filesystem.writeFile + Share.share on native; `<a download>` + Web Share API on web
- `ensurePersistentStorage()` — navigator.storage.persist() on web; no-op on native (already persistent)

### src/lib/storage.ts + storage-adapter.ts
- `storageGet/storageSet/storageRemove/storageClear` — unified API
- On native: @capacitor/preferences (SharedPreferences/NSUserDefaults) — ALWAYS persistent
- On web: idb-keyval (IndexedDB)
- All data is schema-versioned with backup rotation (card.bak)

### src/lib/qr-render.ts
- `renderQrToCanvas(canvas, card, style, size, photoDataUrl)`
- Clips to rounded corners via `ctx.clip()` BEFORE drawing the QR
- Checks `style.background === "transparent"` → skips plate fill (for Studio preview)
- Draws "HandOff" signature watermark in bottom-right corner (anti-screenshot)
- Caption only renders when `captionEnabled && captionText.trim()` (never auto-name)

### src/lib/haptics.ts
- `useHaptics()` hook — reads `settings.haptics` from Zustand store
- `haptic(pattern)` — async, uses Capacitor Haptics.impact on native, navigator.vibrate on web
- Settings toggle fires test haptic immediately on enable

### src/components/handoff/qr-preview.tsx
- `transparentBg` prop → passes `background: "transparent"` to renderer
- Wrapper: `overflow-hidden border-2 border-ink` + CSS `borderRadius` (scales with size)
- 60ms debounce on re-render

### src/components/handoff/screens/wallpaper.tsx
- 11 art templates: Sunburst, Halftone, Checkerboard, Confetti, Orbs, Comic, Kawaii cat, Clouds, Mountains, Bubbles, Vines
- `WallpaperArtPreview` component renders template art to canvas live in the phone preview
- `generate()` renders full 1080×1920 wallpaper + downloads via native bridge

## Build Instructions (Windows + npm)

```bash
# Clone
git clone https://github.com/OmKardile/handOff.git
cd handOff
npm install

# Dev server
npm run dev

# Capacitor Android build
npm run cap:add:android    # first time only
npm run cap:sync           # builds web + syncs to android
npm run cap:open:android   # opens Android Studio

# In Android Studio: click Run to build + test on device/emulator
```

### next.config.ts
- `NEXT_STATIC_EXPORT=1` env var → `output: "export"` (generates /out for Capacitor)
- Without it → `output: "standalone"` (for dev server)
- `images: { unoptimized: true }` + `trailingSlash: true` when exporting

### .env
```
DATABASE_URL=file:./db/custom.db
```

## Git Push Command
```bash
git add -A
git commit -m "your message"
git push https://OmKardile:<YOUR_GITHUB_TOKEN>@github.com/OmKardile/handOff.git main
```

## Known Issues to Fix (PRIORITY ORDER)

1. **Storage may still not persist on Android** — the dual adapter (Preferences on native) should work, but if it doesn't, check that `@capacitor/preferences` is properly synced (`cap sync`) and the plugin is registered in `android/app/src/main/java/.../MainActivity.java`

2. **Haptics may not fire on Android** — the `haptic()` function is called on toggle, but Capacitor Haptics requires the plugin to be installed AND the device to have a vibrator. Test on a real device (emulators may not vibrate).

3. **Back button may still quit** — the `installBackButton()` runs in a `useEffect` with `[view, navigate]` deps, which means it re-installs on every view change. The `backHandlerInstalled` flag prevents double-install, but verify the listener survives navigation.

4. **Performance** — the app may feel slow because:
   - QrPreview re-renders on every store change (add React.memo)
   - Heavy screens (wallpaper, share-sheet) load eagerly (add React.lazy)
   - Background orbs animate even when not visible (add IntersectionObserver)

5. **README is outdated** — needs to reflect the current brutalist design, Capacitor setup, and v1.6.9

## Design System Docs
Full documentation at `/design-system/` — 22 files across tokens, primitives, components, patterns. Start at `design-system/README.md`.

## Cron Job
A recurring 15-minute QA job runs with instructions to:
- Review worklog.md
- Test via agent-browser
- Fix bugs / add features
- NOT create /api routes (breaks static export)
- NOT create duplicate component directories
- Always push to GitHub
- Focus on performance (React.memo, lazy-loading)

## What NOT to Do

- ❌ Create `/api` routes (breaks `output: export` for Capacitor)
- ❌ Use `text-ink` on lime surfaces (use `text-black` — see #1 RULE above)
- ❌ Use `bun.lock` or `bun run` in scripts (user is on Windows with npm)
- ❌ Use Unix commands like `cp -r` or `2>&1 | tee` in npm scripts
- ❌ Apply `backdrop-filter` to a parent of `<canvas>` (breaks compositing)
- ❌ Create duplicate component directories (slate/, vello/, etc.)
- ❌ Auto-draw the card name as QR caption (only custom text)
- ❌ Add signal/transmission/dead-drop themed copy to titles (use plain English)
- ❌ Use `rounded-full` on buttons (use 10-14px or the brut utilities)

## Current State Summary

The app is functional as a web app. The Capacitor Android build compiles and runs, but has these runtime issues:
- Storage persistence (using Preferences API now, should work but needs testing on device)
- Haptics (function exists + fires on toggle, needs device testing)
- Back button (handler installed, routes by view, needs device testing)
- Wallpaper/share downloads (native bridge uses Filesystem+Share, needs device testing)

All code is pushed to GitHub at commit `0c5bc29`. The design system is fully documented. The brutalist DEAD DROP aesthetic is consistent across all screens.
