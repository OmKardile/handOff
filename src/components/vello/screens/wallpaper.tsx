"use client";

import * as React from "react";
import { Loader2, Download, Image as ImageIcon, Info } from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { QrPreview } from "../qr-preview";
import { renderQrToCanvas, canvasToBlob } from "@/lib/qr-render";
import { downloadBlob } from "@/lib/export";
import { toast } from "sonner";

const BACKDROPS = [
  { id: "charcoal", name: "Charcoal", color: "#161619", fg: "#ECE7DE" },
  { id: "navy", name: "Navy", color: "#0E1B33", fg: "#ECE7DE" },
  { id: "warm", name: "Warm", color: "#1A1410", fg: "#ECE7DE" },
  { id: "clay", name: "Clay", color: "#8A3B22", fg: "#FBF4EC" },
];

export function WallpaperScreen() {
  const { card, style, photo } = useVello();
  const { navigate } = useView();
  const [busy, setBusy] = React.useState(false);
  const [backdrop, setBackdrop] = React.useState(BACKDROPS[0]);

  if (!card) return null;

  const W = 1080;
  const H = 1920;

  async function generate() {
    if (!card) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // backdrop
      ctx.fillStyle = backdrop.color;
      ctx.fillRect(0, 0, W, H);

      // QR plate in the 36%-80% band
      const qrSize = Math.round(W * 0.56);
      const qrX = (W - qrSize) / 2;
      const qrY = Math.round(H * 0.36);
      const qrCanvas = document.createElement("canvas");
      await renderQrToCanvas(qrCanvas, card, style, qrSize, photo?.full);
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // name + title beneath, inside band
      ctx.fillStyle = backdrop.fg;
      await document.fonts.load('500 48px "Fraunces"');
      ctx.textAlign = "center";
      const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
      if (name) {
        ctx.font = '500 56px "Fraunces", serif';
        ctx.fillText(name.slice(0, 24), W / 2, qrY + qrSize + 90);
      }
      if (card.jobTitle) {
        ctx.font = '400 32px "Instrument Sans", sans-serif';
        ctx.fillText(card.jobTitle.slice(0, 40), W / 2, qrY + qrSize + 140);
      }

      const blob = await canvasToBlob(canvas, "image/png");
      downloadBlob(blob, `${card.firstName || "contact"}-wallpaper.png`);
      toast.success("Wallpaper downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader title="Wallpaper" onBack={() => navigate("home")} />
      <div className="px-5 pb-28 pt-4">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-clay" />
            <h2 className="font-display text-xl font-medium tracking-tight">Lock-screen wallpaper</h2>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            A phone-shaped image with your QR placed in the safe zone — clear of the
            clock and shortcuts. Save it and set it as your lock screen.
          </p>
        </div>

        {/* phone preview */}
        <div className="mt-5 flex justify-center">
          <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-foreground/80 shadow-xl" style={{ width: 220, height: 440 }}>
            <div className="absolute inset-0" style={{ background: backdrop.color }} />
            {/* faux clock */}
            <div className="absolute left-0 right-0 top-6 flex flex-col items-center">
              <span className="font-display text-5xl font-light" style={{ color: backdrop.fg }}>9:41</span>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: backdrop.fg, opacity: 0.6 }}>
                {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            {/* QR */}
            <div className="absolute left-1/2 top-[36%] -translate-x-1/2 rounded-xl bg-white p-1.5">
              <QrPreview card={card} style={style} size={120} photoDataUrl={photo?.full} showLoading={false} />
            </div>
            {/* name */}
            <div className="absolute left-1/2 top-[72%] -translate-x-1/2 text-center" style={{ color: backdrop.fg }}>
              <p className="font-display text-sm font-medium">
                {[card.firstName, card.lastName].filter(Boolean).join(" ")}
              </p>
              {card.jobTitle && <p className="text-[9px] opacity-70">{card.jobTitle}</p>}
            </div>
          </div>
        </div>

        {/* backdrop picker */}
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Backdrop</p>
          <div className="flex gap-2">
            {BACKDROPS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBackdrop(b)}
                className="no-tap flex flex-col items-center gap-1.5"
              >
                <span
                  className="h-10 w-10 rounded-full border-2 transition-colors"
                  style={{
                    background: b.color,
                    borderColor: backdrop.id === b.id ? "var(--clay)" : "transparent",
                  }}
                />
                <span className="text-[10px] text-muted-foreground">{b.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={busy}
          className="no-tap mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-[14px] font-medium text-background disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download wallpaper
        </button>

        <div className="mt-5 flex gap-2 rounded-2xl border border-border bg-card p-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay" />
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            On Android, open the image and set it as your lock-screen wallpaper. On
            iOS, save to Photos then set it via Settings → Wallpaper. Some
            manufacturers override lock-screen wallpapers with their own theming.
          </p>
        </div>
      </div>
    </div>
  );
}
