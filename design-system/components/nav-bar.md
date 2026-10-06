# Nav Bar (Component)

The fixed bottom navigation — brutalist pill with lime active tab.

---

## Anatomy

```
┌────────┬────────┬────────┐
│  CARD  │ STUDIO │ CONFIG │  ← 3 equal-width tabs
└────────┴────────┴────────┘
   ↑ border-[2.5px] border-ink, shadow-[5px_5px_0_0_ink], rounded-[14px]
```

## Implementation

```tsx
<nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),10px)]">
  <div className="pointer-events-auto flex w-full max-w-md items-stretch gap-0 overflow-hidden border-[2.5px] border-ink bg-card shadow-[5px_5px_0_0_var(--ink)] rounded-[14px]">
    {TABS.map((t) => (
      <DockItem key={t.id} label={t.label} active={tab === t.id} onClick={() => navigate(t.view)} icon={t.icon} />
    ))}
  </div>
</nav>
```

## Tab item

```tsx
<motion.button
  whileTap={{ scale: 0.94 }}
  className={cn(
    "no-tap press relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5",
    active ? "bg-signal text-black" : "bg-card text-ink hover:bg-secondary"
  )}
>
  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.6 : 2} />
  <span className="field-label text-[9px] font-bold">{label}</span>
</motion.button>
```

## Specs

| Spec | Value |
|------|-------|
| Tabs | 3: CARD (home), STUDIO, CONFIG (settings) |
| Active fill | `bg-signal` (lime) |
| Active text | `text-black` (FIXED) |
| Inactive text | `text-ink` |
| Container radius | `14px` + `overflow-hidden` (clips tab corners) |
| Shadow | `5px 5px 0 0 ink` |
| Safe area | `pb-[max(env(safe-area-inset-bottom), 10px)]` |

## Hidden states

- `hideBar` = true on onboarding + fullscreen-qr screens
- Main content needs `pb-32` to clear the nav

## What was removed

- ❌ The REC indicator block (blinking clay dot + "REC" text) — removed
- ❌ The macOS-dock magnification — replaced with simple press scale
- ❌ Glass blur on the nav — it's solid `bg-card` now

---

## What NOT to do

- ❌ `rounded-full` (use `14px`)
- ❌ Active tab with `text-ink` (flips white in dark mode)
- ❌ More than 3 tabs
- ❌ Icons without labels
