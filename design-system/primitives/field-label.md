# Field Label (Primitive)

The tiny mono spaced-caps text that carries HandOff's brutalist metadata flavor.

---

## Definition

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

| Token | Light | Dark |
|-------|-------|------|
| `--field-label` | `#6B6557` | `#8A8478` |

## Where to use it

| Element | Example |
|---------|---------|
| Input labels | `FIRST NAME`, `LAST NAME`, `PHONE` |
| Section captions | `//READY`, `//CH.01` |
| Privacy spec | `ACCOUNT`, `SERVER`, `TRACKING`, `STORAGE` |
| Byte counts | `71B`, `117 bytes` |
| Step indicators | `1/3`, `Step 1 · Identity` |
| Status chip text | `ON DEVICE` |

## The `//` prefix pattern

Decorative mono tags use a `//` prefix to read like code comments:

```tsx
<span className="field-label">{"//READY"}</span>
<span className="field-label">{"//CH.01"}</span>
<span className="field-label opacity-70">Step 1 · Identity</span>
```

⚠️ **In JSX, `//` literals must be in braces** or ESLint flags them:

```tsx
// ❌ Error: react/jsx-no-comment-textnodes
<span className="field-label">//READY</span>

// ✅ Correct
<span className="field-label">{"//READY"}</span>
```

## Variations

### Bold (for emphasis)
```tsx
<span className="field-label font-bold text-foreground">ACTIVE: SUNBURST</span>
```

### Muted (for secondary)
```tsx
<span className="field-label opacity-60">No app needed to scan</span>
```

### On lime (black text)
```tsx
<span className="field-label font-bold text-black">YOUR CARD</span>
```

### Tabular nums (for numbers)
```tsx
<span className="field-label tabular-nums">{size.bytes}B</span>
```

---

## What NOT to do

- ❌ `field-label` on a lime surface with default color (use `text-black`)
- ❌ `//` literal in JSX without braces (ESLint error)
- ❌ Using it for primary readable text (it's for metadata only)
- ❌ Font-size > 12px (it's always tiny)
