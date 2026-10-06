# Design Principles

The philosophy behind HandOff's visual language. Read this before touching any token or component.

---

## 1. Brutalist, not harsh

HandOff uses a post-digital brutalist aesthetic — but **softened**. The key tension:

- **Thick ink borders** (2–3px solid black) — yes, always
- **Hard offset shadows** (no blur, `4px 4px 0 0 ink`) — yes, always
- **Sharp 90° corners** — NO. Corners are rounded (`28px` on cards, `10–14px` on buttons)

The result: a confident, stamped, zine-like feel that's still approachable. Think
"indie record sleeve" not "corporate brutalism website."

## 2. Black on yellow. Always.

The signature accent is **acid lime** (`#C6FF00`). Text on lime MUST be fixed black.

- ❌ `text-ink` on a lime surface → in dark mode `--ink` becomes bone → white-on-lime.
- ✅ `text-black` on a lime surface → `#000` in both themes.

This is the #1 bug. If you're adding a lime surface anywhere, audit the text color.

## 3. One accent does the heavy lifting

There is ONE primary accent: **lime**. It appears on:
- Primary CTAs (filled lime + black text)
- Active nav tab
- Section label bars ("On your card", "QR breakdown")
- Selected states (checkmarks, ring-2 ring-signal)
- Progress segments

**Clay** (vermilion `#FF3B1F`) is the alert color — used sparingly for warnings,
changed-card banners, and the QR eye color in the default Ink preset. Never use
clay as a primary action color.

**Cobalt** (`#1B2BE0`) is rare — data accents only.

## 4. Normal-person language, brutalist flavor

Big readable titles are **plain English**:
- "Settings", "Style studio", "Create your card", "Share", "On your card"

Tiny `//` mono tags (`field-label`) carry the brutalist flavor:
- `//READY`, `//CH.01`, `NET: NONE`, `DEVICE: ONLY`

The titles should make sense to someone's mom. The mono tags are decorative texture.
**Never** make a title cryptic ("TRANSMISSION READY", "PAYLOAD MODIFIED") — that
was a mistake we already reverted.

## 5. Consistent title location

Every screen's title sits at the same vertical position: `paddingTop: max(env(safe-area-inset-top, 0px), 44px)`.

Use the shared `ScreenHeader` component (in `src/components/handoff/app-shell.tsx`)
for all secondary screens. The home screen's Wordmark uses the same padding so it
aligns with Settings/Studio/etc.

## 6. Concentric radii

When a rounded element nests inside another rounded element, the inner radius should
equal the outer radius MINUS the padding between them. This keeps the gap uniform
at the corners (no "stepped" look).

Example: the hero card is `28px` (--radius-xl). The QR plate inside it has `24px`
padding (px-6) → the QR plate radius should be `28 - 24 = 4px`? No — in practice
we set both to `28px` because the QR has its own border, and the visual match is
what matters. See `patterns/color-on-lime.md` → actually see `tokens/radius.md`.

## 7. Hard shadows stamp, they don't float

Shadows are `Npx Npx 0 0 ink` — **zero blur**. This creates a "stamped" or "sticker"
effect, not a floating card. The `press:active` utility translates the element
`2px 2px` into the shadow on tap, simulating a button being pressed into paper.

Never use soft/blurry shadows (`shadow-lg`, `shadow-2xl`). They break the aesthetic.

## 8. Motion is snappy, not bouncy

- Transitions: `80–150ms` with `ease` (not spring unless it's a tap)
- Drag gestures: spring `stiffness: 400, damping: 35` (firm, not rubbery)
- Page reveals: `framer-motion` `Reveal` with `delay: 0.05–0.28` stagger
- Background orbs drift slowly (20–30s) and hue-cycle (44–72s)

Respect `prefers-reduced-motion` — kill ALL animations for those users.

## 9. Privacy is the architecture, not a setting

The UI reinforces privacy without being preachy:
- The "On device" chip (not "OFFLINE", not "TRANSMISSION SECURE")
- Plain privacy spec: `ACCOUNT: NONE / SERVER: NONE / TRACKING: NONE / STORAGE: ON DEVICE`
- The ScanBadge says "Scans well" + a real contrast ratio (computed, not decorative)

Never add fake technical readouts (signal bars, REC dots, transmission tickers)
that don't reflect real state. We removed all of that.

## 10. Don't mess with the theme

The current HandOff theme is settled. When adding features:
- Reuse existing tokens (`bg-signal`, `text-ink`, `border-ink`, `brut`, `brut-lg`)
- Don't introduce new colors outside the palette
- Don't add glassmorphism, gradients on buttons, or neon glows
- Rounded corners everywhere (min `10px` on buttons, `28px` on cards)

If a feature feels off-theme, it probably is. Check the tokens before inventing.
