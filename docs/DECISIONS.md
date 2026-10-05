# Decisions

A dated, numbered log of the architectural and product decisions behind Vello. Each entry has a context, decision, and consequence.

## D1 — Next.js over Vite (2025-01-10)

**Context.** The original product spec targeted Vite + React + Capacitor so the same codebase could ship to web, iOS and Android. The workspace available for this build provides Next.js 16 (App Router), not Vite, and does not permit a separate Vite project.

**Decision.** Build Vello as a Next.js 16 App Router app. Keep all product logic (`src/shared`, `src/lib`, the screen components) framework-agnostic so a future Vite port would mostly be a shell change.

**Consequence.** No native iOS/Android builds in this environment. Wallet Photo and direct wallpaper setting fall back to web flows (download + instructions). Documented in [KNOWN_ISSUES.md](KNOWN_ISSUES.md) and [RELEASE.md](RELEASE.md).

## D2 — SPA views over additional Next.js routes (2025-01-10)

**Context.** The product spec called for two extra user-facing routes: `/showcase` (a gallery of preset looks) and `/index-help` (the in-app help centre). The workspace constraint permits only one user-facing Next.js route (`/`).

**Decision.** Implement `showcase` and `help` as additional views inside the existing client-side view router in `src/components/vello/view-context.tsx`. They are reachable from Settings and render via the same `switch` in `src/app/page.tsx`.

**Consequence.** No URL-level routing for these screens (no deep-link, no browser back button). Acceptable for a single-route PWA. Future, if the route constraint lifts, the view names already match candidate path segments.

## D3 — vCard 3.0 compact for QR, full for `.vcf` (2025-01-11)

**Context.** QR codes have a hard byte budget; vCard 3.0 is the most widely supported format by phone contact apps.

**Decision.** `buildCompactVcard` emits the minimum fields the user enabled, with no `PRODID`/`REV`/`UID`/`PHOTO` and no line folding (the QR encoder doesn't care about line breaks). `buildFullVcard` emits a complete vCard 3.0 with CRLF, 75-octet byte-aware folding, `itemN.URL` + `itemN.X-ABLabel` for socials, base64 photo (256 px), and `UID:urn:uuid:`. Both share the same escaping core.

**Consequence.** The QR payload is small enough for typical cards to fit at version 6–10 ECC M. The `.vcf` is import-friendly across iOS/Android contact apps. See [TECHNICAL.md](TECHNICAL.md) for the full spec.

## D4 — IndexedDB over `localStorage` (2025-01-11)

**Context.** The card photo is binary-ish (base64 JPEG of a 512×512 image at q0.82 ≈ 30–80 KB; thumb is ~6 KB). `localStorage` has a 5 MB ceiling per origin and is synchronous.

**Decision.** Store everything in IndexedDB via `idb-keyval`, using a dedicated database `vello-db` / store `vello-store`. Wrap every record in `{ schemaVersion, data }` so future migrations are possible. Keep a `.bak` of the previous card on every save.

**Consequence.** Larger quota (origin-dependent, usually hundreds of MB), async (no main-thread blocking), persists across browser restarts. The downside is browser storage eviction under pressure — mitigated by `navigator.storage.persist()` requests and the backup file (see [PRIVACY.md](PRIVACY.md)).

## D5 — Static QR over URL QR (2025-01-12)

**Context.** Most digital business cards use a URL QR pointing to a server-hosted profile. That requires a server, which breaks the privacy promise.

**Decision.** The QR encodes the contact directly (vCard 3.0). No server, no URL, no account.

**Consequence.** The QR changes when the user edits their details — anything previously shared (printed, embedded in a wallpaper, sent as an image) keeps showing the old details. Vello surfaces this with a "QR changed" banner and the `qrFingerprint` (SHA-256, first 8 bytes hex) comparison in `src/lib/store.ts`. This is honestly documented in [PRIVACY.md](PRIVACY.md) and [USER_GUIDE.md](USER_GUIDE.md).

## D6 — Wallet photo route, not official Wallet API (2025-01-12)

**Context.** Apple Wallet and Google Wallet pass APIs require server-signed passes and developer accounts. That violates the no-server, no-account promise.

**Decision.** Vello exports a wallet-optimised image (1080×1350, pure light plate, large clean QR, ECC M, no centre element) that the user can save as a photo pass or wallpaper where their device supports it. No official Wallet pass is generated.

**Consequence.** Wallet Photo availability varies by device and region (it first shipped on Pixel phones). Vello doesn't claim to "add to Apple/Google Wallet" — it exports an image and gives instructions. See [USER_GUIDE.md](USER_GUIDE.md) and [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## D7 — 17 presets grouped by mood (2025-01-12)

**Context.** A blank style sheet overwhelms most users; dozens of arbitrary presets dilute identity.

**Decision.** Ship 17 curated presets across 4 mood groups: Quiet (6: Ink, Midnight Press, Sunday Linen, Paper & Pine, Graphite Mono, Noir Gold), Warm (5: Terracotta, Saffron Line, Ember, Dusk Rose, Plum Hours), Cool (4: Monsoon, Glacier, Sage Room, Cobalt Edit), Social (2: Afterglow, Open Sky). Each preset fixes module shape, eye shape, colours, optional gradient, and caption font.

**Consequence.** A user can apply a beautiful QR in one tap. Custom edits remain available via the 5 tabs in Studio. See [DESIGN.md](DESIGN.md) for the rationale.

## D8 — Editorial serif + sans pairing (2025-01-12)

**Context.** Most QR apps default to a single neutral sans. Vello's brand is editorial — closer to a printed card than to a SaaS dashboard.

**Decision.** Pair Fraunces (variable serif, with optical-size axis) for display and Instrument Sans (variable sans) for UI. JetBrains Mono for monospace. All via `next/font/google`, self-hosted at build time.

**Consequence.** A distinctive, slightly literary feel. Latin-only at runtime — Devanagari and other scripts fall back to a system font (see [KNOWN_ISSUES.md](KNOWN_ISSUES.md)).

## D9 — Warm paper palette + clay accent (2025-01-12)

**Context.** The default "tech" palette (indigo, slate, neon) is overused and clashes with the editorial direction.

**Decision.** Paper `#F6F3EE`, ink `#161619`, clay `#B0533A` (burnt sienna). Dark mode inverts the paper/ink and softens the clay to `#D17A5C`. No blue or indigo in the UI chrome. The QR presets use their own palette but live within the same warm-neutral world.

**Consequence.** Distinctive, warm, calm. The presets' cool blues (Monsoon, Cobalt Edit) are QR-content colours, not chrome.

## D10 — jsQR scan-check warns, never blocks (2025-01-13)

**Context.** Styled QRs can fail to scan — too little contrast, centre element too large, gradient wrong direction. A blocking check would frustrate users; no check at all would let them ship broken QRs.

**Decision.** After every style change, render the QR to a canvas, decode it with `jsQR`, compute a WCAG-style contrast ratio, and show an indicator: green ("Scans well") ≥ 4.5 contrast, amber ("Scans, but contrast is a bit low") 3–4.5, red ("Couldn't verify") < 3 or decode failure. The user can still export — the check never blocks.

**Consequence.** Users get honest feedback and a chance to fix problems, but they're never prevented from exporting a high-contrast clean QR they trust. See [TECHNICAL.md](TECHNICAL.md) for the algorithm.
