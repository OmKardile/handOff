# Backlog

A prioritised list of small (S, ≤ 1 day) and medium (M, 1–3 days) improvements. Items are grouped by theme. Each item has an id, a one-line description, a size, and acceptance criteria.

Larger initiatives (i18n full rollout, native wrapper, shareable presets, paid style packs) live in [BUSINESS.md](BUSINESS.md) → Roadmap and are tracked there.

## Polish — animations & motion

### B-01 Staggered screen-enter animations
Add a staggered fade-and-rise to the children of each screen on first mount using Framer Motion. Respect `prefers-reduced-motion`. Size: M. Done when: every screen transitions in within 250 ms of mount with a 30 ms stagger, and is disabled when reduced motion is requested.

### B-02 Press feedback on all buttons
Audit every `Button` in `src/components/ui/button.tsx` and the custom pressable rows; ensure all have `active:scale-[0.98]` and a 100 ms `transition-transform`. Size: S. Done when: every tappable element visibly depresses.

### B-03 `aria-live` on the toast container
The sonner `<Toaster />` should announce toasts to screen readers. Size: S. Done when: a screen reader announces a toast within 1 s of it appearing.

### B-04 Escape closes the fullscreen QR
Pressing Escape on web (or the system back gesture on Android PWA) exits the fullscreen QR view. Size: S. Done when: Escape closes the fullscreen QR; back gesture navigates back to Home.

## Polish — empty states

### B-05 Onboarding "no photo" empty state
When the user reaches the photo step without picking one, show a designed empty state (not a blank upload box) within the editorial language — a hairline-bordered square with a small lucide `ImagePlus` icon and "Optional — skip if you like". Size: S. Done when: the empty state is rendered and passes the scan indicator (i.e. doesn't introduce a contrast failure on the onboarding step).

### B-06 Home "empty fields" empty state
If the user finishes onboarding with only a name and no other fields, the home contact list shows a single muted "Add contact details" prompt that links to the Editor. Size: S. Done when: an empty card list shows the prompt; a populated list hides it.

### B-07 Editor "no changes" state
The Editor's sticky save bar currently always shows "Save changes". When the draft is identical to the saved card, the bar should show "No changes" and disable the button. Size: S. Done when: editing then reverting a field re-disables the save button.

## Features — QR studio

### B-08 Drag-reorder social links in the Editor
Use `@dnd-kit/sortable` to let users drag-reorder the social-link rows in the Editor. Persist the order on the card and reflect it in the `.vcf` `itemN` numbering. Size: M. Done when: reordering changes the vCard itemN order and survives a save+reload.

### B-09 "Recents" and "Favourites" in the font picker
The font picker currently shows all 7 fonts alphabetically. Add two tabs: Recents (last 5 used) and Favourites (user-flagged). Size: M. Done when: recents persist across sessions in `vello:settings.fontRecents`; favourites persist in `vello:presets` as a separate array.

### B-10 "Surprise me" scan-check guard
`surpriseMe()` in `style-presets.ts` randomises a preset. Verify every output passes `evaluateScan` before returning it; if it fails, retry (max 5 attempts) or fall back to a known-good preset. Size: S. Done when: 100 consecutive `surpriseMe()` calls return a style that passes `evaluateScan` with `ok: true`.

### B-11 Custom centre emoji picker
The Centre tab currently lets the user type any emoji. Add a small curated picker (the user's most-recent 8 emojis + a search). Size: M. Done when: the picker shows and persists; the existing free-text path remains as a fallback.

### B-12 Per-preset centre element defaults
Three presets (Open Sky has initials by default; the rest don't). Add sensible defaults for the Warm and Social groups (e.g. Ember gets an emoji 🔥). Size: S. Done when: applying each preset sets the centre element to its documented default; the user can still toggle it off.

## Features — sharing

### B-13 Share-card layout variants
Currently the print-card and story/square exports use a single layout. Add four layout variants — Hairline, Plaque, Ticket, Polaroid — selectable from the Share screen. Size: M. Done when: each variant renders correctly at all four sizes (story/square/print/wallet) and the choice persists per session.

### B-14 "Copy vCard" button on Home
A small action under the QR hero: "Copy vCard" puts the full vCard (with photo) on the clipboard. Size: S. Done when: tapping the button copies the vCard string; a toast confirms; pasting into a notes app yields a valid vCard.

### B-15 Drag-to-share the QR
On desktop, let the user drag the QR image directly to a folder or chat window (HTML5 drag-and-drop with a PNG blob). Size: M. Done when: dragging the QR onto a Finder/Explorer window saves a PNG; dragging into Slack drops the image.

## Features — fonts & i18n

### B-16 Custom font import for QR captions
Let the user import a `.ttf` or `.woff2` file as a caption font. Use `FontFace` API to register it; store the base64 in IndexedDB. Size: M. Done when: an imported font appears in the font picker, persists across reloads, and renders correctly in the QR caption.

### B-17 i18n scaffolding
Extract every UI string to message catalogs (English first). Use `next-intl` (already in dependencies). Scaffold Hindi and Marathi catalogs with placeholder strings. Size: M. Done when: switching to Hindi shows translated strings (or placeholders) for every screen; English remains the default.

### B-18 Devanagari font fallback for captions
Caption fonts are Latin-only today. Either bundle a Devanagari font (e.g. `@fontsource/mukta`) and use it as a fallback when the chosen caption font doesn't cover the name's script, or detect script coverage and switch automatically. Size: M. Done when: a Devanagari name renders in the QR caption without box characters.

## Hardening

### B-19 CSP meta tag
Add a `<meta http-equiv="Content-Security-Policy">` tag (or a Next.js header) with `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'none'; frame-ancestors 'none'`. Size: S. Done when: the tag is present, the app still works, and DevTools shows no CSP violations during the full flow.

### B-20 Playwright network test
Add a Playwright test that intercepts every outgoing request during a full onboarding → export flow and asserts none happen (except the app's own static assets). Size: M. Done when: the test passes; it fails if any code path adds a fetch.

### B-21 Photo EXIF runtime test
Verify at runtime (not just by code inspection) that the canvas re-encode strips EXIF/GPS. Take a photo with embedded GPS, process it through `processPhoto`, decode the resulting data URL, assert no EXIF chunk. Size: S. Done when: the test passes; the EXIF reader returns null on the re-encoded image.

### B-22 Service worker for offline-first
Add a minimal service worker that pre-caches the app shell on first load and serves it from cache when offline. Today Vello works offline because of the browser's HTTP cache, but a service worker would make it deterministic. Size: M. Done when: killing the network after first load still lets onboarding and export work.

## Polish — UI details

### B-23 Wallpaper safe-zone overlay
The Wallpaper screen shows a phone-shaped preview. Add a faux clock and gesture-bar zone overlay so the user can see where the QR will sit relative to the OS clock. Size: S. Done when: the overlay shows in 4 backdrops at the right vertical offsets.

### B-24 Studio scan-check debounce
`evaluateScan` runs on every style change. Debounce it by 150 ms so dragging a slider doesn't fire 30 decodes. Size: S. Done when: dragging the centre-size slider fires at most 1 scan per 150 ms.

### B-25 Editor field-by-field validation hints
Show inline validation hints (e.g. "Enter a valid email") when a normaliser returns `""` for a non-empty input. Size: M. Done when: typing an invalid email shows a muted hint below the field; the field is not auto-cleared.

## Polish — accessibility

### B-26 Keyboard navigation for the Studio tabs
The Studio's 6 tabs should be fully keyboard-navigable (arrow keys + Enter to apply). Size: S. Done when: a user can move through all 6 tabs and apply a preset without touching the mouse.

### B-27 Screen-reader labels on every icon button
Audit every icon-only button (close, share, scan-indicator, fullscreen) and add `aria-label`. Size: S. Done when: VoiceOver / TalkBack announces a meaningful label for each.

## Polish — settings

### B-28 "Default ECC" setting wired through
`Settings.defaultEcc` is stored but the QR rendering uses the per-style `ecc`. Wire the default through to new cards and presets. Size: S. Done when: changing `defaultEcc` in Settings applies to the next preset the user applies.

### B-29 Storage status re-check button
The Settings screen shows persistence status once on mount. Add a "Re-check" button so users can refresh after granting persistence. Size: S. Done when: tapping the button calls `checkPersistence()` and updates the displayed status.

## Tests

### B-30 Unit tests for the four pure modules
Add Vitest tests for `normalizers`, `vcard`, `qr`, `scan-check` per the strategy in [TESTING.md](TESTING.md). Size: M. Done when: `bun run test` passes with ≥ 80 % line coverage on those four files.
