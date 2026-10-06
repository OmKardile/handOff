"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { motion, useMotionValue, useTransform, type PanInfo, animate } from "framer-motion";
import { useHandOff } from "@/lib/store";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";
import { getQrSizeInfo } from "@/lib/qr";
import { getFieldBytes, getTotalBytes } from "@/lib/qr-insights";
import { toast } from "sonner";

/** Drag down past this (px) → dismiss. */
const DISMISS_THRESHOLD = 110;

export function FullscreenQr() {
  const { card, style, photo } = useHandOff();
  const { navigate } = useView();
  const [size, setSize] = React.useState(320);
  const [copiedMeta, setCopiedMeta] = React.useState(false);
  const [dismissing, setDismissing] = React.useState(false);

  // live drag Y → drives opacity + scale for premium feel
  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 400], [1, 0.4]);
  const dragScale = useTransform(dragY, [0, 400], [1, 0.94]);

  React.useEffect(() => {
    function resize() {
      const s = Math.min(window.innerWidth - 64, window.innerHeight - 220);
      setSize(Math.max(200, Math.min(s, 520)));
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // keep screen awake via Wake Lock API
  React.useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    async function acquire() {
      try {
        const wl = navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } };
        if (wl.wakeLock) lock = await wl.wakeLock.request("screen");
      } catch { /* ignore */ }
    }
    void acquire();
    const onVis = () => { if (document.visibilityState === "visible") void acquire(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); void lock?.release(); };
  }, []);

  const dismiss = React.useCallback(() => {
    setDismissing(true);
    // smoothly slide down + fade out
    animate(dragY, window.innerHeight, { duration: 0.32, ease: [0.32, 0.72, 0, 1] });
    animate(dragOpacity, 0, { duration: 0.32, ease: "easeIn" });
    setTimeout(() => navigate("home"), 300);
  }, [dragY, dragOpacity, navigate]);

  // close on Escape
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") dismiss(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 500) {
      dismiss();
    }
  }

  if (!card) return null;
  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden paper-grain pt-safe"
      style={{ touchAction: "none", y: dragY, opacity: dragOpacity, scale: dragScale }}
    >
      {/* Ambient mesh gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -right-[5%] h-[50vh] w-[50vh] animate-[hueA_50s_linear_infinite]" style={{ animationDelay: "-8s" }}>
          <div className="h-full w-full rounded-full opacity-[0.35] blur-[50px] animate-[driftA_24s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #B93D17, transparent 60%)" }} />
        </div>
        <div className="absolute top-[30%] -left-[10%] h-[45vh] w-[45vh] animate-[hueB_64s_linear_infinite]" style={{ animationDelay: "-28s" }}>
          <div className="h-full w-full rounded-full opacity-[0.25] blur-[55px] animate-[driftB_30s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #0E1B33, transparent 60%)" }} />
        </div>
        <div className="absolute bottom-[-5%] right-[10%] h-[40vh] w-[40vh] animate-[hueC_72s_linear_infinite]" style={{ animationDelay: "-45s" }}>
          <div className="h-full w-full rounded-full opacity-[0.2] blur-[60px] animate-[driftC_28s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #8A6A1F, transparent 60%)" }} />
        </div>
      </div>
      <style>{`
        @keyframes driftA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,30px) scale(1.12)} }
        @keyframes driftB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,20px) scale(1.1)} }
        @keyframes driftC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(0.92)} }
        @keyframes hueA { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes hueB { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes hueC { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @media (prefers-reduced-motion: reduce) { [class*="animate-[drift"], [class*="animate-[hue"] { animation: none !important; } }
      `}</style>

      {/* Drag layer — captures the gesture across the whole screen.
          The content inside is non-draggable (buttons, copy) so taps still work. */}
      <motion.div
        className="absolute inset-0 z-0"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        dragMomentum={false}
        _dragX={dragY}
        onDrag={(_, info) => dragY.set(Math.max(0, info.offset.y))}
        onDragEnd={onDragEnd}
      />

      {/* Grabber handle — minimal, elegant. Tapping also dismisses. */}
      <button
        onClick={dismiss}
        className="group relative z-10 flex w-full flex-col items-center gap-2 pt-3 pb-3"
        aria-label="Close"
      >
        <span className="h-[5px] w-9 rounded-full bg-foreground/20 transition-all duration-200 group-hover:w-11 group-hover:bg-foreground/35 group-active:scale-90" />
      </button>

      {/* Centered card */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="brut-lg p-5">
          <QrPreview
            card={card}
            style={style}
            size={size}
            photoDataUrl={photo?.full}
            showLoading={false}
          />
        </div>
        <div className="mt-6 flex flex-col items-center text-center">
          {photo && (
            <img
              src={photo.full}
              alt=""
              className="mb-2 h-11 w-11 border-2 border-ink object-cover"
            />
          )}
          <h1 className="font-display text-[1.6rem] uppercase leading-tight tracking-tight">
            {fullName || "Your card"}
          </h1>
          {card.jobTitle && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">{card.jobTitle}</p>
          )}
          {card.company && (
            <p className="text-[12px] text-muted-foreground/80">{card.company}</p>
          )}
        </div>
      </div>

      {/* Footer metadata */}
      <div className="relative z-10 pb-8 text-center">
        <p className="text-[11px] text-muted-foreground/70">
          Screen stays on · Drag down to close
        </p>
        {(() => {
          const fields = getFieldBytes(card);
          const total = getTotalBytes(fields);
          const dataFields = fields.filter((f) => f.id !== "envelope").length;
          const sizeInfo = getQrSizeInfo(card);
          const meta = `${total}B · v${sizeInfo.version} · ${dataFields} field${dataFields === 1 ? "" : "s"} · ECC ${style.ecc}`;
          return (
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(meta);
                  setCopiedMeta(true);
                  toast.success("Metadata copied");
                  setTimeout(() => setCopiedMeta(false), 1500);
                } catch { toast.error("Couldn't copy"); }
              }}
              className="no-tap mx-auto mt-1.5 inline-flex items-center gap-1 border-2 border-ink bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground shadow-[2px_2px_0_0_var(--ink)] transition-colors hover:text-foreground"
              style={{ borderRadius: 8 }}
            >
              {copiedMeta ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
              {copiedMeta ? "Copied" : meta}
            </button>
          );
        })()}
      </div>
    </motion.div>
  );
}
