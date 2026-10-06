# Layout Pattern

The fixed-height shell with a single scroll area.

---

## The shell

```
┌──────────────────────────────────────┐ h-[100dvh]
│  [background: field-grid + orbs]     │ ← fixed, pointer-events-none, -z-10
│  ┌──────────────────────────────┐    │
│  │  <main> (scroll area)        │    │ ← no-scrollbar, flex-1, overflow-y-auto
│  │                              │    │
│  │    mx-auto max-w-md px-5    │    │ ← content column
│  │    [ScreenHeader]            │    │
│  │    [content]                 │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  [bottom nav, fixed]                 │ ← pb-[max(safe, 10px)]
└──────────────────────────────────────┘
```

## Implementation

```tsx
<div className="relative flex h-[100dvh] flex-col overflow-hidden field-grain">
  {/* Background layers */}
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div className="absolute inset-0 bg-background" />
    <div className="absolute inset-0 field-grid opacity-70" />
    {/* drifting hue-cycling orbs */}
    {/* scanlines */}
  </div>

  {/* The ONLY scroll area */}
  <main className={cn(
    "no-scrollbar relative z-10 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain",
    hideBar ? "pb-0" : "pb-32"
  )}>
    {children}
  </main>

  {/* Bottom nav */}
  {!hideBar && <BottomNav />}
</div>
```

## Rules

1. **`h-[100dvh]`** on the root (not `h-screen` — `dvh` handles mobile browser chrome)
2. **`overflow-hidden`** on the root (only `<main>` scrolls)
3. **`<main>` has `no-scrollbar`** — hides the 10px scrollbar so centered content isn't shifted
4. **`pb-32` on `<main>`** when the nav is visible (clears the fixed nav)
5. **Content column is `mx-auto max-w-md px-5`** — centered, max 448px, 20px edges
6. **Background is `fixed inset-0 -z-0`** with `pointer-events-none` — it doesn't scroll

## Fullscreen QR / Onboarding

These set `hideBar = true`:
- `<main>` gets `pb-0` (no nav clearance)
- No bottom nav rendered
- Full-bleed content

## Safe areas

- Top: each screen's header handles it via `max(env(safe-area-inset-top, 0px), 44px)`
- Bottom: nav uses `pb-[max(env(safe-area-inset-bottom), 10px)]`

## The no-scrollbar utility

```css
.no-scrollbar {
  scrollbar-width: none;      /* Firefox */
  -ms-overflow-style: none;   /* IE10+ */
}
.no-scrollbar::-webkit-scrollbar {
  display: none;              /* Chromium/Safari */
}
```

Why: a visible 10px scrollbar on the right eats into the right padding and shifts
centered (`mx-auto`) content off-center. Touch users never see scrollbars anyway;
desktop users still scroll via wheel/trackpad.

---

## What NOT to do

- ❌ `h-screen` (use `h-[100dvh]`)
- ❌ Multiple scroll areas (only `<main>` scrolls)
- ❌ Visible scrollbar on `<main>`
- ❌ Content wider than `max-w-md`
- ❌ `pt-6` on `<main>` (removed — each screen's header owns its top padding)
