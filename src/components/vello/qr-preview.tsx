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
        <div
          className="absolute inset-0 flex items-center justify-center bg-card"
          aria-hidden="true"
        >
          <div className="relative h-full w-full overflow-hidden">
            {/* skeleton grid pattern mimicking a QR */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, var(--muted) 25%, transparent 25%), linear-gradient(-45deg, var(--muted) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--muted) 75%), linear-gradient(-45deg, transparent 75%, var(--muted) 75%)",
                backgroundSize: `${Math.max(8, size / 16)}px ${Math.max(8, size / 16)}px`,
                backgroundPosition: `0 0, 0 ${Math.max(4, size / 32)}px, ${Math.max(4, size / 32)}px ${-Math.max(4, size / 32)}px, ${-Math.max(4, size / 32)}px 0`,
              }}
            />
            {/* shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-background/60 to-transparent" />
            {/* finder-eye placeholders */}
            <div className="absolute left-[8%] top-[8%] h-[18%] w-[18%] rounded-md border-2 border-muted-foreground/30" />
            <div className="absolute right-[8%] top-[8%] h-[18%] w-[18%] rounded-md border-2 border-muted-foreground/30" />
            <div className="absolute left-[8%] bottom-[8%] h-[18%] w-[18%] rounded-md border-2 border-muted-foreground/30" />
          </div>
        </div>
      )}
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}
