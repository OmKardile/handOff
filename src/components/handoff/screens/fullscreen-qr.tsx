"use client";

import * as React from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { motion, type PanInfo } from "framer-motion";
import { useHandOff } from "@/lib/store";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";
import { getQrSizeInfo } from "@/lib/qr";
import { getFieldBytes, getTotalBytes } from "@/lib/qr-insights";
import { toast } from "sonner";

/** Dismiss threshold (px) — drag down past this and the sheet closes. */
const DISMISS_THRESHOLD = 120;

export function FullscreenQr() {
  const { card, style, photo } = useHandOff();
  const { navigate } = useView();
  const [size, setSize] = React.useState(320);
  const [copiedMeta, setCopiedMeta] = React.useState(false);
  const [dismissing, setDismissing] = React.useState(false);

  React.useEffect(() => {
    function resize() {
      const s = Math.min(window.innerWidth, window.innerHeight) - 120;
      setSize(Math.min(s, 560));
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
        if (wl.wakeLock) {
          lock = await wl.wakeLock.request("screen");
        }
      } catch {
        /* ignore */
      }
    }
    void acquire();
    const onVis = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      void lock?.release();
    };
  }, []);

  // close on Escape
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") navigate("home");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // drag-to-dismiss: when the user drags down past threshold, close.
  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 600) {
      setDismissing(true);
      setTimeout(() => navigate("home"), 180);
    }
  }

  if (!card) return null;
  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden paper-grain pt-safe"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      animate={dismissing ? { y: window.innerHeight, opacity: 0 } : { y: 0, opacity: 1 }}
      transition={dismissing ? { duration: 0.18, ease: "easeIn" } : { type: "spring", stiffness: 400, damping: 35 }}
      style={{ touchAction: "none" }}
    >
      {/* Vibrant mesh gradient — orbs drift AND cycle colour (hue-rotate) */}
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

      {/* Grabber handle — minimal swipe-down affordance (replaces the X button).
          A small pill at the top center. Tapping it also closes. */}
      <button
        onClick={() => navigate("home")}
        className="group flex w-full flex-col items-center gap-1.5 pt-3 pb-2"
        aria-label="Swipe down to close"
      >
        <span className="h-1.5 w-10 rounded-full bg-foreground/25 transition-colors group-hover:bg-foreground/40 group-active:bg-foreground/50" />
        <span className="flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
          <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
          Swipe down
        </span>
      </button>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="brut-lg p-5">
          <QrPreview
            card={card}
            style={style}
            size={size}
            photoDataUrl={photo?.full}
            showLoading={false}
          />
        </div>
        <div className="mt-8 text-center">
          {photo && (
            <img
              src={photo.full}
              alt=""
              className="mx-auto mb-3 h-12 w-12 border-2 border-ink object-cover"
            />
          )}
          <h1 className="font-display text-2xl uppercase tracking-tight">
            {fullName || "Your card"}
          </h1>
          {card.jobTitle && (
            <p className="mt-1 text-[14px] text-muted-foreground">{card.jobTitle}</p>
          )}
          {card.company && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">{card.company}</p>
          )}
        </div>
      </div>

      {/* Footer — kept the polished brutalist metadata badge */}
      <div className="pb-10 text-center">
        <p className="text-[12px] text-muted-foreground">
          Screen stays on · Drag down to close
        </p>
        {(() => {
          const fields = getFieldBytes(card);
          const total = getTotalBytes(fields);
          const dataFields = fields.filter((f) => f.id !== "envelope").length;
          const sizeInfo = getQrSizeInfo(card);
          const meta = `${total} bytes · QR v${sizeInfo.version} · ${dataFields} field${dataFields === 1 ? "" : "s"} · ECC ${style.ecc}`;
          return (
            <>
              <p className="mt-1 text-[10.5px] tabular-nums text-muted-foreground/60">{meta}</p>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(meta);
                    setCopiedMeta(true);
                    toast.success("Metadata copied");
                    setTimeout(() => setCopiedMeta(false), 1500);
                  } catch {
                    toast.error("Couldn't copy");
                  }
                }}
                className="no-tap mx-auto mt-1.5 inline-flex items-center gap-1 border-2 border-ink bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground shadow-[2px_2px_0_0_var(--ink)] transition-colors hover:text-foreground"
                style={{ borderRadius: 8 }}
              >
                {copiedMeta ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                {copiedMeta ? "Copied" : "Copy"}
              </button>
            </>
          );
        })()}
      </div>
    </motion.div>
  );
}
