# Radius Tokens

Corner radii across the system. Softened from pure brutalist (0px) to approachable.

---

## Scale

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | `6px` | Tiny chips, swatches |
| `--radius-md` | `10px` | Small cards, buttons, swatches |
| `--radius-lg` | `14px` | Standard cards, glass surfaces |
| `--radius-xl` | `28px` | Hero cards, QR plate, bottom nav |

## Per-component

| Component | Radius | Why |
|----------|--------|-----|
| Hero card (`.brut-lg`) | `28px` (--radius-xl) | The main content card |
| QR plate | `28px` | **Matches the hero card** (concentric) |
| Standard card (`.brut`) | `14px` (--radius-lg) | Secondary cards |
| Small card (`.brut-sm`) | `10px` (--radius-md) | Chips, tiles |
| Button | inline `14px` or `10px` | Buttons match their context |
| Bottom nav | `14px` + `overflow-hidden` | Pill-ish but not full pill |
| Input fields | `0` (sharp) | Intentional — brutalist inputs |
| Wallpaper phone preview | `24px` | Matches card scale |
| Wallpaper template buttons | `10px` | Matches small card |
| Color swatches | `10px` | Matches their button |

## THE CONCENTRIC RULE

When a rounded element nests inside another rounded element:

> `innerRadius = outerRadius - padding`

This keeps the gap between the two curves **uniform at the corners**.

### Example: QR inside hero card
- Hero card: `28px` radius
- Hero card padding around QR: `24px` (px-6)
- QR plate radius: should be `28 - 24 = 4px`?

In practice, we set the QR plate to `28px` (same as card) because:
1. The QR plate has its own 2px ink border, making its curve prominent
2. The card's 3px ink border makes its curve prominent
3. Equal radii + both having visible borders → the curves look matched

If you nest further, compute: `inner = outer - padding`.

## Implementation

The QrPreview component CSS-clips the canvas to the plate radius:

```tsx
<div
  className="relative inline-block overflow-hidden border-2 border-ink"
  style={{ borderRadius: style.plateRadius }}
>
  <canvas />
</div>
```

This ensures the QR's square background is cropped to rounded corners (the
canvas-drawn radius alone wasn't visually prominent enough).

## What NOT to do

- ❌ `rounded-full` on cards (use `28px`)
- ❌ `rounded-none` on buttons (use `10–14px`)
- ❌ Mismatched inner/outer radii (follow the concentric rule)
- ❌ Sharp corners on the QR plate (must match the card)
