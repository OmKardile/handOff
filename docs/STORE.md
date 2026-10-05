# Store listing

Copy and answers for the App Store and Google Play listings. **All copy below assumes the `appId` placeholder `com.example.vello` has been replaced** (see [RELEASE.md](RELEASE.md) and [BRAND.md](BRAND.md)).

## App name (30 chars)

`Vello — Digital Business Card`

## Short description (80 chars)

`One card. One scan. Nothing leaves your phone. Privacy-first QR contact.`

## Long description (4000 chars max)

Vello is a privacy-first digital business card. It lives only on your phone — no accounts, no servers, no analytics, no tracking.

**Create your card once.** Enter your name, title, company, phone, email, website, location, and social links. Add a photo if you like.

**Style your QR.** 17 curated presets across four mood groups — Quiet, Warm, Cool, Social — plus full manual control over module shape, eye shape, colours, gradients, centre element (initials, photo, emoji), ring, caption, font, plate radius, and error-correction level.

**Share anywhere.** Export a high-resolution PNG (1200 px), an SVG vector, a `.vcf` contact file with your photo and labelled socials, a 1080×1920 Story image, a 1080×1080 square, a print-ready 1050×600 business card (ECC H for durability), or a wallet-optimised 1080×1350 image. Use the system share sheet on mobile or download directly on desktop.

**Scan confidently.** After every style change, Vello decodes its own QR with a QR reader library and checks colour contrast, so you know your QR will scan before you share it.

**Stay private.** Everything is stored in your browser's local storage. Vello makes zero network requests at runtime. The privacy guarantee is enforced by a build-time check that fails if any app code makes a network call.

**Works offline.** Install Vello as a PWA. Once installed, it works without an internet connection.

**Open source.** Vello is MIT licensed. Inspect the code, run the privacy check yourself, fork it.

Vello is for professionals, freelancers, students, and small-business owners who want to share their contact without surrendering it to a third-party service. No subscription. No ads. No data.

## Keywords

`digital business card`, `QR code`, `vCard`, `contact sharing`, `privacy`, `offline`, `networking`, `contact exchange`, `scan to save`, `QR card`

## Promotional text (170 chars, optional)

`New: 17 curated QR presets, 7 export formats, and a build-time privacy check. Open source.`

## Categories

- Primary: **Productivity**
- Secondary: **Business** / **Lifestyle**

## Screenshot plan

Vello ships with screenshots already captured in `download/` (used during development). For the store listing, capture fresh 1080×2400 screenshots at the device sizes Apple and Google require (iPhone 14 Pro, 6.7"; iPad 12.9" if you submit an iPad layout; Pixel 7 Pro). The plan:

| # | Screen | Caption | Source file (existing) |
| --- | --- | --- | --- |
| 1 | Home (light) | One card. One scan. | `download/vello-home.png` |
| 2 | Home (final) | QR hero, your details, six actions. | `download/vello-home-final.png` |
| 3 | Onboarding | Set up your card in under a minute. | `download/vello-onboarding.png` |
| 4 | Studio (presets) | 17 curated looks across four moods. | `download/vello-studio.png` |
| 5 | Studio (applied) | Apply a preset, see it live. | `download/vello-studio-applied.png` |
| 6 | Fullscreen QR | Big, bright, scannable. | `download/vello-fullscreen-qr.png` |
| 7 | Settings (dark) | Theme, haptics, storage, privacy. | `download/vello-settings-dark.png` |
| 8 | Privacy (dark) | Nothing leaves your phone. | `download/vello-privacy-dark.png` |

Add a 30–60 frame App Preview video if you submit to Apple. Suggested beat sheet: onboarding (5s) → home + tap QR (5s) → studio preset apply (5s) → share export (5s) → settings theme switch (5s) → privacy screen hold (3s).

## Google Play Data safety

Vello collects **no data**. Fill the Data safety form as follows:

- **Does your app collect or share any of the required user data types?** No
- **Is all of the user data collected by your app encrypted in transit?** N/A (no data collected)
- **Provide a URL for your app's privacy policy** — link to your hosted copy of [PRIVACY.md](PRIVACY.md) (or a user-facing version of it)
- **Is your app a family app?** No

If Google prompts for *any* data type, the honest answer is "No" for every row, including "Approximate location", "Email", "Personal info", "Photos", and "Other app data". Vello never transmits data off the device; even the local IndexedDB storage is not collected by you as the developer.

## Apple App Privacy

Vello collects **no data**. The App Privacy responses:

- **Data Types Collected?** None
- **Data Types Used to Track You?** None
- **Data Types Linked to You?** None
- **Data Types Not Linked to You?** None

- **Privacy Policy URL** — your hosted copy of [PRIVACY.md](PRIVACY.md).
- **App Tracking Transparency** — not applicable; Vello does not track.

## Permissions rationale

Vello (as a web app) requests **no permissions** at runtime. There is no camera, no microphone, no location, no contacts, no notifications, no push.

If a future native wrapper is added (Capacitor), the only permission that may be requested is `SET_WALLPAPER` on Android (for the Wallpaper screen's "set directly" button). The web build does not request this — it downloads the image and gives the user manual instructions instead. No iOS permissions are needed; wallpaper setting on iOS is always a manual step.

## Pre-submission checklist

Before any store submission:

- [ ] Replace `com.example.vello` in `src/shared/brand.ts` (`appId`, `androidPackage`, `iosBundleId`) and any native config.
- [ ] Run `bun run verify:all`. Must pass with zero failures.
- [ ] Generate signing keys. Back them up. Keep them somewhere a single laptop failure can't destroy.
- [ ] Host a privacy policy URL (your hosted copy of [PRIVACY.md](PRIVACY.md)).
- [ ] Run a formal trademark check on "Vello" in your target markets (see [BRAND.md](BRAND.md)).
- [ ] Capture fresh screenshots at the required device sizes (see the screenshot plan above).
- [ ] Fill the App Store and Google Play data safety / app privacy forms as above (no data collected).
- [ ] Confirm the manifest (`public/manifest.webmanifest`) has the correct app name and icons.
- [ ] Test the production build (`bun run build` then `bun run start`) end-to-end on at least one real device.
- [ ] Confirm there are zero network requests in the browser DevTools network panel during a full onboarding → export flow.
- [ ] Prepare a support URL and a contact email.
- [ ] Write release notes for the first version (a short version of the [CHANGELOG.md](../CHANGELOG.md) `[1.0.0]` entry).

## Submission steps

1. **Web (PWA)** — host the standalone build (`bun run build` → `.next/standalone/`) on any HTTPS host. Submit the URL to Google Search Console (optional). No store review needed.
2. **Google Play** — create an app record, fill the listing above, upload the `.aab`, complete the Data safety form, submit for review. Review typically takes 1–3 days.
3. **Apple App Store** — create an App Store Connect record, fill the listing above, upload via Xcode or `altool`, complete the App Privacy form, submit for review. Review typically takes 1–2 days; first-time submissions can take longer.
4. **Both stores** — set the privacy policy URL on the store record to your hosted copy of [PRIVACY.md](PRIVACY.md).
