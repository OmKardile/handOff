"use client";

import * as React from "react";
import { useHandOff } from "@/lib/store";

/**
 * Lightweight haptics wrapper. Uses the Vibration API when available
 * and the setting is enabled in the zustand store. No-op otherwise.
 *
 * Also supports Capacitor Haptics on native builds via dynamic import.
 */
export function useHaptics() {
  // Read the haptics setting directly from the zustand store.
  // Previously this read from localStorage("handoff:haptics") which was NEVER
  // written — the store persists to IndexedDB, not localStorage — so the
  // toggle had no effect. Fixed to use the real store value.
  const enabled = useHandOff((s) => s.settings.haptics);

  return React.useCallback(
    async (pattern: number | number[] = 10) => {
      if (!enabled) return;
      try {
        // Try Capacitor Haptics first (native iOS/Android build)
        const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        if (cap?.isNativePlatform?.()) {
          const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
          if (typeof pattern === "number" && pattern > 30) {
            await Haptics.impact({ style: ImpactStyle.Medium });
          } else if (Array.isArray(pattern) && pattern.length > 1) {
            await Haptics.impact({ style: ImpactStyle.Heavy });
          } else {
            await Haptics.impact({ style: ImpactStyle.Light });
          }
          return;
        }
        // Fallback: Web Vibration API (Android Chrome)
        navigator.vibrate?.(pattern);
      } catch {
        // Fallback: Web Vibration API
        try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
      }
    },
    [enabled]
  );
}

/** Fire-and-forget haptic for places that don't use hooks. */
export function haptic(pattern: number | number[] = 10) {
  try {
    const settings = useHandOff.getState().settings;
    if (!settings.haptics) return;
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}
