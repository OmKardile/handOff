"use client";

import * as React from "react";

/**
 * Track recently-used and favourited QR caption fonts.
 * Stored in localStorage (small, non-sensitive). No network.
 */

const RECENTS_KEY = "vello:font-recents";
const FAVS_KEY = "vello:font-favs";
const MAX_RECENTS = 6;

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useFontMemory() {
  const [recents, setRecents] = React.useState<string[]>(() => read<string[]>(RECENTS_KEY, []));
  const [favs, setFavs] = React.useState<string[]>(() => read<string[]>(FAVS_KEY, []));

  const remember = React.useCallback((family: string) => {
    setRecents((prev) => {
      const next = [family, ...prev.filter((f) => f !== family)].slice(0, MAX_RECENTS);
      write(RECENTS_KEY, next);
      return next;
    });
  }, []);

  const toggleFav = React.useCallback((family: string) => {
    setFavs((prev) => {
      const next = prev.includes(family)
        ? prev.filter((f) => f !== family)
        : [...prev, family];
      write(FAVS_KEY, next);
      return next;
    });
  }, []);

  const isFav = React.useCallback((family: string) => favs.includes(family), [favs]);

  return { recents, favs, remember, toggleFav, isFav };
}
