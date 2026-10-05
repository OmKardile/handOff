# Release

How to ship a Vello release. Read this in full before tagging.

## Versioning

Vello follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — incompatible API or storage-schema changes (e.g. `schemaVersion` bump that needs a migration).
- **MINOR** — new features, new presets, new exports, new screens. Backwards-compatible.
- **PATCH** — bug fixes, copy edits, dependency bumps. Backwards-compatible.

The current version lives in [`package.json`](../package.json) (`version` field) and in `src/shared/brand.ts` (`BRAND.version`). They must always agree.

## Version bump process

1. Decide the bump (e.g. `1.0.0` → `1.1.0` for a new feature).
2. Edit `package.json` → `version`.
3. Edit `src/shared/brand.ts` → `BRAND.version`.
4. Add a new section to [`CHANGELOG.md`](../CHANGELOG.md) under `## [X.Y.Z] - YYYY-MM-DD`. Keep a Changelog format. Group entries under `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, `Security` as appropriate.
5. Run `bun run verify:all` — must pass with zero failures.
6. If you added or renamed a `package.json` script, make sure it's mentioned in some doc (the `docs:check` script will warn if not).
7. Commit with `chore(release): vX.Y.Z`.
8. Tag: `git tag vX.Y.Z`, `git push --tags`.

## Building

```bash
bun install            # ensure dependencies match the lockfile
bun run build
```

The `build` script runs `next build`, then copies `.next/static` and `public/` into `.next/standalone/`. The result is a self-contained Node server you can run with `bun run start` (which invokes `bun .next/standalone/server.js`).

To verify the production build locally:

```bash
bun run build
bun run start          # serves on the port Next assigns (default 3000)
```

Open the URL, walk through onboarding, apply a preset, trigger an export. There should be no console errors and zero network requests in the browser DevTools network panel.

## Store submission

> Vello's `appId` is currently a placeholder (`com.example.vello`). This **must** be changed before any store submission, including for closed testing tracks. See [STORE.md](STORE.md) for the full pre-submission checklist.

### Web (PWA)

Vello is installable as a PWA from any modern browser via the manifest (`public/manifest.webmanifest`). No store submission is required for the web build. If you host it yourself:

- Serve over HTTPS.
- Set appropriate cache headers for static assets and `no-store` for the HTML.
- Add a CSP meta tag (currently absent; see [BACKLOG.md](BACKLOG.md)).
- Submit the URL to Google Search Console for indexing (optional).

### Native (iOS / Android)

Not currently possible in this environment — Vello has no Capacitor or native wrapper today. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md). The native paths below are documented for future reference, not for the current release:

1. Decide on the final `appId` and replace `com.example.vello` in:
   - `src/shared/brand.ts` (`appId`, `androidPackage`, `iosBundleId`)
   - `public/manifest.webmanifest` (where applicable)
   - any native config files (Capacitor's `capacitor.config.ts`, when added)
2. Generate signing keys. Keep them in a secure, backed-up location; losing them means you can never update the app on the store under the same package name.
3. Build the native binary from the standalone Next.js output wrapped in a webview (Capacitor / Cordova / a custom WKWebView wrapper).
4. iOS: create an App Store Connect record, fill in the listing (see [STORE.md](STORE.md)), upload via Xcode or `altool`, submit for review.
5. Android: create a Google Play Console record, fill in the listing, upload the `.aab`, submit for review.
6. Apple and Google both require a privacy policy URL — link to your hosted copy of [PRIVACY.md](PRIVACY.md) (or a user-facing version of it).
7. Both stores require you to declare what data you collect. The honest answer is **none** — see [STORE.md](STORE.md) for the exact Data safety / App Privacy answers.

## Rollback

If a release is bad:

1. **Web**: revert the deploy. If you serve the standalone Node build, point your host at the previous image/build artefact. There's no traffic to fail over because the app makes zero runtime network requests — once the previous build is served, everything works.
2. **Native**: roll back to the previous build on the store. Both Apple and Google allow you to revert to a previously-approved version. Users who already updated will need to update again to get the rollback.
3. **Storage**: if a release ships a bad migration (none today; `schemaVersion` is still 1), write a forward-only migration that detects the corrupted record and restores from `vello:card.bak` if available. Do not bump `schemaVersion` retroactively.

## Post-release

1. Update [PROGRESS.md](PROGRESS.md) with the release date and any notes.
2. Close the milestone in the issue tracker.
3. Move unfinished [BACKLOG.md](BACKLOG.md) items into the next milestone.
4. Run `bun run verify:all` once more on the released tag to confirm the docs are consistent.
