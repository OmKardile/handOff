# Third-party licences

Vello is MIT-licensed. The dependencies below are bundled into the build. Their licence texts are summarised here; the canonical text for each lives in the package's `LICENSE` file under `node_modules/` at install time.

## Runtime dependencies

| Package | Licence | Notes |
| --- | --- | --- |
| `next` | MIT | Next.js 16 framework |
| `react`, `react-dom` | MIT | UI runtime |
| `tailwindcss`, `@tailwindcss/postcss`, `tailwind-merge`, `tailwindcss-animate`, `tw-animate-css` | MIT | Styling |
| shadcn/ui primitives (Radix UI packages, `class-variance-authority`, `clsx`, `cmdk`) | MIT | Component layer |
| `zustand` | MIT | State management |
| `idb-keyval` | Apache-2.0 | IndexedDB wrapper used by `src/lib/storage.ts` |
| `qr-code-styling` | MIT | Styled QR rendering used by `src/lib/qr-render.ts` |
| `qrcode` (and `@types/qrcode`) | MIT | Used by build tooling |
| `jsqr` | Apache-2.0 | QR decoder used by `src/lib/scan-check.ts` |
| `libphonenumber-js` | MIT | Phone parsing used by `src/lib/normalizers.ts` |
| `zod` | MIT | Schema validation (available; used ad-hoc in input validation) |
| `next-themes` | MIT | Theme switching |
| `next-intl` | MIT | i18n scaffolding (English-only in this build) |
| `lucide-react` | ISC | Icon set |
| `sonner` | MIT | Toast notifications |
| `framer-motion` | MIT | Motion (used in screen transitions) |
| `vaul` | MIT | Drawer component |
| `embla-carousel-react` | MIT | Carousel |
| `react-hook-form`, `@hookform/resolvers` | MIT | Forms |
| `react-markdown`, `react-syntax-highlighter` | MIT | Markdown rendering for in-app help |
| `@mdxeditor/editor` | MIT | Editor (help-authoring scaffolding) |
| `date-fns` | MIT | Date utilities |
| `recharts` | MIT | Charts (unused in app screens; available) |
| `uuid` | MIT | UUID generation |
| `@dnd-kit/*` | MIT | Drag-and-drop (used in the editor) |
| `@reactuses/core`, `react-resizable-panels`, `react-day-picker`, `input-otp`, `@tanstack/react-query`, `@tanstack/react-table` | MIT | UI utilities |
| `@radix-ui/*` | MIT | Radix primitives backing shadcn/ui |
| `class-variance-authority` | MIT | Variant styling |
| `sharp` | Apache-2.0 | Image processing (build-time only) |
| `prisma`, `@prisma/client` | Apache-2.0 | Included for workspace compatibility; unused at runtime (Vello stores data in IndexedDB only). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). |
| `next-auth` | MIT | Included for workspace compatibility; unused at runtime. |
| `z-ai-web-dev-sdk` | MIT | Available for tooling; not used by the runtime app. |

### Self-hosted fonts

UI fonts are loaded via `next/font/google` and served from the same origin:

- **Fraunces** (serif, display) — `next/font/google`, SIL Open Font Licence 1.1
- **Instrument Sans** (sans) — `next/font/google`, SIL Open Font Licence 1.1
- **JetBrains Mono** (mono) — `next/font/google`, SIL Open Font Licence 1.1

QR caption fonts used by the style engine are bundled via `@fontsource/*`:

- `@fontsource-variable/fraunces` — OFL 1.1
- `@fontsource-variable/instrument-sans` — OFL 1.1
- `@fontsource/cormorant-garamond` — OFL 1.1
- `@fontsource/dm-serif-display` — OFL 1.1
- `@fontsource/jetbrains-mono` — OFL 1.1
- `@fontsource/newsreader` — OFL 1.1
- `@fontsource/space-grotesk` — OFL 1.1

All fonts are **self-hosted**. No request to `fonts.googleapis.com` or `fonts.gstatic.com` is made at runtime. (The `next/font/google` package fetches font files at build time and inlines them; the runtime output is served from the same origin as the app.)

## SIL Open Font Licence 1.1 — summary

The licensed fonts and any associated derivatives, in source or binary form, may be used, studied, modified, embedded, redistributed and sold without restriction, provided that:

1. The copyright notices and licence terms are preserved in any redistribution of the font files themselves;
2. Subsets of the font or modified versions may be bundled, redistributed and sold with any software, provided that each copy contains the above copyright notice and this licence;
3. The fonts, when modified, must be redistributed under the OFL with the new name, not the reserved font name(s).

The full text is at <https://openfontlicense.org/open-font-license-version-1-1/>.

## Apache-2.0 — summary

Apache-2.0 permits use, modification and redistribution subject to: preserving copyright and licence notices, stating significant changes, and including the `NOTICE` file contents in derivative works. It also grants an explicit patent grant from contributors to users.

## ISC — summary

ISC is a permissive licence equivalent in effect to MIT: use, copy, modify, distribute, with the copyright notice and licence text preserved.

## Verification

To confirm what's bundled at runtime, run:

```bash
bun run build
# inspect .next/standalone/ for the server bundle and .next/static for client assets
```

The `check:privacy` script does not validate licences; it validates that the runtime makes no network calls. See [docs/PRIVACY.md](docs/PRIVACY.md) and [docs/SECURITY.md](docs/SECURITY.md).

---

Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/).
