# Motion Tokens

HandOff motion is snappy and physical, not floaty.

---

## Durations

| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | `120ms` | Tap feedback, hover |
| `--duration-normal` | `200ms` | Standard transitions |
| `--duration-deliberate` | `320ms` | Page-level changes |

## Easing

| Token | Value | Use |
|-------|-------|-----|
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions |
| `--ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements appearing |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |
| `--ease-spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | Spring-like entrances |

## Press feedback (the "stamp")

Buttons physically press into their shadow on tap:

```css
.press:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 0 var(--ink) !important;
}
```

A `5px 5px` shadow becomes `2px 2px` on press — simulating the button being
stamped into paper. Always add `press` to clickable brutalist surfaces.

## Page reveals

Use the `Reveal` component (framer-motion) with staggered delays:

```tsx
<Reveal delay={0.05}>  {/* hero card */}
<Reveal delay={0.08}>  {/* scan badge */}
<Reveal delay={0.1}>   {/* breakdown panel */}
<Reveal delay={0.15}>  {/* primary actions */}
<Reveal delay={0.22}>  {/* secondary actions */}
<Reveal delay={0.28}>  {/* contact details */}
```

Each reveals with `opacity: 0→1, y: 8→0`, `duration: 0.4s`, `ease: [0.22, 1, 0.36, 1]`.

## Drag gestures

Drag-to-dismiss (fullscreen QR, sheets) uses a firm spring:

```tsx
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={{ top: 0, bottom: 0.5 }}
  dragMomentum={false}
  onDragEnd={(_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 600) dismiss();
  }}
  animate={dismissing ? { y: window.innerHeight, opacity: 0 } : { y: 0, opacity: 1 }}
  transition={dismissing
    ? { duration: 0.18, ease: "easeIn" }
    : { type: "spring", stiffness: 400, damping: 35 }}
>
```

- Threshold: `120px` drag OR `600` velocity
- Dismiss animation: `180ms easeIn` slide down
- Snap-back: spring `stiffness: 400, damping: 35` (firm, not rubbery)

## Background motion

The mesh-gradient orbs drift + hue-cycle, but SLOWLY (they're ambient, not distracting):

| Animation | Duration | What it does |
|-----------|----------|--------------|
| `drift1–5` | `20–30s` | Position + scale drift |
| `hue1–5` | `44–72s` | Full 360° hue rotation |
| `blink` | `1.4s` | REC-style dot (used sparingly) |
| `ticker` | `28s` | Marquee scroll (removed from UI) |

Each orb has a **different duration + negative delay** so they desync — never
in lockstep.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Kills ALL animations for users who prefer reduced motion. Non-negotiable.

## What NOT to do

- ❌ Bouncy springs (`stiffness: 200, damping: 10` — too rubbery)
- ❌ Long durations (>400ms feels sluggish)
- ❌ Rotating/spinning logos
- ❌ Parallax scroll effects
- ❌ Auto-playing carousels
