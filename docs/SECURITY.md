# Security

Vello is a local-only app. The threat model is shaped by that fact: there is no server to compromise, no database to exfiltrate, no session to steal. The remaining risks are on the device itself.

## Threat model

| Threat | Surface | Likelihood | Impact |
| --- | --- | --- | --- |
| XSS via vCard input | User enters `<script>`-like text into a name/title field; rendering uses `dangerouslySetInnerHTML` | Low — we never use `dangerouslySetInnerHTML`; all user input renders as plain text | — |
| XSS via malicious backup file | User imports a hostile `vello-backup.json` containing `<img onerror=...>`-style payloads | Low — JSON is parsed, never injected into the DOM | — |
| Malicious vCard header injection | User enters a newline in a field, breaking the vCard structure to inject extra lines | Low — `escapeVcardText` escapes `\n` to `\n` (literal) before emitting | — |
| Storage clearing (browser eviction) | Browser clears IndexedDB under storage pressure or after inactivity | Medium — depends on the browser; mitigated by `navigator.storage.persist()` | Loss of card + photo + style |
| Backup file theft | Backup JSON contains all contact details + photo in plain JSON; if stored unencrypted, anyone with file access can read it | Medium — depends on user's filesystem / cloud sync | Identity + contact leak |
| URL-spoofing in website field | User is tricked into entering a `javascript:` or `data:` URL | Low — `normalizeWebsite` rejects these schemes | — |
| Fake "Vello" install | Attacker hosts a lookalike app under a similar domain | Medium — outside our control | Phishing of contact details |
| Malicious QR preset (custom import) | A future "share preset" feature could carry hostile colours/fonts | N/A today — preset sharing is not implemented | — |

## Enforcement

### Input validation

Every user input passes through `src/lib/normalizers.ts` before reaching the store or the vCard builder:

- **Control characters** (`\x00-\x08`, `\x0B`, `\x0C`, `\x0E-\x1F`, `\x7F`) are stripped by `cleanText`. Names, titles, companies, locations are single-spaced and length-capped.
- **Phone numbers** are parsed by `libphonenumber-js` (with `IN` as the default region); invalid numbers become `""` rather than malformed strings.
- **Emails** must match the RFC 5322 simplified regex and are lowercased.
- **Websites** are passed through `new URL()`; the scheme must be `http:` or `https:`; `javascript:`, `data:`, `file:`, `vbscript:` are explicitly rejected; the hostname must contain a `.` (or be `localhost`); the host is lowercased.
- **Social handles** (LinkedIn, Instagram, X) are validated against character-class regexes and rebuilt as canonical `https://www.linkedin.com/in/<handle>` / `https://www.instagram.com/<handle>` / `https://x.com/<handle>` URLs. The user's raw input never reaches the vCard directly.
- **WhatsApp** reuses `normalizePhone` (E.164).

### vCard escaping

`escapeVcardText` escapes `\\`, `;`, `,`, and newlines before any value reaches a vCard line. `foldLine` is byte-aware (never splits a multibyte UTF-8 sequence). The compact and full builders both go through this; there is no path from user input to a vCard line that skips escaping.

### Backup files

`importBackup` treats every backup file as hostile until validated:

1. JSON parse — non-JSON files are rejected with `"Not a valid JSON file."`.
2. Top-level type check — must be a non-null object.
3. `app === "vello"` check — files from other apps are rejected.
4. `schemaVersion` must be present.

If any of these fail, no data is written. If they pass, the records are saved via the same `saveCard`/`saveStyle`/`saveSettings`/`savePhoto`/`saveCustomPresets` paths as runtime data, which re-wrap them with the current `schemaVersion`.

The backup file itself contains contact details and a photo as plain JSON/base64. Anyone with file-system access can read it. The export prompt in the UI warns the user: "Keep it somewhere safe — it has your contact details in plain JSON." Vello does not encrypt backups because we have no key material the user could recover if they forgot a password; encryption would shift the failure mode from "stolen file" to "lost password → permanent data loss", which is worse for the target user.

### No `dangerouslySetInnerHTML`

A grep for `dangerouslySetInnerHTML` across `src/` returns zero matches. All user input renders as plain text via React's default escaping.

### No network calls

The `check:privacy` script enforces that `src/` and `scripts/` contain no `fetch()`, `XMLHttpRequest`, `new WebSocket`, `navigator.sendBeacon`, or `new EventSource`. Absolute `http(s)://` URLs outside the allow-list (the author link, `localhost`, `example.com`, and the canonical social-URL hosts used by `normalizers.ts`) also fail the check. Run with `bun run check:privacy` or `bun run verify:all`.

### Storage isolation

All data lives in IndexedDB under the origin's database `vello-db` / store `vello-store`. There is no shared storage with other apps. `navigator.storage.persist()` is requested on first save to reduce the chance of browser eviction. The previous card is rotated to `vello:card.bak` on every save so a single corrupted write doesn't lose everything.

### Photo processing

Photos are decoded with `createImageBitmap` (orientation-aware) and re-encoded via `canvas.toDataURL("image/jpeg", 0.82)`. The canvas re-encode strips EXIF, GPS, and any embedded metadata, because the pixels are copied to a fresh canvas and re-encoded as a new JPEG. The original file is never persisted; only the 512 px and 256 px JPEG data URLs are stored.

### CSP

There is no CSP meta tag in `index.html` today. The app makes zero runtime network requests regardless, but a `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'` policy is recommended before public launch. See [BACKLOG.md](BACKLOG.md).

## How to report a security issue

Open a private issue or email the author at <https://omkardile.is-a.dev/>. Please:

1. Don't open a public GitHub issue for security-sensitive reports.
2. Include the version (`package.json` `version`), the browser, and the OS.
3. If you can, include a minimal reproduction (a backup JSON that triggers the issue, or a specific input string).

Reports are acknowledged within 7 days. There is no bug bounty program — Vello is an MIT-licensed personal project.

## What Vello does NOT do

- No login, no sessions, no JWT, no cookies.
- No CSRF protection — there's nothing to forge.
- No rate limiting — there's no server to rate-limit.
- No SQL injection surface — there's no SQL (the `db:*` scripts in `package.json` operate on a Prisma schema that the runtime app does not use; see [ARCHITECTURE.md](ARCHITECTURE.md)).
- No telemetry on security events — there's no telemetry at all.
