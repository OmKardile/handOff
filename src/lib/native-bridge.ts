/**
 * HandOff native bridge — Capacitor integration.
 * Handles: back-button navigation, file downloads (via Filesystem + Share),
 * and storage persistence. No-ops gracefully on web.
 */

import type { Card } from "@/shared/types";
import { getQrPayload } from "./qr";

/** Returns true if running inside a Capacitor native shell (Android/iOS). */
export function isNative(): boolean {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return !!cap?.isNativePlatform?.();
  } catch {
    return false;
  }
}

// ── Back button handling ──

let backHandlerInstalled = false;
/** Install the Android hardware back-button listener. Call once on app mount. */
export async function installBackButton(getView: () => string, navigate: (v: "home" | "studio" | "settings") => void): Promise<void> {
  if (backHandlerInstalled || !isNative()) return;
  backHandlerInstalled = true;
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", () => {
      const view = getView();
      // On the home screen, minimize the app (native back = exit to home)
      if (view === "onboarding" || view === "home") {
        App.exitApp();
        return;
      }
      // On any sub-screen, go back to home
      navigate("home");
    });
  } catch {
    /* not native — ignore */
  }
}

// ── File downloads ──

/**
 * Save a blob to the device + optionally share it.
 * On native (Capacitor): writes to Filesystem, then shares via Share API.
 * On web: uses the standard <a download> trick.
 */
export async function saveOrShareBlob(
  blob: Blob,
  filename: string,
  shareTitle = "HandOff",
  shareText = "Here's my card"
): Promise<"shared" | "saved" | "downloaded"> {
  // Native path: write to filesystem, then share
  if (isNative()) {
    try {
      const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
      // convert blob → base64
      const base64 = await blobToBase64(blob);
      const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const result = await Filesystem.writeFile({
        path: cleanName,
        data: base64,
        directory: Directory.Cache,
        encoding: Encoding.Base64,
        recursive: true,
      });
      // try to share
      try {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title: shareTitle,
          text: shareText,
          url: result.uri,
          dialogTitle: shareTitle,
        });
        return "shared";
      } catch {
        // share cancelled or unavailable — file is saved to cache, user can find it
        return "saved";
      }
    } catch (e) {
      console.error("HandOff: native save failed, falling back to web", e);
      // fall through to web download
    }
  }

  // Web path: standard download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  // Try web share API as well (mobile browsers)
  try {
    const file = new File([blob], filename, { type: blob.type });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean; share?: (d: { files: File[]; title?: string; text?: string }) => Promise<void> };
    if (nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: shareTitle, text: shareText });
      return "shared";
    }
  } catch {
    /* ignore — already downloaded */
  }

  return "downloaded";
}

/** Save text content (for .vcf files). */
export async function saveOrShareText(
  text: string,
  filename: string,
  mime = "text/vcard",
  shareTitle = "HandOff",
  shareText = "Here's my contact"
): Promise<"shared" | "saved" | "downloaded"> {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  return saveOrShareBlob(blob, filename, shareTitle, shareText);
}

/** Convert a Blob to a base64 string (without the data: prefix). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the "data:...;base64," prefix
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Storage persistence ──

/** Request persistent storage so data survives app restarts. */
export async function ensurePersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      const granted = await navigator.storage.persist();
      return granted;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Check if storage is persistent. */
export async function isStoragePersistent(): Promise<boolean> {
  try {
    return navigator.storage?.persisted ? await navigator.storage.persisted() : false;
  } catch {
    return false;
  }
}

// ── QR payload helper (for share sheet) ──

export { getQrPayload };
