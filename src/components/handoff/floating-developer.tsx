"use client";

import * as React from "react";
import { BRAND } from "@/shared/brand";
import { ExternalLink } from "lucide-react";

/**
 * FloatingDeveloperChip — a small floating chip at the bottom-left of the
 * screen (above the nav bar) linking to the developer's site.
 * Replaces the "Developer" row that used to be in Settings.
 * Visible on all main screens (hidden on onboarding + fullscreen).
 */
export function FloatingDeveloperChip({ hide = false }: { hide?: boolean }) {
  if (hide) return null;
  return (
    <a
      href="https://omkardile.is-a.dev/"
      target="_blank"
      rel="noopener noreferrer"
      className="no-tap press fixed bottom-[max(env(safe-area-inset-bottom),84px)] left-3 z-40 flex items-center gap-1.5 border-2 border-ink bg-card px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wide text-ink shadow-[2px_2px_0_0_var(--ink)] transition-colors hover:bg-signal hover:text-black"
      style={{ borderRadius: 8 }}
      aria-label="Developer: Omkar Kardile (opens in a new tab)"
    >
      <ExternalLink className="h-3 w-3" strokeWidth={2.5} />
      <span className="hidden sm:inline">{BRAND.name}</span>
      <span>v{BRAND.version}</span>
    </a>
  );
}
