# Technical reference

Module-by-module reference for `src/lib` and `src/shared`, with the format specs and tables that are too detailed for [ARCHITECTURE.md](ARCHITECTURE.md). Read alongside [DATA_MODEL.md](DATA_MODEL.md) for the type definitions.

## `src/shared`

### `brand.ts`

The single source of truth for name, tagline, identifiers, and brand voice.

```ts
export const BRAND = {
  name: "Vello",
  displayName: "Vello",
  tagline: "One card. One scan. Nothing leaves your phone.",
  slug: "vello",
  appId: "com.example.vello",      // placeholder — change before store submission
  androidPackage: "com.example.vello",
  iosBundleId: "com.example.vello",
  version: "1.0.0",
  voice: { do: [...], dont: [...] },
} as const;

export const PRIVACY_PROMISE = [...] as const;
```

### `types.ts`

Defines `Card`, `QrStyle`, `Settings`, `PhotoData`, `CustomPreset`, `QrInclude`, `EccLevel`, `ModuleShape`, `EyeShape`, `ThemePref`. See [DATA_MODEL.md](DATA_MODEL.md) for the full schemas.

### `limits.ts`

Field length limits and QR thresholds. See [DATA_MODEL.md](DATA_MODEL.md) for the table.

## `src/lib`

### `normalizers.ts`

Input validation and canonicalisation. Every user input passes through these before it lands on the card.

| Function | Input | Output | Rule |
| --- | --- | --- | --- |
| `cleanText(input, max)` | raw string | trimmed, control-chars stripped, sliced to `max` | strips `\x00-\x08\x0B\x0C\x0E-\x1F\x7F` |
| `normalizeName(input)` | raw | trimmed, single-spaced, ≤ 60 chars | — |
| `normalizeJobTitle` / `normalizeCompany` / `normalizeLocation` | raw | trimmed, single-spaced, ≤ 80 / 80 / 100 chars | — |
| `normalizePhone(input)` | raw | E.164 string or `""` | libphonenumber-js with `DEFAULT_REGION = "IN"`, must be valid |
| `normalizeEmail(input)` | raw | lowercased email or `""` | RFC 5322 simplified regex, ≤ 254 chars |
| `normalizeWebsite(input)` | raw | `https://` URL or `""` | rejects `javascript:`/`data:`/`file:`/`vbscript:`; requires hostname with `.` (or `localhost`); lowercases host, strips trailing slash |
| `normalizeLinkedin(input)` | raw, full URL, `in/handle`, or bare handle | `https://www.linkedin.com/in/<handle>` or `""` | validates `^[A-Za-z0-9][A-Za-z0-9\-_%]{0,98}$` |
| `normalizeInstagram(input)` | raw, full URL, or `@handle` | `https://www.instagram.com/<handle>` or `""` | `^[A-Za-z0-9._]{1,30}$` |
| `normalizeX(input)` | raw, full URL, or `@handle` | `https://x.com/<handle>` or `""` | `^[A-Za-z0-9_]{1,15}$` |
| `normalizeWhatsapp(input)` | raw | E.164 or `""` | reuses `normalizePhone` |
| `sanitizeFilename(input)` | raw | ASCII-safe, kebab-case, ≤ 60 chars | NFKD-normalised, non-`\w\s-` stripped, default `"contact"` |
| `vcardFilename(first, last)` | names | `First-Last.vcf` | — |

### `vcard.ts`

The compact and full vCard 3.0 builders. Both share the same escaping core.

**`escapeVcardText(value)`** — escapes `\\`, `;`, `,`, and newlines (`\n`). vCard 3.0 line values must not contain unescaped instances of these.

**`foldLine(line)`** — folds at 75 octets (UTF-8 bytes, not characters). Inserts `\r\n ` (CRLF + space). Crucially, it never splits a multibyte sequence: it backs up to a leading byte (one where `(bytes[end] & 0xc0) !== 0x80`) before splitting.

**`buildCompactVcard(card)`** — emits the minimal vCard 3.0 for the QR payload:

```
BEGIN:VCARD\r\n
VERSION:3.0\r\n
N:<last>;<first>;;;\r\n
ORG:<company>\r\n          (only if qrInclude.company && card.company)
TITLE:<jobTitle>\r\n        (only if qrInclude.title && card.jobTitle)
FN:<first last>\r\n
TEL;TYPE=CELL:<phone>\r\n   (only if qrInclude.phone && card.phone)
EMAIL:<email>\r\n            (only if qrInclude.email && card.email)
URL:<website>\r\n            (only if qrInclude.website && card.website)
ADR;TYPE=WORK:;;;<location>;;;\r\n  (only if qrInclude.location && card.location)
URL:<linkedin>\r\n           (one plain URL line per social)
URL:<instagram>\r\n
URL:<xHandle>\r\n
URL:https://wa.me/<whatsapp-digits>\r\n
END:VCARD
```

No `PRODID`, no `REV`, no `UID`, no `PHOTO`, no folding (the QR encoder doesn't care about line breaks). CRLF line endings throughout. Example:

```
BEGIN:VCARD
VERSION:3.0
N:Doe;Jane;;;
ORG:Acme Co
TITLE:Product Designer
FN:Jane Doe
TEL;TYPE=CELL:+919876543210
EMAIL:jane@acme.co
URL:https://acme.co
URL:https://www.linkedin.com/in/janedoe
END:VCARD
```

**`buildFullVcard(card, photoBase64?)`** — emits the complete vCard 3.0 for the `.vcf` export:

```
BEGIN:VCARD
VERSION:3.0
N:<last>;<first>;;;
FN:<first last>           (falls back to "Contact" if both names empty)
ORG:<company>             (if present)
TITLE:<jobTitle>          (if present)
TEL;TYPE=CELL,VOICE:<phone>
EMAIL;TYPE=INTERNET,WORK:<email>
URL;TYPE=WORK:<website>
ADR;TYPE=WORK:;;;<location>;;;
item1.URL:<linkedin>
item1.X-ABLABEL:LinkedIn
item2.URL:<instagram>
item2.X-ABLABEL:Instagram
item3.URL:<xHandle>
item3.X-ABLABEL:X
item4.URL:https://wa.me/<whatsapp-digits>
item4.X-ABLABEL:WhatsApp
PHOTO;ENCODING=b;TYPE=JPEG:<base64>      (folded; only if photoBase64)
UID:urn:uuid:<card.id>
PRODID:-//Vello//Digital Business Card//EN
REV:<ISO timestamp>
END:VCARD
```

Every line except `PHOTO` (already folded) is folded at 75 octets. Line endings are CRLF.

**`qrFingerprint(payload)`** — `SHA-256` of the payload, first 8 bytes as hex (16 chars). Uses `crypto.subtle.digest` when available; falls back to djb2 (non-crypto) in environments without `crypto.subtle`. Used by the store to detect real changes (not just `updatedAt` bumps).

### `qr.ts`

| Function | Input | Output | Notes |
| --- | --- | --- | --- |
| `getQrPayload(card)` | `Card` | compact vCard string | wraps `buildCompactVcard` |
| `byteLength(s)` | string | number of UTF-8 bytes | `new TextEncoder().encode(s).length` |
| `getQrSizeInfo(card)` | `Card` | `{ bytes, status, label, hint, version }` | thresholds below |
| `isQrOverflow(card)` | `Card` | boolean | `bytes > 700` |

QR size thresholds (from `limits.ts`):

| Status | Bytes | Label | Hint shown to user |
| --- | --- | --- | --- |
| green | ≤ 250 | "Scans great" | "Compact and fast to scan." |
| amber | ≤ 450 | "Fine" | "Scans well. Keep it under 250 bytes for instant scanning." |
| red | ≤ 700 | "Large" | "Getting dense. Fewer fields scan more reliably." |
| overflow | > 700 | "Too large" | "Remove some fields — the QR can't encode this much." |

QR version estimation uses the standard byte-mode capacity table at ECC M (versions 1–40: 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 534, 592, 640, …). The result is informational; the actual version is chosen by `qr-code-styling` based on the payload and ECC level.

### `qr-render.ts`

The `qr-code-styling` adapter and canvas composer.

| Function | Input | Output |
| --- | --- | --- |
| `styleToOptions(style, payload)` | `QrStyle`, payload | options object for `new QRCodeStyling(...)` |
| `createQr(card, style)` | card + style | `QRCodeStyling` instance (used for SVG export) |
| `renderQrToCanvas(canvas, card, style, size?, photoDataUrl?)` | target canvas, card, style | `Promise<void>`; draws plate background, QR modules, centre element, caption |
| `getInitials(card)` | card | `String` (first letters of first + last name, uppercased; `"V"` fallback) |
| `ensureFont(family)` | font family | `Promise<void>`; uses `document.fonts.load` |
| `canvasToBlob(canvas, type?)` | canvas | `Promise<Blob>` |

Module shape map: `square`, `rounded`, `dots`, `classy`, `extra-rounded`, `classy-rounded` (6 options). Eye shape map: `square`, `circle`, `rounded` (3 options). Centre element types: `none`, `initials`, `photo`, `emoji`, `icon`.

### `scan-check.ts`

| Function | Input | Output |
| --- | --- | --- |
| `decodeQrFromImageData(data, w, h)` | `Uint8ClampedArray` | decoded string or `null` |
| `decodeQrFromCanvas(canvas)` | canvas | decoded string or `null` |
| `contrastRatio(hexA, hexB)` | two hex colours | WCAG contrast ratio (1–21) |
| `evaluateScan(canvas, expected, moduleColor, background)` | the four params | `{ ok, message, contrast }` |

Decision matrix in `evaluateScan`:

| Decode | Contrast | Result |
| --- | --- | --- |
| matches expected | ≥ 4.5 | `{ ok: true, message: "Scans well" }` |
| matches expected | 3–4.5 | `{ ok: true, message: "Scans, but contrast is a bit low" }` |
| doesn't match | < 3 | `{ ok: false, message: "Might be hard to scan: try higher contrast or a smaller centre image." }` |
| doesn't match | ≥ 3 | `{ ok: false, message: "Couldn't verify. Try higher contrast or a smaller centre image." }` |

The check is invoked after every style change. It never blocks export.

### `photo.ts`

`processPhoto(file)` decodes the image (with `createImageBitmap`, `imageOrientation: "from-image"` to handle EXIF orientation; falls back to `<img>` if unavailable), centre-crops to a square, draws to a canvas (which strips EXIF/GPS metadata by re-encoding), and exports two JPEGs at q0.82: 512×512 (full) and 256×256 (thumb). Rejects images > 12 MB or > 8000 px on a side.

### `export.ts`

| Function | Output | Dimensions / format |
| --- | --- | --- |
| `exportQrPng(card, style, size=1200, photo?)` | PNG `Blob` | styled QR at `size` |
| `exportQrSvg(card, style)` | SVG `string` | styled QR vector |
| `exportPrintCard(card, style, photo?)` | PNG `Blob` | 1050×600, QR ECC H on left, text on right |
| `exportStoryImage(card, style, photo?)` | PNG `Blob` | 1080×1920 (9:16), QR centred, name + title + caption |
| `exportSquareImage(card, style, photo?)` | PNG `Blob` | 1080×1080 (1:1) |
| `exportWalletImage(card, style, photo?)` | PNG `Blob` | 1080×1350, pure light plate, plain (no centre) QR ECC M |
| `buildVcfContent(card, photoThumb?)` | vCard `string` | full vCard 3.0 |
| `exportVcf(card, photoThumb?)` | download | `First-Last.vcf` |
| `downloadBlob(blob, filename)` | file download | — |
| `downloadText(text, filename, mime="text/vcard")` | file download | — |
| `shareOrDownload(blob, filename, title, text)` | `"shared"` or `"downloaded"` | uses `navigator.share({files})` when available |

The wallet image intentionally overrides the user's style to a plain high-contrast look (centre off, gradient off, plate radius 0, background `#fffefb`) — wallets do best with a clean QR.

### `storage.ts`

See [ARCHITECTURE.md](ARCHITECTURE.md) for the storage keys table. Key functions:

| Function | Notes |
| --- | --- |
| `getCard()` / `saveCard(card)` | save rotates the previous card into `.bak` before writing |
| `getStyle()` / `saveStyle(style)` | — |
| `getSettings()` / `saveSettings(s)` | — |
| `getPhoto()` / `savePhoto(p)` / `deletePhoto()` | — |
| `getCustomPresets()` / `saveCustomPresets(p)` | — |
| `isOnboarded()` / `setOnboarded(v)` | stored as bare boolean (not wrapped) |
| `requestPersistence()` / `checkPersistence()` | `navigator.storage.persist()` / `.persisted()` |
| `exportBackup()` | returns JSON string of `BackupBundle` |
| `importBackup(json)` | validates `app === "vello"`, then replaces data; throws on invalid |
| `eraseAll()` | `clear()` on the store |

### `style-presets.ts`

`PLAIN_STYLE` is the default — square modules, square eyes, ink-on-paper, no centre, no caption, ECC M, plate radius 16, plate padding 1.

`STYLE_PRESETS` is the array of 17 entries. Each entry spreads `PLAIN_STYLE` and overrides only what changes. The 4 groups:

- `quiet` (6): Ink, Midnight Press, Sunday Linen, Paper & Pine, Graphite Mono, Noir Gold
- `warm` (5): Terracotta, Saffron Line, Ember, Dusk Rose, Plum Hours
- `cool` (4): Monsoon, Glacier, Sage Room, Cobalt Edit
- `social` (2): Afterglow, Open Sky

`SWATCH_ROWS` (6): Neutrals, Earth, Jewel, Pastels, Brights, Duotone — used by the colour picker.

`QR_FONTS` (7): Fraunces, Newsreader, DM Serif Display, Cormorant Garamond (Serif); Instrument Sans, Space Grotesk (Sans); JetBrains Mono (Mono).

`surpriseMe()` picks a random preset (excluding `social`), randomises the module shape (5 options), eye shape (3 options), centre element (initials with prob 0.4), centre ring (prob 0.5), and caption (prob 0.5).

### `store.ts`

The Zustand store. See [DATA_MODEL.md](DATA_MODEL.md) for the state shape. The debounced save timer is 400 ms. `qrFingerprint` is computed on `saveCardNow()`; if it differs from the previous fingerprint, `qrChanged` becomes true (the banner). `dismissQrChanged()` resets it.

## Full `QrStyle` JSON example

```json
{
  "presetId": "open-sky",
  "moduleShape": "rounded",
  "eyeShape": "rounded",
  "eyeOuterColor": "#0B5CAD",
  "eyeInnerColor": "#1B8FD6",
  "moduleColor": "#1B8FD6",
  "moduleGradient": {
    "type": "linear",
    "rotation": 180,
    "colors": ["#0B5CAD", "#1B8FD6"]
  },
  "background": "#FFFFFF",
  "backgroundGradient": null,
  "centerType": "initials",
  "centerValue": "",
  "centerSize": 20,
  "centerShape": "circle",
  "centerRing": true,
  "captionEnabled": false,
  "captionText": "",
  "captionFont": "Fraunces",
  "plateRadius": 16,
  "platePadding": 1,
  "ecc": "M"
}
```

## Backup file format

`exportBackup()` returns a JSON string. Example (truncated photo for brevity):

```json
{
  "app": "vello",
  "version": "1.0.0",
  "schemaVersion": 1,
  "exportedAt": "2025-01-15T12:34:56.789Z",
  "card": {
    "id": "a1b2c3d4-...",
    "firstName": "Jane",
    "lastName": "Doe",
    "jobTitle": "Product Designer",
    "company": "Acme Co",
    "phone": "+919876543210",
    "email": "jane@acme.co",
    "website": "https://acme.co",
    "location": "Pune, India",
    "linkedin": "https://www.linkedin.com/in/janedoe",
    "instagram": "",
    "xHandle": "",
    "whatsapp": "+919876543210",
    "photoPresent": true,
    "qrInclude": {
      "name": true, "title": true, "company": true,
      "phone": true, "email": true, "website": true,
      "location": false, "linkedin": true, "instagram": false,
      "x": false, "whatsapp": false
    },
    "createdAt": "2025-01-12T08:00:00.000Z",
    "updatedAt": "2025-01-15T12:34:56.789Z",
    "qrFingerprint": "9f8a1c2b3d4e5f60"
  },
  "style": { "...": "see QrStyle example above" },
  "settings": { "theme": "system", "haptics": true, "defaultEcc": "M", "storagePersisted": true },
  "photo": { "full": "data:image/jpeg;base64,/9j/4A...", "thumb": "data:image/jpeg;base64,/9j/4B..." },
  "presets": []
}
```

`importBackup` validates `app === "vello"` and the presence of `schemaVersion`, then replaces all matching keys. Invalid or hostile files are rejected with a thrown `Error`.

## Environment and build variables

**None required.** Vello has no `.env` file, no API keys, no feature flags. The only environment variable consulted at runtime is `NODE_ENV` (set by the `start` script).

## Performance notes

- The QR preview re-renders on every card or style change. The debounce on storage writes (400 ms) keeps disk IO off the critical path. `qr-code-styling` is instantiated per render in `qr-render.ts` and appended to a hidden div — this is heavier than ideal; a future optimisation is to reuse a single instance (see [BACKLOG.md](BACKLOG.md)).
- `scan-check` runs `jsQR` over the full canvas `ImageData`. At 600×600 (the default preview size) this is fast enough on modern devices (< 20 ms); at 1200×1200 (the export size) it's still under 100 ms.
- All fonts are loaded via `document.fonts.load(...)` before drawing text on canvas, so the first export may take an extra ~50 ms to ensure the font is ready.
- IndexedDB writes are debounced (400 ms) and the previous card is rotated to `.bak` synchronously before each save.
- No web workers today. All computation is on the main thread but the only heavy work (QR decode, canvas re-encode) is short enough not to jank the UI on mid-range phones.
