# Screen Header (Component)

The shared title bar for all secondary screens. Keeps titles at a consistent location.

---

## Implementation

Located in `src/components/handoff/app-shell.tsx`. Every secondary screen uses it:

```tsx
<ScreenHeader
  title="Style studio"
  onBack={() => navigate("home")}
  helpGuideId="style-qr"
  action={<button>…</button>}
/>
```

## Anatomy

```
                                        ← paddingTop: max(safe-area, 44px)
SETTINGS              [?] [action]      ← title left, actions right
                                        ← pb-2
```

## Specs

| Spec | Value |
|------|-------|
| Top padding | `max(env(safe-area-inset-top, 0px), 44px)` |
| Bottom padding | `pb-2` |
| Horizontal padding | `px-5` |
| Title font | `font-display` (Anton), `30px`, uppercase, `tracking-[-0.01em]` |
| Title color | `text-foreground` (ink) |
| Back button | optional `onBack` prop |
| Help button | optional `helpGuideId` prop → renders `?` button |
| Action slot | optional `action` prop (ReactNode, right-aligned) |

## The title alignment rule

> **Every screen's title sits at the same Y position.**

The home screen's Wordmark uses the SAME `paddingTop: max(env(safe-area-inset-top, 0px), 44px)` + `pb-2` so it aligns with Settings/Studio/etc.

Verified: Home "HandOff" → Y=48px, Studio "Style studio" → Y=48px, Settings → Y=44px.

## Home screen (special case)

The home screen doesn't use ScreenHeader (it has a Wordmark + status chip):

```tsx
<div
  className="relative z-30 flex items-center justify-between pb-2"
  style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 44px)" }}
>
  <Wordmark className="text-[30px]" />  {/* matches ScreenHeader title size */}
  <button onClick={() => navigate("privacy")} className="…On device chip">
    <span className="h-1.5 w-1.5 rounded-full bg-signal blink" />
    On device
  </button>
</div>
```

## Plain-language titles

Titles must be normal-person readable:

| Screen | Title |
|--------|-------|
| Home | (Wordmark: "HandOff") |
| Studio | "Style studio" |
| Settings | "Settings" |
| Wallpaper | "Wallpaper" |
| Share | "Share & export" |
| Editor | "Edit card" |
| Privacy | "Privacy" |
| Backup | "Backup & restore" |
| Wallet | "Wallet" |
| Help | "Help centre" / "Guide" |

❌ Never: "TRANSMISSION", "PAYLOAD", "DEAD DROP", "CONFIGURE DEVICE"

---

## What NOT to do

- ❌ Custom title positioning (use ScreenHeader)
- ❌ `pt-safe` alone (no 44px floor — use `max(safe, 44px)`)
- ❌ Title font other than `font-display` (Anton)
- ❌ `pt-6` on `<main>` (removed — each screen's header owns its top padding)
