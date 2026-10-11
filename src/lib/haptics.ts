"use client";

import * as React from "react";
import { useHandOff } from "@/lib/store";
import { isNative } from "@/lib/native-bridge";

/**
 * Lightweight haptics wrapper. Uses the Vibration API when available
 * and the setting is enabled in the zustand store. No-op otherwise.
 *
 * Also supports Capacitor Haptics on native builds via dynamic import.
 */
export function useHaptics() {
  const enabled = useHandOff((s) => s.settings.haptics);

  return React.useCallback(
    async (pattern: number | number[] = 10) => {
      if (!enabled) return;
      try {
        if (isNative()) {
          const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
          if (typeof pattern === "number" && pattern > 30) {
            await Haptics.impact({ style: ImpactStyle.Medium });
          } else if (Array.isArray(pattern) && pattern.length > 1) {
            await Haptics.impact({ style: ImpactStyle.Heavy });
          } else {
            await Haptics.impact({ style: ImpactStyle.Light });
          }
          return;
        }
        navigator.vibrate?.(pattern);
      } catch {
        try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
      }
    },
    [enabled]
  );
}

/** Fire-and-forget haptic for places that don't use hooks. */
export async function haptic(pattern: number | number[] = 10, force = false) {
  try {
    const settings = useHandOff.getState().settings;
    if (!settings.haptics && !force) return;

    if (isNative()) {
      try {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
        if (typeof pattern === "number" && pattern > 30) {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } else if (Array.isArray(pattern) && pattern.length > 1) {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } else {
          await Haptics.impact({ style: ImpactStyle.Light });
        }
        return;
      } catch {
        /* fall through to vibration API */
      }
    }

    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}
