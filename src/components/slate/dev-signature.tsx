"use client";

import * as React from "react";
import { BRAND } from "@/shared/brand";

/**
 * Developer signature credit.
 * Subtle, restrained — the kind of credit a meticulous craftsman leaves on their work.
 */
export function DevSignature({ className }: { className?: string }) {
  return (
    <a
      href="https://omkardile.is-a.dev/"
      target="_blank"
      rel="noopener noreferrer"
      className={
        "no-tap group inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground " +
        (className ?? "")
      }
      aria-label="Designed and developed by Omkar Kardile (opens in a new tab)"
    >
      <span className="h-px w-3 bg-current opacity-40 transition-opacity group-hover:opacity-100" />
      <span>
        Designed &amp; developed by{" "}
        <span className="font-medium text-foreground/80 underline-offset-2 group-hover:underline">
          Omkar Kardile
        </span>
      </span>
    </a>
  );
}

/** A full-width footer block with the signature + version, for standalone pages. */
export function PageFooter({ className }: { className?: string }) {
  return (
    <footer
      className={
        "border-t border-border px-6 py-8 pb-safe " + (className ?? "")
      }
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <DevSignature />
        <p className="text-[11px] text-muted-foreground/60">
          {BRAND.name} v{BRAND.version} · MIT License · No servers. No tracking. Ever.
        </p>
      </div>
    </footer>
  );
}
