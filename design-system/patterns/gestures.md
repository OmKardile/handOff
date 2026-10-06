# Gestures Pattern

HandOff uses minimal, physical gestures — drag to dismiss, tap to act.

---

## Swipe-down to dismiss (fullscreen QR)

The fullscreen QR page replaces the X button with a grabber handle + drag gesture.

### The grabber handle

```tsx
<button onClick={() => navigate("home")} className="group flex w-full flex-col items-center gap-1.5 pt-3 pb-2">
  <span className="h-1.5 w-10 rounded-full bg-foreground/25 group-hover:bg-foreground/40" />
  <span className="flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
    <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
    Swipe down
  </span>
</button>
```

- Small pill (`h-1.5 w-10 rounded-full`) — the iOS sheet grabber affordance
- Chevron-down + "SWIPE DOWN" label for discoverability
- Tappable (closes on tap for users who don't drag)

### The drag gesture

```tsx
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={{ top: 0, bottom: 0.5 }}
  dragMomentum={false}
  onDragEnd={(_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 600) {
      setDismissing(true);
      setTimeout(() => navigate("home"), 180);
    }
  }}
  animate={dismissing ? { y: window.innerHeight, opacity: 0 } : { y: 0, opacity: 1 }}
  transition={dismissing
    ? { duration: 0.18, ease: "easeIn" }
    : { type: "spring", stiffness: 400, damping: 35 }}
  style={{ touchAction: "none" }}
>
```

### Specs

| Spec | Value |
|------|-------|
| Drag axis | `y` only (vertical) |
| Constraints | `top: 0, bottom: 0` (can't drag up, snaps back if not dismissed) |
| Elasticity | `top: 0` (resists up), `bottom: 0.5` (allows down with slight resistance) |
| Dismiss threshold | `offset.y > 120px` OR `velocity.y > 600` |
| Dismiss animation | slide down `180ms easeIn` |
| Snap-back | spring `stiffness: 400, damping: 35` |
| `touch-action` | `none` (prevents browser scroll conflict) |

### Keyboard

Escape key still closes (accessibility):
```tsx
React.useEffect(() => {
  function onKey(e: KeyboardEvent) { if (e.key === "Escape") navigate("home"); }
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [navigate]);
```

## Tap feedback (press-stamp)

All brutalist buttons use the press-stamp:

```css
.press:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 0 var(--ink) !important;
}
```

The button physically presses INTO its shadow. Always add `press` + `no-tap` to
clickable brutalist surfaces.

## Nav tab tap

```tsx
<motion.button whileTap={{ scale: 0.94 }} transition={{ type: "spring", stiffness: 600, damping: 25 }}>
```

Firm, snappy tap — not bouncy.

---

## What NOT to do

- ❌ X / close buttons on fullscreen pages (use grabber + drag)
- ❌ `whileTap={{ scale: 0.8 }}` (too much shrink)
- ❌ Drag without `touchAction: "none"` (conflicts with scroll)
- ❌ Dismiss threshold < 100px (too easy to accidentally close)
- ❌ Bouncy springs on dismiss (use firm `stiffness: 400, damping: 35`)

## Accessibility

- Drag gestures must have a tap alternative (the grabber is tappable)
- Keyboard: Escape closes fullscreen
- `prefers-reduced-motion`: the drag still works, but snap-back is instant
