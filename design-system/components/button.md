# Button (Component)

HandOff buttons are brutalist blocks — thick borders, hard shadows, lime primary.

---

## Primary CTA

The main action button. Lime fill, black text, hard offset shadow, press-stamp.

```tsx
<button className="press no-tap flex w-full items-center justify-center gap-2 border-[2.5px] border-ink bg-signal py-4 font-heavy text-[15px] uppercase tracking-wide text-black shadow-[5px_5px_0_0_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--ink)]">
  ▸ Create your card
</button>
```

| Spec | Value |
|------|-------|
| Background | `bg-signal` (lime) |
| Text | `text-black` (FIXED — never `text-ink`) |
| Border | `border-[2.5px] border-ink` |
| Shadow | `5px 5px 0 0 ink` → `2px 2px` on active |
| Font | `font-heavy` (Archivo Black), uppercase, `tracking-wide` |
| Padding | `py-4` (16px vertical) |
| Press | `.press` + `active:translate-x/y` |

### Disabled state

```tsx
className="… disabled:opacity-40"
```

### With icon

```tsx
<button className="…">
  <Check className="h-4 w-4" strokeWidth={3} />
  Create card
</button>
```

---

## Secondary button

White card fill, ink text, smaller shadow.

```tsx
<button className="press no-tap border-[2.5px] border-ink bg-card px-5 py-4 font-heavy text-[15px] uppercase tracking-wide text-ink shadow-[5px_5px_0_0_var(--ink)]">
  Skip
</button>
```

---

## Action grid buttons (SHOW / SHARE / STYLE)

3-column grid. The middle (primary) is lime; others are white.

```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  className={cn(
    "press no-tap flex flex-col items-center gap-2 border-[2.5px] border-ink py-4 shadow-[4px_4px_0_0_var(--ink)]",
    highlight ? "bg-signal text-black" : "bg-card text-ink hover:bg-secondary"
  )}
>
  <Icon className="h-5 w-5" strokeWidth={2.4} />
  <span className="font-heavy text-[12px] uppercase tracking-wide">{label}</span>
</motion.button>
```

---

## Small chip button

For copy actions, inline actions.

```tsx
<button className="press no-tap flex items-center gap-1.5 border-2 border-ink bg-card px-3 py-1.5 font-heavy text-[11px] uppercase text-ink shadow-[2px_2px_0_0_var(--ink)]">
  <Copy className="h-3 w-3" strokeWidth={2.5} />
  Copy vCard
</button>
```

---

## Back button (in ScreenHeader area)

```tsx
<button className="press no-tap -ml-1 border-2 border-ink bg-card px-2 py-1 font-heavy text-[11px] uppercase text-ink shadow-[2px_2px_0_0_var(--ink)]">
  ◂ Back
</button>
```

---

## Status chip (top-right, e.g. "On device")

```tsx
<button className="press no-tap flex h-9 items-center gap-1.5 border-2 border-ink bg-ink px-2.5 font-heavy text-[11px] uppercase tracking-wide text-bone shadow-[2px_2px_0_0_var(--ink)]">
  <span className="h-1.5 w-1.5 rounded-full bg-signal blink" />
  On device
</button>
```

Ink fill, bone text, lime blink dot.

---

## Rules

1. **Always add `press` + `no-tap`** to clickable brutalist surfaces
2. **Lime buttons = `text-black`** (never `text-ink`)
3. **Font is always `font-heavy`** (Archivo Black), uppercase, `tracking-wide`
4. **Shadows shrink on press** via `active:translate-x/y` + `active:shadow-[2px_2px…]`
5. **Never use `rounded-full`** on buttons — use `10–14px` or none

## What NOT to do

- ❌ `rounded-full bg-clay text-white` (that's the old vermilion pill — removed)
- ❌ `bg-primary text-primary-foreground` (too generic — use explicit bg-signal text-black)
- ❌ `hover:scale-105` (use the press-stamp instead)
- ❌ Gradient buttons
