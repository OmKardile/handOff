/**
 * Vello storage adapter — web only (IndexedDB via idb-keyval).
 * Privacy-first: everything stays on this device.
 * Debounced writes, .bak fallback, schema-versioned, corrupted-store recovery.
 */

import { get, set, del, clear, createStore } from "idb-keyval";
import type { Card, QrStyle, Settings, PhotoData, CustomPreset } from "@/shared/types";
import { LIMITS } from "@/shared/limits";

const store = createStore("vello-db", "vello-store");

const K = {
  card: "vello:card",
  cardBak: "vello:card.bak",
  style: "vello:style",
  settings: "vello:settings",
  photo: "vello:photo",
  presets: "vello:presets",
  onboarded: "vello:onboarded",
} as const;

export const SCHEMA_VERSION = LIMITS.schemaVersion;

interface Versioned<T> {
  schemaVersion: number;
  data: T;
}

function wrap<T>(data: T): Versioned<T> {
  return { schemaVersion: SCHEMA_VERSION, data };
}

function unwrap<T>(v: unknown): T | null {
  if (!v || typeof v !== "object") return null;
  const obj = v as Versioned<T>;
  if (obj.schemaVersion === SCHEMA_VERSION) return obj.data;
  // future: migrate
  return obj.data ?? null;
}

export async function getCard(): Promise<Card | null> {
  try {
    const raw = await get(K.card);
    const card = unwrap<Card>(raw);
    if (card) return card;
    // try backup
    const bak = unwrap<Card>(await get(K.cardBak));
    return bak;
  } catch {
    return null;
  }
}

export async function saveCard(card: Card): Promise<void> {
  try {
    // rotate backup
    const prev = await get(K.card);
    if (prev) await set(K.cardBak, prev);
    await set(K.card, wrap(card));
  } catch (e) {
    console.error("Vello: failed to save card", e);
  }
}

export async function getStyle(): Promise<QrStyle | null> {
  try {
    return unwrap<QrStyle>(await get(K.style));
  } catch {
    return null;
  }
}

export async function saveStyle(style: QrStyle): Promise<void> {
  await set(K.style, wrap(style));
}

export async function getSettings(): Promise<Settings | null> {
  try {
    return unwrap<Settings>(await get(K.settings));
  } catch {
    return null;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await set(K.settings, wrap(s));
}

export async function getPhoto(): Promise<PhotoData | null> {
  try {
    return unwrap<PhotoData>(await get(K.photo));
  } catch {
    return null;
  }
}

export async function savePhoto(photo: PhotoData): Promise<void> {
  await set(K.photo, wrap(photo));
}

export async function deletePhoto(): Promise<void> {
  await del(K.photo);
}

export async function getCustomPresets(): Promise<CustomPreset[]> {
  try {
    return unwrap<CustomPreset[]>(await get(K.presets)) ?? [];
  } catch {
    return [];
  }
}

export async function saveCustomPresets(presets: CustomPreset[]): Promise<void> {
  await set(K.presets, wrap(presets));
}

export async function isOnboarded(): Promise<boolean> {
  try {
    return (await get(K.onboarded)) === true;
  } catch {
    return false;
  }
}

export async function setOnboarded(v: boolean): Promise<void> {
  await set(K.onboarded, v);
}

/** Request persistent storage (web). Returns whether it was granted. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
  } catch {
    /* ignore */
  }
  return false;
}

export async function checkPersistence(): Promise<boolean> {
  try {
    return navigator.storage?.persisted ? await navigator.storage.persisted() : false;
  } catch {
    return false;
  }
}

/** Backup export: card + style + settings + photo + presets + memories as base64 JSON. */
export interface BackupBundle {
  app: string;
  version: string;
  schemaVersion: number;
  exportedAt: string;
  card: Card | null;
  style: QrStyle | null;
  settings: Settings | null;
  photo: PhotoData | null;
  presets: CustomPreset[];
  /** localStorage-backed memories: font recents/favourites + style recents. */
  memories?: {
    fontRecents: string[];
    fontFavs: string[];
    styleRecents: string[];
  };
}

/** Read the localStorage-backed memories (font + style recents/favourites). */
function readMemories(): NonNullable<BackupBundle["memories"]> {
  const read = (key: string): string[] => {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as string[]) : [];
    } catch {
      return [];
    }
  };
  return {
    fontRecents: read("vello:font-recents"),
    fontFavs: read("vello:font-favs"),
    styleRecents: read("vello:style-recents"),
  };
}

/** Write memories back to localStorage (used during backup restore). */
function writeMemories(m: BackupBundle["memories"]): void {
  if (!m) return;
  const write = (key: string, val: string[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  };
  if (m.fontRecents) write("vello:font-recents", m.fontRecents);
  if (m.fontFavs) write("vello:font-favs", m.fontFavs);
  if (m.styleRecents) write("vello:style-recents", m.styleRecents);
}

export async function exportBackup(): Promise<string> {
  const bundle: BackupBundle = {
    app: "vello",
    version: "1.0.0",
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    card: await getCard(),
    style: await getStyle(),
    settings: await getSettings(),
    photo: await getPhoto(),
    presets: await getCustomPresets(),
    memories: readMemories(),
  };
  return JSON.stringify(bundle, null, 2);
}

/** Validate + restore a backup file. Throws on invalid. */
export async function importBackup(json: string): Promise<BackupBundle> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Not a valid JSON file.");
  }
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid backup file.");
  const b = parsed as Partial<BackupBundle>;
  if (b.app !== "vello") throw new Error("This is not a Vello backup.");
  if (!b.schemaVersion) throw new Error("Missing schema version.");

  if (b.card) await saveCard(b.card);
  if (b.style) await saveStyle(b.style);
  if (b.settings) await saveSettings(b.settings);
  if (b.photo) await savePhoto(b.photo);
  if (b.presets) await saveCustomPresets(b.presets);
  if (b.memories) writeMemories(b.memories);

  return b as BackupBundle;
}

/** Erase all data and return to onboarding. */
export async function eraseAll(): Promise<void> {
  await clear();
}
