"use client";

import * as React from "react";
import { Check, AlertTriangle, Loader2 } from "lucide-react";
import type { Card, QrStyle } from "@/shared/types";
import { renderQrToCanvas } from "@/lib/qr-render";
import { evaluateScan, type ScanResult } from "@/lib/scan-check";
import { getQrPayload } from "@/lib/qr";
import { cn } from "@/lib/utils";

/**
 * ScanBadge — a minimal "Scans well" status card.
 * Inspired by a dark-mode cyberpunk status pill:
 *   - thin neon-mint border, fully rounded (rounded-2xl)
 *   - dark gradient background (charcoal → plum)
 *   - circular checkmark icon + headline + contrast description
 * Re-runs the scan-check whenever the card or style changes.
 */
export function ScanBadge({
  card,
  style,
  photoDataUrl,
  className,
}: {
  card: Card;
  style: QrStyle;
  photoDataUrl?: string;
  className?: string;
}) {
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 320;
        await renderQrToCanvas(canvas, card, style, 320, photoDataUrl);
        const payload = getQrPayload(card);
        const r = evaluateScan(
          canvas,
          payload,
          style.moduleColor,
          style.background
        );
        if (!cancelled) setResult(r);
      } catch {
        if (!cancelled) setResult(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [card, style, photoDataUrl]);

  const ok = result?.ok;
  const headline = loading
    ? "Checking…"
    : result?.message.split(":")[0] ?? "Checking…";
  const contrast = result?.contrast;
  const ratioText =
    contrast != null ? `${contrast.toFixed(1)}:1 contrast` : "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-3",
        ok
          ? "border-emerald-400/60 text-emerald-300"
          : loading
            ? "border-muted-foreground/40 text-muted-foreground"
            : "border-amber-400/60 text-amber-300",
        className
      )}
      style={{
        background:
          "linear-gradient(110deg, #0E0E12 0%, #15121D 55%, #1B1426 100%)",
      }}
    >
      <div className="relative z-10 flex items-start gap-3">
        {/* circular checkmark / spinner / warning */}
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border",
            ok
              ? "border-emerald-400/70"
              : loading
                ? "border-muted-foreground/40"
                : "border-amber-400/70"
          )}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
          ) : ok ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight">
            {headline}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug opacity-70">
            {loading
              ? "Verifying optical contrast…"
              : ok
                ? `High optical contrast ratio (${ratioText}). Tested with stock camera algorithms.`
                : `${ratioText || "Low contrast"} — may need higher contrast or a smaller centre image.`}
          </p>
        </div>
      </div>
      {/* faint schematic grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
    </div>
  );
}
