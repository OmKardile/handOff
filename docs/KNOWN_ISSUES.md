# Known issues

An honest list of things that don't work the way you might expect. None of these are blocking the v1.0.0 release; all are documented so users and contributors aren't surprised.

## Native builds not possible (environment)

The original product spec targeted Vite + React + Capacitor for native iOS/Android. This build is a Next.js 16 web app because that's what the surrounding workspace provides. Concretely:

- No `.aab` or `.ipa` can be built from this repo today. There is no Capacitor config, no Xcode project, no Android Studio project.
- The Wallet "open Google Wallet" flow is a web fallback (download image + instructions), not a native pass.
- The Wallpaper "set directly" flow is a web fallback (download image + manual instructions), not a `SET_WALLPAPER` call.
- See [DECISIONS.md](DECISIONS.md) D1 and D2.

A future native wrapper is in the roadmap (see [BUSINESS.md](BUSINESS.md)) but is not in scope for v1.0.0.

## No automated tests yet

The test strategy is documented in [TESTING.md](TESTING.md) but no Vitest or Playwright tests are written. Verification is manual via `agent-browser` (iPhone 14 emulation), covering the full onboarding → home → studio → share → export flow, theme switching, and the fullscreen QR view. The only automated gates today are:

- `bun run lint` — ESLint
- `bun run docs:check` — documentation quality gate
- `bun run check:privacy` — privacy enforcement gate
- `bun run verify:all` — runs all three in sequence

Run `bun run verify:all` before every commit. See [BACKLOG.md](BACKLOG.md) B-30 for the test backlog item.

## Fonts Latin-only (Devanagari fallback)

The 7 caption fonts in `QR_FONTS` are Latin-only at runtime. They're loaded via `@fontsource/*` packages with the `latin` subset. Names in Devanagari (Hindi, Marathi, Nepali, Sanskrit) or other non-Latin scripts fall back to the system font of the same category (serif/sans/mono). This means:

- A Hindi name in the caption may render in a system serif while the rest of the QR uses Fraunces.
- A Hindi name in the centre "initials" element may render in a system font.
- The UI chrome (Fraunces, Instrument Sans, JetBrains Mono via `next/font/google`) has the same limitation — only `latin` subset is loaded.

See [BACKLOG.md](BACKLOG.md) B-18 for the fix (bundle a Devanagari font and detect script coverage).

## iOS wallpaper must be set manually

There is no public iOS API for an app to set the lock-screen wallpaper. Vello downloads a wallpaper image and shows the user the iOS Settings → Wallpaper flow. The user has to complete the setting themselves.

On some iPhone models, the wallpaper preview may not match the actual lock-screen rendering (Apple applies its own clock widget layer). Vello's wallpaper preview shows a safe zone that avoids the typical clock position, but cannot guarantee the QR will be unobstructed on every iOS version.

## Wallet Photo availability varies

Vello's Wallet screen exports a wallet-optimised image (1080×1350, pure light plate, large clean QR). Whether the user's device supports adding a photo pass varies:

- The Wallet Photo option first shipped on Pixel phones. It may not exist on Samsung, OnePlus, Xiaomi, or other Android skins.
- On iPhone, adding an image as a Wallet pass is not generally supported; the user must add the image to Photos and use whatever Apple provides (which varies by iOS version).

Vello does not use an official Wallet pass API because that requires a server and a developer account, breaking the privacy model. See [DECISIONS.md](DECISIONS.md) D6 and [USER_GUIDE.md](USER_GUIDE.md) → Wallet.

## No CSP meta tag yet

There is no Content-Security-Policy meta tag in `index.html`. The app makes zero runtime network requests regardless (the `check:privacy` script enforces this statically), but a CSP is recommended defence-in-depth. See [BACKLOG.md](BACKLOG.md) B-19.

## Static QR limitation (inherent)

The QR encodes the user's contact directly. When the user edits their details, the QR changes. Anything previously shared (printed, embedded in a wallpaper, sent as an image) keeps showing the old details. Vello surfaces this with a "QR changed" banner after edits that affect the payload, and re-sharing or re-exporting updates the recipient — but previously-shared artefacts are not updated.

This is an inherent trade-off of the no-server design. See [DECISIONS.md](DECISIONS.md) D5 and [PRIVACY.md](PRIVACY.md) → Static-QR limitation.

## Showcase and Help centre are SPA views, not routes

The spec called for `/showcase` and `/index-help` routes. The workspace constraint permits only one user-facing Next.js route (`/`). These features are implemented as additional views in the existing client-side view router (`src/components/vello/view-context.tsx`), reachable from Settings → Showcase and Settings → Help centre. Consequences:

- No deep-link to Showcase or Help; users always arrive via Settings.
- No browser back button support within these views (they replace the current view).
- A future route-permission lift could promote them to real routes; the view names already match candidate path segments.

See [DECISIONS.md](DECISIONS.md) D2.

## `appId` is a placeholder

`com.example.vello` is in `src/shared/brand.ts` as the `appId`, `androidPackage`, and `iosBundleId`. It must be replaced before any store submission. See [STORE.md](STORE.md) → Pre-submission checklist.

## QR preview re-render cost

The QR preview re-renders on every card or style change. `qr-render.ts` instantiates `qr-code-styling` and appends it to a hidden div for each render, which is heavier than ideal. On mid-range phones this is fast enough (< 50 ms per change at 600×600), but a busy studio session can cause GC pressure. The `scan-check` runs `jsQR` over the full canvas ImageData, which is also per-render. See [BACKLOG.md](BACKLOG.md) B-24 for the debounce and [TECHNICAL.md](TECHNICAL.md) → Performance notes.

## `db:*` scripts unused at runtime

`package.json` includes `db:push`, `db:generate`, `db:migrate`, `db:reset` (Prisma). These are present for compatibility with the surrounding workspace and operate on `prisma/schema.prisma`. The runtime app does not use Prisma — Vello stores data in IndexedDB only. The `docs:check` script explicitly skips `db:*` from the "every script must be mentioned" check. See [ARCHITECTURE.md](ARCHITECTURE.md) and [AUTOMATION.md](AUTOMATION.md).

## Trademark status unverified

The "Vello" name was chosen by elimination and a web search of obvious conflicts but no formal trademark search. See [BRAND.md](BRAND.md) → Trademark caveat.
