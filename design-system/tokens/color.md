# Color Tokens

The HandOff palette. Five core colors, no more.

---

## Core palette (light mode)

| Token | Hex | Role |
|------|-----|------|
| `--bone` | `#F2EFE6` | Canvas background (aged paper / receipt) |
| `--ink` | `#0A0A0A` | Text primary + all borders |
| `--signal` | `#C6FF00` | Acid lime — primary brutalist accent |
| `--clay` | `#FF3B1F` | Vermilion — alert/warning accent |
| `--cobalt` | `#1B2BE0` | Cobalt — rare data accent |
| `--void` | `#08080A` | Deepest black (rare full-bleed) |

## Surface hierarchy (light)

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#F2EFE6` (bone) | App canvas |
| `--card` | `#FFFFFF` (pure white) | Cards, popovers — pops off bone |
| `--secondary` | `#E6E1D2` | Sunken bone (inset fields, inactive) |
| `--muted-foreground` | `#6B6557` | Secondary text, mono labels |
| `--border` | `#0A0A0A` (ink) | ALL borders are ink black |

## Dark mode ("night")

| Token | Value |
|-------|-------|
| `--bone` | `#08080A` (void) |
| `--ink` | `#EDEAE0` (bone text) |
| `--signal` | `#D4FF1A` (brightened lime) |
| `--clay` | `#FF4A2E` |
| `--background` | `#08080A` |
| `--card` | `#141416` |
| `--secondary` | `#1E1E22` |
| `--border` | `#EDEAE0` (ink flips to bone) |

## THE RULE (read twice)

> `--ink` is black in light mode, bone (near-white) in dark mode.
>
> **On any lime/yellow surface, NEVER use `text-ink` or `var(--ink)`.**
> Use the fixed `text-black` (`#000`) so it stays black in both themes.

### Where this applies
- `bg-signal` → `text-black`
- `brut-signal` → `color: #0A0A0A` (hardcoded in CSS)
- `focus:bg-signal` on inputs → `focus:text-black`
- Active nav tab (`bg-signal`) → `text-black`
- Section label bars → `text-black`

## Usage in Tailwind

```tsx
// Primary CTA
<button className="bg-signal text-black border-2 border-ink shadow-[5px_5px_0_0_var(--ink)]">

// Card
<div className="brut-lg">  {/* .brut-lg = border-3 ink + shadow + radius-xl + bg-card */}

// Section label (lime bar with black text)
<div className="border-2 border-ink bg-signal px-2 py-1">
  <span className="text-black">On your card</span>
</div>
```

## What NOT to do

- ❌ Indigo, blue, purple as primary (the palette is bone/ink/lime/clay/cobalt only)
- ❌ White text on lime (use black)
- ❌ Gradient buttons (solid fills only)
- ❌ Glassmorphism / backdrop-blur on primary surfaces (was removed for good reason)
- ❌ Neon glows (hard offset shadows, not blurred glows)
