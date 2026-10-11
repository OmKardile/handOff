# Troubleshooting & Known Gotchas — HandOff

**Version:** 1.6.9  
**Updated:** 2026-10-11  

---

## 1. Development & Build FAQ

### Q: Why does `npm run dev` use `scripts/dev.mjs`?
**A:** Next.js CLI accepts `-H` or `--hostname` for binding IP addresses, whereas some dev supervisors and AI Studio control planes invoke `npm run dev --port 3000 --host 0.0.0.0`. `scripts/dev.mjs` translates `--host` flags to Next.js `-H` flags and disables telemetry, ensuring cross-platform stability on both Windows and Linux.

### Q: Why can't I create API routes in `src/app/api`?
**A:** HandOff is compiled as a static export (`output: "export"`) for Capacitor Android. Any server-side API routes will cause `next build` to fail during static export. HandOff is intentionally 100% offline with zero server requirements.

### Q: Why did static export show "TypeError: Cannot read properties of null (reading 'useContext')"?
**A:** Next.js 16 App Router requires `NODE_ENV=production` during `next build`. When `NODE_ENV=development` is inherited from the container or shell, Next.js prerendering attempts to load dev error boundaries with uninitialized React contexts. All build scripts (`npm run build`, `npm run cap:sync`) now enforce `cross-env NODE_ENV=production`.

---

## 2. Design System & The #1 Rule

### Q: What is The #1 Rule in HandOff?
**A:** **Black text on yellow/lime.** Any element with `bg-signal` (`#C6FF00`) must use `text-black` (`#000000`). Never use `text-ink` or `var(--ink)`, because in dark mode `--ink` flips to bone (`#EDEAE0`), causing invisible white-on-lime text.

### Q: Why are button borders 2px with sharp offset shadows?
**A:** HandOff follows the DEAD DROP brutalist aesthetic: `.brut` classes provide 2px solid ink borders with 4px hard offset shadows (no blur radius). Do not use `rounded-full` on buttons; use 10px–14px rounded corners (`.brut` or `.brut-sm`).

---

## 3. Native Capacitor (Android) Gotchas

### Q: Storage cleared after device restart or WebView update?
**A:** On native Android, HandOff uses `@capacitor/preferences` which stores data in native `SharedPreferences`. In addition, `src/lib/storage-adapter.ts` maintains a dual mirror to IndexedDB. If you are developing locally, ensure `@capacitor/preferences` is synced via `npm run cap:sync`.

### Q: Android back button exits the app instead of navigating back?
**A:** This occurred when the back button listener captured an initial render closure. In `src/lib/native-bridge.ts`, `installBackButton` now uses dynamic module-level references (`currentGetView` and `currentNavigate`) so the active screen is always evaluated dynamically.

### Q: Saved wallpapers or cards not showing in Android Gallery/Downloads?
**A:** `saveOrShareBlob` writes files to `Directory.Documents` first (fallback to `Directory.Cache`). Files saved to Documents are user-accessible and persist across app cache wipes.

### Q: Haptics not firing?
**A:** Check if haptics are enabled in Settings (Config tab). When toggled on, a test haptic fires immediately (`haptic(30, true)`). Note that Android emulators do not have physical vibrator motors; haptics must be tested on a real physical device.
