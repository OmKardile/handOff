# QR Preview (Component)

Renders a styled QR code to canvas, with CSS-clipped rounded corners.

---

## Implementation

Located at `src/components/handoff/qr-preview.tsx`:

```tsx
<QrPreview
  card={card}
  style={style}
  size={264}
  photoDataUrl={photo?.full}
  showLoading={true}
/>
```

## Anatomy

```
┌──────────────────────────┐
│                          │  ← div: overflow-hidden, border-2 border-ink
│   [canvas with QR]       │     borderRadius: style.plateRadius
│                          │
└──────────────────────────┘
   ↑ CSS clips the square canvas to rounded corners
```

## The rounded-corner fix (CRITICAL)

The QR canvas draws its own square background. To get rounded corners, the
wrapper div CSS-clips the canvas:

```tsx
<div
  className={cn("relative inline-block overflow-hidden border-2 border-ink", className)}
  style={{ width: size, height: size, borderRadius: style.plateRadius }}
>
  <canvas ref={canvasRef} width={size} height={size} className="block h-full w-full" />
</div>
```

This was a recurring bug — the canvas-drawn radius (via `ctx.clip()` in
`qr-render.ts`) wasn't visually prominent enough. The CSS `border-radius` +
`overflow-hidden` on the wrapper is what actually makes the corners visibly round.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `card` | `Card` | required | The user's card data |
| `style` | `QrStyle` | required | QR styling (colors, shapes, plateRadius) |
| `size` | `number` | `320` | Canvas size in px |
| `photoDataUrl` | `string` | — | Center photo (for `centerType: "photo"`) |
| `className` | `string` | — | Additional classes on wrapper |
| `showLoading` | `boolean` | `true` | Show shimmer while rendering |

## Sizes used

| Context | Size |
|---------|------|
| Home hero QR | `264` |
| Onboarding preview | `140` |
| Wallpaper phone preview | `120` |
| Wallpaper preset thumbnails | `56` |
| Studio preset thumbnails | varies |
| Fullscreen QR | `min(viewport) - 120`, max `560` |

## The plateRadius

Default `28px` (matches `--radius-xl` so the QR plate aligns with the hero card).
All 36 presets inherit via `...PLAIN_STYLE`, so every preset renders rounded.

The Studio "Plate radius" slider lets users adjust `0–72px`.

## Caption rule

The QR caption (text drawn on the canvas) only renders when:
```ts
if (style.captionEnabled && style.captionText.trim())
```

**Never** auto-draw the card name as the caption. (This was a bug — a stray
"Atharva" appeared at the bottom of users' QRs.)

---

## What NOT to do

- ❌ Remove the wrapper's `overflow-hidden` (corners go square)
- ❌ Remove the wrapper's `border-2 border-ink` (curve becomes invisible)
- ❌ `borderRadius: 0` (must match the card)
- ❌ Auto-caption with the card name (only custom text)
