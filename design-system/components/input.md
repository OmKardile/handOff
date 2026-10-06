# Input (Component)

Text inputs are intentionally sharp-cornered (brutalist), turn lime on focus.

---

## Standard input

```tsx
const inputCls =
  "no-tap w-full border-2 border-ink bg-card px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:bg-signal focus:text-black focus:placeholder:text-black/40";
```

| Spec | Value |
|------|-------|
| Border | `border-2 border-ink` |
| Background | `bg-card` (white) |
| Text | `text-foreground` (ink) |
| Placeholder | `text-muted-foreground/50` |
| Focus bg | `bg-signal` (lime) |
| Focus text | `text-black` (FIXED — never text-ink) |
| Focus placeholder | `text-black/40` |
| Radius | **0** (sharp — intentional brutalist) |
| Padding | `px-4 py-3.5` |

## Field wrapper

```tsx
<label className="block">
  <span className="mb-1.5 block field-label">{label}</span>
  <input className={inputCls} />
  {hint && <span className="mt-1 block field-label opacity-70">{hint}</span>}
</label>
```

## The focus state (CRITICAL)

When focused, the input turns lime with **black** text:

```tsx
// ❌ WRONG — text-ink flips to bone in dark mode → white-on-lime
"focus:bg-signal focus:text-ink"

// ✅ CORRECT — text-black is fixed #000 in both themes
"focus:bg-signal focus:text-black focus:placeholder:text-black/40"
```

This was the #1 contrast bug. Never regress it.

---

## Input types

```tsx
<input type="tel" inputMode="tel" />      // phone
<input type="email" inputMode="email" />  // email
<input type="url" inputMode="url" />       // website
<input maxLength={60} />                   // name fields
```

## Placeholders

Use realistic placeholder names:

| Field | Placeholder |
|-------|-------------|
| First name | `Aarav` |
| Last name | `Sharma` |
| Job title | `Product Designer` |
| Company | `Studio Vellum` |
| Phone | `+91 98765 43210` |
| Email | `aarav@example.com` |
| Website | `aarav.studio` |

---

## What NOT to do

- ❌ `rounded-xl` on inputs (they're sharp)
- ❌ `focus:border-clay focus:ring-2 focus:ring-clay/20` (old style — use lime focus fill)
- ❌ `focus:text-ink` (flips to white in dark mode)
- ❌ `bg-background` (use `bg-card` so inputs pop off the bone canvas)
