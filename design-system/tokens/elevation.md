# Elevation Tokens

HandOff shadows are **hard offsets, zero blur**. No soft drop shadows.

---

## Scale

| Token | Value | Use |
|-------|-------|-----|
| `--elevation-subtle` | `2px 2px 0 0 var(--ink)` | Chips, small buttons |
| `--elevation-card` | `4px 4px 0 0 var(--ink)` | Standard cards |
| `--elevation-sheet` | `6px 6px 0 0 var(--ink)` | Hero cards, modals |
| `--elevation-floating` | `8px 8px 0 0 var(--ink)` | Floating nav, dock |

## Usage

All shadows use `var(--ink)` as the shadow color (black in light, bone in dark).

```tsx
// Hero card
<div className="border-3 border-ink shadow-[5px_5px_0_0_var(--ink)]">

// Standard card (.brut = auto)
<div className="brut">  /* includes shadow-[4px_4px_0_0_var(--ink)] */

// Small button
<button className="shadow-[2px_2px_0_0_var(--ink)]">

// Floating nav
<nav className="shadow-[5px_5px_0_0_var(--ink)]">
```

## The press effect

On `:active`, shadows shrink and the element translates into the shadow:

```css
.press:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 0 var(--ink) !important;
}
```

A `5px 5px` shadow becomes `2px 2px` — the button looks pressed into the surface.

## Why no blur?

Blurred shadows (`box-shadow: 0 4px 12px rgba(0,0,0,0.1)`) create a "floating card"
look that belongs to Material Design / iOS. HandOff's hard offsets create a
"stamped / sticker" look — the element is physically placed on the canvas, not
hovering above it.

This is core to the brutalist feel. Don't reintroduce blur.

## What NOT to do

- ❌ `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` (Tailwind defaults have blur)
- ❌ `shadow-2xl` (way too soft)
- ❌ Colored shadows (`shadow-clay/20` etc.)
- ❌ Inset shadows (except the `.stamp` utility for ink stamps)
- ❌ Multiple layered shadows
