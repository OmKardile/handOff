# Figma guide

## Honest statement

**No `.fig` file was created for Vello.** The design system lives entirely in code: design tokens in `src/app/globals.css`, component primitives in `src/components/ui/` (shadcn/ui), and the 17 QR presets in `src/lib/style-presets.ts`. There was no parallel design track in Figma.

This file packages what a designer *would* need to import Vello into Figma from the source of truth. If you create a `.fig` from this package, please commit it to `design/vello.fig` and update this file with the import path.

## What's in the package

A designer can reconstruct Vello in Figma from four sources in this repo:

1. **Tokens** — `src/app/globals.css` (the canonical source).
2. **Brand SVGs** — `public/icon.svg`, `public/logo.svg`, the `VelloMark` component in `src/app/page.tsx`.
3. **Screen inventory** — see [DESIGN.md](DESIGN.md) for the table of screens and their focal points.
4. **Component naming** — see `COMPONENTS.md` below.

## `tokens.json` (Style Dictionary compatible)

The tokens below are a JSON representation of `src/app/globals.css`. Drop into [Style Dictionary](https://amzn.github.io/style-dictionary/) or a Figma Tokens plugin to populate variables.

```json
{
  "color": {
    "paper": { "value": "#F6F3EE", "dark": "#161619" },
    "ink": { "value": "#161619", "dark": "#ECE7DE" },
    "clay": { "value": "#B0533A", "dark": "#D17A5C" },
    "clay_soft": { "value": "#D9A48F", "dark": "#8A4A35" },
    "background": { "value": "#F6F3EE", "dark": "#141417" },
    "foreground": { "value": "#1A1A1F", "dark": "#ECE7DE" },
    "card": { "value": "#FFFEFB", "dark": "#1D1D21" },
    "card_foreground": { "value": "#1A1A1F", "dark": "#ECE7DE" },
    "popover": { "value": "#FFFEFB", "dark": "#1D1D21" },
    "popover_foreground": { "value": "#1A1A1F", "dark": "#ECE7DE" },
    "primary": { "value": "#1A1A1F", "dark": "#ECE7DE" },
    "primary_foreground": { "value": "#F6F3EE", "dark": "#141417" },
    "secondary": { "value": "#EFEAE1", "dark": "#26262B" },
    "secondary_foreground": { "value": "#1A1A1F", "dark": "#ECE7DE" },
    "muted": { "value": "#EFEAE1", "dark": "#26262B" },
    "muted_foreground": { "value": "#6B655C", "dark": "#9B958A" },
    "accent": { "value": "#B0533A", "dark": "#D17A5C" },
    "accent_foreground": { "value": "#FFFEFB", "dark": "#141417" },
    "destructive": { "value": "#C0392B", "dark": "#E57373" },
    "border": { "value": "#E0D9CD", "dark": "#2E2E34" },
    "input": { "value": "#E8E2D6", "dark": "#33333A" },
    "ring": { "value": "#B0533A", "dark": "#D17A5C" }
  },
  "font": {
    "serif": { "value": "Fraunces, ui-serif, Georgia, serif" },
    "sans": { "value": "Instrument Sans, ui-sans-serif, system-ui, sans-serif" },
    "mono": { "value": "JetBrains Mono, ui-monospace, monospace" }
  },
  "radius": {
    "base": { "value": "0.75rem" },
    "sm": { "value": "0.5rem" },
    "md": { "value": "0.625rem" },
    "lg": { "value": "0.75rem" },
    "xl": { "value": "1rem" }
  },
  "spacing": {
    "editorial_container_max_width": { "value": "28rem" }
  }
}
```

## Brand SVGs

### Wordmark — `VelloMark` (40×40)

```svg
<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" rx="10" fill="#161619" />
  <path d="M13 12.5L20 27l7-14.5" stroke="#F6F3EE" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

In dark mode the `rect` fill is `#ECE7DE` and the `path` stroke is `#161619`.

### Tagline

Set in Fraunces 500, letter-spacing -0.02em. Single line. Always clay (`--clay`) or ink (`--ink`), never the chart palette.

### Colour swatches (the 6 swatch rows from `style-presets.ts`)

| Row | Colours |
| --- | --- |
| Neutrals | `#16161A`, `#2B2B2B`, `#4A4A4A`, `#6B655C`, `#9B958A`, `#CDC7BC` |
| Earth | `#8A3B22`, `#B0533A`, `#C4572F`, `#8A6A1F`, `#C8A24A`, `#3A332B` |
| Jewel | `#1738A8`, `#0E1B33`, `#1F3A2E`, `#3B1F4A`, `#5B2A3A`, `#123C4A` |
| Pastels | `#E9E1D3`, `#EEF6F8`, `#FFF5F4`, `#FAF3F6`, `#F2F4EC`, `#FBF4EC` |
| Brights | `#B53A12`, `#1F7A8C`, `#7A2E5E`, `#B87400`, `#1B8FD6`, `#E1306C` |
| Duotone | `#0E1B33`, `#C8A24A`, `#1F3A2E`, `#C4572F`, `#1738A8`, `#1B8FD6` |

## Screen inventory (for the page list in Figma)

| Page | View name | Notes |
| --- | --- | --- |
| Onboarding — Welcome | `onboarding` (step 1) | Wordmark + tagline + CTA |
| Onboarding — Identity | `onboarding` (step 2) | First/last name, title, company |
| Onboarding — Contact | `onboarding` (step 3) | Phone, email, website, location, socials, photo |
| Onboarding — Finish | `onboarding` (step 4) | QR preview + finish CTA |
| Home | `home` | QR hero, name/title/company, 6 actions |
| Editor | `editor` | Collapsible sections + size meter + sticky save bar |
| Fullscreen QR | `fullscreen-qr` | Large QR centred, wake lock |
| Studio — Presets | `studio` (tab 1) | 17 preset cards |
| Studio — Shape / Colour / Centre / Frame / Caption | `studio` (tabs 2–6) | Tabbed controls + live preview + scan indicator |
| Share | `share` | 7 export options |
| Wallet | `wallet` | Wallet image preview + guide |
| Wallpaper | `wallpaper` | Phone preview + 4 backdrops |
| Settings | `settings` | Grouped list |
| Privacy | `privacy` | 6 fact cards + promise |
| Backup | `backup` | Export / Restore / Erase |
| Showcase | `showcase` | Grid of all 17 presets |
| Help centre | `help` | Categorised guides + search |
| Help guide | `help-guide` | One guide with steps |

## `COMPONENTS.md` — naming conventions

When reconstructing Vello in Figma, use these component names so they match the code:

- `Card/Surface` — `bg-card text-card-foreground` (radius `--radius-lg`, border `--border`)
- `Card/Muted` — same as `Card/Surface` but `bg-muted`
- `Button/Primary` — `bg-primary text-primary-foreground`, `active:scale-[0.98]`, radius `--radius-md`
- `Button/Secondary` — `bg-secondary text-secondary-foreground`
- `Button/Accent` — `bg-accent text-accent-foreground`
- `Button/Destructive` — `bg-destructive text-white`
- `Button/Ghost` — transparent, `hover:bg-muted`
- `Input/Text` — `border-input`, radius `--radius-md`
- `Tab/BottomBar` — `Card`, `Studio`, `Settings` icons + labels
- `Tabs/Studio` — Presets, Shape, Colour, Centre, Frame, Caption
- `QR/PresetCard` — preset name + small QR preview, 4-up grid
- `QR/Preview` — live canvas, 4:3 aspect, plate radius `--radius-xl`
- `QR/ScanIndicator` — green/amber/red dot + label
- `List/Row` — Settings list row, hairline border-bottom
- `Meter/SizeBar` — green/amber/red bar with byte count

## Step-by-step import guide

1. Create a new Figma file "Vello".
2. Install the [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978) plugin (or use Figma's native Variables).
3. Import the `tokens.json` above as a JSON file. Map `color.*` to color variables, `font.*` to text styles, `radius.*` to corner-radius variables, `spacing.*` to spacing variables. Create a light mode and a dark mode collection.
4. Open `public/icon.svg` in a text editor, paste into Figma as SVG. Save as a component `Brand/VelloMark`. Build `Brand/Wordmark` separately (text component, Fraunces 500, -0.02em tracking).
5. Create the page list above. For each page, drag in the components from `COMPONENTS.md` and lay out per the screen-inventory table in [DESIGN.md](DESIGN.md).
6. Reconstruct the 17 presets as component variants on `QR/PresetCard` (see [TECHNICAL.md](TECHNICAL.md) for the full preset list with hex values).
7. When done, save the file to `design/vello.fig` and update this guide.

## What's not in this package

- No Figma styles file (`.tokens.json` is provided above instead).
- No font binary. Fonts come from `next/font/google` and `@fontsource/*`; install Figma's font picker for Fraunces, Instrument Sans, JetBrains Mono, Cormorant Garamond, DM Serif Display, Newsreader, Space Grotesk.
- No icon set beyond the Vello mark. The app uses `lucide-react` for all functional icons — install the [Lucide Figma plugin](https://www.figma.com/community/plugin/1067290322686193040) to access the same set.
- No motion specs. Default motion is minimal; see [DESIGN.md](DESIGN.md) → Motion.
