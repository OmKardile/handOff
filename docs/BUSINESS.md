# Business

Product positioning, market, monetisation, risks, and roadmap for Vello.

## One-line pitch

> A digital business card that lives only on your phone — no app, no server, no network.

## Positioning

Vello sits at the intersection of three product categories and competes with none of them on their own turf:

| Category | Examples | Where Vello differs |
| --- | --- | --- |
| Digital business card SaaS | Blinq, HiHello, Linq, Popl | No account, no server, no subscription, no analytics |
| QR generator web tools | qr-code-styling demos, goqr.me | Designed end-to-end as a card+style studio, not a one-off generator |
| vCard editor apps | Various iOS/Android apps | Editorial design, 17 curated presets, full export suite |

Vello's wedge is **privacy as a feature, not a setting**. Where competitors ask users to opt out of analytics, cloud sync, and data sharing, Vello has none of those to opt out of.

## Target users

- **Professionals** — consultants, designers, engineers, lawyers, doctors who network regularly and don't want a SaaS subscription for a digital card.
- **Freelancers** — writers, photographers, illustrators who share their contact frequently and value their identity.
- **Students** — final-year undergrads, postgrads, MBA students entering the job market, who want a free, instant, professional card.
- **Event goers** — conference attendees, meet-up regulars, hackathon participants who need to exchange contact in seconds.
- **Small-business owners in India and globally** — sole proprietors, cafe owners, gym instructors, tutors who don't have a corporate card but need one.

The founder's primary market is **India** (where the libphonenumber default region is `IN`, the brand voice is tested for Hindi/Marathi speakers, and the warm palette is calibrated for the visual culture). The product works globally.

## Problems solved

1. **"I don't want another subscription."** Vello is one-time. No monthly fee, no upgrade nag.
2. **"I don't want my contact on a third-party server."** Vello has no server. The card lives in IndexedDB on the user's phone.
3. **"My current digital card service got acquired / shut down / changed its plan."** Vello is MIT licensed. The user can run their own copy; the app keeps working even if the founder stops maintaining it.
4. **"I want a beautiful QR, not a default black-on-white square."** Vello ships 17 curated presets and a full style studio.
5. **"I don't know if my styled QR still scans."** Vello decodes its own QR after every style change and warns when contrast or centre-element size is problematic.
6. **"I want to print my card, put it on a wallpaper, save it to my wallet."** Vello exports seven formats covering each use case.

## Value proposition on privacy

The promise is the product. Vello's privacy stance is structural, not a policy:

- **No data collection** — there's nothing to collect because nothing leaves the device.
- **No account** — there's no signup, no login, no email verification, no password reset flow.
- **No analytics** — the `check:privacy` script fails the build if any app code makes a network call.
- **No third-party scripts** at runtime — fonts are self-hosted; the only external assets are baked into the build.
- **Open source** — anyone can audit the privacy claim by running `bun run check:privacy`.

This is verifiable: a user with technical skills can clone the repo, run the check, and confirm. A non-technical user can trust the open-source audit and the absence of any signup flow.

## Competitor comparison

> The table below is based on publicly available information at the time of writing. Competitor business models and feature sets change frequently. **Items marked "unverified" could not be independently confirmed and should be re-checked before any marketing use.**

| Product | What it does | Business model | Where Vello differs |
| --- | --- | --- | --- |
| **Blinq** | Digital business card with QR, NFC tag support, analytics, team plans. *Unverified: feature list and pricing may have changed.* | Freemium SaaS; paid tiers for custom domains, analytics, teams. NFC card hardware sold separately. | No server, no account, no analytics. No NFC hardware (out of scope). No team plans (single-user product). |
| **HiHello** | Digital business card with QR, contacts, team plans, CRM integrations. *Unverified.* | Freemium SaaS; paid tiers for branded cards, integrations, teams. | No CRM, no integrations, no team plans. No data shared with CRM vendors. |
| **Popl** | NFC-tag-first digital business card; app + hardware. *Unverified.* | Hardware + SaaS subscription. | No NFC hardware. No subscription. Web-only (today). |
| **Linq** | Digital business card with QR + NFC, analytics, lead capture. *Unverified.* | Freemium SaaS; paid tiers for analytics, lead capture. | No analytics, no lead capture. The recipient is not a lead; they're a peer. |

**Caveat:** The competitor table is the founder's best-effort summary as of writing. It should not be used in paid marketing without re-verifying each row against the competitor's current website.

## Pricing / monetisation

Vello is **free and open source** under the MIT Licence. The base app — all 17 presets, all 7 export formats, the full studio — is free forever.

Possible future revenue streams (all **optional and not yet implemented**):

1. **One-time purchase** for a native iOS/Android app if and when native builds exist. Price target: ₹199–₹499 in India, $3–$5 globally. No subscription.
2. **Paid style packs** — additional curated preset packs (e.g. a "Festive" pack with 6 India-themed presets, a "Mono" pack with 6 high-contrast mono presets). One-time purchase per pack. The base 17 presets remain free.
3. **Tip / support** — a "Buy me a coffee"-style link in Settings (off by default; the founder's link only, no third-party widget that injects scripts).

Explicitly excluded:

- No ads. Ever.
- No analytics. Ever.
- No data sale. Ever.
- No subscription for the base app. Ever.
- No paywall on the core promise (create a card, style it, share it).

## Go-to-market

1. **Open-source launch** — submit the repo to Hacker News, Product Hunt, r/india, r/webdev, r/nextjs. Lead with the privacy promise and the design system.
2. **PWA install** — the web app is the primary surface. Users install from the browser; no store review needed.
3. **Native (if/when added)** — Google Play and Apple App Store listings per [STORE.md](STORE.md). Lead with "no data collected" in the data safety / app privacy forms.
4. **Word of mouth** — the QR itself is a marketing surface. Every shared card carries Vello's brand implicitly (the QR is a vCard, not a URL, so there's no link back; users who like the QR's aesthetic will ask "how did you make that?").
5. **Designer community** — the editorial design system is distinctive. Designer-targeted content (a "how Vello's design system works" post) is a candidate channel.

## Success metrics without tracking

Vello does not and will not collect analytics. Success is measured by:

- **App store ratings** (when native builds exist) — target ≥ 4.5 stars.
- **Download counts** (store dashboards, not user-side tracking).
- **Voluntary feedback** — GitHub issues, the founder's contact form, social media mentions.
- **Forks and stars** on the open-source repo.
- **Backup-file prevalence** as an indirect health signal: a user who exports a backup is engaged enough to worry about losing their card. (We don't see this metric; it's a design heuristic.)

## Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Static-QR limitation frustrates users who edit their details often | Medium | Medium — negative reviews, churn | Surface the "QR changed" banner clearly; offer "Re-export" shortcut; document in [PRIVACY.md](PRIVACY.md) and [USER_GUIDE.md](USER_GUIDE.md) |
| Wallet Photo doesn't work on the user's device | High | Low — has a Wallpaper fallback | Detect availability, point users to Wallpaper; honest messaging on the Wallet screen |
| iOS wallpaper can't be set programmatically | High | Low — manual step is acceptable | Provide clear manual instructions; the Wallpaper screen walks the user through it |
| Trademark conflict on "Vello" | Low | High — forced rebrand | Run a formal trademark search before any paid marketing or store submission (see [BRAND.md](BRAND.md)) |
| Platform policy changes (Apple/Google rejecting PWAs or web-view apps) | Low | High — loss of distribution | Maintain a clean PWA + a clear path to a native wrapper if needed; never depend on a single store |
| Browser storage eviction clears the user's card | Medium | High — data loss | `navigator.storage.persist()` requests, PWA install improves persistence, regular backup prompts |
| Dependency vulnerability (npm supply chain) | Medium | Medium — could break the privacy guarantee | `bun install` from a checked lockfile; periodic `bun audit`; the `check:privacy` script catches network additions at build time |
| Competitor ships a privacy-first card app first | Low | Medium | Move fast on the open-source launch; the design system is a defensible differentiator |

## Legal and compliance

- **Licence** — MIT. The repo and any distributed copies are MIT-licensed. See [LICENSE](../LICENSE).
- **Privacy policy** — [PRIVACY.md](PRIVACY.md). Must be hosted at a public URL for store submission.
- **Data protection laws (GDPR, DPDP Act India, CCPA)** — Vello collects no personal data, so most obligations under these laws don't apply. The user's own contact data is the user's own; Vello doesn't process it on anyone's behalf.
- **Children** — Vello is not directed at children under 16. No data is collected from anyone.
- **Accessibility** — Vello aims for WCAG 2.1 AA. Audit and remediation is on the backlog (see [BACKLOG.md](BACKLOG.md) → accessibility).

## Roadmap

Tied to [BACKLOG.md](BACKLOG.md). Three time horizons:

### Now (v1.0.x patch)
- Documentation set (this task).
- CSP meta tag (B-19).
- Wallpaper safe-zone overlay (B-23).
- Studio scan-check debounce (B-24).
- "Copy vCard" button on Home (B-14).
- `aria-live` on toasts (B-03), Escape closes fullscreen QR (B-04).

### Next (v1.1)
- Staggered screen-enter animations (B-01), press feedback (B-02).
- Empty states (B-05, B-06, B-07).
- Drag-reorder social links (B-08).
- Custom font import for QR captions (B-16).
- Devanagari font fallback (B-18).
- Share-card layout variants (B-13).
- Unit tests for the four pure modules (B-30).
- Playwright network test (B-20).

### Later (v1.2+)
- i18n full rollout (B-17) — Hindi, Marathi, then Spanish, French, German.
- Service worker for deterministic offline (B-22).
- Native wrapper (Capacitor) for iOS and Android — unlocks SET_WALLPAPER, official Wallet pass (with a server), native notifications (off by default).
- Shareable custom presets (export a preset as a JSON link; import on another device).
- Paid style packs (subject to the monetisation principles above).
