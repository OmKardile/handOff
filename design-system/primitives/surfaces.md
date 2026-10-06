# Surfaces (Primitives)

The core container utilities. Every card/panel in HandOff uses one of these.

---

## `.brut` — standard card

```css
.brut {
  border: 2px solid var(--ink);
  box-shadow: var(--elevation-card);   /* 4px 4px 0 0 ink */
  border-radius: var(--radius-lg);      /* 14px */
  background: var(--card);             /* white */
}
```

**Use for:** secondary cards, info panels, QR breakdown, contact detail lists, empty states.

```tsx
<div className="brut p-5">…</div>
<div className="brut overflow-hidden">…rows…</div>
```

---

## `.brut-lg` — hero card

```css
.brut-lg {
  border: 3px solid var(--ink);
  box-shadow: var(--elevation-sheet);  /* 6px 6px 0 0 ink */
  border-radius: var(--radius-xl);     /* 28px */
  background: var(--card);
}
```

**Use for:** the home hero card (the QR card), wallpaper phone preview, large feature cards.

```tsx
<div className="brut-lg relative overflow-hidden">
  {/* header strip */}
  {/* content */}
</div>
```

---

## `.brut-sm` — small card / chip

```css
.brut-sm {
  border: 1.5px solid var(--ink);
  box-shadow: 2px 2px 0 0 var(--ink);
  border-radius: var(--radius-md);    /* 10px */
  background: var(--card);
}
```

**Use for:** tiny info chips, badges, thumbnail tiles.

---

## `.brut-signal` — lime tile

```css
.brut-signal {
  border: 2px solid var(--ink);
  box-shadow: var(--elevation-card);
  border-radius: var(--radius-md);     /* 10px */
  background: var(--signal);          /* lime */
  color: #0A0A0A;                     /* FIXED BLACK — never var(--ink) */
}
```

**Use for:** status tiles (the ScanBadge checkmark tile), active icons.

⚠️ **The color is hardcoded `#0A0A0A`, not `var(--ink)`** — because `--ink` flips
to bone in dark mode. This is the #1 bug source. See `tokens/color.md`.

---

## `.brut-ink` — ink tile

```css
.brut-ink {
  border: 2px solid var(--ink);
  box-shadow: var(--elevation-card);
  border-radius: var(--radius-md);
  background: var(--ink);             /* black in light, bone in dark */
  color: var(--bone);                /* bone in light, ink in dark — inverse */
}
```

**Use for:** the onboarding tagline block, dark callout boxes.

---

## `.solid-card` — canvas-safe card

Same as `.brut` but used when a `<canvas>` is a child (QR plate). Historically
this existed because `backdrop-filter` broke canvas compositing — kept as an alias.

```css
.solid-card {
  background: var(--card);
  border: 2px solid var(--ink);
  box-shadow: var(--elevation-card);
  border-radius: var(--radius-lg);
}
```

---

## Composition examples

### Hero card with lime header strip

```tsx
<div className="brut-lg relative overflow-hidden">
  {/* lime header — black text */}
  <div className="flex items-center justify-between border-b-2 border-ink bg-signal px-4 py-1.5 text-black">
    <span className="field-label font-bold text-black">YOUR CARD</span>
    <span className="field-label text-black/60">Ready</span>
  </div>
  {/* content */}
  <div className="px-6 pt-6">…</div>
</div>
```

### Section label bar (lime)

```tsx
<div className="mb-2 flex items-center gap-2 border-2 border-ink bg-signal px-2 py-1 shadow-[2px_2px_0_0_var(--ink)]">
  <span className="h-1.5 w-1.5 bg-black" />
  <span className="font-heavy text-[11px] uppercase tracking-wide text-black">On your card</span>
</div>
```

---

## What NOT to do

- ❌ `rounded-3xl` (use `.brut-lg` which is `28px`)
- ❌ `border border-border` (use `border-2 border-ink` — the token is ink)
- ❌ Soft shadows (use the hard-offset elevation tokens)
- ❌ `bg-white/80 backdrop-blur` (no glassmorphism on primary surfaces)
