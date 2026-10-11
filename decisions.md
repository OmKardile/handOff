# Architectural & Product Decisions — HandOff

**Project:** HandOff  
**Format:** Numbered, dated log including Context, Decision, and Consequences.

---

### D1 — Static Export App Architecture (Next.js 16 + Capacitor 8)
- **Date:** 2026-10-06
- **Context:** The product requires targeting both a responsive web application and native Android mobile installation without maintaining two divergent codebases.
- **Decision:** Build as a Next.js 16 App Router application with static HTML export (`NEXT_STATIC_EXPORT=1 next build`) wrapped by Capacitor 8. Zero `/api` server routes are allowed.
- **Consequence:** Single codebase powers both web and native Android APK/AAB builds. All routing remains client-side SPA within `page.tsx`.

### D2 — Dual Storage Persistence Layer
- **Date:** 2026-10-10
- **Context:** WebView instances on Android can clear IndexedDB caches during OS memory pressure or system app updates, causing users to lose their cards upon restarting the app.
- **Decision:** Implement a dual-storage adapter (`src/lib/storage-adapter.ts`). On native Android/iOS, use `@capacitor/preferences` (backed by Android `SharedPreferences` / iOS `NSUserDefaults`), while mirroring writes to IndexedDB. On web, use `idb-keyval` (IndexedDB).
- **Consequence:** Contact cards and settings survive Android process death and updates. Backward compatibility ensures existing web IndexedDB data is automatically migrated into native storage on startup.

### D3 — Direct vCard QR vs Server Redirect QR
- **Date:** 2025-01-11
- **Context:** Server-redirect QRs allow dynamic contact updates but require hosting a centralized backend, user accounts, and tracking databases.
- **Decision:** Encode the full contact payload directly into a standardized vCard 3.0 static QR code.
- **Consequence:** 100% privacy and offline operation. Changes to the card change the QR code; previous printed or saved QR codes do not update dynamically. The app provides a "QR Changed" banner to alert users.

### D4 — DEAD DROP Brutalist Design System & The #1 Rule
- **Date:** 2026-10-06
- **Context:** Most digital card apps use generic corporate SaaS interfaces. HandOff needs a bold, unforgettable identity while maintaining accessibility.
- **Decision:** Establish the DEAD DROP aesthetic: Bone canvas (`#F2EFE6`), Ink borders (`#0A0A0A`), Acid Lime (`#C6FF00`), and Anton / Archivo Black / Space Grotesk typography. Strictly enforce The #1 Rule: fixed black text on yellow/lime (`text-black` on `bg-signal`).
- **Consequence:** Uncompromising high-contrast visual identity. Dark mode flips borders and neutral canvas while lime surfaces stay strictly black-on-lime, preventing unreadable white-on-lime UI.

### D5 — Dynamic Hardware Back-Button Callback Closure
- **Date:** 2026-10-11
- **Context:** Capacitor's `@capacitor/app` back-button event listener previously captured stale closure state when registered in React effects, leading to premature app exits.
- **Decision:** Register a single listener on mount and update module-level pointer functions (`currentGetView` and `currentNavigate`) on every view transition.
- **Consequence:** Android back button navigates hierarchical sub-screens (`editor`, `share`, `wallpaper` -> `home`; `privacy`, `help` -> `settings`) and only exits the app on `home` or `onboarding`.

### D6 — Performance Optimization: React.memo & Screen Code-Splitting
- **Date:** 2026-10-11
- **Context:** Frequent Zustand store updates caused expensive `qr-code-styling` canvas redraws in `QrPreview`, and heavy art screens (`wallpaper.tsx`) inflated initial bundle load.
- **Decision:** Wrap `QrPreview` in `React.memo` and load heavy modal sub-screens (`WallpaperScreen`, `ShareSheet`, `FullscreenQr`, `EditorScreen`, etc.) via `React.lazy` and `Suspense`. Also pause animated blur orbs when document is hidden.
- **Consequence:** Faster startup time, zero redundant QR canvas redraws, and reduced GPU/battery consumption on mobile devices.
