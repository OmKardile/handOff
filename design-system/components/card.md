# Card (Component)

The hero card — the main content container on the home screen.

---

## Anatomy

```
┌─────────────────────────────────┐
│ [lime header strip, black text] │  ← bg-signal, border-b-2 border-ink
├─────────────────────────────────┤
│                                 │
│  [photo]   ACCENT LABEL          │  ← field-label text-clay
│  NAME (Anton, huge)              │  ← font-display text-[2.1rem]
│  Job title                      │  ← text-muted-foreground
│                                 │
│         [ QR CODE ]             │  ← QrPreview, centered, rounded
│                                 │
└─────────────────────────────────┘
   ↑ border-3 border-ink, shadow-[6px_6px_0_0_ink], rounded-[28px]
```

## Implementation

```tsx
<div className="brut-lg relative overflow-hidden">
  {/* Lime header strip — BLACK text */}
  <div className="flex items-center justify-between border-b-2 border-ink bg-signal px-4 py-1.5 text-black">
    <span className="field-label flex items-center gap-1.5 font-bold text-black">
      <span className="h-1.5 w-1.5 rounded-full bg-black blink" />
      YOUR CARD
    </span>
    <span className="field-label text-black/60">Ready</span>
  </div>

  {/* Name plate */}
  <div className="px-6 pt-6">
    {photo && <img src={photo.full} className="mb-3 h-12 w-12 border-2 border-ink object-cover" />}
    {card.company && <p className="field-label text-clay">{card.company}</p>}
    <h1 className="mt-1 font-display text-[2.1rem] uppercase leading-[0.95] tracking-tight">
      {fullName || "Your name"}
    </h1>
    {card.jobTitle && <p className="mt-1 text-[14px] text-muted-foreground">{card.jobTitle}</p>}
  </div>

  {/* QR */}
  <div className="flex justify-center px-6 py-6">
    <QrPreview card={card} style={style} size={264} photoDataUrl={photo?.full} />
  </div>
</div>
```

## Key rules

1. **The header strip is `bg-signal text-black`** — never `text-ink`
2. **The blink dot is `bg-black`** (not `bg-ink`) on the lime strip
3. **The name uses `font-display`** (Anton), uppercase, `2.1rem`
4. **The company label is `text-clay`** (vermilion) — the only place clay appears on the card
5. **The QR plate radius matches the card radius** (both 28px) — see `tokens/radius.md`
6. **No size meter in the card anymore** — it moved to the QR breakdown expandable

## Variations

### Without header strip
For simpler cards, omit the lime header:
```tsx
<div className="brut-lg p-6">
  …content…
</div>
```

### With QR-changed banner
A clay-bordered alert appears above the card when the QR has changed:
```tsx
{qrChanged && (
  <div className="mb-4 flex items-start gap-3 border-2 border-clay bg-clay/10 p-3.5">
    <AlertCircle className="text-clay" />
    <div>
      <p className="font-heavy text-[12px] uppercase">Your card changed</p>
      <p className="text-[12px] text-muted-foreground">Anything printed or saved earlier still shows the old details.</p>
    </div>
  </div>
)}
```

---

## What NOT to do

- ❌ `rounded-3xl` (use `.brut-lg` which is 28px)
- ❌ Header strip with `text-ink` (flips white in dark mode)
- ❌ `shadow-xl` (use hard offset shadow)
- ❌ Size meter inside the card (moved to QR breakdown)
