# Troubleshooting

Common issues and how to fix them. Mirrors the "Troubleshooting" section of the in-app help centre (`src/lib/help-content.ts`).

## My QR won't scan

Common causes and fixes:

1. **Check the scan indicator** in the Style Studio. Amber or red means trouble. The indicator decodes the QR and checks contrast; if it says "Couldn't verify", trust it.
2. **Reduce the centre element size.** Large centres hide too many modules. Drop the centre size to ≤ 20 % (the slider in the Centre tab) or turn the centre off.
3. **Increase contrast.** Dark modules on a light background scan best. Avoid gradients that fade into the background colour at one end.
4. **Remove fields from the QR contents** to make it less dense. Open the Editor → QR contents and toggle off fields you don't need recipients to see.
5. **Use error-correction level H** if you have a centre element. The Print card export already uses H.
6. **Clean your screen and the scanner's camera lens.** A smudged screen is a common cause of "the QR doesn't scan" reports.

If you've tried all of the above and the QR still won't scan, switch to the **Plain** preset (Reset button in Studio) and re-export — a plain black-on-warm-white QR at ECC M scans on every modern phone.

## Wallpaper isn't applying

Some phones override the wallpaper.

- **Samsung, Xiaomi, and some other Android manufacturers** override lock-screen wallpapers with their own theming. Try setting it as the Home wallpaper instead, or use your manufacturer's wallpaper picker (often long-press on the home screen).
- **iPhone** has no API for apps to set wallpapers. Save the image to Photos, then go to Settings → Wallpaper → Add New Wallpaper → Photos. The manual step is unavoidable.
- If the image doesn't appear at all in the picker, check that the download completed (the Wallpaper screen's "Download wallpaper" button shows a toast when done).

## Wallet Photo option is missing

Not every device or region supports photo passes.

- The Wallet Photo option first shipped on Pixel phones and may not exist on your device.
- If it's missing, the lock-screen wallpaper works regardless — see [USER_GUIDE.md](USER_GUIDE.md) → Set a lock-screen wallpaper.
- Vello does not use an official Wallet API, because that needs a server and breaks the privacy model. See [DECISIONS.md](DECISIONS.md) D6.

On iPhone, the Wallet app does not accept arbitrary image passes; the workaround is the Wallpaper flow.

## A caption font isn't showing for my name

Some fonts don't cover all scripts.

- Caption fonts are Latin-only in this build. Devanagari (Hindi, Marathi) names may not render in the chosen caption font.
- Vello falls back to a matching system font when characters aren't covered. This means the caption may look different from the rest of the QR.
- For best results, use a name in the script the font supports, or pick a different caption font (try Instrument Sans or Space Grotesk, which use the system's broader coverage).
- A bundled Devanagari fallback is on the [BACKLOG.md](BACKLOG.md) (B-18).

## Restoring a backup fails

If the restore from a backup file is rejected:

1. **"Not a valid JSON file."** — the file is corrupted or has been edited. Try the previous backup, or re-export from a device where the card still exists.
2. **"Invalid backup file."** — the file is valid JSON but not a Vello backup (missing the `app: "vello"` field). Make sure you're selecting a file produced by Vello's Export backup.
3. **"This is not a Vello backup."** — the `app` field doesn't equal `"vello"`. The file might be from another app or hand-edited.
4. **"Missing schema version."** — the file is missing the `schemaVersion` field. This is unusual; the file may have been hand-edited. Re-export from a working device.

Vello rejects invalid or hostile files safely — no data is written when validation fails. Your current card, style, photo, settings, and presets remain intact.

## My card disappeared (storage was cleared)

Browsers can clear IndexedDB under storage pressure.

1. In Settings, check the **Persistent storage status**. If it says "Not protected", tap **Enable persistence**.
2. **Restore from a backup** if you have one: Settings → Backup & restore → Restore from file.
3. If you don't have a backup, the data is gone. Vello has no server, no cloud sync, and no recovery path beyond the backup file.
4. Install Vello as a PWA to improve persistence. PWA-installed apps are treated more durably by most browsers.
5. Export a backup regularly going forward.

## The "QR changed" notice keeps appearing

The notice appears when you save a card whose QR payload differs from the previously-saved fingerprint. If you're seeing it on every save, even when you didn't change a QR-affecting field:

1. Check whether a QR-content toggle was flipped. Toggling a field on/off changes the payload.
2. Check whether a normalised field changed form. For example, entering `+91 98765 43210` (with spaces) and saving, then entering `+919876543210` and saving, normalises to the same E.164 — but if a non-normalising edit happened (e.g. fixing a typo in your name), the QR payload changes.
3. The notice is dismissible. Tap the X to dismiss it for the current session; it won't reappear until the next real change.

## The fullscreen QR won't stay awake

The fullscreen QR uses the Wake Lock API. On browsers that don't support it (or when the tab is in the background), the screen will dim as usual. Wake Lock is supported in modern Chrome, Edge, Safari, and Firefox; if it's not working, check that:

1. The tab is in the foreground.
2. The browser is up to date.
3. Battery saver isn't forcing the screen to dim (some Android skins override Wake Lock under low battery).

## An export produced a broken file

If a PNG, SVG, or `.vcf` export looks wrong:

1. Try the same export with the **Plain** preset. If it works, the issue is with your current style (likely a contrast or centre-element problem).
2. For the `.vcf` specifically: open it in a text editor. The first line should be `BEGIN:VCARD`, the last `END:VCARD`, and there should be a `VERSION:3.0` near the top. If any of these are missing, the file was truncated by the download; re-export.
3. If the PNG is all-white or all-black, the QR didn't render — check that you have a card with at least a name entered. The QR can't be empty (the vCard builder emits `FN:` even when the name is blank, but the size meter may show 0 bytes if every field is off).

## Vello doesn't load at all

If the page is blank or the loading screen never finishes:

1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R).
2. Check the browser console (F12 → Console). If there's a JavaScript error, copy it before reporting.
3. Try in a private window. If it works there, a browser extension is likely interfering.
4. Check that IndexedDB is enabled. Some privacy-focused browsers disable it by default; Vello cannot work without it.
5. If you have a backup, you can restore it after Vello loads — but Vello must load first.

If none of this helps, please open an issue with the browser, OS, and the console error.
