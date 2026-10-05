# Vello documentation

This folder holds the complete Vello documentation set. The root [README.md](../README.md) has the developer overview; each file below is a focused reference.

| File | What it covers |
| --- | --- |
| [DECISIONS.md](DECISIONS.md) | Numbered, dated decision log (D1–D10) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Layers, module boundaries, data flow, storage, build, Mermaid diagram |
| [TECHNICAL.md](TECHNICAL.md) | Module-by-module reference for `src/lib` and `src/shared`, with format specs and tables |
| [DATA_MODEL.md](DATA_MODEL.md) | Card, QrStyle, Settings, PhotoData, CustomPreset schemas + limits + normalisation rules |
| [TESTING.md](TESTING.md) | Test strategy, what each covers, known gaps |
| [SECURITY.md](SECURITY.md) | Threat model for a local-only app and how it's enforced |
| [PRIVACY.md](PRIVACY.md) | Plain-language privacy policy |
| [RELEASE.md](RELEASE.md) | Version bump, build, store submission steps |
| [DESIGN.md](DESIGN.md) | Rationale, token tables, screen inventory, reference patterns |
| [BRAND.md](BRAND.md) | Naming process, criteria, tagline, identifiers, voice, trademark caveat |
| [FIGMA_GUIDE.md](FIGMA_GUIDE.md) | Honest note that no `.fig` exists; packaged tokens and import guide for a designer |
| [STORE.md](STORE.md) | Store listing copy, screenshot plan, data safety answers, pre-submission checklist |
| [AUTOMATION.md](AUTOMATION.md) | Scheduled review cron, `docs:check`, `check:privacy` |
| [BACKLOG.md](BACKLOG.md) | 25+ prioritised small improvements with acceptance criteria |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | Honest list of current limits |
| [PROGRESS.md](PROGRESS.md) | Current status, completed features, next steps |
| [BUSINESS.md](BUSINESS.md) | Positioning, market, monetisation, risks, roadmap |
| [USER_GUIDE.md](USER_GUIDE.md) | End-user manual (mirrors the in-app help centre) |
| [FAQ.md](FAQ.md) | Frequently asked questions |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and fixes |

## Conventions

- All docs are Markdown. Relative links must resolve (the `docs:check` script enforces this).
- Every script in [`../package.json`](../package.json) is mentioned in some doc (also enforced).
- The CHANGELOG entry for the current `package.json` version must exist.
- The footer credit "Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/)" appears in this file and in [../README.md](../README.md) and [../CONTRIBUTING.md](../CONTRIBUTING.md).

---

Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/).
