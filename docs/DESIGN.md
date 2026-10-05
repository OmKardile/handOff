# Design

The design rationale, tokens, screen inventory, and reference patterns behind Vello.

## Rationale

Vello's design language is **editorial, not SaaS**. The reference world is printed stationery, gallery catalogues, and quiet field guides — not dashboards. Three principles follow from that:

1. **One focal element per screen.** The QR is the hero; everything else supports it.
2. **Warm, not neutral.** The default palette is paper and ink with a clay accent — never the indigo/slate default of most web apps.
3. **Type does the heavy lifting.** Fraunces (variable serif) for display, Instrument Sans (variable) for UI, JetBrains Mono for monospace. No icon wallpaper, no gradient buttons, no glassmorphism.

## Token tables

All tokens are CSS custom properties defined in [`src/app/globals.css`](../src/app/globals.css). The `:root` block is the light theme; `.dark` overrides.

### Colour

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--paper` | `#F6F3EE` | `#161619` | Warm white surface (the conceptual "paper") |
| `--ink` | `#161619` | `#ECE7DE` | Deep charcoal, slightly warm |
| `--clay` | `#B0533A` | `#D17A5C` | Burnt sienna accent |
| `--clay-soft` | `#D9A48F` | `#8A4A35` | Tint of clay for backgrounds |
| `--background` | `#F6F3EE` | `#141417` | App background |
| `--foreground` | `#1A1A1F` | `#ECE7DE` | Default text |
| `--card` | `#FFFEFB` | `#1D1D21` | Card surface |
| `--card-foreground` | `#1A1A1F` | `#ECE7DE` | Text on card |
| `--popover` | `#FFFEFB` | `#1D1D21` | Popover surface |
| `--popover-foreground` | `#1A1A1F` | `#ECE7DE` | Text on popover |
| `--primary` | `#1A1A1F` | `#ECE7DE` | Primary button |
| `--primary-foreground` | `#F6F3EE` | `#141417` | Text on primary |
| `--secondary` | `#EFEAE1` | `#26262B` | Secondary surface |
| `--secondary-foreground` | `#1A1A1F` | `#ECE7DE` | Text on secondary |
| `--muted` | `#EFEAE1` | `#26262B` | Muted surface |
| `--muted-foreground` | `#6B655C` | `#9B958A` | Muted text |
| `--accent` | `#B0533A` | `#D17A5C` | Accent (matches clay) |
| `--accent-foreground` | `#FFFEFB` | `#141417` | Text on accent |
| `--destructive` | `#C0392B` | `#E57373` | Destructive action |
| `--border` | `#E0D9CD` | `#2E2E34` | Hairline border |
| `--input` | `#E8E2D6` | `#33333A` | Input border |
| `--ring` | `#B0533A` | `#D17A5C` | Focus ring |

Chart palette (used by recharts where applicable; not used by app chrome):

| Token | Light | Dark |
| --- | --- | --- |
| `--chart-1` | `#B0533A` (clay) | `#D17A5C` |
| `--chart-2` | `#1F3A2E` (pine) | `#4F7A5A` |
| `--chart-3` | `#C8A24A` (gold) | `#C8A24A` |
| `--chart-4` | `#2B2B2B` (graphite) | `#CDCCCA` |
| `--chart-5` | `#8A6A1F` (umber) | `#B87400` |

### Type

| Token | Family | Notes |
| --- | --- | --- |
| `--font-serif` | Fraunces (variable, `next/font/google`) | Display & headings. Axes: `opsz`, `SOFT`, `WONK`. Subsets: latin. |
| `--font-sans` | Instrument Sans (variable, `next/font/google`) | UI text, body |
| `--font-mono` | JetBrains Mono (`next/font/google`) | Code, monospace UI |
| `--font-display` | Fraunces | Alias for serif; letter-spacing -0.02em via `.font-display` |

QR caption fonts (`QR_FONTS` in `style-presets.ts`): Fraunces, Newsreader, DM Serif Display, Cormorant Garamond (Serif); Instrument Sans, Space Grotesk (Sans); JetBrains Mono (Mono). All self-hosted via `@fontsource/*`.

### Spacing & radius

| Token | Value | Notes |
| --- | --- | --- |
| `--radius` | `0.75rem` (12 px) | Base radius; derived `--radius-sm/md/lg/xl` = `calc(var(--radius) ± N)` |
| `--radius-sm` | `0.5rem` (8 px) | Small controls |
| `--radius-md` | `0.625rem` (10 px) | Medium controls |
| `--radius-lg` | `0.75rem` (12 px) | Cards |
| `--radius-xl` | `1rem` (16 px) | Large plates, QR plate default |

Spacing uses Tailwind's default scale (`p-2` = 8 px, `p-3` = 12 px, etc.). The editorial container is `.container-editorial { max-width: 28rem; margin-inline: auto; }`.

Safe-area: `.pb-safe` and `.pt-safe` add `env(safe-area-inset-*)` for notched devices.

### Motion

Reduced-motion is honoured globally via the `prefers-reduced-motion` media query (animation/transition durations are forced to `0.01ms`). Default motion is intentionally minimal — `transition-colors`, `transition-opacity`, `active:scale-[0.98]` on buttons. Framer Motion is available for screen transitions; not all screens use it yet.

## Screen inventory

Each screen has a focal point and a primary action.

| Screen | View name | Focal point | Primary action |
| --- | --- | --- | --- |
| Onboarding | `onboarding` | Welcome wordmark + step progress | "Create your card" |
| Home | `home` | The styled QR hero | "Share" |
| Editor | `editor` | Collapsible grouped sections + size meter | "Save changes" |
| Fullscreen QR | `fullscreen-qr` | Large, bright QR centred | Close (Escape / tap) |
| Studio | `studio` | 17 preset cards + live preview | Apply preset / Save custom |
| Share | `share` | 7 export options in a list | Trigger an export |
| Wallet | `wallet` | Wallet-optimised QR preview + guide | "Save wallet image" |
| Wallpaper | `wallpaper` | Phone-shaped preview + 4 backdrops | "Download wallpaper" |
| Settings | `settings` | Grouped list (theme/haptics/storage/privacy/erase) | Theme switch / navigate |
| Privacy | `privacy` | 6 fact cards + promise | (read-only) |
| Backup | `backup` | Export / Restore / Erase buttons | "Export backup" |
| Showcase | `showcase` | Grid of all 17 presets at large size | Tap to apply (jump to Studio) |
| Help centre | `help` | Categorised guides + search | Tap a guide |
| Help guide | `help-guide` | One guide with steps | (read-only) |

The bottom tab bar exposes three of these as tabs: **Card** (Home, Editor, Fullscreen QR, Share, Wallet, Wallpaper), **Studio** (Studio, Fonts), **Settings** (Settings, Privacy, Backup, Showcase, Help, Help-guide). Onboarding hides the tab bar.

## Reference patterns

Vello borrows concrete UI patterns from these products:

- **Instagram's QR presets** — the idea of mood-grouped presets with a live preview and a "tap to apply" interaction. Vello's 4 groups (Quiet/Warm/Cool/Social) echo Instagram's tone-grouped preset rows.
- **Telegram's sticker editor** — the tabbed control panel below the preview (Shape / Colour / Centre / Frame / Caption). Vello's Studio uses 5 tabs in the same pattern.
- **Blinq's onboarding** — a 3-step wizard (identity → contact → photo) with a live QR preview that updates as the user types. Vello's onboarding follows this structure.

These are pattern references, not visual copies. Vello's palette, typography, and screen compositions are distinct.

## What's intentionally absent

- No gradient buttons. Buttons are solid ink with `active:scale-[0.98]`.
- No drop shadows on cards. Hairline borders (`--border`) instead.
- No glassmorphism / `backdrop-blur` on chrome.
- No icon wallpaper. Icons are functional (lucide-react) and sparing.
- No splash animation on app launch beyond a simple loading bar.
- No empty-state illustrations yet (see [BACKLOG.md](BACKLOG.md) — designed illustrations within the editorial language are planned).

## Self-hosted fonts

All fonts are served from the app's own origin. `next/font/google` fetches the font files at build time and inlines them; at runtime the app makes zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`. The QR caption fonts come from `@fontsource/*` packages and are bundled into the static assets. See [THIRD_PARTY_LICENSES.md](../THIRD_PARTY_LICENSES.md).
