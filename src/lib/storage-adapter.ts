/**
 * Dual storage adapter — uses Capacitor Preferences on native (Android/iOS)
 * and IndexedDB (via idb-keyval) on web.
 *
 * Why: Capacitor's WebView may clear IndexedDB on app restart (depending on
 * WebView version + OS). @capacitor/preferences uses native SharedPreferences
 * (Android) / NSUserDefaults (iOS) which are always persistent.
 */

import { isNative } from "./native-bridge";

// ── Native storage (Capacitor Preferences) ──
async function nativeGet(key: string): Promise<unknown> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    if (value === null || value === undefined) return undefined;
    try { return JSON.parse(value); } catch { return value; }
  } catch {
    return undefined;
  }
}

async function nativeSet(key: string, value: unknown): Promise<void> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch {
    /* ignore */
  }
}

async function nativeRemove(key: string): Promise<void> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.remove({ key });
  } catch {
    /* ignore */
  }
}

async function nativeClear(): Promise<void> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.clear();
  } catch {
    /* ignore */
  }
}

// ── Web storage (IndexedDB via idb-keyval) ──
let idbStore: ReturnType<typeof import("idb-keyval").createStore> | null = null;
async function getStore() {
  if (!idbStore) {
    const { createStore } = await import("idb-keyval");
    idbStore = createStore("handoff-db", "handoff-store");
  }
  return idbStore;
}

async function webGet(key: string): Promise<unknown> {
  try {
    const { get } = await import("idb-keyval");
    const store = await getStore();
    return await get(key, store);
  } catch {
    return undefined;
  }
}

async function webSet(key: string, value: unknown): Promise<void> {
  try {
    const { set } = await import("idb-keyval");
    const store = await getStore();
    await set(key, value, store);
  } catch {
    /* ignore */
  }
}

async function webRemove(key: string): Promise<void> {
  try {
    const { del } = await import("idb-keyval");
    const store = await getStore();
    await del(key, store);
  } catch {
    /* ignore */
  }
}

async function webClear(): Promise<void> {
  try {
    const { clear } = await import("idb-keyval");
    const store = await getStore();
    await clear(store);
  } catch {
    /* ignore */
  }
}

// ── Unified API ──
export async function storageGet(key: string): Promise<unknown> {
  if (isNative()) return nativeGet(key);
  return webGet(key);
}

export async function storageSet(key: string, value: unknown): Promise<void> {
  if (isNative()) return nativeSet(key, value);
  return webSet(key, value);
}

export async function storageRemove(key: string): Promise<void> {
  if (isNative()) return nativeRemove(key);
  return webRemove(key);
}

export async function storageClear(): Promise<void> {
  if (isNative()) return nativeClear();
  return webClear();
}
