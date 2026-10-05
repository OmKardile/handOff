"use client";

import * as React from "react";
import { X, Copy, Check } from "lucide-react";
import { useSlate } from "@/lib/store";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";
import { getQrSizeInfo } from "@/lib/qr";
import { getFieldBytes, getTotalBytes } from "@/lib/qr-insights";
import { toast } from "sonner";

export function FullscreenQr() {
  const { card, style, photo } = useSlate();
  const { navigate } = useView();
  const [size, setSize] = React.useState(320);
  const [copiedMeta, setCopiedMeta] = React.useState(false);

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
    let released = false;
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
      released = true;
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

  if (!card) return null;
  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background pt-safe">
      {/* vibrant mesh gradient — so the glass header refracts rich colors */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-[10%] -right-[5%] h-[50vh] w-[50vh] rounded-full opacity-[0.4] blur-[50px]"
          style={{ background: "radial-gradient(circle, #b0533a, transparent 60%)" }}
        />
        <div
          className="absolute top-[30%] -left-[10%] h-[45vh] w-[45vh] rounded-full opacity-[0.3] blur-[55px]"
          style={{ background: "radial-gradient(circle, #1a2e4a, transparent 60%)" }}
        />
        <div
          className="absolute bottom-[-5%] right-[10%] h-[40vh] w-[40vh] rounded-full opacity-[0.25] blur-[60px]"
          style={{ background: "radial-gradient(circle, #c8a24a, transparent 60%)" }}
        />
      </div>
      <div className="glass flex items-center justify-between border-b border-border/40 px-4 py-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Tap to scan
        </span>
        <button
          onClick={() => navigate("home")}
          className="glass-pill no-tap flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-foreground transition-all hover:bg-foreground/5 active:scale-95"
          aria-label="Close"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="rounded-[28px] bg-card p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)]">
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
              className="mx-auto mb-3 h-12 w-12 rounded-full object-cover"
            />
          )}
          <h1 className="font-display text-2xl font-medium tracking-tight">
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

      <div className="pb-10 text-center">
        <p className="text-[12px] text-muted-foreground">
          Screen stays on while this is open
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
                className="glass-pill no-tap mx-auto mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                {copiedMeta ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                {copiedMeta ? "Copied" : "Copy"}
              </button>
            </>
          );
        })()}
      </div>
    </div>
  );
}
