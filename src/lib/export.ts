/**
 * Vello export utilities.
 * PNG (≥1200px), SVG, print card (1050x600), story (9:16), square (1:1), .vcf.
 * All reflect the current style. QR always dark-on-light.
 */

import type { Card, QrStyle } from "@/shared/types";
import { getQrPayload } from "./qr";
import { renderQrToCanvas, canvasToBlob, createQr } from "./qr-render";
import { buildFullVcard } from "./vcard";
import { vcardFilename } from "./normalizers";

/** Render the styled QR to a PNG blob at the given size. */
export async function exportQrPng(
  card: Card,
  style: QrStyle,
  size = 1200,
  photoDataUrl?: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderQrToCanvas(canvas, card, style, size, photoDataUrl);
  return canvasToBlob(canvas, "image/png");
}

/** Render the styled QR as an SVG string (via qr-code-styling). */
export async function exportQrSvg(card: Card, style: QrStyle): Promise<string> {
  const qr = createQr(card, style);
  // qr-code-styling supports svg output
  const blob = (await qr.getRawData("svg")) as Blob | null;
  if (!blob) throw new Error("SVG export failed");
  return await blob.text();
}

/** Print-ready business card PNG (1050x600, ECC H, QR ≥30% height). */
export async function exportPrintCard(
  card: Card,
  style: QrStyle,
  photoDataUrl?: string
): Promise<Blob> {
  const W = 1050;
  const H = 600;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // background
  ctx.fillStyle = style.background;
  ctx.fillRect(0, 0, W, H);

  // QR on the left (≥30% of height = 200px+, use 360px)
  const qrSize = 360;
  const qrX = 60;
  const qrY = (H - qrSize) / 2;

  const qrCanvas = document.createElement("canvas");
  await renderQrToCanvas(qrCanvas, card, { ...style, ecc: "H" }, qrSize, photoDataUrl);
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // text on the right
  const tx = qrX + qrSize + 60;
  ctx.fillStyle = style.moduleColor;
  await document.fonts.load('500 48px "Fraunces"');
  ctx.textBaseline = "top";

  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  if (name) {
    ctx.font = '500 52px "Fraunces", serif';
    ctx.fillText(name.slice(0, 26), tx, 140);
  }
  if (card.jobTitle) {
    ctx.font = '400 26px "Instrument Sans", sans-serif';
    ctx.fillText(card.jobTitle.slice(0, 36), tx, 210);
  }
  if (card.company) {
    ctx.font = '600 26px "Instrument Sans", sans-serif';
    ctx.fillText(card.company.slice(0, 36), tx, 250);
  }
  const contactLine = [card.phone, card.email].filter(Boolean).join("  ·  ");
  if (contactLine) {
    ctx.font = '400 22px "Instrument Sans", sans-serif';
    ctx.fillText(contactLine.slice(0, 44), tx, 330);
  }
  if (card.website) {
    ctx.font = '400 22px "Instrument Sans", sans-serif';
    ctx.fillText(card.website.replace(/^https?:\/\//, "").slice(0, 40), tx, 365);
  }

  return canvasToBlob(canvas, "image/png");
}

/** Story image (1080x1920, 9:16) with large QR centred. */
export async function exportStoryImage(
  card: Card,
  style: QrStyle,
  photoDataUrl?: string
): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // backdrop: use the module color for drama
  ctx.fillStyle = style.moduleColor;
  ctx.fillRect(0, 0, W, H);

  const qrSize = 720;
  const qrCanvas = document.createElement("canvas");
  await renderQrToCanvas(qrCanvas, card, style, qrSize, photoDataUrl);
  ctx.drawImage(qrCanvas, (W - qrSize) / 2, 480, qrSize, qrSize);

  ctx.fillStyle = style.background;
  await document.fonts.load('500 64px "Fraunces"');
  ctx.textAlign = "center";
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  if (name) {
    ctx.font = '500 72px "Fraunces", serif';
    ctx.fillText(name.slice(0, 24), W / 2, 1320);
  }
  if (card.jobTitle) {
    ctx.font = '400 36px "Instrument Sans", sans-serif';
    ctx.fillText(card.jobTitle.slice(0, 40), W / 2, 1380);
  }
  ctx.font = '400 30px "Instrument Sans", sans-serif';
  ctx.fillText("Scan to save my contact", W / 2, 1440);

  return canvasToBlob(canvas, "image/png");
}

/** Square share image (1080x1080). */
export async function exportSquareImage(
  card: Card,
  style: QrStyle,
  photoDataUrl?: string
): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = style.background;
  ctx.fillRect(0, 0, W, H);

  const qrSize = 600;
  const qrCanvas = document.createElement("canvas");
  await renderQrToCanvas(qrCanvas, card, style, qrSize, photoDataUrl);
  ctx.drawImage(qrCanvas, (W - qrSize) / 2, 120, qrSize, qrSize);

  ctx.fillStyle = style.moduleColor;
  await document.fonts.load('500 56px "Fraunces"');
  ctx.textAlign = "center";
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  if (name) {
    ctx.font = '500 56px "Fraunces", serif';
    ctx.fillText(name.slice(0, 26), W / 2, 800);
  }
  if (card.jobTitle) {
    ctx.font = '400 32px "Instrument Sans", sans-serif';
    ctx.fillText(card.jobTitle.slice(0, 40), W / 2, 860);
  }
  ctx.font = '400 28px "Instrument Sans", sans-serif';
  ctx.fillText("Scan to save my contact", W / 2, 920);

  return canvasToBlob(canvas, "image/png");
}

/** Wallet-optimised image (1080x1350). Pure light plate, large clean QR, name beneath. */
export async function exportWalletImage(
  card: Card,
  style: QrStyle,
  photoDataUrl?: string
): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // pure light plate — never gradient behind QR
  ctx.fillStyle = "#fffefb";
  ctx.fillRect(0, 0, W, H);

  // very large clean QR (≥70% width), ECC M, no centre, plain style
  const qrSize = 800;
  const plainStyle: QrStyle = {
    ...style,
    ecc: "M",
    centerType: "none",
    centerSize: 0,
    moduleColor: "#161619",
    moduleGradient: null,
    eyeOuterColor: "#161619",
    eyeInnerColor: "#161619",
    background: "#fffefb",
    backgroundGradient: null,
    captionEnabled: false,
    plateRadius: 0,
    platePadding: 1,
  };
  const qrCanvas = document.createElement("canvas");
  await renderQrToCanvas(qrCanvas, card, plainStyle, qrSize, photoDataUrl);
  ctx.drawImage(qrCanvas, (W - qrSize) / 2, 100, qrSize, qrSize);

  ctx.fillStyle = "#161619";
  await document.fonts.load('600 52px "Fraunces"');
  ctx.textAlign = "center";
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  if (name) {
    ctx.font = '600 52px "Fraunces", serif';
    ctx.fillText(name.slice(0, 28), W / 2, 1020);
  }
  if (card.jobTitle) {
    ctx.font = '400 34px "Instrument Sans", sans-serif';
    ctx.fillText(card.jobTitle.slice(0, 40), W / 2, 1080);
  }
  return canvasToBlob(canvas, "image/png");
}

/** Build the .vcf file content with optional photo (256px base64). */
export function buildVcfContent(card: Card, photoThumb?: string): string {
  // strip data URL prefix for base64
  const photoBase64 = photoThumb?.replace(/^data:image\/jpeg;base64,/, "");
  return buildFullVcard(card, photoBase64);
}

/** Trigger a file download (web). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Trigger a text download (for .vcf). */
export function downloadText(text: string, filename: string, mime = "text/vcard"): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  downloadBlob(blob, filename);
}

/** Share via Web Share API if available, else download. */
export async function shareOrDownload(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: blob.type });
  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title, text });
      return "shared";
    } catch {
      /* user cancelled, fall through to download */
    }
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

/** Export the .vcf file with proper filename + MIME. */
export function exportVcf(card: Card, photoThumb?: string): void {
  const content = buildVcfContent(card, photoThumb);
  const filename = vcardFilename(card.firstName, card.lastName);
  downloadText(content, filename, "text/vcard");
}

export { getQrPayload };
