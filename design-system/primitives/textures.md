# Textures (Primitives)

Background textures that give HandOff its field-paper / intercepted-document feel.

---

## `.field-grid` — graph paper

A full graph-paper grid overlay. Used on the app-shell background.

```css
.field-grid {
  background-image:
    /* minor grid every 24px */
    linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px),
    /* major grid every 96px */
    linear-gradient(to right, var(--grid-major) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-major) 1px, transparent 1px);
  background-size: 24px 24px, 24px 24px, 96px 96px, 96px 96px;
}
```

| Token | Light | Dark |
|-------|-------|------|
| `--grid-color` | `rgba(10,10,10,0.06)` | `rgba(237,234,224,0.05)` |
| `--grid-major` | `rgba(10,10,10,0.12)` | `rgba(237,234,224,0.1)` |

**Use on:** `<div className="field-grain">` wrapper on the app shell.

---

## `.scanlines` — CRT overlay

Faint horizontal scanlines for the post-digital feel.

```css
.scanlines {
  background-image: repeating-linear-gradient(
    0deg,
    var(--scanline-color) 0px,
    var(--scanline-color) 1px,
    transparent 1px,
    transparent 3px
  );
}
```

| Token | Light | Dark |
|-------|-------|------|
| `--scanline-color` | `rgba(10,10,10,0.025)` | `rgba(237,234,224,0.03)` |

**Use on:** the app-shell background, at `opacity-60`.

---

## `.field-grain` / `.paper-grain` — noise

Harsher noise than the old paper-grain.

```css
.field-grain {
  background-image:
    radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0),
    radial-gradient(circle at 3px 4px, rgba(0,0,0,0.02) 1px, transparent 0);
  background-size: 5px 5px, 7px 7px;
}
```

**Use on:** the app-shell root `<div className="field-grain">`.

---

## `.tape` — label tape

Translucent yellow tape for the "//" stamps.

```css
.tape {
  background: rgba(255, 229, 102, 0.7);
  border: 1px dashed rgba(10,10,10,0.3);
  box-shadow: 0 1px 0 rgba(10,10,10,0.1);
}
.dark .tape {
  background: rgba(212, 255, 26, 0.18);
  border-color: rgba(237,234,224,0.3);
}
```

**Use for:** the "Digital business card" tag on onboarding, rotated `-2deg`.

```tsx
<span className="tape field-label rotate-[-2deg] px-2 py-1 text-ink">
  Digital business card
</span>
```

---

## `.stamp` — ink stamp

Double-border ink stamp (rarely used).

```css
.stamp {
  border: 2px solid var(--ink);
  outline: 1px solid var(--ink);
  outline-offset: 2px;
  border-radius: 2px;
}
```

---

## Mesh-gradient orbs (background)

Three drifting, hue-cycling color orbs behind everything. See `tokens/motion.md`
for the keyframes. Colors:

| Orb | Base color | Position |
|-----|-----------|----------|
| 1 | `#C6FF00` (lime) | top-right |
| 2 | `#1B2BE0` (cobalt) | mid-left |
| 3 | `#FF3B1F` (vermilion) | bottom-right |

Each wrapped: outer = `hue-rotate` animation, inner = `blur + drift` animation.
**Never** apply `backdrop-filter` to a parent of a `<canvas>` — it breaks compositing.

---

## What NOT to do

- ❌ Visible grid on cards (only on the background shell)
- ❌ Heavy scanlines (keep opacity at 0.025–0.03)
- ❌ Grain on text (only on backgrounds)
- ❌ Tape on primary content (decorative only)
