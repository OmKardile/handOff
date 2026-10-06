"use client";

import * as React from "react";
import { Loader2, Download, Image as ImageIcon, Info, Check } from "lucide-react";
import { useHandOff } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { QrPreview } from "../qr-preview";
import { renderQrToCanvas, canvasToBlob } from "@/lib/qr-render";
import { downloadBlob } from "@/lib/export";
import { STYLE_PRESETS } from "@/lib/style-presets";
import type { QrStyle } from "@/shared/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Backdrops — curated to pair beautifully with the vivid QR presets.
 *  Each has a deep bg color + a fg color for the name text. */
const BACKDROPS = [
  { id: "void", name: "Void", color: "#08080A", fg: "#EDEAE0" },
  { id: "midnight", name: "Midnight", color: "#0E1B33", fg: "#ECE7DE" },
  { id: "plum", name: "Plum", color: "#1A0F2E", fg: "#ECE7DE" },
  { id: "forest", name: "Forest", color: "#0F1F1A", fg: "#ECE7DE" },
  { id: "espresso", name: "Espresso", color: "#1A1410", fg: "#ECE7DE" },
  { id: "clay", name: "Clay", color: "#8A3B22", fg: "#FBF4EC" },
  { id: "cobalt", name: "Cobalt", color: "#1B2BE0", fg: "#FBF4EC" },
  { id: "ink", name: "Ink", color: "#0A0A0A", fg: "#EDEAE0" },
];

/** Curated "beautiful & cool" QR presets for the wallpaper.
 *  Defaults to Aurora (the first one) so the wallpaper never feels boring/default. */
const WALLPAPER_PRESET_IDS = [
  "aurora", "lagoon", "sunset-strip", "mint-chip",
  "magma", "bubblegum", "royal-jade", "neon-pulse",
  "dusk-rose", "tidepool", "afterglow", "ember",
];

export function WallpaperScreen() {
  const { card, style, photo } = useHandOff();
  const { navigate } = useView();
  const [busy, setBusy] = React.useState(false);
  const [backdrop, setBackdrop] = React.useState(BACKDROPS[0]);
  const [presetId, setPresetId] = React.useState<string>(WALLPAPER_PRESET_IDS[0]);

  const wallpaperPresets = React.useMemo(
    () => WALLPAPER_PRESET_IDS.map((id) => STYLE_PRESETS.find((p) => p.id === id)).filter(Boolean) as typeof STYLE_PRESETS,
    []
  );
  const activePreset = wallpaperPresets.find((p) => p.id === presetId) ?? wallpaperPresets[0];
  const wallpaperStyle: QrStyle = activePreset?.style ?? style;

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
      await renderQrToCanvas(qrCanvas, card, wallpaperStyle, qrSize, photo?.full);
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
      <ScreenHeader title="Wallpaper" onBack={() => navigate("home")} helpGuideId="wallpaper-apply" />
      <div className="px-5 pb-28 pt-4">
        {/* intro card */}
        <div className="brut p-5">
          <div className="flex items-center gap-2">
            <span className="brut-signal flex h-7 w-7 items-center justify-center">
              <ImageIcon className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <h2 className="font-heavy text-[15px] uppercase tracking-wide">Lock-screen wallpaper</h2>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            A phone-shaped image with your QR placed in the safe zone — clear of the
            clock and shortcuts. Pick a beautiful QR design below, then download and set
            it as your lock screen.
          </p>
        </div>

        {/* phone preview */}
        <div className="mt-5 flex justify-center">
          <div
            className="relative overflow-hidden border-[3px] border-ink shadow-[5px_5px_0_0_var(--ink)]"
            style={{ width: 220, height: 440, background: backdrop.color, borderRadius: 4 }}
          >
            {/* faux clock */}
            <div className="absolute left-0 right-0 top-6 flex flex-col items-center">
              <span className="font-display text-5xl font-light leading-none" style={{ color: backdrop.fg }}>
                9:41
              </span>
              <span
                className="mt-1 text-[9px] uppercase tracking-[0.18em]"
                style={{ color: backdrop.fg, opacity: 0.6 }}
              >
                {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            {/* QR */}
            <div className="absolute left-1/2 top-[36%] -translate-x-1/2 border-2 border-ink bg-white p-1.5">
              <QrPreview card={card} style={wallpaperStyle} size={120} photoDataUrl={photo?.full} showLoading={false} />
            </div>
            {/* name */}
            <div className="absolute left-1/2 top-[72%] -translate-x-1/2 text-center" style={{ color: backdrop.fg }}>
              <p className="font-display text-sm font-medium uppercase tracking-wide leading-tight">
                {[card.firstName, card.lastName].filter(Boolean).join(" ")}
              </p>
              {card.jobTitle && <p className="mt-0.5 text-[9px] opacity-70">{card.jobTitle}</p>}
            </div>
          </div>
        </div>

        {/* QR design picker — beautiful presets */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 border-b-2 border-ink pb-1">
            <span className="h-1.5 w-1.5 bg-signal" />
            <p className="field-label font-bold text-foreground">QR design</p>
            <span className="field-label text-muted-foreground">{wallpaperPresets.length} beautiful looks</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {wallpaperPresets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={cn(
                  "press no-tap relative flex flex-col items-center gap-1 border-2 border-ink bg-card p-1.5 shadow-[2px_2px_0_0_var(--ink)]",
                  presetId === p.id && "ring-2 ring-signal ring-offset-1 ring-offset-background"
                )}
                aria-label={p.name}
                aria-pressed={presetId === p.id}
              >
                <div className="aspect-square w-full overflow-hidden border border-ink">
                  <QrPreview
                    card={card}
                    style={p.style}
                    size={56}
                    photoDataUrl={photo?.full}
                    showLoading={false}
                  />
                </div>
                <span className="w-full truncate text-center text-[9px] font-bold uppercase tracking-wide text-foreground">
                  {p.name}
                </span>
                {presetId === p.id && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center border border-ink bg-signal">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 field-label leading-relaxed">
            ACTIVE: <span className="font-bold text-foreground">{activePreset?.name.toUpperCase()}</span> · TAP TO CHANGE
          </p>
        </div>

        {/* backdrop picker */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 border-b-2 border-ink pb-1">
            <span className="h-1.5 w-1.5 bg-signal" />
            <p className="field-label font-bold text-foreground">Backdrop</p>
            <span className="field-label text-muted-foreground">{BACKDROPS.length} tones</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BACKDROPS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBackdrop(b)}
                className="press no-tap flex flex-col items-center gap-1"
                aria-label={b.name}
                aria-pressed={backdrop.id === b.id}
              >
                <span
                  className={cn(
                    "h-10 w-10 border-2 border-ink shadow-[2px_2px_0_0_var(--ink)]",
                    backdrop.id === b.id && "ring-2 ring-signal ring-offset-1 ring-offset-background"
                  )}
                  style={{ background: b.color, borderRadius: 2 }}
                />
                <span className="text-[9px] font-bold uppercase tracking-wide text-foreground">{b.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* download button */}
        <button
          onClick={generate}
          disabled={busy}
          className={cn(
            "press no-tap mt-6 flex w-full items-center justify-center gap-2 border-[2.5px] border-ink bg-signal py-4 font-heavy text-[15px] uppercase tracking-wide text-black shadow-[5px_5px_0_0_var(--ink)] disabled:opacity-50"
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Download className="h-4 w-4" strokeWidth={2.5} />}
          Download wallpaper
        </button>

        {/* info */}
        <div className="mt-5 flex gap-2 border-2 border-ink bg-card p-3 shadow-[2px_2px_0_0_var(--ink)]">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay" strokeWidth={2.5} />
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
