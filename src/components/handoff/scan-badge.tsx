"use client";

import * as React from "react";
import { Check, AlertTriangle, Loader2 } from "lucide-react";
import type { Card, QrStyle } from "@/shared/types";
import { renderQrToCanvas } from "@/lib/qr-render";
import { evaluateScan, type ScanResult } from "@/lib/scan-check";
import { getQrPayload } from "@/lib/qr";
import { cn } from "@/lib/utils";

/**
 * ScanBadge — "Scans well" status card in the brutalist HandOff theme.
 * Bone card, thick ink border, hard offset shadow, rounded corners.
 * Status tile: lime (ok) / amber (warn) / muted (loading).
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

  // status tile: lime when ok, amber when warning, muted when loading
  const tileCls = ok
    ? "bg-signal text-black"
    : loading
      ? "bg-secondary text-muted-foreground"
      : "bg-clay/20 text-clay";

  return (
    <div
      className={cn(
        "brut relative overflow-hidden p-3",
        className
      )}
    >
      <div className="relative z-10 flex items-center gap-3">
        {/* status tile — square, rounded, lime/amber/muted */}
        <span
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-ink",
            tileCls
          )}
          style={{ borderRadius: 8 }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
          ) : ok ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : (
            <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heavy text-[13px] uppercase leading-tight tracking-wide text-foreground">
            {headline}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {loading
              ? "Verifying optical contrast…"
              : ok
                ? `High optical contrast (${ratioText}). Tested with stock camera algorithms.`
                : `${ratioText || "Low contrast"} — try higher contrast or a smaller centre image.`}
          </p>
        </div>
      </div>
    </div>
  );
}
