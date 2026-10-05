# Privacy

Vello is private by design, not by setting. This is the plain-language policy that powers the in-app Privacy screen. If anything here changes, the CHANGELOG will record it.

## What we store

| What | Where | Why |
| --- | --- | --- |
| Your card (name, title, company, phone, email, website, location, LinkedIn, Instagram, X, WhatsApp handles) | This browser's IndexedDB (`vello-db` / `vello-store`) | So your QR can be generated and re-rendered |
| Your QR style (preset, colours, fonts, centre element, caption) | IndexedDB | So your QR looks the same next time you open Vello |
| Your photo (512 px JPEG + 256 px thumb) | IndexedDB | For the QR centre element and the `.vcf` export |
| Your settings (theme, haptics, default ECC, persistence status) | IndexedDB | So the app remembers your preferences |
| Your custom presets (if you save any) | IndexedDB | So you can re-apply looks you've designed |
| Whether you finished onboarding | IndexedDB | So the app skips the welcome flow next time |

A `.bak` of the previous card is kept alongside the current one, so a single corrupted write doesn't lose everything.

## Where it's stored

**This browser only.** Specifically, IndexedDB under the origin where Vello is hosted. There is no second copy anywhere else. There is no server.

## What we never do

- **No network requests.** No `fetch()`, no `XMLHttpRequest`, no WebSocket, no `sendBeacon`, no EventSource. The `check:privacy` script enforces this.
- **No accounts.** You don't sign up. You don't log in. There's no email verification, no password, no profile.
- **No analytics.** No page-view tracking, no event tracking, no error reporting, no A/B tests.
- **No cookies.**
- **No cloud sync.** Your card on this phone is independent of your card on another phone.
- **No third-party scripts** loaded at runtime. Fonts are self-hosted via `next/font` and `@fontsource`. The chart library, MDX editor, and other dev dependencies are not loaded by the runtime app.

## What happens when you share

- **PNG / SVG / story / square / print / wallet image** — generates a file on your device. If `navigator.share({files})` is available (most mobile browsers), the system share sheet opens and you decide where it goes. Otherwise the file downloads. Vello does not upload the file anywhere first.
- **`.vcf` contact file** — same as above. The file contains your details and (if you have one) your photo, base64-encoded inside the vCard.
- **Showing your QR fullscreen** — the QR encodes your contact directly (vCard 3.0). Anyone who scans it reads your contact from the QR itself; there's no URL, no redirect, no server.

In every case, what leaves your phone is exactly what you choose to share — nothing more.

## Static-QR limitation (honest)

Because the QR encodes your contact directly, it changes whenever you edit your details. Anything you previously shared (printed, embedded in a wallpaper, sent as an image) keeps showing the old details. Vello surfaces this with a "QR changed" banner after edits that affect the payload. Re-share or re-export to update people.

## How to back up

1. Settings → Backup & restore → Export backup.
2. A file named `vello-backup-YYYYMMDD.json` downloads.
3. It contains your card, style, photo, settings, and custom presets in plain JSON.
4. **Keep it somewhere safe.** It has your contact details and photo. Anyone with the file can read it.
5. There is no cloud backup. If you lose this file and the browser clears your storage, your card is gone.

## How to restore

1. Settings → Backup & restore → Restore from file.
2. Pick a previously-exported `vello-backup-*.json`.
3. Vello validates the file (rejects anything not from Vello, anything missing `schemaVersion`, or anything not valid JSON) and replaces your current data.
4. If the file is invalid or hostile, Vello rejects it safely — no data is written.

## How to erase everything

1. Settings → Danger zone → Erase all data.
2. Confirm the prompt. This cannot be undone.
3. Vello calls `idb-keyval`'s `clear()` on its store. Your card, photo, style, settings, and custom presets are wiped from this browser.
4. You return to onboarding.

## Persistence

Browsers can clear IndexedDB under storage pressure or after a long period of inactivity. To reduce this risk:

- Vello requests `navigator.storage.persist()` on first save. Some browsers grant this silently; others may show a permission prompt.
- Installing Vello as a PWA (Add to Home Screen / Install app) improves persistence.
- The Settings screen shows the persistence status. If it says "Not protected", tap Enable persistence.
- Export a backup regularly. There is no other recovery path.

## Children

Vello is not directed at children under 16. We don't knowingly collect anything from anyone — there's nothing to collect — but the app isn't designed for users under 16.

## Changes to this policy

If this policy changes, the [CHANGELOG.md](../CHANGELOG.md) will record it and the in-app Privacy screen will reflect the new text. There's no email list to notify because there are no accounts.

## Contact

Vello is a personal project by [Omkar Kardile](https://omkardile.is-a.dev/). Open an issue on the project repository, or use the contact link in the footer.

---

*This policy is mirrored in the in-app Privacy screen (`src/components/vello/screens/privacy.tsx`). The two should never disagree; if they do, the source code is canonical.*
