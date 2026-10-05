/**
 * HandOff scan-check.
 * After every style change / before export, render QR → decode with jsQR.
 * Compare decoded payload to the source. Warn, never block.
 */

import jsQR from "jsqr";

export interface ScanResult {
  ok: boolean;
  message: string;
  /** 0-1 contrast ratio between modules and background. */
  contrast: number;
}

/** Decode a QR from an ImageData-like {data,width,height}. */
export function decodeQrFromImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number
): string | null {
  const res = jsQR(data, width, height, { inversionAttempts: "dontInvert" });
  return res?.data ?? null;
}

/** Decode from a canvas. */
export function decodeQrFromCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  return decodeQrFromImageData(imageData.data, width, height);
}

/** Compute WCAG-style contrast ratio between two hex colors. */
export function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "");
  const full =
    m.length === 3
      ? m.split("").map((c) => c + c).join("")
      : m;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Evaluate scan + contrast for a given style. */
export function evaluateScan(
  canvas: HTMLCanvasElement,
  expectedPayload: string,
  moduleColor: string,
  background: string
): ScanResult {
  const decoded = decodeQrFromCanvas(canvas);
  const contrast = contrastRatio(moduleColor, background);
  const ok = decoded === expectedPayload;

  if (ok && contrast >= 4.5) {
    return { ok: true, message: "Scans well", contrast };
  }
  if (ok && contrast >= 3) {
    return { ok: true, message: "Scans, but contrast is a bit low", contrast };
  }
  if (!ok && contrast < 3) {
    return {
      ok: false,
      message: "Might be hard to scan: try higher contrast or a smaller centre image.",
      contrast,
    };
  }
  return {
    ok: false,
    message: "Couldn't verify. Try higher contrast or a smaller centre image.",
    contrast,
  };
}
