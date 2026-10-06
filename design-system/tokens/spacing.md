# Spacing & Layout Tokens

---

## Layout shell

```
┌─────────────────────────────────┐
│ <main> (the ONLY scroll area)  │  ← no-scrollbar (hidden), overflow-y-auto
│                                 │
│   max-w-md (28rem / 448px)      │  ← centered content column
│   px-5 (20px horizontal)        │
│                                 │
│   [ScreenHeader / content]      │
│                                 │
│                                 │
│                      pb-32      │  ← bottom padding for nav clearance
└─────────────────────────────────┘
        [bottom nav, fixed]       ← pb-[max(env(safe-area-inset-bottom), 10px)]
```

- App shell: `h-[100dvh] flex flex-col overflow-hidden`
- Main scroll: `no-scrollbar overflow-y-auto overscroll-y-contain`
- Content column: `mx-auto max-w-md px-5`
- Bottom nav clearance: `pb-32` on main content

## Safe areas

| Token | Value | Use |
|-------|-------|-----|
| `.pt-safe` | `max(env(safe-area-inset-top, 0px), 0px)` | Generic top safe area |
| Title padding | `max(env(safe-area-inset-top, 0px), 44px)` | All screen titles (44px floor) |
| Bottom nav | `pb-[max(env(safe-area-inset-bottom), 10px)]` | Nav container |

## Spacing scale (Tailwind defaults, but these are the ones we use)

| Token | Value | Typical use |
|-------|-------|-------------|
| `gap-1` | 4px | Tight icon+text |
| `gap-1.5` | 6px | Icon + label |
| `gap-2` | 8px | Grid cell gap |
| `gap-2.5` | 10px | Action button grid |
| `gap-3` | 12px | Card content |
| `gap-4` | 16px | Section spacing |
| `gap-6` | 24px | Major section breaks |
| `px-4` | 16px | Card internal padding |
| `px-5` | 20px | Screen edge padding |
| `px-6` | 24px | Hero card padding |
| `py-2.5` | 10px | Row height |
| `py-4` | 16px | Section vertical |
| `pt-4` | 16px | Post-header top |
| `pb-28` | 112px | Screen bottom (wallpaper) |
| `pb-32` | 128px | Screen bottom (with nav) |
| `pb-36` | 144px | Screen bottom (settings) |

## Touch targets

- Minimum: `44px` (iOS HIG) — buttons use `h-9 w-9` (36px) for icon buttons,
  `py-4` (56px effective) for primary CTAs.
- Nav tabs: `py-2.5` + icon `h-[18px]` → ~44px tall.
- Tap highlight: `.no-tap` removes the iOS grey flash.

## Grid

Content uses `grid-cols-3` for action grids, `grid-cols-4` for preset thumbnail grids.

---

## What NOT to do

- ❌ Custom max-widths beyond `max-w-md` (keep the mobile column)
- ❌ Visible scrollbars on `<main>` (use `.no-scrollbar`)
- ❌ Content touching the screen edge (always `px-5` minimum)
- ❌ Inconsistent bottom padding (use `pb-32` for nav clearance)
