/**
 * HandOff export utilities.
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

export type ShareCardLayout = "hairline" | "plaque" | "ticket" | "polaroid";

export const SHARE_CARD_LAYOUTS: { id: ShareCardLayout; name: string; desc: string }[] = [
  { id: "hairline", name: "Hairline", desc: "Minimal, editorial. Thin rules, generous space." },
  { id: "plaque", name: "Plaque", desc: "Dark plaque with a single accent rule." },
  { id: "ticket", name: "Ticket", desc: "Notched ticket with perforated edge." },
  { id: "polaroid", name: "Polaroid", desc: "Photo-first card with handwritten caption." },
];

/** Render a named share-card layout (1080×1350 PNG). */
export async function exportShareCard(
  card: Card,
  style: QrStyle,
  layout: ShareCardLayout,
  photoDataUrl?: string
): Promise<Blob> {
  switch (layout) {
    case "hairline":
      return exportHairline(card, style, photoDataUrl);
    case "plaque":
      return exportPlaque(card, style, photoDataUrl);
    case "ticket":
      return exportTicket(card, style, photoDataUrl);
    case "polaroid":
      return exportPolaroid(card, style, photoDataUrl);
  }
}

const SC_W = 1080;
const SC_H = 1350;
const fullName = (c: Card) => [c.firstName, c.lastName].filter(Boolean).join(" ") || "Your name";

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load('500 64px "Fraunces"'),
      document.fonts.load('400 32px "Instrument Sans"'),
      document.fonts.load('500 48px "Fraunces"'),
    ]);
    await document.fonts.ready;
  } catch { /* ignore */ }
}

/** Hairline: minimal, editorial. Light plate, thin rules, QR centered, name beneath. */
async function exportHairline(card: Card, style: QrStyle, photoDataUrl?: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SC_W;
  canvas.height = SC_H;
  const ctx = canvas.getContext("2d")!;
  await loadFonts();

  ctx.fillStyle = "#fffefb";
  ctx.fillRect(0, 0, SC_W, SC_H);

  // top + bottom hairlines
  ctx.strokeStyle = "#161619";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 120); ctx.lineTo(SC_W - 120, 120);
  ctx.moveTo(120, SC_H - 120); ctx.lineTo(SC_W - 120, SC_H - 120);
  ctx.stroke();

  // eyebrow text
  ctx.fillStyle = "#b0533a";
  ctx.textAlign = "center";
  ctx.font = '500 20px "Instrument Sans", sans-serif';
  const eyebrow = (card.company || "DIGITAL CARD").toUpperCase();
  ctx.fillText(eyebrow.slice(0, 40), SC_W / 2, 180);

  // QR
  const qrSize = 620;
  const qrCanvas = document.createElement("canvas");
  await renderQrToCanvas(qrCanvas, card, style, qrSize, photoDataUrl);
  ctx.drawImage(qrCanvas, (SC_W - qrSize) / 2, 280, qrSize, qrSize);

  // name
  ctx.fillStyle = "#161619";
  ctx.font = '500 68px "Fraunces", serif';
  ctx.fillText(fullName(card).slice(0, 26), SC_W / 2, 1020);

  if (card.jobTitle) {
    ctx.font = '400 30px "Instrument Sans", sans-serif';
    ctx.fillStyle = "#6b655c";
    ctx.fillText(card.jobTitle.slice(0, 44), SC_W / 2, 1075);
  }

  // footer caption
  ctx.font = '400 24px "Instrument Sans", sans-serif';
  ctx.fillStyle = "#9b958a";
  ctx.fillText("Scan to save my contact", SC_W / 2, SC_H - 165);

  return canvasToBlob(canvas, "image/png");
}

/** Plaque: dark plaque with a single clay accent rule. */
async function exportPlaque(card: Card, style: QrStyle, photoDataUrl?: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SC_W;
  canvas.height = SC_H;
  const ctx = canvas.getContext("2d")!;
  await loadFonts();

  // dark plaque
  ctx.fillStyle = "#161619";
  ctx.fillRect(0, 0, SC_W, SC_H);

  // inset plate for QR
  const plateX = 140, plateY = 280, plateW = SC_W - 280, plateH = 620;
  ctx.fillStyle = "#fffefb";
  roundRectFill(ctx, plateX, plateY, plateW, plateH, 8);
  ctx.fill();

  const qrSize = 540;
  const qrCanvas = document.createElement("canvas");
  await renderQrToCanvas(qrCanvas, card, { ...style, plateRadius: 0 }, qrSize, photoDataUrl);
  ctx.drawImage(qrCanvas, plateX + (plateW - qrSize) / 2, plateY + (plateH - qrSize) / 2, qrSize, qrSize);

  // clay accent rule
  ctx.strokeStyle = "#b0533a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(SC_W / 2 - 40, 990); ctx.lineTo(SC_W / 2 + 40, 990);
  ctx.stroke();

  // name (light)
  ctx.fillStyle = "#ece7de";
  ctx.textAlign = "center";
  ctx.font = '500 64px "Fraunces", serif';
  ctx.fillText(fullName(card).slice(0, 26), SC_W / 2, 1070);

  if (card.jobTitle) {
    ctx.font = '400 28px "Instrument Sans", sans-serif';
    ctx.fillStyle = "#9b958a";
    ctx.fillText(card.jobTitle.slice(0, 44), SC_W / 2, 1120);
  }

  ctx.font = '400 22px "Instrument Sans", sans-serif';
  ctx.fillStyle = "#6b655c";
  ctx.fillText("Scan to save my contact", SC_W / 2, SC_H - 100);

  return canvasToBlob(canvas, "image/png");
}

/** Ticket: notched ticket with perforated edge separating QR from details. */
async function exportTicket(card: Card, style: QrStyle, photoDataUrl?: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SC_W;
  canvas.height = SC_H;
  const ctx = canvas.getContext("2d")!;
  await loadFonts();

  ctx.fillStyle = "#fffefb";
  ctx.fillRect(0, 0, SC_W, SC_H);

  // ticket outline
  ctx.strokeStyle = "#161619";
  ctx.lineWidth = 2.5;
  const tX = 100, tY = 120, tW = SC_W - 200, tH = SC_H - 240;
  ctx.strokeRect(tX, tY, tW, tH);

  // header band
  ctx.fillStyle = "#161619";
  ctx.fillRect(tX, tY, tW, 90);
  ctx.fillStyle = "#fffefb";
  ctx.textAlign = "left";
  ctx.font = '600 28px "Instrument Sans", sans-serif';
  ctx.fillText("VELLO · CONTACT", tX + 40, tY + 58);
  ctx.textAlign = "right";
  ctx.font = '400 22px "Instrument Sans", sans-serif';
  ctx.fillText("No server. No tracking.", tX + tW - 40, tY + 58);

  // perforated line
  ctx.strokeStyle = "#161619";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(tX, 720); ctx.lineTo(tX + tW, 720);
  ctx.stroke();
  ctx.setLineDash([]);
  // notch circles
  ctx.fillStyle = "#fffefb";
  ctx.beginPath(); ctx.arc(tX, 720, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(tX + tW, 720, 16, 0, Math.PI * 2); ctx.fill();

  // QR top half
  const qrSize = 480;
  const qrCanvas = document.createElement("canvas");
  await renderQrToCanvas(qrCanvas, card, style, qrSize, photoDataUrl);
  ctx.drawImage(qrCanvas, (SC_W - qrSize) / 2, tY + 130, qrSize, qrSize);

  // details bottom half
  ctx.fillStyle = "#161619";
  ctx.textAlign = "center";
  ctx.font = '500 60px "Fraunces", serif';
  ctx.fillText(fullName(card).slice(0, 26), SC_W / 2, 850);

  ctx.textAlign = "left";
  ctx.font = '400 24px "Instrument Sans", sans-serif';
  ctx.fillStyle = "#6b655c";
  let dy = 920;
  const left = tX + 60;
  if (card.jobTitle) { ctx.fillText(card.jobTitle.slice(0, 36), left, dy); dy += 36; }
  if (card.company) { ctx.fillText(card.company.slice(0, 36), left, dy); dy += 36; }
  if (card.phone) { ctx.fillText(card.phone, left, dy); dy += 36; }
  if (card.email) { ctx.fillText(card.email.slice(0, 40), left, dy); dy += 36; }
  if (card.website) { ctx.fillText(card.website.replace(/^https?:\/\//, "").slice(0, 40), left, dy); dy += 36; }

  return canvasToBlob(canvas, "image/png");
}

/** Polaroid: photo-first card with a handwritten-style caption. */
async function exportPolaroid(card: Card, style: QrStyle, photoDataUrl?: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SC_W;
  canvas.height = SC_H;
  const ctx = canvas.getContext("2d")!;
  await loadFonts();

  // warm backdrop
  ctx.fillStyle = "#efeae1";
  ctx.fillRect(0, 0, SC_W, SC_H);

  // polaroid frame
  const fX = 160, fY = 100, fW = SC_W - 320, fH = 1050;
  ctx.fillStyle = "#fffefb";
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  roundRectFill(ctx, fX, fY, fW, fH, 4);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // photo area (top 60%)
  const pX = fX + 50, pY = fY + 50, pW = fW - 100, pH = 620;
  if (photoDataUrl) {
    const img = await loadImage(photoDataUrl);
    ctx.save();
    ctx.beginPath();
    ctx.rect(pX, pY, pW, pH);
    ctx.clip();
    // cover fit
    const ir = img.width / img.height;
    const cr = pW / pH;
    let dw, dh;
    if (ir > cr) { dh = pH; dw = pH * ir; } else { dw = pW; dh = pW / ir; }
    ctx.drawImage(img, pX + (pW - dw) / 2, pY + (pH - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    // placeholder: QR in the photo area
    const qrSize = 480;
    const qrCanvas = document.createElement("canvas");
    await renderQrToCanvas(qrCanvas, card, style, qrSize, photoDataUrl);
    ctx.drawImage(qrCanvas, pX + (pW - qrSize) / 2, pY + (pH - qrSize) / 2, qrSize, qrSize);
  }

  // caption (handwritten Caveat)
  ctx.fillStyle = "#161619";
  ctx.textAlign = "center";
  try {
    await document.fonts.load('500 56px "Caveat"');
  } catch { /* ignore */ }
  ctx.font = '500 64px "Caveat", cursive';
  ctx.fillText(fullName(card).slice(0, 26), SC_W / 2, fY + fH - 160);

  ctx.font = '400 28px "Instrument Sans", sans-serif';
  ctx.fillStyle = "#6b655c";
  if (card.jobTitle) ctx.fillText(card.jobTitle.slice(0, 40), SC_W / 2, fY + fH - 110);

  // small QR badge bottom-right (so the card is always scannable even with a photo)
  const badgeSize = 200;
  const badgeCanvas = document.createElement("canvas");
  await renderQrToCanvas(badgeCanvas, card, style, badgeSize, photoDataUrl);
  ctx.drawImage(badgeCanvas, fX + fW - badgeSize - 40, fY + 70, badgeSize, badgeSize);

  return canvasToBlob(canvas, "image/png");
}

function roundRectFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
