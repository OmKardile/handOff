# Typography Tokens

HandOff uses four font families. Each has a specific role.

---

## Font families

| Token | Family | Role |
|-------|--------|------|
| `--font-display` | **Anton** | Heavy condensed display — headlines, titles, wordmark |
| `--font-heavy` | **Archivo Black** | Stamps, labels, button text, uppercase callouts |
| `--font-sans` | **Space Grotesk** | Body text, default UI sans |
| `--font-mono` | **JetBrains Mono** | Field labels, metadata, `//` decorative tags |

### Retained for QR captions (don't use for UI)
`--font-serif` (Fraunces), Instrument Sans, Newsreader, DM Serif Display, Cormorant,
Caveat — these are referenced by QR caption presets in canvas rendering only.

---

## Type scale

### Display (Anton) — `font-display`
Heavy condensed, always uppercase, `letter-spacing: -0.01em`, `line-height: 0.92`.

| Element | Size | Example |
|---------|------|---------|
| Onboarding wordmark | `19vw` (mobile) / `7rem` (sm) | `HAND OFF` |
| Screen titles | `30px` | `SETTINGS`, `STYLE STUDIO` |
| Card name | `2.1rem` (~34px) | `ADA LOVELACE` |
| Onboarding step titles | `4xl` (~36px) | `WHO ARE YOU` |
| Fullscreen QR name | `2xl` (~24px) | `Ada Lovelace` |

### Heavy (Archivo Black) — `font-heavy`
For stamps, button labels, callout text. `letter-spacing: -0.02em`.

| Element | Size | Tracking |
|---------|------|----------|
| Button text | `12–15px` | `tracking-wide` |
| Section labels | `11–12px` | `tracking-wide` |
| Status chip | `11px` | `tracking-wide` |
| Tagline | `13px` | `tracking-wide` |

### Mono (JetBrains Mono) — `font-mono` / `field-label`
Tiny spaced-caps for metadata. `letter-spacing: 0.12em`, `text-transform: uppercase`,
`font-size: 10px`, `color: var(--field-label)`.

| Element | Example |
|---------|---------|
| Field label | `FIRST NAME`, `PHONE` |
| Decorative tag | `//READY`, `//CH.01` |
| Privacy spec | `ACCOUNT: NONE` |
| Byte count | `71B`, `117 bytes` |
| Ticker text | (removed — was signal stupidity) |

---

## The `.field-label` utility

```css
.field-label {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--field-label);
  font-weight: 500;
}
```

Use it for ALL tiny metadata text. It's the brutalist "texture" that distinguishes
HandOff from a generic app.

## The `.font-display` utility

```css
.font-display {
  font-family: var(--font-anton), var(--font-archivo-black), Impact, sans-serif;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  line-height: 0.92;
}
```

Every screen title uses this. The Anton typeface is the single most recognizable
element of the HandOff brand.

---

## Plain-language rule

Titles must be **normal-person readable**:
- ✅ "Settings", "Style studio", "Create your card", "Share", "On your card"
- ❌ "TRANSMISSION READY", "PAYLOAD MODIFIED", "Initiate dead drop", "Arm payload"

The mono `//` tags (`//READY`, `//CH.01`) carry the brutalist flavor. The titles
don't need to — they need to be understood.

## What NOT to do

- ❌ Serif fonts for UI (Fraunces is for QR captions only)
- ❌ Sentence-case titles (display titles are always uppercase)
- ❌ Letter-spacing > 0 on body text (only on mono field-labels)
- ❌ Mixing font families on the same element
