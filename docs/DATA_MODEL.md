# Data model

Vello's data model is small and entirely on-device. Everything below is defined in `src/shared/types.ts` and `src/shared/limits.ts`; the storage adapter (`src/lib/storage.ts`) wraps each record in `{ schemaVersion, data }`.

## `Card`

The user's business card. One per device (the storage adapter holds a single card).

```ts
interface Card {
  id: string;            // crypto.randomUUID() — used as the vCard UID
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  phone: string;         // E.164 or ""
  email: string;
  website: string;       // normalised https URL or ""
  location: string;
  linkedin: string;      // canonical URL or ""
  instagram: string;     // canonical URL or ""
  xHandle: string;       // canonical URL or ""
  whatsapp: string;      // E.164 or ""
  photoPresent: boolean; // whether a PhotoData record exists
  qrInclude: QrInclude;
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
  qrFingerprint: string; // SHA-256(payload)[0..8] hex; "" before first save
}
```

| Field | Type | Limit | Normalisation rule |
| --- | --- | --- | --- |
| `firstName` | string | 60 | `normalizeName`: trim, strip control chars, single-space |
| `lastName` | string | 60 | `normalizeName` |
| `jobTitle` | string | 80 | `normalizeJobTitle` |
| `company` | string | 80 | `normalizeCompany` |
| `phone` | string (E.164) | 20 (display) | `normalizePhone`: libphonenumber-js with `IN` default region; must be valid |
| `email` | string | 254 | `normalizeEmail`: RFC 5322 simplified regex, lowercased |
| `website` | string (URL) | 2000 | `normalizeWebsite`: rejects `javascript:`/`data:`/`file:`/`vbscript:`; requires hostname with `.` (or `localhost`); lowercases host, strips trailing slash |
| `location` | string | 100 | `normalizeLocation` |
| `linkedin` | string (URL) | handle ≤ 100 | `normalizeLinkedin`: accepts full URL, `in/handle`, or bare handle; `^[A-Za-z0-9][A-Za-z0-9\-_%]{0,98}$` |
| `instagram` | string (URL) | handle ≤ 30 | `normalizeInstagram`: accepts full URL or `@handle`; `^[A-Za-z0-9._]{1,30}$` |
| `xHandle` | string (URL) | handle ≤ 15 | `normalizeX`: accepts full URL or `@handle`; `^[A-Za-z0-9_]{1,15}$` |
| `whatsapp` | string (E.164) | 20 (display) | `normalizeWhatsapp`: reuses `normalizePhone` |

`qrFingerprint` is `SHA-256(getQrPayload(card))` truncated to the first 8 bytes, rendered as 16 hex chars. Used by the store to detect *real* QR changes (vs. cosmetic edits that don't affect the payload, like toggling `photoPresent`).

## `QrInclude`

Per-field toggle for what appears in the compact QR payload. Defaults set in `makeEmptyCard()`:

```ts
interface QrInclude {
  name: boolean;       // true
  title: boolean;      // true
  company: boolean;    // true
  phone: boolean;      // true
  email: boolean;      // true
  website: boolean;    // true
  location: boolean;   // false (off by default — keeps QR compact)
  linkedin: boolean;   // false
  instagram: boolean;  // false
  x: boolean;          // false
  whatsapp: boolean;   // false
}
```

## `QrStyle`

The visual style of the QR. The full schema:

```ts
type EccLevel = "L" | "M" | "Q" | "H";
type ModuleShape = "square" | "rounded" | "dots" | "classy" | "extra-rounded" | "classy-rounded";
type EyeShape = "square" | "circle" | "rounded";
type GradientType = "linear" | "radial";

interface QrStyleGradient {
  type: GradientType;
  rotation: number;       // degrees
  colors: [string, string];
}

interface QrStyle {
  presetId: string | null;                 // null = custom
  moduleShape: ModuleShape;
  eyeShape: EyeShape;
  eyeOuterColor: string;                   // hex
  eyeInnerColor: string;                   // hex
  moduleColor: string;                     // hex; first stop if gradient
  moduleGradient: QrStyleGradient | null;
  background: string;                      // hex
  backgroundGradient: QrStyleGradient | null;
  centerType: "none" | "initials" | "photo" | "emoji" | "icon";
  centerValue: string;                     // emoji text or lucide icon name
  centerSize: number;                      // 0–40 (% of QR half-width)
  centerShape: "circle" | "rounded-square";
  centerRing: boolean;
  captionEnabled: boolean;
  captionText: string;                     // "" = use first + last name
  captionFont: string;                     // one of QR_FONTS[].family
  plateRadius: number;                     // px
  platePadding: number;                    // quiet-zone multiplier
  ecc: EccLevel;                            // L/M/Q/H — M default, H with centre element
}
```

`PLAIN_STYLE` is the default. The 17 built-in presets each spread `PLAIN_STYLE` and override only what changes (see [TECHNICAL.md](TECHNICAL.md) for the full preset list).

`centerSize` is a percentage of the QR's half-width (0–40), passed to `drawCenterElement` as `(centerSize / 100) * (canvas.width / 2)` to give the radius. Values above ~25 will likely break scan-check; the Studio's Centre tab caps the slider.

## `Settings`

```ts
type ThemePref = "light" | "dark" | "system";

interface Settings {
  theme: ThemePref;
  haptics: boolean;
  defaultEcc: EccLevel;
  storagePersisted: boolean | null;   // null = unknown / not requested
}
```

Defaults: `theme: "system"`, `haptics: true`, `defaultEcc: "M"`, `storagePersisted: null`.

## `PhotoData`

Two base64 JPEG data URLs, produced by `processPhoto` in `src/lib/photo.ts`:

```ts
interface PhotoData {
  full: string;   // 512×512 JPEG q0.82
  thumb: string;  // 256×256 JPEG q0.82 — used by .vcf export
}
```

Both are centre-cropped squares from the source image. Canvas re-encoding strips EXIF/GPS metadata. Rejected at upload if the file is > 12 MB or > 8000 px on a side.

## `CustomPreset`

A user-saved named style:

```ts
interface CustomPreset {
  id: string;          // crypto.randomUUID()
  name: string;
  style: QrStyle;      // with presetId: null (custom)
  createdAt: string;   // ISO timestamp
}
```

Stored as an array under `vello:presets`.

## Field limits (`LIMITS`)

| Key | Value | Notes |
| --- | --- | --- |
| `firstName` | 60 | chars |
| `lastName` | 60 | chars |
| `jobTitle` | 80 | chars |
| `company` | 80 | chars |
| `phone` | 20 | display chars; stored E.164 |
| `email` | 254 | chars (RFC 5321 ceiling) |
| `website` | 2000 | chars |
| `location` | 100 | chars |
| `linkedinHandle` | 100 | chars (handle portion) |
| `instagramHandle` | 30 | chars (handle portion) |
| `xHandle` | 15 | chars (X handle ceiling) |
| `whatsapp` | 20 | display chars |
| `qrGreen` | 250 | bytes |
| `qrAmber` | 450 | bytes |
| `qrHardCap` | 700 | bytes |
| `photoMaxBytes` | 12 582 912 (12 MB) | upload ceiling |
| `photoMaxSide` | 8000 | px |
| `photoOutput` | 512 | px (full) |
| `photoVcf` | 256 | px (thumb) |
| `schemaVersion` | 1 | integer |

`DEFAULT_REGION = "IN"` is the libphonenumber-js default region for inputs without a country code.

## Storage keys

| Key | Type | Wrapped? |
| --- | --- | --- |
| `vello:card` | `Card` | yes |
| `vello:card.bak` | `Card` | yes |
| `vello:style` | `QrStyle` | yes |
| `vello:settings` | `Settings` | yes |
| `vello:photo` | `PhotoData` | yes |
| `vello:presets` | `CustomPreset[]` | yes |
| `vello:onboarded` | `boolean` | no (bare value) |

## Schema version

Current: **1** (`LIMITS.schemaVersion = 1`).

Every wrapped record includes `schemaVersion: 1` next to `data`. The `unwrap` helper in `storage.ts` compares the stored value against `LIMITS.schemaVersion`. A future bump would branch on the mismatch and run a migration. There are no migrations today.

## Migration history

### v1 — 2025-01-15 (initial)

All records are wrapped as `{ schemaVersion: 1, data: ... }`. No prior versions exist. The `unwrap` helper returns `data ?? null` for any record missing `schemaVersion` (treats it as a v1 record without the wrapper), which is a forward-compatibility escape hatch.
