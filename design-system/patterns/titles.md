# Titles Pattern

How to title screens, sections, and CTAs — in plain English, with brutalist flavor.

---

## The two-layer rule

HandOff uses TWO layers of text:

1. **Big readable titles** — plain English, `font-display` (Anton), uppercase
2. **Tiny mono tags** — `field-label` (JetBrains Mono), `//` prefix, decorative

```
SETTINGS                    ← big title (Anton, 30px)
//CH.01                     ← mono tag (decorative, 10px)
```

The titles make sense to a normal person. The mono tags carry the brutalist texture.

## Screen titles

Every screen title uses `ScreenHeader` with a plain-English title:

| Screen | Title | ❌ Never |
|--------|-------|---------|
| Home | (Wordmark "HandOff") | — |
| Studio | "Style studio" | "TRANSMISSION STUDIO" |
| Settings | "Settings" | "CONFIGURE DEVICE" |
| Wallpaper | "Wallpaper" | "WALLPAPER FOUNDRY" |
| Share | "Share & export" | "TRANSMIT PAYLOAD" |
| Editor | "Edit card" | "EDIT PAYLOAD" |
| Privacy | "Privacy" | "RADIO SILENCE" |
| Backup | "Backup & restore" | "DATA RECOVERY" |
| Wallet | "Wallet" | "WALLET VAULT" |
| Help | "Help centre" / "Guide" | "FIELD MANUAL" |

## Section headers

Two styles:

### Lime section bar (primary)
```tsx
<div className="mb-2 flex items-center gap-2 border-2 border-ink bg-signal px-2 py-1 shadow-[2px_2px_0_0_var(--ink)]">
  <span className="h-1.5 w-1.5 bg-black" />
  <span className="font-heavy text-[11px] uppercase tracking-wide text-black">On your card</span>
</div>
```

### Underlined section header (secondary)
```tsx
<div className="mb-2 flex items-center gap-2 border-b-2 border-ink pb-1">
  <span className="h-1.5 w-1.5 bg-signal" />
  <p className="field-label font-bold text-foreground">Art template</p>
  <span className="field-label text-muted-foreground">6 designs</span>
</div>
```

## CTA titles

CTAs are verbs in plain English, `font-heavy` uppercase:

| ✅ Plain | ❌ Cryptic |
|----------|-----------|
| Create your card | Initiate dead drop |
| Continue | Proceed to next sector |
| Create card | Arm payload |
| Share | Transmit |
| Show | Display beacon |
| Download wallpaper | Export plate |
| Add details | Insert payload |
| Edit contents | Modify payload |
| Skip | Bypass sector |

## The `//` mono tags

Decorative metadata, always in `field-label`:

```tsx
// ✅ Correct (in braces — ESLint requires it)
<span className="field-label">{"//READY"}</span>
<span className="field-label">{"//CH.01"}</span>

// ❌ Error: react/jsx-no-comment-textnodes
<span className="field-label">//READY</span>
```

Use sparingly — 1-2 per screen max. Examples: `//READY`, `//CH.01`, `//STEP 1 · IDENTITY`.

## The privacy spec strip

On the onboarding welcome screen:
```tsx
{[
  { k: "ACCOUNT", v: "NONE" },
  { k: "SERVER", v: "NONE" },
  { k: "TRACKING", v: "NONE" },
  { k: "STORAGE", v: "ON DEVICE" },
].map(…)}
```

Plain labels, not "NET/SERVER/TRACK/DEVICE".

---

## What NOT to do

- ❌ Cryptic titles ("TRANSMISSION READY", "PAYLOAD MODIFIED")
- ❌ `//` literals in JSX without braces
- ❌ Titles in `font-mono` (use `font-display`)
- ❌ Section headers without a visual bar (lime strip or underlined)
- ❌ More than 2 `//` tags per screen
