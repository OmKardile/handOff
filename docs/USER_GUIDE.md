# User guide

The end-user manual for Vello. This file mirrors the in-app help centre (`src/lib/help-content.ts`); if the two ever disagree, the source code is canonical. Read this if you're using Vello, not building it.

If you're a developer or contributor, start with [README.md](../README.md) instead.

## Table of contents

1. [Create your card](#create-your-card)
2. [Edit your details](#edit-your-details)
3. [Style your QR](#style-your-qr)
4. [Choose what's in the QR](#choose-whats-in-the-qr)
5. [How the scan check works](#how-the-scan-check-works)
6. [Show your QR fullscreen](#show-your-qr-fullscreen)
7. [Share or export your QR](#share-or-export-your-qr)
8. [About the `.vcf` contact file](#about-the-vcf-contact-file)
9. [Make a print-ready card](#make-a-print-ready-card)
10. [Save a Wallet image](#save-a-wallet-image)
11. [Set a lock-screen wallpaper](#set-a-lock-screen-wallpaper)
12. [Back up your card](#back-up-your-card)
13. [Restore from a backup](#restore-from-a-backup)
14. [Erase all data](#erase-all-data)
15. [The privacy promise](#the-privacy-promise)
16. [Install Vello as an app](#install-vello-as-an-app)
17. [About Vello](#about-vello)

## Create your card

Set up your digital business card in under a minute.

1. Open Vello. If it's your first time, you'll see the welcome screen.
2. Tap **Create your card**.
3. Enter your first and last name (required), then an optional job title and company.
4. Tap **Continue** and add your phone, email, and website. All optional.
5. Optionally add a photo. Vello crops it square and strips location data.
6. Tap **Finish**. Your QR appears on the home screen.

> The live QR preview updates as you type, so you can see the size meter change when you add or remove a field.

## Edit your details

Change your name, contact info, links, or photo anytime.

1. From the home screen, tap **Edit**.
2. Expand a section (Identity, Contact, Social links, QR contents) to edit it.
3. Use the **QR contents** toggles to choose what appears in the QR.
4. Tap **Save changes**. If the QR payload changed, Vello shows a notice.

> The Editor keeps a draft of your card while you're editing. If you leave and come back, you'll be offered the chance to restore the draft.

## Style your QR

Apply a preset or fine-tune shapes, colours, and a centre element.

1. From home, tap **Style** (or use the **Studio** tab in the bottom bar).
2. Browse the **Presets** tab — 17 looks across Quiet, Warm, Cool, and Social groups.
3. Tap a preset to apply it instantly. The live preview updates.
4. Use the **Shape**, **Colour**, **Centre**, **Frame**, and **Caption** tabs to fine-tune.
5. Watch the scan indicator: green means it scans well.
6. Tap **Reset** to plain or **Surprise me** anytime.

> The Studio's "Surprise me" button randomises a preset, shape, and centre element. If the result doesn't scan well, the indicator will tell you.

## Choose what's in the QR

Toggle which fields appear in the QR code.

1. Open the Editor and expand **QR contents**.
2. Toggle fields on or off. Name, title, company, phone, email, and website are on by default.
3. Location and social links are off by default to keep the QR compact.
4. Watch the size meter: green is best, amber is fine, red means remove a field.

> The size meter shows byte count and an approximate QR version. Under 250 bytes (green) scans in under a second on most phones.

## How the scan check works

Vello verifies your styled QR stays scannable.

1. After every style change, Vello renders the QR and decodes it with a QR reader library.
2. It compares the decoded result to your contact payload.
3. It also checks colour contrast between modules and background.
4. If something might be hard to scan, you'll see an amber warning — never a block.

> The check is a guide, not a gate. You can still export a QR the check flags red, but you shouldn't.

## Show your QR fullscreen

Display a large, bright QR for easy scanning.

1. From home, tap **Show** (or tap the QR itself).
2. The QR fills the screen and the display stays awake.
3. On web, press **Escape** or tap **Close** to exit.

> The fullscreen view uses the Wake Lock API on supported browsers to prevent the screen from dimming.

## Share or export your QR

Send a PNG, SVG, `.vcf` file, story image, and more.

1. From home, tap **Share**.
2. Choose an export:
   - **QR image (PNG)** — 1200×1200 styled QR.
   - **QR vector (SVG)** — scalable vector for print and web.
   - **Contact file (.vcf)** — full vCard with photo and labelled socials.
   - **Story** — 1080×1920 image for Instagram / WhatsApp / Snapchat stories.
   - **Square** — 1080×1080 image.
   - **Print card** — 1050×600 business-card layout, ECC H.
   - **Wallet image** — 1080×1350 clean QR for wallet apps.
3. Every export reflects your current style (except the wallet image, which uses a plain high-contrast look on purpose).
4. On mobile, the system share sheet opens. On desktop, the file downloads.

## About the `.vcf` contact file

A standard vCard 3.0 file with all your details and photo.

1. From Share, choose **Contact file (.vcf)**.
2. The file includes your photo (256 px), all social links as labelled items, and a UID.
3. Most phones import `.vcf` files directly into the contacts app.
4. The filename is ASCII-safe: `First-Last.vcf`.

> The `.vcf` is the most universal export. If in doubt, share the `.vcf` — it works on iOS, Android, Outlook, Apple Contacts, Google Contacts, and most CRM tools.

## Make a print-ready card

A 1050×600 PNG with your QR and details, ECC H for durability.

1. From Share, choose **Print card**.
2. The image is 1050×600 with your QR on the left and details on the right.
3. It uses error-correction level H so it survives wear, smudges, and partial obstruction.
4. Send it to a printer or a print service.

> Print cards have a higher ECC than on-screen QRs. The trade-off is module density — at small print sizes, the QR can become hard to scan. Test a printed proof before ordering a batch.

## Save a Wallet image

A clean, high-contrast QR for wallet apps that support photo passes.

1. From home, tap **Wallet**.
2. Review the preview — a pure light plate with a large, clean QR.
3. Tap **Save wallet image**.
4. Open your Wallet app and add the image as a photo pass.
   - **Android**: Wallet → Add to Wallet → Photo → choose the image.
   - **iPhone**: Photos → open the image → Add Pass to Wallet (where available).

> Not every device or region supports photo passes. See [FAQ.md](FAQ.md) → "The Wallet Photo option is missing" if you can't find it.

## Set a lock-screen wallpaper

A phone-shaped image with your QR in the safe zone.

1. From home, tap **Wallpaper**.
2. Choose a backdrop (Charcoal, Navy, Warm, Clay).
3. Tap **Download wallpaper**.
4. **Android**: open the image, tap Set as wallpaper → Lock screen.
   **iPhone**: save to Photos, then Settings → Wallpaper → Add New Wallpaper → Photos.
   **Web**: the image downloads. Transfer it to your phone to use.
5. Some manufacturers override lock-screen wallpapers with their own theming.

> iOS doesn't let apps set the wallpaper programmatically. The Wallpaper screen's "set directly" is a download + manual-instructions flow on every platform.

## Back up your card

Export a single JSON file with everything, kept entirely offline.

1. Go to **Settings → Backup & restore**.
2. Tap **Export backup**. A file named `vello-backup-YYYYMMDD.json` downloads.
3. It contains your card, style, photo, settings, and custom presets.
4. Keep it somewhere safe — it has your contact details in plain JSON.

> There is no cloud backup. If you lose this file and the browser clears your storage, your card is gone.

## Restore from a backup

Import a backup file to replace current data.

1. Go to **Settings → Backup & restore**.
2. Tap **Restore from file** and pick your backup JSON.
3. Vello validates the file and replaces your current data after a prompt.
4. If the file is invalid or hostile, Vello rejects it safely.

## Erase all data

Remove everything from this device instantly.

1. Go to **Settings → Danger zone → Erase all data**.
2. Confirm the prompt. This cannot be undone.
3. Your card, photo, style, settings, and presets are wiped from local storage.
4. You return to onboarding.

## The privacy promise

What Vello stores, and what it never does.

1. Vello stores your card, style, photo, and settings in this browser's local storage (IndexedDB).
2. It makes zero network requests. No `fetch`, no WebSocket, no analytics.
3. No accounts, no cookies, no tracking, no cloud sync.
4. Data leaves your phone only when you choose to share or export.
5. See **Settings → Privacy** for the full, plain-language policy.

## Install Vello as an app

Add Vello to your home screen for a native-like experience.

- **Android (Chrome)**: tap the menu → Install app / Add to Home screen.
- **iPhone (Safari)**: tap Share → Add to Home Screen.
- **Desktop (Chrome/Edge)**: click the install icon in the address bar.

Once installed, Vello works offline and persists storage more reliably.

## About Vello

What it is, what it isn't, and who made it.

1. Vello is a privacy-first digital business card. It lives only on your device.
2. It's MIT licensed and open source.
3. No accounts, no servers, no analytics, no tracking — by design, not by setting.
4. Designed & developed by Omkar Kardile.

---

For frequently asked questions, see [FAQ.md](FAQ.md). For common issues and fixes, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
