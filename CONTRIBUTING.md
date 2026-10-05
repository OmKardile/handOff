# Contributing to Vello

Thanks for considering a contribution. Vello is a privacy-first project — every change must keep the runtime zero-network guarantee. Read this file in full before opening a PR.

## Project layout

```
src/
  shared/      brand.ts, types.ts, limits.ts         — no dependencies, pure types & constants
  lib/         normalizers, vcard, qr, qr-render,
               scan-check, photo, export, storage,
               style-presets, store, haptics, utils   — pure logic (some browser APIs)
  components/
    ui/                                                — shadcn/ui primitives
    vello/
      view-context.tsx, app-shell.tsx, qr-preview.tsx
      screens/                                        — one file per screen
  app/
    layout.tsx, page.tsx, globals.css                 — Next.js App Router shell
scripts/
  docs-check.ts, check-privacy.ts
docs/                                                 — documentation set
```

## Setup

Requirements: Node 20+, Bun (recommended), a modern browser.

```bash
git clone <repo-url>
cd vello
bun install
bun run dev            # http://localhost:3000
```

## Branch and commit conventions

- Branch from `main`. Name branches `feat/<short>`, `fix/<short>`, `docs/<short>`, or `chore/<short>`.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`. Scope optional, e.g. `feat(studio): add surprise-me guard`.
- Keep commits atomic. One logical change per commit.
- PRs should be small and focused. If a change touches more than ~400 lines, split it.

## Code style

- **TypeScript everywhere** (strict). Avoid `any`; prefer `unknown` + narrowing.
- **File names** are `kebab-case.ts` / `kebab-case.tsx`. **React components** are `PascalCase`. **Hooks** are `useThing`. **Constants** are `UPPER_SNAKE`.
- No default exports for components — named exports only (matches the existing screens).
- No `dangerouslySetInnerHTML` anywhere. We render user input as plain text.
- No `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, or `sendBeacon` in app code. The `check:privacy` script will fail CI.
- No absolute `http(s)://` URLs in source except the allow-list (the author link, `localhost`, `example.com`, and the canonical social-URL hosts used by `src/lib/normalizers.ts`).
- Prefer pure functions in `src/lib/`. DOM-coupled code (canvas, IndexedDB) goes in clearly named modules and is allowed.
- Use the Tailwind tokens from `globals.css` (`bg-background`, `text-foreground`, `text-clay`, `font-serif`, etc.). Don't introduce new colours outside `--chart-*` or new preset colours outside `style-presets.ts`.

## Running the checks

Before pushing, always run:

```bash
bun run lint
bun run docs:check
bun run check:privacy
```

Or, in one command:

```bash
bun run verify:all
```

- `lint` runs ESLint across the repo.
- `docs:check` enforces that every required doc exists and is non-empty, that all relative markdown links resolve, and that every `package.json` script is mentioned in some doc.
- `check:privacy` walks `src/` and `scripts/` for network patterns and non-allowlisted URLs.

## How to add a QR style preset

Edit `src/lib/style-presets.ts`:

1. Add an entry to the `STYLE_PRESETS` array in the right group (`quiet` | `warm` | `cool` | `social`). Each entry has `id`, `name`, `group`, `captionFontLabel`, and a full `QrStyle` object.
2. Spread `PLAIN_STYLE` as the base, then override only what changes: `presetId`, `moduleShape`, `eyeShape`, colours, optional `moduleGradient`/`backgroundGradient`, `captionFont`.
3. If you want the preset to have a centre element by default, set `centerType`, `centerSize`, `centerShape`, `centerRing`.
4. Use the existing swatch palette (`SWATCH_ROWS`) where possible. If you genuinely need a new colour, add it to the appropriate swatch row first.
5. Verify the preset passes the scan check at default contents (Name + Title + Company + Phone + Email + Website). If `evaluateScan()` reports red, raise ECC to `H` or reduce the centre size.

## How to add a caption font

1. Install the `@fontsource/<family>` package (e.g. `bun add @fontsource/cormorant-garamond`).
2. Add an entry to `QR_FONTS` in `src/lib/style-presets.ts`: `{ family: "Cormorant Garamond", label: "Cormorant", category: "Serif" }`.
3. Import the font in `src/app/layout.tsx` if it's used in the UI; otherwise the `@fontsource` import is sufficient for canvas rendering (loaded via `document.fonts.load(...)` in `qr-render.ts`).
4. If the font is variable, prefer the `-variable` package and load specific weights.

## How to add a screen

1. Create `src/components/vello/screens/<name>.tsx` with a named export (e.g. `export function HelpScreen()`).
2. Add the view name to the `View` union in `src/components/vello/view-context.tsx`.
3. Add a `case` to the `switch` in `src/app/page.tsx`'s `Screens` component to render your screen for that view.
4. Wire up navigation: `useView().navigate("<name>")` from somewhere (e.g. a Settings row).
5. Update the `tab` mapping in `view-context.tsx` if your screen belongs to the Card, Studio, or Settings tab.
6. Don't add a new Next.js route. The system constraint requires a single user-facing route (`/`). All screens are SPA views on that one route.

## How to add a test

There is no test suite yet (see [docs/TESTING.md](docs/TESTING.md)). When adding one, the convention will be:

- Unit tests live next to the module: `src/lib/vcard.test.ts`. Use Vitest.
- Pure logic (`normalizers`, `vcard`, `qr`, `storage` round-trip) is the priority.
- E2E tests use Playwright, with the dev server started on port 3000. Cover the onboarding → home → studio → share → export flow.
- Add a `test` script to `package.json` and mention it in [docs/TESTING.md](docs/TESTING.md) and [README.md](README.md) so `docs:check` stays happy.

## Reporting issues

Open an issue with:

1. What you expected, what happened, the exact steps to reproduce.
2. Browser, OS, and whether Vello is installed as a PWA.
3. A screenshot if visual.
4. The output of `bun run verify:all` if you can run it locally.

## Licensing

By contributing, you agree your contributions are licensed under the project's [MIT License](LICENSE).

---

Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/).
