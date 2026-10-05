/**
 * Slate QR payload builder + size meter.
 * Compact vCard → QR. Byte counting, thresholds, hard cap.
 */

import type { Card } from "@/shared/types";
import { LIMITS } from "@/shared/limits";
import { buildCompactVcard } from "./vcard";

/** Get the compact vCard payload for a card. */
export function getQrPayload(card: Card): string {
  return buildCompactVcard(card);
}

/** Count bytes (UTF-8) of a string. */
export function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

export type QrSizeStatus = "green" | "amber" | "red" | "overflow";

export interface QrSizeInfo {
  bytes: number;
  status: QrSizeStatus;
  label: string;
  hint: string;
  /** Approx QR version (1-40) based on byte-mode capacity at ECC M. */
  version: number;
}

/** Byte-mode capacity per QR version at ECC M (approx, standard table). */
const BYTE_CAP_M = [
  14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450,
  504, 534, 592, 640, 690, 740, 810, 858, 929, 1003, 1082, 1150, 1226, 1316,
  1370, 1448, 1530, 1620, 1722, 1800, 1900, 1992, 2102, 2218, 2332,
];

export function getQrSizeInfo(card: Card): QrSizeInfo {
  const payload = getQrPayload(card);
  const bytes = byteLength(payload);

  let status: QrSizeStatus;
  let label: string;
  let hint: string;

  if (bytes > LIMITS.qrHardCap) {
    status = "overflow";
    label = "Too large";
    hint = "Remove some fields — the QR can't encode this much.";
  } else if (bytes > LIMITS.qrAmber) {
    status = "red";
    label = "Large";
    hint = "Getting dense. Fewer fields scan more reliably.";
  } else if (bytes > LIMITS.qrGreen) {
    status = "amber";
    label = "Fine";
    hint = "Scans well. Keep it under 250 bytes for instant scanning.";
  } else {
    status = "green";
    label = "Scans great";
    hint = "Compact and fast to scan.";
  }

  // estimate version
  let version = 1;
  for (let i = 0; i < BYTE_CAP_M.length; i++) {
    if (bytes <= BYTE_CAP_M[i]) {
      version = i + 1;
      break;
    }
    version = 40;
  }

  return { bytes, status, label, hint, version };
}

/** Determine if QR is too large to encode at all. */
export function isQrOverflow(card: Card): boolean {
  return byteLength(getQrPayload(card)) > LIMITS.qrHardCap;
}
