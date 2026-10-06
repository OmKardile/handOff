/**
 * HandOff QR rendering engine.
 * Uses qr-code-styling for styled output (shapes, gradients, centre element).
 * Renders to canvas/data-url/blob for exports.
 */

import QRCodeStyling from "qr-code-styling";
import type { QrStyle, Card } from "@/shared/types";
import { getQrPayload } from "./qr";

/** Map our style → qr-code-styling options. */
export function styleToOptions(style: QrStyle, payload: string) {
  // qr-code-styling shape names
  const shapeMap: Record<string, string> = {
    square: "square",
    rounded: "rounded",
    dots: "dots",
    classy: "classy",
    "extra-rounded": "extra-rounded",
    "classy-rounded": "classy-rounded",
  };
  const eyeMap: Record<string, string> = {
    square: "square",
    circle: "circle",
    rounded: "rounded",
  };

  const dotsOptions: Record<string, unknown> = {
    type: shapeMap[style.moduleShape] ?? "square",
    color: style.moduleColor,
  };
  if (style.moduleGradient) {
    dotsOptions.gradient = {
      type: style.moduleGradient.type,
      rotation: (style.moduleGradient.rotation * Math.PI) / 180,
      colorStops: [
        { offset: 0, color: style.moduleGradient.colors[0] },
        { offset: 1, color: style.moduleGradient.colors[1] },
      ],
    };
    delete (dotsOptions as { color?: string }).color;
  }

  const cornersSquareOptions: Record<string, unknown> = {
    type: eyeMap[style.eyeShape] ?? "square",
    color: style.eyeOuterColor,
  };
  const cornersDotOptions: Record<string, unknown> = {
    type: eyeMap[style.eyeShape] ?? "square",
    color: style.eyeInnerColor,
  };

  const backgroundOptions: Record<string, unknown> = {
    color: style.background,
  };
  if (style.backgroundGradient) {
    backgroundOptions.gradient = {
      type: style.backgroundGradient.type,
      rotation: (style.backgroundGradient.rotation * Math.PI) / 180,
      colorStops: [
        { offset: 0, color: style.backgroundGradient.colors[0] },
        { offset: 1, color: style.backgroundGradient.colors[1] },
      ],
    };
    delete (backgroundOptions as { color?: string }).color;
  }

  // image (centre element) handled separately via overlay; qr-code-styling image option
  // uses a URL. We pass empty and overlay ourselves for full control.

  return {
    width: 600,
    height: 600,
    type: "canvas" as const,
    data: payload,
    margin: Math.round(style.platePadding * 4),
    qrOptions: {
      errorCorrectionLevel: style.ecc,
    },
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions,
    image: "",
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 0,
      imageSize: 0,
      hideBackgroundDots: false,
    },
  };
}

/** Create a QRCodeStyling instance for a card + style. */
export function createQr(card: Card, style: QrStyle): QRCodeStyling {
  const payload = getQrPayload(card);
  const opts = styleToOptions(style, payload);
  const qr = new QRCodeStyling(opts as ConstructorParameters<typeof QRCodeStyling>[0]);
  return qr;
}

/** Render QR to a canvas, including centre element overlay + caption. */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  card: Card,
  style: QrStyle,
  size = 600,
  photoDataUrl?: string
): Promise<void> {
  const payload = getQrPayload(card);
  const qr = new QRCodeStyling({
    ...styleToOptions(style, payload),
    width: size,
    height: size,
  } as ConstructorParameters<typeof QRCodeStyling>[0]);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  // Plate background with rounded corners. We CLIP to the rounded shape
  // BEFORE drawing the QR image, so the QR's own square background fill
  // gets cropped to rounded corners (otherwise it paints over the plate
  // as a sharp square).
  const r = style.plateRadius;
  ctx.save();
  roundRect(ctx, 0, 0, size, size, r);
  ctx.clip();
  // fill the plate color inside the clipped (rounded) region
  ctx.fillStyle = style.background;
  ctx.fillRect(0, 0, size, size);

  // Draw the QR modules. getRawData("png") returns a Blob → Image → drawImage.
  // Because we're inside a clip, the square QR image is cropped to the rounded shape.
  let drew = false;
  try {
    const blob = await qr.getRawData("png");
    if (blob && blob.size > 0) {
      const url = URL.createObjectURL(blob);
      const img = await loadImage(url);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      drew = true;
    }
  } catch {
    /* fall through to DOM fallback */
  }

  if (!drew) {
    // Fallback: append to DOM and wait for the paint to commit
    const tmp = document.createElement("div");
    tmp.style.position = "absolute";
    tmp.style.left = "-9999px";
    tmp.style.top = "0";
    document.body.appendChild(tmp);
    await qr.append(tmp);
    await new Promise((res) => setTimeout(res, 80));
    const srcCanvas = tmp.querySelector("canvas");
    if (srcCanvas) ctx.drawImage(srcCanvas, 0, 0, size, size);
    document.body.removeChild(tmp);
  }

  ctx.restore(); // remove the rounded clip

  // centre element overlay
  if (style.centerType !== "none" && style.centerSize > 0) {
    await drawCenterElement(ctx, canvas, card, style, photoDataUrl);
  }

  // Caption — ONLY when the user explicitly enabled it AND typed custom text.
  // Never auto-draw the card name on the QR (that caused the stray "name" at the bottom).
  if (style.captionEnabled && style.captionText.trim()) {
    await drawCaption(ctx, canvas, style.captionText.trim(), style);
  }

  // App signature — a tiny "HandOff" watermark in the bottom-right corner.
  // Anti-screenshot measure: anyone who screenshots the QR also captures this
  // signature, making it traceable. Subtle but present on ALL renders (home,
  // fullscreen, exports, wallpapers). Skipped on very small previews (<100px).
  // Drawn AFTER restore so it's not clipped by the CSS border-radius, but
  // positioned far enough from the corner to avoid the clip curve.
  if (size >= 100) {
    drawSignature(ctx, canvas, style);
  }
}

/** Draw a subtle "HandOff" signature in the bottom-right corner of the QR plate.
 *  Positioned safely inside the border-radius curve so it's not clipped. */
function drawSignature(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  style: QrStyle
) {
  const s = canvas.width;
  // font size scales with canvas (≈4% of QR size, min 8px)
  const fontSize = Math.max(8, Math.round(s * 0.04));
  const text = "HandOff";

  // padding: position well inside the border-radius curve.
  // At 28px radius, the curve eats ~8px at 45°. Use 6% to clear it safely.
  const padX = Math.round(s * 0.05);
  const padY = Math.round(s * 0.045);

  ctx.save();
  ctx.font = `700 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;

  // bottom-right, inside the radius curve
  const x = s - padX - textW;
  const y = s - padY;

  // semi-transparent module color — visible on light plates, subtle on dark
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = style.moduleColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function drawCenterElement(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  card: Card,
  style: QrStyle,
  photoDataUrl?: string
) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = (style.centerSize / 100) * (canvas.width / 2);

  // white background patch so modules don't interfere
  ctx.save();
  ctx.beginPath();
  if (style.centerShape === "circle") {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else {
    const sz = r * 1.8;
    roundRect(ctx, cx - sz / 2, cy - sz / 2, sz, sz, sz * 0.2);
  }
  ctx.fillStyle = style.background;
  ctx.fill();
  ctx.restore();

  if (style.centerRing) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = style.moduleColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  if (style.centerType === "photo" && photoDataUrl) {
    const img = await loadImage(photoDataUrl);
    ctx.save();
    ctx.beginPath();
    if (style.centerShape === "circle") {
      ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    } else {
      const sz = (r - 2) * 1.8;
      roundRect(ctx, cx - sz / 2, cy - sz / 2, sz, sz, sz * 0.2);
    }
    ctx.clip();
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } else if (style.centerType === "initials") {
    const initials = getInitials(card);
    const fontFamily = style.captionFont || "Fraunces";
    await ensureFont(fontFamily);
    ctx.save();
    ctx.fillStyle = style.moduleColor;
    ctx.font = `${Math.round(r)}px "${fontFamily}", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy + r * 0.05);
    ctx.restore();
  } else if (style.centerType === "emoji" && style.centerValue) {
    ctx.save();
    ctx.font = `${Math.round(r * 1.2)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.centerValue, cx, cy);
    ctx.restore();
  }
}

async function drawCaption(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  style: QrStyle
) {
  const fontFamily = style.captionFont || "Fraunces";
  await ensureFont(fontFamily);
  const fontSize = Math.round(canvas.width * 0.05);
  ctx.save();
  ctx.fillStyle = style.moduleColor;
  ctx.font = `500 ${fontSize}px "${fontFamily}", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, canvas.width / 2, canvas.height - fontSize * 0.6);
  ctx.restore();
}

export function getInitials(card: Card): string {
  const a = card.firstName.trim()[0] ?? "";
  const b = card.lastName.trim()[0] ?? "";
  return (a + b).toUpperCase() || "V";
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

export async function ensureFont(family: string): Promise<void> {
  try {
    await document.fonts.load(`16px "${family}"`);
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}

/** Get a PNG blob from a canvas. */
export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, 0.92);
  });
}
