"use client";

import * as React from "react";
import type { Card, QrStyle } from "@/shared/types";
import { renderQrToCanvas } from "@/lib/qr-render";
import { cn } from "@/lib/utils";

interface QrPreviewProps {
  card: Card;
  style: QrStyle;
  size?: number;
  photoDataUrl?: string;
  className?: string;
  /** show a subtle shimmer while rendering */
  showLoading?: boolean;
}

export function QrPreview({
  card,
  style,
  size = 320,
  photoDataUrl,
  className,
  showLoading = true,
}: QrPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = React.useState(true);
  const renderKey = React.useRef(0);

  React.useEffect(() => {
    let cancelled = false;
    const id = ++renderKey.current;
    setLoading(true);
    // small debounce so rapid changes don't thrash
    const t = setTimeout(async () => {
      if (cancelled || id !== renderKey.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        await renderQrToCanvas(canvas, card, style, size, photoDataUrl);
        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error("QR render failed", e);
        if (!cancelled) setLoading(false);
      }
    }, 60);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [card, style, size, photoDataUrl]);

  return (
    <div
      className={cn("relative inline-block overflow-hidden border-2 border-ink", className)}
      style={{ width: size, height: size, borderRadius: style.plateRadius }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block h-full w-full"
        aria-label={`QR code for ${card.firstName || "your contact"}`}
        role="img"
      />
      {showLoading && loading && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-card"
          aria-hidden="true"
        >
          <div className="relative h-full w-full overflow-hidden">
            {/* shimmer sweep */}
            <div className="absolute inset-0 -tranhandoff-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-background/70 to-transparent" />
          </div>
        </div>
      )}
      <style>{`@keyframes shimmer{0%{transform:tranhandoffX(-100%)}100%{transform:tranhandoffX(200%)}}`}</style>
    </div>
  );
}
