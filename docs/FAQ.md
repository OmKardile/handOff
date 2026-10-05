# FAQ

Frequently asked questions about Vello. Mirrored in part by the in-app Help centre (`src/lib/help-content.ts`).

## Does any of my data leave my device?

No, unless you choose to share or export. Vello makes zero network requests at runtime — no `fetch`, no `XMLHttpRequest`, no WebSocket, no `sendBeacon`, no `EventSource`. The `check:privacy` build script enforces this; you can clone the repo and run `bun run check:privacy` yourself.

When you tap Share or Export, the chosen file (PNG, SVG, `.vcf`, story, square, print, wallet) is generated on your device and either opened in the system share sheet (mobile) or downloaded (desktop). Vello does not upload it anywhere first.

## Can someone scan my QR without the app?

Yes — that's the point. The QR encodes a standard vCard 3.0 contact. Any modern phone camera (iOS Camera, Google Lens, Samsung camera, any QR scanner app) reads it and offers to add the contact to the recipient's address book. The recipient does not need Vello.

## What if I change my details after sharing?

Because the QR encodes your contact directly (no URL), editing your details changes the QR. Anything you previously shared (printed, embedded in a wallpaper, sent as an image) keeps showing the old details. Vello surfaces this with a "QR changed" banner after edits that affect the payload. Re-share or re-export to update people.

This is the trade-off for not having a server. See [PRIVACY.md](PRIVACY.md) → Static-QR limitation.

## Is Vello free? Is it open source?

Yes and yes. Vello is MIT-licensed and the source is open. The base app — all 17 presets, all 7 export formats, the full studio — is free forever. There is no subscription, no ads, no upsell, no data sale. See [LICENSE](../LICENSE) and [BUSINESS.md](BUSINESS.md) → Pricing.

## Does Vello work offline?

Yes. Once the page has loaded once, every screen, the QR engine, the exports, the photo processing, and the storage all work without an internet connection. Installing Vello as a PWA makes this deterministic (the app shell is cached).

There is no service worker today — Vello relies on the browser's HTTP cache for offline behaviour. A service worker is on the [BACKLOG.md](BACKLOG.md) (B-22).

## How does the Wallet feature work?

Vello exports a wallet-optimised image (1080×1350, pure light plate, large clean QR, ECC M, no centre element). On Android devices that support photo passes (Pixel phones first, others vary), you can add the image as a Wallet photo pass. On iPhone, the official Wallet pass API requires a server, which Vello doesn't have; the image can be saved to Photos and used as a wallpaper or referenced manually.

Vello does not use an official Wallet pass API because that requires a server, a developer account, and signed passes — all of which break the privacy model. See [DECISIONS.md](DECISIONS.md) D6.

If your device doesn't have the Wallet Photo option, the Wallpaper flow works regardless — see the next question.

## How do I set the QR as my wallpaper?

From home → **Wallpaper**. Choose a backdrop (Charcoal, Navy, Warm, Clay). Tap Download wallpaper. The image is sized to a phone aspect ratio with the QR in the lock-screen safe zone.

- **Android**: open the image, set as Lock screen wallpaper.
- **iPhone**: save to Photos, then Settings → Wallpaper → Add New Wallpaper → Photos.
- **Web**: the image downloads. Transfer it to your phone.

iOS does not let apps set the wallpaper programmatically; the step is always manual. Some Android manufacturers override lock-screen wallpapers with their own theming; in that case, try Home wallpaper instead.

## What fonts can I use for non-Latin names?

The 7 caption fonts in Vello (Fraunces, Newsreader, DM Serif Display, Cormorant Garamond, Instrument Sans, Space Grotesk, JetBrains Mono) are Latin-only. Names in Devanagari (Hindi, Marathi, Nepali, Sanskrit), CJK, Arabic, or other non-Latin scripts fall back to a system font of the same category (serif/sans/mono).

For best results, use a name in the script the chosen caption font supports, or pick a different caption font. A bundled Devanagari fallback is on the [BACKLOG.md](BACKLOG.md) (B-18).

## Will my data disappear if my browser clears storage?

Browsers can clear IndexedDB under storage pressure or after a long period of inactivity. Vello mitigates this:

- It requests `navigator.storage.persist()` on first save. Some browsers grant this silently; others may prompt.
- The Settings screen shows the persistence status. If it says "Not protected", tap Enable persistence.
- Installing Vello as a PWA improves persistence.
- The store keeps a `.bak` of the previous card on every save, so a single corrupted write doesn't lose everything.
- **Export a backup regularly.** There's no other recovery path.

See [PRIVACY.md](PRIVACY.md) → Persistence.

## Can I have multiple cards?

Not in v1.0.0. The storage adapter holds a single card per device. The workaround is to use the backup/restore flow: export a backup of card A, edit the card to card B, export a backup of B, and swap as needed.

Multiple cards per device is on the roadmap. See [BACKLOG.md](BACKLOG.md) for related items and [BUSINESS.md](BUSINESS.md) → Roadmap.

## Does Vello collect analytics?

No. Vello has no analytics. No page-view tracking, no event tracking, no error reporting, no A/B tests. There is no telemetry on security events either. The `check:privacy` script enforces this at build time.

## How do I back up?

Settings → Backup & restore → Export backup. A file named `vello-backup-YYYYMMDD.json` downloads, containing your card, style, photo, settings, and custom presets. Keep it somewhere safe — it has your contact details in plain JSON. See [USER_GUIDE.md](USER_GUIDE.md) → Back up your card.

## Is Vello on iOS / Android?

Not as a native app in v1.0.0. The current build is a Next.js web app (PWA). You can install it from the browser (Add to Home Screen / Install app) and it works offline, but there's no `.ipa` or `.aab` and no Capacitor wrapper today. A native wrapper is on the roadmap. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) and [BUSINESS.md](BUSINESS.md) → Roadmap.

## Who makes Vello?

Vello is a personal project by [Omkar Kardile](https://omkardile.is-a.dev/). It's MIT licensed and open source.

## I found a bug. How do I report it?

Open an issue on the project repository, or contact the author via the link above. Include:

1. What you expected, what happened, the steps to reproduce.
2. Browser, OS, and whether Vello is installed as a PWA.
3. A screenshot if visual.
4. The output of `bun run verify:all` if you can run it locally.
