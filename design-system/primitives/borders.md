# Borders (Primitive)

All HandOff borders are ink. Thick. Solid.

---

## The border token

```css
--border: #0A0A0A;  /* ink — in BOTH themes (dark mode flips --ink, but --border stays... actually it flips too) */
```

Actually in dark mode, `--border` becomes `#EDEAE0` (bone). So `border-border` =
ink in light, bone in dark. That's correct — borders should be the foreground color.

## Standard border widths

| Width | Class | Use |
|-------|-------|-----|
| `1.5px` | `border-[1.5px]` | Small chips (.brut-sm) |
| `2px` | `border-2` | Standard cards, buttons, inputs, section bars |
| `2.5px` | `border-[2.5px]` | Primary CTAs, nav container |
| `3px` | `border-3` | Hero cards (.brut-lg) |

## Standard classes

```tsx
// Card
<div className="border-2 border-ink">…

// Primary CTA
<button className="border-[2.5px] border-ink bg-signal">…

// Hero card
<div className="border-3 border-ink">…  {/* via .brut-lg */}

// Divider between rows
<div className="border-b-2 border-ink">…

// Dashed (photo upload, empty states)
<button className="border-2 border-dashed border-ink">…
```

## Internal dividers

Card rows are divided by `border-b-2 border-ink`:

```tsx
<div className="brut overflow-hidden">
  <Row className="border-b-2 border-ink last:border-b-0" />
  <Row className="border-b-2 border-ink last:border-b-0" />
</div>
```

The `last:border-b-0` removes the divider on the final row.

## Lime header strip border

The lime header strip on hero cards uses `border-b-2 border-ink` to separate
it from the card body:

```tsx
<div className="border-b-2 border-ink bg-signal px-4 py-1.5">
  …header content…
</div>
```

---

## What NOT to do

- ❌ `border border-border` (1px is too thin — use `border-2`)
- ❌ Colored borders (`border-clay`, `border-signal` — borders are always ink)
- ❌ Rounded borders on inputs (inputs are intentionally sharp)
- ❌ Double borders (except the rare `.stamp` utility)
