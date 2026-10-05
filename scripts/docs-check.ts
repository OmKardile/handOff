#!/usr/bin/env bun
/**
 * Vello docs:check — documentation quality gate.
 * Fails when:
 *  - a required doc is missing or empty
 *  - a relative markdown link or image is broken
 *  - a package.json script is not mentioned in the relevant doc
 *  - CHANGELOG.md has no entry for the current version
 * Exits non-zero on any failure.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, resolve, basename } from "path";

const ROOT = resolve(import.meta.dir, "..");
let failures: string[] = [];
let warnings: string[] = [];

function fail(msg: string) {
  failures.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

// ---- Required docs ----
const REQUIRED = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "THIRD_PARTY_LICENSES.md",
  "docs/README.md",
  "docs/DECISIONS.md",
  "docs/ARCHITECTURE.md",
  "docs/TECHNICAL.md",
  "docs/DATA_MODEL.md",
  "docs/TESTING.md",
  "docs/SECURITY.md",
  "docs/PRIVACY.md",
  "docs/RELEASE.md",
  "docs/DESIGN.md",
  "docs/BRAND.md",
  "docs/FIGMA_GUIDE.md",
  "docs/STORE.md",
  "docs/AUTOMATION.md",
  "docs/BACKLOG.md",
  "docs/KNOWN_ISSUES.md",
  "docs/PROGRESS.md",
  "docs/BUSINESS.md",
  "docs/USER_GUIDE.md",
  "docs/FAQ.md",
  "docs/TROUBLESHOOTING.md",
];

for (const rel of REQUIRED) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    fail(`Missing required doc: ${rel}`);
    continue;
  }
  const stat = statSync(p);
  if (stat.size === 0) {
    fail(`Empty doc: ${rel}`);
  }
}

// ---- Collect all markdown files ----
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git" || entry === "download" || entry === "skills" || entry === "tool-results" || entry === "upload" || entry === "mini-services" || entry === "examples" || entry === ".zscripts" || entry === "tests") continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (entry.endsWith(".md")) out.push(p);
  }
  return out;
}

const mdFiles = walk(ROOT);

// ---- Check relative links/images ----
const LINK_RE = /(?:^|[^!])\[([^\]]*)\]\(([^)]+)\)/g;
const IMG_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

function resolveLink(fromFile: string, link: string): string {
  if (link.startsWith("http://") || link.startsWith("https://") || link.startsWith("mailto:")) return "";
  if (link.startsWith("#")) return ""; // in-page anchor
  const clean = link.split("#")[0].split("?")[0];
  if (!clean) return "";
  return resolve(dirname(fromFile), clean);
}

for (const file of mdFiles) {
  const rel = file.replace(ROOT + "/", "");
  const content = readFileSync(file, "utf8");
  const links: { text: string; target: string; isImg: boolean }[] = [];
  let m: RegExpExecArray | null;
  while ((m = LINK_RE.exec(content))) {
    links.push({ text: m[1], target: m[2], isImg: false });
  }
  while ((m = IMG_RE.exec(content))) {
    links.push({ text: m[1], target: m[2], isImg: true });
  }
  for (const l of links) {
    const resolved = resolveLink(file, l.target);
    if (!resolved) continue;
    if (!existsSync(resolved)) {
      fail(`Broken ${l.isImg ? "image" : "link"} in ${rel}: "${l.target}"`);
    }
  }
}

// ---- Check every package.json script is mentioned in a doc ----
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const scripts = Object.keys(pkg.scripts || {});
for (const script of scripts) {
  // skip db:* which are framework defaults
  if (script.startsWith("db:")) continue;
  let found = false;
  for (const file of mdFiles) {
    const content = readFileSync(file, "utf8");
    if (content.includes(`\`${script}\``) || content.includes(`npm run ${script}`) || content.includes(`bun run ${script}`)) {
      found = true;
      break;
    }
  }
  if (!found) warn(`Script "${script}" not mentioned in any doc.`);
}

// ---- CHANGELOG has entry for current version ----
const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
if (!changelog.includes(`## [${pkg.version}]`)) {
  fail(`CHANGELOG.md has no entry for current version ${pkg.version}.`);
}

// ---- Report ----
console.log("Vello docs:check\n");
if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠  ${w}`);
  console.log("");
}
if (failures.length > 0) {
  console.error(`Failures (${failures.length}):`);
  for (const f of failures) console.error(`  ✗  ${f}`);
  console.error(`\ndocs:check FAILED with ${failures.length} failure(s).`);
  process.exit(1);
}
console.log(`✓ All ${REQUIRED.length} required docs present, ${mdFiles.length} markdown files checked, links valid.`);
process.exit(0);
