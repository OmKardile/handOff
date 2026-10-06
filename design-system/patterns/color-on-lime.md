# Color on Lime Pattern

The #1 bug pattern in HandOff. Read this every time you add a lime surface.

---

## THE RULE

> **On any `bg-signal` (lime) surface, the text MUST be fixed `text-black` (#000).**
>
> Never use `text-ink` or `var(--ink)` — `--ink` flips to bone (near-white) in dark mode,
> producing unreadable white-on-lime.

## Where this applies

Every element with a lime background:

| Element | Class |
|---------|-------|
| Hero card header strip | `bg-signal … text-black` |
| Primary CTA button | `bg-signal … text-black` |
| Active nav tab | `bg-signal … text-black` |
| Section label bar | `bg-signal … text-black` |
| SHARE action button | `bg-signal … text-black` |
| ScanBadge status tile (ok) | `bg-signal … text-black` |
| Add details button (empty state) | `bg-signal … text-black` |
| Focused input | `focus:bg-signal focus:text-black` |
| Help button hover | `hover:bg-signal hover:text-black` |
| `.brut-signal` utility | `color: #0A0A0A` (hardcoded in CSS) |

## The dot indicators

On lime surfaces, indicator dots are `bg-black` (not `bg-ink`):

```tsx
// ✅ Correct
<span className="h-1.5 w-1.5 rounded-full bg-black blink" />

// ❌ Wrong — bg-ink is black in light but bone in dark
<span className="h-1.5 w-1.5 rounded-full bg-ink blink" />
```

## The placeholder text

On focused inputs (lime fill), placeholders must be black:

```tsx
"focus:bg-signal focus:text-black focus:placeholder:text-black/40"
```

## The CSS safeguard

In `globals.css`:
```css
.brut-signal { color: #0A0A0A; }  /* FIXED — never var(--ink) */
```

This is belt-and-suspenders. Still use `text-black` in JSX classes for clarity.

## Dark mode verification

Always verify in dark mode. The bug only appears there:

```
Light mode:  --ink = #0A0A0A (black)  → text-ink looks fine
Dark mode:   --ink = #EDEAE0 (bone)   → text-ink = WHITE ON LIME = unreadable
```

## Audit checklist

When adding ANY lime surface, check:
- [ ] Text uses `text-black` (not `text-ink`)
- [ ] Placeholder uses `text-black/40` (not `text-ink`)
- [ ] Dot indicators use `bg-black` (not `bg-ink`)
- [ ] The `.brut-signal` CSS safeguard uses `#0A0A0A` (not `var(--ink)`)
- [ ] Verified in dark mode (lime bg + black text)

## History

This bug recurred multiple times:
1. Initial DEAD DROP redesign — used `text-ink` everywhere (broke in dark mode)
2. ScanBadge added — dark gradient had its own colors (off-theme)
3. Wallpaper buttons — `text-ink` on lime (broke in dark mode)

Each time the fix was the same: replace `text-ink` → `text-black` on lime surfaces.

---

## What NOT to do

- ❌ `text-ink` on `bg-signal` (flips white in dark mode)
- ❌ `var(--ink)` in CSS for lime surface text
- ❌ `bg-ink` dots on lime (use `bg-black`)
- ❌ `text-foreground` on lime (same as text-ink — flips)
- ❌ Testing only in light mode (the bug is dark-mode-only)
