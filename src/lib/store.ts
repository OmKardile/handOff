/**
 * HandOff store — the single source of truth for the app's state.
 * Zustand store backed by the storage adapter (IndexedDB).
 * Debounced persistence. Loads on mount.
 */

"use client";

import { create } from "zustand";
import type { Card, QrStyle, Settings, PhotoData, CustomPreset } from "@/shared/types";
import {
  getCard,
  saveCard,
  getStyle,
  saveStyle,
  getSettings,
  saveSettings,
  getPhoto,
  savePhoto,
  deletePhoto,
  getCustomPresets,
  saveCustomPresets,
  isOnboarded,
  setOnboarded,
} from "@/lib/storage";
import { PLAIN_STYLE, getPreset } from "@/lib/style-presets";
import { qrFingerprint } from "@/lib/vcard";
import { getQrPayload } from "@/lib/qr";

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  haptics: true,
  defaultEcc: "M",
  storagePersisted: true,
};

export function makeEmptyCard(): Card {
  return {
    id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    jobTitle: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    location: "",
    linkedin: "",
    instagram: "",
    xHandle: "",
    whatsapp: "",
    photoPresent: false,
    qrInclude: {
      name: true,
      title: true,
      company: true,
      phone: true,
      email: true,
      website: true,
      location: false,
      linkedin: false,
      instagram: false,
      x: false,
      whatsapp: false,
    },
    socialOrder: ["linkedin", "instagram", "x", "whatsapp"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    qrFingerprint: "",
  };
}

interface HandOffState {
  loaded: boolean;
  onboarded: boolean;
  card: Card | null;
  style: QrStyle;
  settings: Settings;
  photo: PhotoData | null;
  presets: CustomPreset[];

  // draft + restore
  draft: Card | null;
  hasDraft: boolean;

  // "QR changed" banner
  qrChanged: boolean;

  // actions
  load: () => Promise<void>;
  setCard: (updater: Card | ((c: Card) => Card)) => void;
  saveCardNow: () => Promise<void>;
  startDraft: () => void;
  discardDraft: () => void;
  restoreDraft: () => void;
  clearDraft: () => void;

  setStyle: (updater: QrStyle | ((s: QrStyle) => QrStyle)) => void;
  applyPreset: (presetId: string) => void;
  saveStyleNow: () => Promise<void>;

  setPhoto: (p: PhotoData | null) => Promise<void>;

  setSettings: (updater: Settings | ((s: Settings) => Settings)) => void;
  saveSettingsNow: () => Promise<void>;

  saveCustomPreset: (name: string, style: QrStyle) => Promise<void>;
  deleteCustomPreset: (id: string) => Promise<void>;

  completeOnboarding: (card: Card) => Promise<void>;
  resetAll: () => Promise<void>;

  dismissQrChanged: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useHandOff = create<HandOffState>((set, get) => ({
  loaded: false,
  onboarded: false,
  card: null,
  style: PLAIN_STYLE,
  settings: DEFAULT_SETTINGS,
  photo: null,
  presets: [],
  draft: null,
  hasDraft: false,
  qrChanged: false,

  load: async () => {
    const [card, style, settings, photo, presets, onboarded] = await Promise.all([
      getCard(),
      getStyle(),
      getSettings(),
      getPhoto(),
      getCustomPresets(),
      isOnboarded(),
    ]);
    // Auto-enable persistent storage on load.
    // On native (Capacitor): always true (app data dir is persistent).
    // On web: requests navigator.storage.persist() — browser may grant/deny.
    let persistence = settings?.storagePersisted ?? false;
    try {
      const { requestPersistence, checkPersistence } = await import("./storage");
      // always try to request (idempotent — if already persistent, returns true)
      await requestPersistence();
      persistence = await checkPersistence();
    } catch {
      /* ignore */
    }
    set({
      card: card ?? makeEmptyCard(),
      style: style ?? PLAIN_STYLE,
      settings: settings
        ? { ...settings, storagePersisted: persistence }
        : { ...DEFAULT_SETTINGS, storagePersisted: persistence },
      photo,
      presets,
      onboarded,
      loaded: true,
    });
  },

  setCard: (updater) => {
    const current = get().card ?? makeEmptyCard();
    const next = typeof updater === "function" ? updater(current) : updater;
    next.updatedAt = new Date().toISOString();
    set({ card: next });
    // debounced save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void get().saveCardNow();
    }, 400);
  },

  saveCardNow: async () => {
    const { card } = get();
    if (!card) return;
    // compute fingerprint to detect real changes
    const payload = getQrPayload(card);
    const fp = await qrFingerprint(payload);
    const changed = card.qrFingerprint !== "" && card.qrFingerprint !== fp;
    const updated = { ...card, qrFingerprint: fp };
    await saveCard(updated);
    set({ card: updated, qrChanged: changed });
  },

  startDraft: () => {
    const { card } = get();
    if (card) set({ draft: structuredClone(card), hasDraft: true });
  },

  discardDraft: () => {
    set({ draft: null, hasDraft: false });
  },

  restoreDraft: () => {
    const { draft } = get();
    if (draft) {
      get().setCard(draft);
      set({ draft: null, hasDraft: false });
    }
  },

  clearDraft: () => set({ draft: null, hasDraft: false }),

  setStyle: (updater) => {
    const current = get().style;
    const next = typeof updater === "function" ? updater(current) : updater;
    set({ style: next });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void get().saveStyleNow();
    }, 400);
  },

  applyPreset: (presetId) => {
    const preset = getPreset(presetId);
    if (preset) {
      get().setStyle({ ...preset.style, presetId: preset.id });
    } else if (presetId === "plain") {
      get().setStyle({ ...PLAIN_STYLE, presetId: "plain" });
    }
  },

  saveStyleNow: async () => {
    await saveStyle(get().style);
  },

  setPhoto: async (p) => {
    if (p) {
      await savePhoto(p);
      set({ photo: p });
    } else {
      await deletePhoto();
      set({ photo: null });
    }
    get().setCard((c) => ({ ...c, photoPresent: !!p }));
  },

  setSettings: (updater) => {
    const current = get().settings;
    const next = typeof updater === "function" ? updater(current) : updater;
    set({ settings: next });
    // mirror haptics to localStorage for fast sync reads (used by haptics.ts fallback)
    try { localStorage.setItem("handoff:haptics", next.haptics ? "on" : "off"); } catch { /* ignore */ }
    void get().saveSettingsNow();
  },

  saveSettingsNow: async () => {
    await saveSettings(get().settings);
  },

  saveCustomPreset: async (name, style) => {
    const preset: CustomPreset = {
      id: crypto.randomUUID(),
      name,
      style: { ...style, presetId: null },
      createdAt: new Date().toISOString(),
    };
    const all = [...get().presets, preset];
    await saveCustomPresets(all);
    set({ presets: all });
  },

  deleteCustomPreset: async (id) => {
    const all = get().presets.filter((p) => p.id !== id);
    await saveCustomPresets(all);
    set({ presets: all });
  },

  completeOnboarding: async (card) => {
    const fp = await qrFingerprint(getQrPayload(card));
    const updated = { ...card, qrFingerprint: fp };
    await saveCard(updated);
    await setOnboarded(true);
    set({ card: updated, onboarded: true, qrChanged: false });
  },

  resetAll: async () => {
    const { eraseAll } = await import("@/lib/storage");
    await eraseAll();
    set({
      card: makeEmptyCard(),
      style: PLAIN_STYLE,
      settings: DEFAULT_SETTINGS,
      photo: null,
      presets: [],
      onboarded: false,
      draft: null,
      hasDraft: false,
      qrChanged: false,
    });
  },

  dismissQrChanged: () => set({ qrChanged: false }),
}));
