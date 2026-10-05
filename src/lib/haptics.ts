"use client";

import * as React from "react";

/**
 * Lightweight haptics wrapper. Uses the Vibration API when available
 * and the setting is enabled. No-op otherwise.
 */
export function useHaptics() {
  const enabled = React.useSyncExternalStore(
    () => () => {},
    () => {
      // read from zustand via a module-level flag to avoid circular deps
      try {
        return localStorage.getItem("handoff:haptics") !== "off";
      } catch {
        return true;
      }
    }
  );

  return React.useCallback(
    (pattern: number | number[] = 10) => {
      if (!enabled) return;
      try {
        navigator.vibrate?.(pattern);
      } catch {
        /* ignore */
      }
    },
    [enabled]
  );
}
