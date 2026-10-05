"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";

export function FullscreenQr() {
  const { card, style, photo } = useVello();
  const { navigate } = useView();
  const [size, setSize] = React.useState(320);

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
    <div className="fixed inset-0 z-50 flex flex-col bg-background pt-safe">
      <div className="flex items-center justify-between p-4">
        <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Tap to scan
        </span>
        <button
          onClick={() => navigate("home")}
          className="no-tap flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="rounded-3xl bg-card p-5 shadow-lg">
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
      </div>
    </div>
  );
}
