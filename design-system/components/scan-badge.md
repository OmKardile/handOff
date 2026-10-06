# Scan Badge (Component)

A minimal "Scans well" status card that runs a real QR scan-check + contrast ratio.

---

## Purpose

Tells the user whether their QR actually scans, with a real computed contrast ratio.
Not decorative — it renders the QR to an offscreen canvas, decodes it with jsQR,
and computes the WCAG contrast ratio between the module color and background.

## Implementation

Located at `src/components/handoff/scan-badge.tsx`:

```tsx
<ScanBadge card={card} style={style} photoDataUrl={photo?.full} className="mt-3" />
```

## Anatomy

```
┌────────────────────────────────────────────┐
│  [✓]  SCANS WELL                           │  ← status tile (lime) + headline
│       High optical contrast (17.2:1        │  ← description with real ratio
│       contrast). Tested with stock         │
│       camera algorithms.                  │
└────────────────────────────────────────────┘
   ↑ .brut card, rounded-[14px], hard shadow
```

## States

| State | Tile | Headline | Description |
|-------|------|----------|-------------|
| OK | `bg-signal` lime + black ✓ | "Scans well" | "High optical contrast (XX.X:1 contrast). Tested with stock camera algorithms." |
| Warning | `bg-clay/20` + clay ⚠ | (message) | "XX.X:1 contrast — try higher contrast or a smaller centre image." |
| Loading | `bg-secondary` + spinner | "Checking…" | "Verifying optical contrast…" |

## Styling

Matches the brutalist theme (was previously a dark cyberpunk gradient — reverted):

```tsx
<div className="brut relative overflow-hidden p-3">
  <div className="flex items-center gap-3">
    <span className={cn(
      "flex h-9 w-9 items-center justify-center border-2 border-ink",
      ok ? "bg-signal text-black" : loading ? "bg-secondary" : "bg-clay/20 text-clay"
    )} style={{ borderRadius: 8 }}>
      {loading ? <Loader2 className="animate-spin" /> : ok ? <Check /> : <AlertTriangle />}
    </span>
    <div>
      <p className="font-heavy text-[13px] uppercase tracking-wide">{headline}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  </div>
</div>
```

## The contrast ratio

Computed via `evaluateScan()` in `src/lib/scan-check.ts`:

```ts
const contrast = contrastRatio(style.moduleColor, style.background);
// e.g. #16161A on #FBF9F5 → ~17.2:1
```

The ratio is REAL — it reflects the actual QR colors. When the user changes
preset/style, the badge re-runs (120ms debounce).

## Placement

On the home screen, directly under the hero QR card:

```tsx
<Reveal delay={0.08}>
  <ScanBadge card={card} style={style} photoDataUrl={photo?.full} className="mt-3" />
</Reveal>
```

## History

- Originally a dark cyberpunk gradient card (charcoal→plum, neon-mint border) — didn't match the app
- Restyled to `.brut` (bone card, ink border, lime status tile) to match the theme
- Replaces the removed "signal/transmission/REC" decorations — it shows REAL status, not fake readouts

---

## What NOT to do

- ❌ Fake/constant contrast ratio (must be computed from actual style)
- ❌ Dark gradient background (use `.brut` card)
- ❌ Neon-mint text colors (use the status-state colors)
- ❌ Placing it anywhere but under the QR card on home
