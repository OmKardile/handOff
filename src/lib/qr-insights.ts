/**
 * Vello QR insights — per-field byte breakdown of the compact vCard payload.
 * Shows how much each field contributes to the total QR size, so users can
 * make informed decisions about what to include.
 */

import type { Card } from "@/shared/types";
import { escapeVcardText } from "./vcard";

const CRLF = "\r\n";

/** Compute the byte length (UTF-8) of a string. */
function bytes(s: string): number {
  return new TextEncoder().encode(s).length;
}

export interface FieldByteInfo {
  id: string;
  label: string;
  bytes: number;
  included: boolean;
}

/** Per-field byte contributions for the compact QR vCard. */
export function getFieldBytes(card: Card): FieldByteInfo[] {
  const inc = card.qrInclude;
  const fields: FieldByteInfo[] = [];

  // Helper to compute a vCard line's bytes (including CRLF)
  const line = (content: string) => bytes(content + CRLF);

  // Envelope (always present)
  fields.push({ id: "envelope", label: "vCard envelope", bytes: bytes("BEGIN:VCARD" + CRLF + "VERSION:3.0" + CRLF + "END:VCARD" + CRLF), included: true });

  // Name
  if (inc.name) {
    const first = card.firstName.trim();
    const last = card.lastName.trim();
    const nBytes = line(`N:${escapeVcardText(last)};${escapeVcardText(first)};;;`);
    const fn = [first, last].filter(Boolean).join(" ").trim() || (inc.title || inc.company ? [card.jobTitle, card.company].filter(Boolean).join(", ") : "");
    const fnBytes = line(`FN:${escapeVcardText(fn)}`);
    fields.push({ id: "name", label: "Name", bytes: nBytes + fnBytes, included: true });
  }

  if (inc.company && card.company) {
    fields.push({ id: "company", label: "Company", bytes: line(`ORG:${escapeVcardText(card.company)}`), included: true });
  }
  if (inc.title && card.jobTitle) {
    fields.push({ id: "title", label: "Job title", bytes: line(`TITLE:${escapeVcardText(card.jobTitle)}`), included: true });
  }
  if (inc.phone && card.phone) {
    fields.push({ id: "phone", label: "Phone", bytes: line(`TEL;TYPE=CELL:${card.phone}`), included: true });
  }
  if (inc.email && card.email) {
    fields.push({ id: "email", label: "Email", bytes: line(`EMAIL:${card.email}`), included: true });
  }
  if (inc.website && card.website) {
    fields.push({ id: "website", label: "Website", bytes: line(`URL:${card.website}`), included: true });
  }
  if (inc.location && card.location) {
    fields.push({ id: "location", label: "Location", bytes: line(`ADR;TYPE=WORK:;;;${escapeVcardText(card.location)};;;`), included: true });
  }

  const order = card.socialOrder?.length === 4 ? card.socialOrder : ["linkedin", "instagram", "x", "whatsapp"];
  for (const sid of order) {
    if (sid === "linkedin" && inc.linkedin && card.linkedin) fields.push({ id: "linkedin", label: "LinkedIn", bytes: line(`URL:${card.linkedin}`), included: true });
    if (sid === "instagram" && inc.instagram && card.instagram) fields.push({ id: "instagram", label: "Instagram", bytes: line(`URL:${card.instagram}`), included: true });
    if (sid === "x" && inc.x && card.xHandle) fields.push({ id: "x", label: "X", bytes: line(`URL:${card.xHandle}`), included: true });
    if (sid === "whatsapp" && inc.whatsapp && card.whatsapp) fields.push({ id: "whatsapp", label: "WhatsApp", bytes: line(`URL:https://wa.me/${card.whatsapp.replace(/^\+/, "")}`), included: true });
  }

  return fields;
}

/** Total bytes of the included fields. */
export function getTotalBytes(fields: FieldByteInfo[]): number {
  return fields.reduce((sum, f) => sum + f.bytes, 0);
}

/** Format a plain-text contact card for copying into notes/messages. */
export function formatContactText(card: Card): string {
  const lines: string[] = [];
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  if (name) lines.push(name);
  if (card.jobTitle) lines.push(card.jobTitle);
  if (card.company) lines.push(card.company);
  if (card.phone) lines.push(card.phone);
  if (card.email) lines.push(card.email);
  if (card.website) lines.push(card.website.replace(/^https?:\/\//, ""));
  if (card.location) lines.push(card.location);
  const order = card.socialOrder?.length === 4 ? card.socialOrder : ["linkedin", "instagram", "x", "whatsapp"];
  for (const sid of order) {
    if (sid === "linkedin" && card.linkedin) lines.push(`LinkedIn: ${card.linkedin}`);
    if (sid === "instagram" && card.instagram) lines.push(`Instagram: ${card.instagram}`);
    if (sid === "x" && card.xHandle) lines.push(`X: ${card.xHandle}`);
    if (sid === "whatsapp" && card.whatsapp) lines.push(`WhatsApp: ${card.whatsapp}`);
  }
  return lines.join("\n");
}
