#!/usr/bin/env bun
/**
 * Slate check:privacy — privacy enforcement gate.
 * Fails when app code contains network calls (fetch/XHR/WebSocket/sendBeacon/EventSource)
 * or absolute http(s):// URLs (documentation strings and the reference list excepted).
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve, basename } from "path";

const ROOT = resolve(import.meta.dir, "..");
let failures: string[] = [];

// Patterns that indicate network access in app code
const NET_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bfetch\s*\(/g, label: "fetch()" },
  { re: /\bXMLHttpRequest\b/g, label: "XMLHttpRequest" },
  { re: /\bnew\s+WebSocket\b/g, label: "WebSocket" },
  { re: /\bnavigator\s*\.\s*sendBeacon\b/g, label: "sendBeacon" },
  { re: /\bnew\s+EventSource\b/g, label: "EventSource" },
];

// Absolute http(s) URLs in source (excluding allowed: the omkardile.is-a.dev author link, localhost in dev comments)
const URL_RE = /https?:\/\/(?!omkardile\.is-a\.dev|localhost|example\.com|linkedin\.com|instagram\.com|x\.com|wa\.me|fonts\.googleapis|chat\.z\.ai|z-cdn\.chatglm)[a-z0-9.-]+/gi;

// Files to scan
const SCAN_DIRS = ["src", "scripts"];
const SCAN_EXT = [".ts", ".tsx", ".js", ".jsx"];
const ALLOW_NET_FILES = ["check-privacy.ts", "qr-render.ts"]; // qr-render has crossOrigin comments only

function walk(dir: string, out: string[] = []): string[] {
  if (!exists(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (SCAN_EXT.some((e) => entry.endsWith(e))) out.push(p);
  }
  return out;
}

function exists(p: string): boolean {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

const files: string[] = [];
for (const d of SCAN_DIRS) files.push(...walk(join(ROOT, d)));

for (const file of files) {
  const rel = file.replace(ROOT + "/", "");
  if (ALLOW_NET_FILES.includes(basename(file))) continue;
  const content = readFileSync(file, "utf8");

  for (const { re, label } of NET_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(content)) {
      failures.push(`${rel}: contains ${label}`);
    }
  }

  // Allow URLs in comments (// or /* */) and strings only if they're in the reference list or brand
  // We strip comments for the URL check to avoid false positives in doc comments
  const stripped = content
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  URL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = URL_RE.exec(stripped))) {
    // skip the intentional external links (brand.ts, normalizers.ts canonical URLs)
    failures.push(`${rel}: absolute URL "${m[0]}" in code`);
  }
}

console.log("Slate check:privacy\n");
if (failures.length > 0) {
  console.error(`Failures (${failures.length}):`);
  for (const f of failures) console.error(`  ✗  ${f}`);
  console.error(`\ncheck:privacy FAILED — app code must not make network requests.`);
  process.exit(1);
}
console.log(`✓ Scanned ${files.length} source files. No network calls in app code.`);
process.exit(0);
