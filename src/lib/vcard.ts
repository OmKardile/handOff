/**
 * HandOff vCard builder.
 * One module, two modes: compact (for QR, byte-efficient) and full (for .vcf).
 * Shared escaping + line-folding core. CRLF, UTF-8.
 */

import type { Card } from "@/shared/types";

/** Escape vCard text values: \ ; , and newlines. */
export function escapeVcardText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Fold a line at 75 OCTETS, inserting a space + CRLF.
 * Never splits a multibyte character (uses a byte-aware approach).
 */
export function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  const decoder = new TextDecoder("utf-8", { fatal: false });
  while (i < bytes.length) {
    let end = i + 75;
    // don't split in the middle of a multibyte sequence: back up to a leading byte
    if (end < bytes.length) {
      while (end > i && (bytes[end] & 0xc0) === 0x80) end--;
    }
    chunks.push(decoder.decode(bytes.subarray(i, end), { stream: true }));
    i = end;
  }
  chunks.push(decoder.decode());
  return chunks.filter(Boolean).join("\r\n ");
}

const CRLF = "\r\n";

/** Build a compact vCard 3.0 for the QR payload. No PRODID/REV/UID/PHOTO. */
export function buildCompactVcard(card: Card): string {
  const inc = card.qrInclude;
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  const fnParts: string[] = [];
  if (inc.name) {
    const first = card.firstName.trim();
    const last = card.lastName.trim();
    if (first || last) {
      lines.push(`N:${escapeVcardText(last)};${escapeVcardText(first)};;;`);
      fnParts.push([first, last].filter(Boolean).join(" ").trim());
    }
  }
  if (inc.company && card.company) {
    lines.push(`ORG:${escapeVcardText(card.company)}`);
  }
  if (inc.title && card.jobTitle) {
    lines.push(`TITLE:${escapeVcardText(card.jobTitle)}`);
  }
  if (fnParts.length === 0 && (inc.title || inc.company)) {
    // need an FN even if name excluded
    const fallback = [card.jobTitle, card.company].filter(Boolean).join(", ");
    fnParts.push(fallback);
  }
  if (fnParts.length > 0) {
    lines.push(`FN:${escapeVcardText(fnParts[0])}`);
  } else {
    lines.push("FN:");
  }

  if (inc.phone && card.phone) {
    lines.push(`TEL;TYPE=CELL:${card.phone}`);
  }
  if (inc.email && card.email) {
    lines.push(`EMAIL:${card.email}`);
  }
  if (inc.website && card.website) {
    lines.push(`URL:${card.website}`);
  }
  if (inc.location && card.location) {
    lines.push(`ADR;TYPE=WORK:;;;${escapeVcardText(card.location)};;;`);
  }
  // social links: one plain URL line each, in the user's chosen order
  const order = card.socialOrder?.length === 4 ? card.socialOrder : ["linkedin", "instagram", "x", "whatsapp"];
  for (const id of order) {
    if (id === "linkedin" && inc.linkedin && card.linkedin) lines.push(`URL:${card.linkedin}`);
    if (id === "instagram" && inc.instagram && card.instagram) lines.push(`URL:${card.instagram}`);
    if (id === "x" && inc.x && card.xHandle) lines.push(`URL:${card.xHandle}`);
    if (id === "whatsapp" && inc.whatsapp && card.whatsapp) {
      lines.push(`URL:https://wa.me/${card.whatsapp.replace(/^\+/, "")}`);
    }
  }

  lines.push("END:VCARD");
  return lines.join(CRLF);
}

/** Build a full vCard 3.0 for .vcf export (photo, folding, social labels). */
export function buildFullVcard(card: Card, photoBase64?: string): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  const first = card.firstName.trim();
  const last = card.lastName.trim();
  lines.push(`N:${escapeVcardText(last)};${escapeVcardText(first)};;;`);
  const fn = [first, last].filter(Boolean).join(" ").trim() || "Contact";
  lines.push(`FN:${escapeVcardText(fn)}`);

  if (card.company) lines.push(`ORG:${escapeVcardText(card.company)}`);
  if (card.jobTitle) lines.push(`TITLE:${escapeVcardText(card.jobTitle)}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL,VOICE:${card.phone}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${card.email}`);
  if (card.website) lines.push(`URL;TYPE=WORK:${card.website}`);
  if (card.location) {
    lines.push(`ADR;TYPE=WORK:;;;${escapeVcardText(card.location)};;;`);
  }

  // Social links as itemN.URL + itemN.X-ABLabel (numbered sequentially, in user's order)
  const order = card.socialOrder?.length === 4 ? card.socialOrder : ["linkedin", "instagram", "x", "whatsapp"];
  const socialMap: Record<string, [string, string]> = {};
  if (card.linkedin) socialMap.linkedin = ["LinkedIn", card.linkedin];
  if (card.instagram) socialMap.instagram = ["Instagram", card.instagram];
  if (card.xHandle) socialMap.x = ["X", card.xHandle];
  if (card.whatsapp) socialMap.whatsapp = ["WhatsApp", `https://wa.me/${card.whatsapp.replace(/^\+/, "")}`];
  const socials: [string, string][] = order.map((id) => socialMap[id]).filter(Boolean) as [string, string][];

  let itemN = 1;
  for (const [label, url] of socials) {
    lines.push(`item${itemN}.URL:${url}`);
    lines.push(`item${itemN}.X-ABLABEL:${escapeVcardText(label)}`);
    itemN++;
  }

  // PHOTO (256px JPEG base64, folded)
  if (photoBase64) {
    const photoLine = `PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`;
    lines.push(foldLine(photoLine));
  }

  lines.push(`UID:urn:uuid:${card.id}`);
  lines.push(`PRODID:-//HandOff//Digital Business Card//EN`);
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  return lines.map((l) => (l.startsWith("PHOTO") ? l : foldLine(l))).join(CRLF);
}

/** A short, stable fingerprint of the QR payload to detect real changes. */
export async function qrFingerprint(payload: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(payload);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .slice(0, 8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // fallback (non-crypto): simple djb2
  let h = 5381;
  for (let i = 0; i < payload.length; i++) h = (h * 33) ^ payload.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, "0");
}
