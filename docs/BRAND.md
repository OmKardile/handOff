# Brand

How Vello got its name, what the brand stands for, and how to talk about it.

## Naming process

The name was chosen by elimination from a longlist of ~15 candidates. The shortlist of 3 was Vello, Inka, and Verge; Vello won.

### Candidates considered (15)

Vello, Inka, Verge, Carda, Onyx, Quietus, Lumen, Echo, Tinta, Press, Stipple, Kard, Square One, Whittle, Civic.

### Shortlist (3) and decision

| Candidate | Pros | Cons |
| --- | --- | --- |
| **Vello** | Short, two syllables, evokes "vellum" (paper, manuscripts) and "velo" (movement, bicycle — quick), brandable, .com is contested but app stores and package names are fine | Slight overlap with the bicycle brand Vélo |
| Inka | Strong, evocative of ink | Confusable with "Inca"; heavily used by stationery brand Inka |
| Verge | One syllable, edgy | Already a major media brand (The Verge); conflict-prone |

Vello was chosen because it pairs the editorial ("vellum") and the kinetic ("velo") readings, is pronounceable across Latin scripts, and is short enough to read well as a wordmark at small sizes.

### Criteria used

1. **Short** — 2 syllables, 4–6 letters.
2. **Pronounceable** in English, Hindi, and Marathi (the founder's primary languages).
3. **Evocative of the editorial direction** without being literal ("Card", "QR").
4. **Brandable** — works as a wordmark, app icon label, and npm package name.
5. **Not a generic descriptor** — avoids "DigitalCard" / "QRCard" / "MyCard".
6. **Reasonable domain and store availability** — the `.com` was already taken; the brand works on `is-a.dev` and app stores without it.
7. **No obscene meaning** in the founder's known languages.

## Tagline

> **One card. One scan. Nothing leaves your phone.**

Three clauses. The first names the product category. The second names the action. The third is the privacy promise — front and centre.

The tagline is set in Fraunces, slightly tightened (letter-spacing -0.02em), and appears on the loading screen, in the in-app Privacy screen, and in the website metadata.

## Identifiers

| Identifier | Value | Notes |
| --- | --- | --- |
| `name` | `Vello` | Display name |
| `displayName` | `Vello` | — |
| `slug` | `vello` | Used in URLs, package names, file paths |
| `appId` | `com.example.vello` | **Placeholder — change before store submission** |
| `androidPackage` | `com.example.vello` | Same placeholder |
| `iosBundleId` | `com.example.vello` | Same placeholder |
| `version` | `1.0.0` | Mirrors `package.json` |

All identifiers live in [`src/shared/brand.ts`](../src/shared/brand.ts).

## Brand voice

Confident, concise, human, specific.

**Do:**
- Be confident and specific.
- Lead with the promise (privacy, simplicity).
- Use short, deliberate sentences.

**Don't** use these words:
- revolutionary
- next-generation
- seamless
- empowering
- cutting-edge
- world-class
- unlock

The voice treats the reader as an adult who knows what they want. It doesn't beg, doesn't oversell, and doesn't pad. Compare:

- Bad: "Unlock the next-generation seamless digital card experience."
- Good: "One card. One scan. Nothing leaves your phone."

## Monogram

The Vello mark is a 40×40 SVG: a rounded-square ink plate (`#161619` in light mode, `#ECE7DE` in dark) with a paper-coloured "V" stroke. The "V" is a single open path drawn from `(13, 12.5)` to `(20, 27)` to `(27, 12.5)`, stroke-width 2.5, round caps and joins. Defined in [`src/app/page.tsx`](../src/app/page.tsx) as the `VelloMark` component, and in [`public/icon.svg`](../public/icon.svg) for the PWA manifest.

The mark reads as both a "V" (initial) and as the silhouette of an open card / envelope — a deliberate ambiguity.

## Trademark caveat

Vello's trademarks were **not formally checked**. The naming process was elimination by the founder's knowledge and a web search of obvious conflicts (Vélo the bicycle brand, Vello the mattress brand, Vello the leather-goods brand). A formal trademark search in the founder's primary markets (India, US, EU) is recommended before any commercial launch, store submission, or paid marketing.

Specifically unverified:

- Whether "Vello" is registered in Class 9 (software) or Class 42 (SaaS) in India.
- Whether "Vello" is registered in the USPTO or EUIPO in software classes.
- Whether the wordmark or monogram conflicts with any registered design.

If a conflict surfaces, the recommended fallback is to rebrand before public launch (the codebase uses `BRAND.name` everywhere, so a rename is a one-file change for the wordmark and a find-replace for copy).

---

*This file is mirrored in spirit by `src/shared/brand.ts` (the identifiers) and the in-app About guide (`src/lib/help-content.ts` → `about-vello`).*
