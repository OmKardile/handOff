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

/** A wallpaper art template — draws decorative art around the QR. */
interface ArtTemplate {
  id: string;
  name: string;
  bg: string; // background color
  accent: string; // art accent color
  fg: string; // text color
  /** draw the decorative art on the canvas (called BEFORE the QR is drawn) */
  draw: (ctx: CanvasRenderingContext2D, W: number, H: number, qrSize: number, qrX: number, qrY: number) => void;
}

const TEMPLATES: ArtTemplate[] = [
  {
    id: "sunburst",
    name: "Sunburst",
    bg: "#0E1B33",
    accent: "#C6FF00",
    fg: "#ECE7DE",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      const maxR = Math.hypot(W, H);
      ctx.save();
      ctx.translate(cx, cy);
      const rays = 36;
      for (let i = 0; i < rays; i++) {
        ctx.rotate((Math.PI * 2) / rays);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-30, maxR);
        ctx.lineTo(30, maxR);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "rgba(198,255,0,0.10)" : "rgba(198,255,0,0.04)";
        ctx.fill();
      }
      ctx.restore();
    },
  },
  {
    id: "halftone",
    name: "Halftone",
    bg: "#FBF9F5",
    accent: "#FF3B1F",
    fg: "#16161A",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // dotted halftone gradient field, denser at edges
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      const maxD = Math.hypot(W, H) / 2;
      for (let x = 20; x < W; x += 28) {
        for (let y = 20; y < H; y += 28) {
          const d = Math.hypot(x - cx, y - cy);
          const t = Math.min(1, d / maxD);
          const r = 2 + t * 7;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,59,31,${0.08 + t * 0.18})`;
          ctx.fill();
        }
      }
    },
  },
  {
    id: "checker",
    name: "Checkerboard",
    bg: "#1A0F2E",
    accent: "#C6FF00",
    fg: "#ECE7DE",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // checkerboard border frame around the whole canvas
      const tile = 48;
      const frame = 64;
      ctx.fillStyle = "#C6FF00";
      for (let x = 0; x < W; x += tile) {
        for (let y = 0; y < H; y += tile) {
          const inFrame = x < frame || x > W - frame || y < frame || y > H - frame;
          if (!inFrame) continue;
          if (((x / tile) + (y / tile)) % 2 === 0) {
            ctx.fillRect(x, y, tile, tile);
          }
        }
      }
      // accent: lime corner brackets at the QR corners
      const c = 36;
      ctx.strokeStyle = "#C6FF00";
      ctx.lineWidth = 8;
      [[qrX, qrY, 1, 1], [qrX + qrSize, qrY, -1, 1], [qrX, qrY + qrSize, 1, -1], [qrX + qrSize, qrY + qrSize, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * c);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * c, y);
        ctx.stroke();
      });
    },
  },
  {
    id: "confetti",
    name: "Confetti",
    bg: "#0F1F1A",
    accent: "#34D399",
    fg: "#ECE7DE",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      const colors = ["#34D399", "#C6FF00", "#F59E0B", "#EC4899", "#06B6D4"];
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      // seeded-ish random for consistency
      let seed = 7;
      const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      for (let i = 0; i < 160; i++) {
        const x = rand() * W;
        const y = rand() * H;
        // skip the QR area
        if (x > qrX - 20 && x < qrX + qrSize + 20 && y > qrY - 20 && y < qrY + qrSize + 20) continue;
        const c = colors[Math.floor(rand() * colors.length)];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rand() * Math.PI);
        ctx.fillStyle = c;
        const shape = rand();
        if (shape < 0.5) {
          ctx.fillRect(-4, -2, 8, 4); // rect
        } else if (shape < 0.8) {
          ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); // dot
        } else {
          // star
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const a = (j / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.lineTo(Math.cos(a) * 5, Math.sin(a) * 5);
            const a2 = a + Math.PI / 5;
            ctx.lineTo(Math.cos(a2) * 2, Math.sin(a2) * 2);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    },
  },
  {
    id: "orbs",
    name: "Orbs",
    bg: "#08080A",
    accent: "#1B2BE0",
    fg: "#EDEAE0",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // big soft gradient orbs behind the QR
      const orbs = [
        { x: W * 0.2, y: H * 0.2, r: 280, c: "rgba(27,43,224,0.35)" },
        { x: W * 0.85, y: H * 0.35, r: 320, c: "rgba(198,255,0,0.18)" },
        { x: W * 0.3, y: H * 0.75, r: 240, c: "rgba(255,59,31,0.22)" },
        { x: W * 0.8, y: H * 0.8, r: 200, c: "rgba(52,211,153,0.2)" },
      ];
      orbs.forEach((o) => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, o.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
    },
  },
  {
    id: "comic",
    name: "Comic",
    bg: "#FFF6DC",
    accent: "#0A0A0A",
    fg: "#0A0A0A",
    draw: (ctx, W, H, qrSize, qrX, qrY) => {
      // halftone dots + thick black outline + "BOOM" star burst behind QR
      const cx = qrX + qrSize / 2;
      const cy = qrY + qrSize / 2;
      // yellow halftone bg
      for (let x = 0; x < W; x += 22) {
        for (let y = 0; y < H; y += 22) {
          const d = Math.hypot(x - cx, y - cy);
          const r = Math.max(0.5, 5 - d / 220);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,59,31,0.18)";
          ctx.fill();
        }
      }
      // star burst behind QR
      ctx.save();
      ctx.translate(cx, cy);
      const points = 24;
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const a = (i / (points * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? qrSize * 0.95 : qrSize * 0.72;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = "#FF3B1F";
      ctx.fill();
      ctx.strokeStyle = "#0A0A0A";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    },
  },
];

/** QR color presets that pair well with the templates. */
const WALLPAPER_QR_IDS = ["ink", "aurora", "lagoon", "sunset-strip", "royal-jade", "neon-pulse"];

export function WallpaperScreen() {
  const { card, style, photo } = useHandOff();
  const { navigate } = useView();
  const [busy, setBusy] = React.useState(false);
  const [templateId, setTemplateId] = React.useState<string>(TEMPLATES[0].id);
  const [qrPresetId, setQrPresetId] = React.useState<string>("ink");

  const wallpaperPresets = React.useMemo(
    () => WALLPAPER_QR_IDS.map((id) => STYLE_PRESETS.find((p) => p.id === id)).filter(Boolean) as typeof STYLE_PRESETS,
    []
  );
  const activeTemplate = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const activeQrPreset = wallpaperPresets.find((p) => p.id === qrPresetId) ?? wallpaperPresets[0];
  const wallpaperStyle: QrStyle = activeQrPreset?.style ?? style;

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
      ctx.fillStyle = activeTemplate.bg;
      ctx.fillRect(0, 0, W, H);

      // QR plate in the 36%-80% band
      const qrSize = Math.round(W * 0.56);
      const qrX = (W - qrSize) / 2;
      const qrY = Math.round(H * 0.36);

      // draw template art (behind QR)
      activeTemplate.draw(ctx, W, H, qrSize, qrX, qrY);

      // QR
      const qrCanvas = document.createElement("canvas");
      await renderQrToCanvas(qrCanvas, card, wallpaperStyle, qrSize, photo?.full);
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // name + title beneath, inside band
      ctx.fillStyle = activeTemplate.fg;
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
        {/* intro */}
        <div className="brut p-5">
          <div className="flex items-center gap-2">
            <span className="brut-signal flex h-7 w-7 items-center justify-center">
              <ImageIcon className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <h2 className="font-heavy text-[15px] uppercase tracking-wide">Lock-screen wallpaper</h2>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Pick an art template, then a QR color. Your QR sits inside the design,
            clear of the clock and shortcuts. Download and set it as your lock screen.
          </p>
        </div>

        {/* phone preview */}
        <div className="mt-5 flex justify-center">
          <div
            className="relative overflow-hidden border-[3px] border-ink shadow-[5px_5px_0_0_var(--ink)]"
            style={{ width: 220, height: 440, background: activeTemplate.bg, borderRadius: 18 }}
          >
            {/* faux clock */}
            <div className="absolute left-0 right-0 top-6 flex flex-col items-center">
              <span className="font-display text-5xl font-light leading-none" style={{ color: activeTemplate.fg }}>
                9:41
              </span>
              <span
                className="mt-1 text-[9px] uppercase tracking-[0.18em]"
                style={{ color: activeTemplate.fg, opacity: 0.6 }}
              >
                {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            {/* QR */}
            <div className="absolute left-1/2 top-[36%] -translate-x-1/2 border-2 border-ink bg-white p-1.5" style={{ borderRadius: 6 }}>
              <QrPreview card={card} style={wallpaperStyle} size={120} photoDataUrl={photo?.full} showLoading={false} />
            </div>
            {/* name */}
            <div className="absolute left-1/2 top-[72%] -translate-x-1/2 text-center" style={{ color: activeTemplate.fg }}>
              <p className="font-display text-sm font-medium uppercase tracking-wide leading-tight">
                {[card.firstName, card.lastName].filter(Boolean).join(" ")}
              </p>
              {card.jobTitle && <p className="mt-0.5 text-[9px] opacity-70">{card.jobTitle}</p>}
            </div>
          </div>
        </div>

        {/* art template picker */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 border-b-2 border-ink pb-1">
            <span className="h-1.5 w-1.5 bg-signal" />
            <p className="field-label font-bold text-foreground">Art template</p>
            <span className="field-label text-muted-foreground">{TEMPLATES.length} designs</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={cn(
                  "press no-tap relative flex flex-col items-center gap-1.5 border-2 border-ink p-2 shadow-[2px_2px_0_0_var(--ink)]",
                  templateId === t.id && "ring-2 ring-signal ring-offset-1 ring-offset-background"
                )}
                style={{ background: t.bg, borderRadius: 10 }}
                aria-label={t.name}
                aria-pressed={templateId === t.id}
              >
                {/* mini preview swatch */}
                <span
                  className="flex h-10 w-full items-center justify-center"
                  style={{ background: t.bg, borderRadius: 6 }}
                >
                  <span className="h-4 w-4" style={{ background: t.accent, borderRadius: 2 }} />
                </span>
                <span className="w-full truncate text-center text-[10px] font-bold uppercase tracking-wide" style={{ color: t.fg }}>
                  {t.name}
                </span>
                {templateId === t.id && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center border border-ink bg-signal">
                    <Check className="h-2.5 w-2.5 text-black" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 field-label leading-relaxed">
            Active: <span className="font-bold text-foreground">{activeTemplate.name}</span> · Tap to change
          </p>
        </div>

        {/* QR color picker */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 border-b-2 border-ink pb-1">
            <span className="h-1.5 w-1.5 bg-signal" />
            <p className="field-label font-bold text-foreground">QR color</p>
            <span className="field-label text-muted-foreground">{wallpaperPresets.length} looks</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {wallpaperPresets.map((p) => (
              <button
                key={p.id}
                onClick={() => setQrPresetId(p.id)}
                className={cn(
                  "press no-tap relative flex flex-col items-center gap-1 border-2 border-ink bg-card p-1.5 shadow-[2px_2px_0_0_var(--ink)]",
                  qrPresetId === p.id && "ring-2 ring-signal ring-offset-1 ring-offset-background"
                )}
                style={{ borderRadius: 10 }}
                aria-label={p.name}
                aria-pressed={qrPresetId === p.id}
              >
                <div className="aspect-square w-full overflow-hidden border border-ink" style={{ borderRadius: 6 }}>
                  <QrPreview card={card} style={p.style} size={56} photoDataUrl={photo?.full} showLoading={false} />
                </div>
                <span className="w-full truncate text-center text-[9px] font-bold uppercase tracking-wide text-foreground">
                  {p.name}
                </span>
                {qrPresetId === p.id && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center border border-ink bg-signal">
                    <Check className="h-2.5 w-2.5 text-black" strokeWidth={3.5} />
                  </span>
                )}
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
          style={{ borderRadius: 14 }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Download className="h-4 w-4" strokeWidth={2.5} />}
          Download wallpaper
        </button>

        {/* info */}
        <div className="mt-5 flex gap-2 border-2 border-ink bg-card p-3 shadow-[2px_2px_0_0_var(--ink)]" style={{ borderRadius: 10 }}>
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
