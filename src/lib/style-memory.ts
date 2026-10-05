"use client";

import * as React from "react";
import type { QrStyle } from "@/shared/types";
import { getPreset } from "@/lib/style-presets";

/**
 * Track recently-applied style presets.
 * Stores preset ids in localStorage (small, non-sensitive). No network.
 * Only tracks built-in preset ids (not custom styles), max 8.
 */

const KEY = "handoff:style-recents";
const MAX = 8;

function read(key: string, fallback: string[]): string[] {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as string[]) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useStyleRecents() {
  const [recents, setRecents] = React.useState<string[]>(() => read<string[]>(KEY, []));

  const remember = React.useCallback((presetId: string | null) => {
    if (!presetId || presetId === "plain") return;
    setRecents((prev) => {
      const next = [presetId, ...prev.filter((p) => p !== presetId)].slice(0, MAX);
      write(KEY, next);
      return next;
    });
  }, []);

  /** Get the full style objects for the recent preset ids (skips unknown/custom). */
  const recentStyles = React.useMemo(() => {
    return recents
      .map((id) => {
        const preset = getPreset(id);
        return preset ? { id, name: preset.name, style: preset.style } : null;
      })
      .filter(Boolean) as { id: string; name: string; style: QrStyle }[];
  }, [recents]);

  const clearRecents = React.useCallback(() => {
    setRecents([]);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { recents, recentStyles, remember, clearRecents };
}
