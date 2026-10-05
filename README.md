# Vello

> One card. One scan. Nothing leaves your phone.

Vello is a privacy-first digital business card web app. It generates a compact vCard QR code from your contact details, lets you style it beautifully (Instagram/Telegram-style), and export or share it — all 100% local. No server. No network. No accounts. No tracking.

Built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, IndexedDB (idb-keyval), qr-code-styling, jsQR, libphonenumber-js and next-themes. MIT licensed.

---

## The promise

- **No accounts. No servers. No analytics. No tracking. No cloud backup.**
- Everything lives in this browser's IndexedDB. Data leaves your phone only when *you* choose to share or export.
- The `check:privacy` script enforces this: app code in `src/` must not contain `fetch()`, `XMLHttpRequest`, `WebSocket`, `EventSource`, or `sendBeacon`.

## Quick start

```bash
bun install
bun run dev
```

Open http://localhost:3000. The dev server also tees its output to `dev.log` (see `package.json` → `scripts.dev`).

Build for production:

```bash
bun run build
bun run start        # serves the standalone server from .next/standalone
```

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | `next dev -p 3000`, output also written to `dev.log` |
| `build` | `next build` then copies `.next/static` and `public/` into `.next/standalone/` |
| `start` | Runs the standalone production server (`bun .next/standalone/server.js`) and tees to `server.log` |
| `lint` | `eslint .` across the whole repo |
| `docs:check` | Validates every required doc exists, is non-empty, all relative markdown links resolve, and every script in `package.json` is mentioned somewhere in docs |
| `check:privacy` | Greps `src/` and `scripts/` for network-call patterns (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`) and absolute URLs not on the allow-list |
| `verify:all` | Runs `lint` → `docs:check` → `check:privacy` in sequence |
| `db:push` | `prisma db push --accept-data-loss` |
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:reset` | `prisma migrate reset` |

> The `db:*` scripts are scaffolding for a Prisma schema that the runtime app does not use. Vello stores data in IndexedDB only; Prisma is unused at runtime and included for compatibility with the surrounding workspace. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Architecture summary

```
        ┌─────────────────────────────────────────────┐
        │                src/shared/                   │   brand.ts, types.ts, limits.ts
        │   (types, brand, limits — no dependencies)   │
        └──────────────────┬──────────────────────────┘
                           │
        ┌──────────────────▼──────────────────────────┐
        │                  src/lib/                    │   normalizers, vcard, qr, qr-render,
        │        (pure logic — no React, no DOM)       │   scan-check, photo, export, storage,
        │                                              │   style-presets, store (zustand), haptics
        └──────────────────┬──────────────────────────┘
                           │
        ┌──────────────────▼──────────────────────────┐
        │             src/components/                  │   view-context, app-shell, qr-preview,
        │       (React: screens, app shell, UI)        │   screens/{onboarding,home,editor,...}
        └──────────────────┬──────────────────────────┘
                           │
        ┌──────────────────▼──────────────────────────┐
        │                 src/app/                     │   layout.tsx (fonts + theme + sonner),
        │          (Next.js App Router shell)          │   page.tsx (loads store → AppShell),
        │                                              │   globals.css (design tokens)
        └─────────────────────────────────────────────┘
```

Data flow at runtime:

```
Card (typed) → buildCompactVcard → QR payload → qr-code-styling → canvas → PNG/SVG/story/print/wallet/.vcf export
                  ↓
            qrFingerprint (SHA-256, first 8 bytes hex) → "QR changed" banner detection
```

Storage adapter (IndexedDB via idb-keyval):

```
vello-db / vello-store  →  vello:card, vello:card.bak, vello:style, vello:settings,
                            vello:photo, vello:presets, vello:onboarded
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full layered walk-through and Mermaid diagram.

## Platform adaptation note

The original product spec targeted Vite + React + Capacitor for native iOS/Android. This build adapts Vello to a **Next.js 16 App Router** environment, which is what the surrounding workspace provides. Concretely:

- The native iOS/Android paths (Capacitor, SET_WALLPAPER, official Wallet pass API) are not available. The **Wallet** and **Wallpaper** features use web fallbacks (download an image + step-by-step instructions).
- The system constraint for this workspace permits only one user-facing Next.js route (`/`). The product's planned `/showcase` and `/index-help` routes are therefore implemented as **client-side SPA views** inside the existing view router (`src/components/vello/view-context.tsx`), reachable from **Settings → Showcase** and **Settings → Help centre**. They are not separate Next.js routes — they are React components switched on a single route.
- See [docs/DECISIONS.md](docs/DECISIONS.md) for the full decision log (D1 and D2 cover these adaptations).

This is honestly reflected in [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) and [docs/RELEASE.md](docs/RELEASE.md).

## Privacy enforcement

The privacy guarantee is enforced by the `check:privacy` script (`scripts/check-privacy.ts`). It walks every `.ts`/`.tsx`/`.js`/`.jsx` file under `src/` and `scripts/`, fails on any of:

- `fetch(`, `XMLHttpRequest`, `new WebSocket`, `navigator.sendBeacon`, `new EventSource`
- Absolute `http(s)://` URLs that are not on the allow-list (canonical social-URL builders, the author link, `localhost`, `example.com`)

Files exempt from the URL check: `scripts/check-privacy.ts` (it's the checker) and `src/lib/qr-render.ts` (only has `crossOrigin` comments). Run it with `bun run check:privacy`, or run everything at once with `bun run verify:all`.

## Testing note

There is **no automated test suite yet**. Verification is manual via `agent-browser` (iPhone 14 emulation), covering the full onboarding → home → studio → share → export flow plus theme switching and the fullscreen QR view. See [docs/TESTING.md](docs/TESTING.md) for the test strategy and the known gap.

## Hosting

Vello is a Next.js 16 app. Production runs as a standalone Node server (`bun .next/standalone/server.js`, see the `start` script). It can also be deployed as a normal Next.js app on Vercel, Netlify, or any Node host that can run `.next/standalone`.

For a fully static export, additional Next.js configuration would be required (`output: 'export'`) and is not currently enabled — see [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md).

## Limitations

- No native iOS/Android builds (workspace constraint). Wallet Photo and direct wallpaper setting use web fallbacks.
- No CSP meta tag in `index.html` yet — the app makes zero runtime network requests regardless, but a `default-src 'self'` policy is recommended before public launch (see [docs/BACKLOG.md](docs/BACKLOG.md)).
- No automated tests yet.
- Caption fonts are Latin-only (Devanagari falls back to a system font). See [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md).
- The `appId` (`com.example.vello`) is a placeholder and must be changed before any store submission. See [docs/STORE.md](docs/STORE.md).

## Documentation index

Full documentation lives in [`docs/`](docs/). The index is at [docs/README.md](docs/README.md).

| File | What it covers |
| --- | --- |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup, conventions, how to extend |
| [LICENSE](LICENSE) | MIT License |
| [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) | Dependency licences |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decision log |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, data flow, storage, build |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Module-by-module reference |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Card, QrStyle, Settings, PhotoData, presets |
| [docs/TESTING.md](docs/TESTING.md) | Test strategy and known gaps |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model for a local-only app |
| [docs/PRIVACY.md](docs/PRIVACY.md) | Plain-language privacy policy |
| [docs/RELEASE.md](docs/RELEASE.md) | Version bump, build, submission |
| [docs/DESIGN.md](docs/DESIGN.md) | Design rationale, tokens, screen inventory |
| [docs/BRAND.md](docs/BRAND.md) | Name, tagline, identifiers, voice |
| [docs/FIGMA_GUIDE.md](docs/FIGMA_GUIDE.md) | Designer import package |
| [docs/STORE.md](docs/STORE.md) | Store listing, data safety, privacy |
| [docs/AUTOMATION.md](docs/AUTOMATION.md) | Scheduled review cron, scripts |
| [docs/BACKLOG.md](docs/BACKLOG.md) | Prioritised improvements |
| [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) | Honest list of known limits |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Current status |
| [docs/BUSINESS.md](docs/BUSINESS.md) | Positioning, market, monetisation |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | End-user manual (mirrors in-app help) |
| [docs/FAQ.md](docs/FAQ.md) | Frequently asked questions |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and fixes |

## License

MIT — see [LICENSE](LICENSE).

---

Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/).
