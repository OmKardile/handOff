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
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [card, style, size, photoDataUrl]);

  return (
    <div
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
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
        <div className="absolute inset-0 flex items-center justify-center bg-background/40">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        </div>
      )}
    </div>
  );
}
