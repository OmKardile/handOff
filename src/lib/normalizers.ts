/**
 * HandOff field normalizers.
 * Trim, validate, canonicalise. Reject malicious input.
 * Social URLs are built from validated handles, never stored as arbitrary URLs.
 */

import { parsePhoneNumberFromString } from "libphonenumber-js";
import { DEFAULT_REGION, LIMITS } from "@/shared/limits";

/** Remove control characters and trim. */
export function cleanText(input: string, max: number): string {
  if (!input) return "";
  // Strip control chars except tab/newline (we don't keep those anyway)
  const stripped = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return stripped.trim().slice(0, max);
}

export function normalizeName(input: string): string {
  return cleanText(input, LIMITS.firstName).replace(/\s+/g, " ");
}

export function normalizeJobTitle(input: string): string {
  return cleanText(input, LIMITS.jobTitle).replace(/\s+/g, " ");
}

export function normalizeCompany(input: string): string {
  return cleanText(input, LIMITS.company).replace(/\s+/g, " ");
}

export function normalizeLocation(input: string): string {
  return cleanText(input, LIMITS.location).replace(/\s+/g, " ");
}

export function normalizePhone(input: string): string {
  if (!input) return "";
  const cleaned = input.replace(/[^\d+\s().-]/g, "").trim();
  if (!cleaned) return "";
  const parsed = parsePhoneNumberFromString(cleaned, DEFAULT_REGION);
  if (!parsed || !parsed.isValid()) return "";
  return parsed.number; // E.164
}

export function normalizeEmail(input: string): string {
  const v = cleanText(input, LIMITS.email).toLowerCase();
  // RFC 5322 simplified
  const re = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;
  return re.test(v) ? v : "";
}

export function normalizeWebsite(input: string): string {
  let v = cleanText(input, LIMITS.website);
  if (!v) return "";
  // reject javascript:/data:
  if (/^\s*(javascript|data|file|vbscript):/i.test(v)) return "";
  if (!/^https?:\/\//i.test(v)) {
    v = "https://" + v;
  }
  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    // require a hostname with a dot (or localhost for dev)
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return "";
    // normalize: lowercase host, strip trailing slash, keep path
    url.hostname = url.hostname.toLowerCase();
    let out = url.toString().replace(/\/$/, "");
    return out;
  } catch {
    return "";
  }
}

export function normalizeLinkedin(input: string): string {
  let v = cleanText(input, LIMITS.linkedinHandle);
  if (!v) return "";
  // accept full URL, "in/handle", or bare handle
  if (/^https?:\/\//i.test(v)) {
    try {
      const url = new URL(v);
      if (!/linkedin\.com$/i.test(url.hostname) && !url.hostname.endsWith(".linkedin.com"))
        return "";
      return url.toString().replace(/\/$/, "");
    } catch {
      return "";
    }
  }
  // strip leading "in/"
  v = v.replace(/^\/?in\/?/i, "");
  v = v.replace(/^@/, "");
  if (!/^[A-Za-z0-9][A-Za-z0-9\-_%]{0,98}$/.test(v)) return "";
  return `https://www.linkedin.com/in/${v.toLowerCase()}`;
}

export function normalizeInstagram(input: string): string {
  let v = cleanText(input, LIMITS.instagramHandle);
  if (!v) return "";
  v = v.replace(/^@/, "");
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  v = v.replace(/\/.*$/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(v)) return "";
  return `https://www.instagram.com/${v}`;
}

export function normalizeX(input: string): string {
  let v = cleanText(input, LIMITS.xHandle);
  if (!v) return "";
  v = v.replace(/^@/, "");
  v = v.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "");
  v = v.replace(/\/.*$/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(v)) return "";
  return `https://x.com/${v}`;
}

export function normalizeWhatsapp(input: string): string {
  const e164 = normalizePhone(input);
  if (!e164) return "";
  return e164; // stored E.164; wa.me/{digits} built at export
}

/** Sanitise a filename to ASCII-safe. */
export function sanitizeFilename(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base || "contact";
}

/** Build a vCard filename "First-Last.vcf". */
export function vcardFilename(first: string, last: string): string {
  const parts = [first, last].filter(Boolean).map((p) => sanitizeFilename(p));
  const name = parts.join("-") || "contact";
  return `${name}.vcf`;
}
