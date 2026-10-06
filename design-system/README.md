# HandOff Design System

> The single source of truth for HandOff's visual language and interaction patterns.
> Encoding the brutalist "DEAD DROP" aesthetic so any contributor can build on-brand screens.

---

## What this is

This directory documents and codifies the HandOff design system — the palette, typography,
spacing, components, and patterns that make the app look and feel like HandOff.

It is **separate from the app source** (`src/`) so it can be consumed by:
- Designers (as reference)
- New contributors (as onboarding)
- AI agents (as context for building on-brand UI)
- Future ports (web → native → print)

## Structure

```
design-system/
├── README.md              ← you are here (start here)
├── tokens/                ← raw values (color, type, spacing, radius, motion, elevation)
│   ├── color.md
│   ├── typography.md
│   ├── spacing.md
│   ├── radius.md
│   ├── motion.md
│   └── elevation.md
├── primitives/            ← building blocks (atoms)
│   ├── surfaces.md         (.brut, .brut-lg, .brut-sm, .brut-signal, .brut-ink)
│   ├── borders.md
│   ├── field-label.md
│   └── textures.md         (field-grid, scanlines, grain, tape)
├── components/             ← composed UI (molecules)
│   ├── button.md
│   ├── input.md
│   ├── card.md
│   ├── nav-bar.md
│   ├── screen-header.md
│   ├── scan-badge.md
│   └── qr-preview.md
├── patterns/               ← screen-level conventions
│   ├── layout.md
│   ├── titles.md
│   ├── color-on-lime.md
│   └── gestures.md
└── DESIGN-PRINCIPLES.md   ← the philosophy / guardrails
```

## Quick reference

| Token | Value |
|-------|-------|
| Bone (canvas) | `#F2EFE6` |
| Ink (text/border) | `#0A0A0A` |
| Signal (lime accent) | `#C6FF00` |
| Clay (vermilion alert) | `#FF3B1F` |
| Cobalt (data accent) | `#1B2BE0` |
| Display font | Anton (heavy condensed uppercase) |
| Body font | Space Grotesk |
| Mono font | JetBrains Mono |
| Card radius | `28px` (--radius-xl) |
| QR plate radius | `28px` (matches card) |
| Border | `2px solid ink` |
| Card shadow | `4px 4px 0 0 ink` (hard, no blur) |
| Primary action | `bg-signal text-black` + hard shadow |

## The one rule that matters most

> **Black text on yellow. Always.**
>
> `--ink` flips to bone in dark mode. So on any lime/yellow surface, NEVER use `text-ink`
> or `var(--ink)` — use the fixed `text-black` (#000). This is the most common bug.

---

See `DESIGN-PRINCIPLES.md` for the full philosophy, then dive into `tokens/`.
