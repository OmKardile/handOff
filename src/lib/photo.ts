/**
 * HandOff photo processing — fully on device.
 * Decodes with createImageBitmap (orientation-aware), centre-crop square,
 * draws to canvas (strips EXIF/GPS), exports JPEG q0.82 at 512px + 256px thumb.
 */

import { LIMITS } from "@/shared/limits";
import type { PhotoData } from "@/shared/types";

export async function processPhoto(file: File): Promise<PhotoData> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > LIMITS.photoMaxBytes) throw new Error("Image is larger than 12 MB.");

  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  } as ImageBitmapOptions).catch(() => null);

  // fallback to <img> if createImageBitmap unavailable
  let img: HTMLImageElement | null = null;
  let source: ImageBitmap | HTMLImageElement;
  if (bitmap) {
    source = bitmap;
  } else {
    img = await fileToImage(file);
    source = img;
  }

  const w = source.width;
  const h = source.height;
  if (w > LIMITS.photoMaxSide || h > LIMITS.photoMaxSide) {
    if (bitmap) bitmap.close();
    throw new Error("Image sides can't exceed 8000px.");
  }

  const full = drawSquare(source, LIMITS.photoOutput);
  const thumb = drawSquare(source, LIMITS.photoVcf);

  if (bitmap) bitmap.close();

  return { full, thumb };
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read the image."));
    };
    img.src = url;
  });
}

function drawSquare(
  source: ImageBitmap | HTMLImageElement,
  outSize: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  const sw = source.width;
  const sh = source.height;
  const side = Math.min(sw, sh);
  const sx = (sw - side) / 2;
  const sy = (sh - side) / 2;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outSize, outSize);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source as CanvasImageSource, sx, sy, side, side, 0, 0, outSize, outSize);

  return canvas.toDataURL("image/jpeg", 0.82);
}
