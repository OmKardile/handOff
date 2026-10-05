"use client";

import * as React from "react";
import { FileImage, FileText, Image as ImageIcon, Square, Share2, Download, Loader2, Wallet, Monitor, LayoutGrid, Check } from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import {
  exportQrPng,
  exportStoryImage,
  exportSquareImage,
  exportPrintCard,
  exportWalletImage,
  exportVcf,
  exportQrSvg,
  exportShareCard,
  shareOrDownload,
  SHARE_CARD_LAYOUTS,
  type ShareCardLayout,
} from "@/lib/export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ExportId = "png" | "svg" | "vcf" | "story" | "square" | "print" | "wallet";
const LABELS: Record<ExportId, string> = {
  png: "QR image (PNG)",
  svg: "QR vector (SVG)",
  vcf: "Contact file (.vcf)",
  story: "Story image (9:16)",
  square: "Square image",
  print: "Print card",
  wallet: "Wallet image",
};

export function ShareSheet() {
  const { card, style, photo } = useVello();
  const { navigate } = useView();
  const [busy, setBusy] = React.useState<ExportId | null>(null);
  const [layoutBusy, setLayoutBusy] = React.useState<ShareCardLayout | null>(null);
  const [selectedLayout, setSelectedLayout] = React.useState<ShareCardLayout>("hairline");

  if (!card) return null;

  async function runLayout(layout: ShareCardLayout) {
    if (!card) return;
    setLayoutBusy(layout);
    try {
      const blob = await exportShareCard(card, style, layout, photo?.full);
      const fname = `${card.firstName || "contact"}-${layout}.png`;
      const res = await shareOrDownload(blob, fname, "Vello card", "My contact");
      toast[res === "shared" ? "success" : "default"](res === "shared" ? "Shared" : "Downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLayoutBusy(null);
    }
  }

  async function run(id: ExportId) {
    if (!card) return;
    setBusy(id);
    try {
      switch (id) {
        case "png": {
          const blob = await exportQrPng(card, style, 1200, photo?.full);
          const res = await shareOrDownload(blob, `${card.firstName || "contact"}-qr.png`, "Vello QR", "Scan to save my contact");
          toast[res === "shared" ? "success" : "default"](res === "shared" ? "Shared" : "Downloaded");
          break;
        }
        case "svg": {
          const svg = await exportQrSvg(card, style);
          const blob = new Blob([svg], { type: "image/svg+xml" });
          shareOrDownload(blob, `${card.firstName || "contact"}-qr.svg`, "Vello QR", "QR vector");
          toast.default("SVG ready");
          break;
        }
        case "vcf": {
          exportVcf(card, photo?.thumb);
          toast.success(".vcf downloaded");
          break;
        }
        case "story": {
          const blob = await exportStoryImage(card, style, photo?.full);
          const res = await shareOrDownload(blob, `${card.firstName || "contact"}-story.png`, "Vello", "My contact");
          toast[res === "shared" ? "success" : "default"](res === "shared" ? "Shared" : "Downloaded");
          break;
        }
        case "square": {
          const blob = await exportSquareImage(card, style, photo?.full);
          const res = await shareOrDownload(blob, `${card.firstName || "contact"}-square.png`, "Vello", "My contact");
          toast[res === "shared" ? "success" : "default"](res === "shared" ? "Shared" : "Downloaded");
          break;
        }
        case "print": {
          const blob = await exportPrintCard(card, style, photo?.full);
          shareOrDownload(blob, `${card.firstName || "contact"}-card.png`, "Business card", "Print-ready card");
          toast.success("Print card ready");
          break;
        }
        case "wallet": {
          const blob = await exportWalletImage(card, style, photo?.full);
          shareOrDownload(blob, `${card.firstName || "contact"}-wallet.png`, "Wallet image", "Save to wallet");
          toast.success("Wallet image ready");
          break;
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  }

  const items: { id: ExportId; icon: typeof FileImage; desc: string; size: string }[] = [
    { id: "png", icon: FileImage, desc: "Large PNG of your styled QR", size: "1200px" },
    { id: "svg", icon: FileText, desc: "Scalable vector for print/web", size: "SVG" },
    { id: "vcf", icon: FileText, desc: "Full contact file with photo", size: ".vcf" },
    { id: "story", icon: ImageIcon, desc: "Tall image for stories", size: "1080×1920" },
    { id: "square", icon: Square, desc: "Square share image", size: "1080×1080" },
    { id: "print", icon: FileImage, desc: "Business card layout", size: "1050×600" },
    { id: "wallet", icon: Wallet, desc: "Clean QR for wallet photo", size: "1080×1350" },
  ];

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader title="Share & export" onBack={() => navigate("home")} helpGuideId="share-qr" />
      <div className="px-5 pb-28 pt-4">
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
          Every export reflects your current style. Shared files leave your device
          only through the system share sheet or a download you choose.
        </p>
        <div className="space-y-2">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => run(it.id)}
                disabled={busy !== null}
                className="no-tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-clay/40 disabled:opacity-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                  {busy === it.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-clay" />
                  ) : (
                    <Icon className="h-4 w-4 text-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium">{LABELS[it.id]}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{it.desc}</p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {it.size}
                </span>
              </button>
            );
          })}
        </div>

        {/* Share-card layouts */}
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-clay" />
            <h3 className="text-[13px] font-semibold">Share-card layouts</h3>
          </div>
          <p className="mb-3 text-[12px] leading-relaxed text-muted-foreground">
            Four designed layouts, each 1080×1350. Pick one to export.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {SHARE_CARD_LAYOUTS.map((l) => {
              const active = selectedLayout === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setSelectedLayout(l.id)}
                  onDoubleClick={() => runLayout(l.id)}
                  className={cn(
                    "no-tap relative flex flex-col overflow-hidden rounded-2xl border-2 p-3 text-left transition-all",
                    active ? "border-clay bg-clay/5" : "border-border bg-card"
                  )}
                >
                  <LayoutThumb layout={l.id} />
                  <div className="mt-2">
                    <p className="text-[13px] font-semibold">{l.name}</p>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{l.desc}</p>
                  </div>
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => runLayout(selectedLayout)}
            disabled={layoutBusy !== null}
            className="no-tap mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-[14px] font-medium text-background disabled:opacity-50"
          >
            {layoutBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {layoutBusy ? "Rendering…" : `Export ${SHARE_CARD_LAYOUTS.find((l) => l.id === selectedLayout)?.name}`}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-clay" />
            <h3 className="text-[13px] font-semibold">On this device</h3>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Files are saved to your downloads or shared through your phone's share
            sheet. Nothing is uploaded.
          </p>
        </div>
      </div>
    </div>
  );
}

/** A small SVG thumbnail previewing each share-card layout. */
function LayoutThumb({ layout }: { layout: ShareCardLayout }) {
  const common = "h-24 w-full rounded-lg overflow-hidden";
  switch (layout) {
    case "hairline":
      return (
        <div className={cn(common, "bg-[#fffefb] border border-border")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <line x1="10" y1="12" x2="70" y2="12" stroke="#161619" strokeWidth="0.5" />
            <text x="40" y="18" textAnchor="middle" fontSize="3" fill="#b0533a" fontFamily="sans-serif">DIGITAL CARD</text>
            <rect x="22" y="28" width="36" height="36" fill="#f0ece4" stroke="#e0d9cd" strokeWidth="0.5" />
            <text x="40" y="78" textAnchor="middle" fontSize="7" fill="#161619" fontFamily="Fraunces, serif" fontWeight="500">Name</text>
            <text x="40" y="85" textAnchor="middle" fontSize="3" fill="#6b655c" fontFamily="sans-serif">Title</text>
            <line x1="10" y1="92" x2="70" y2="92" stroke="#161619" strokeWidth="0.5" />
          </svg>
        </div>
      );
    case "plaque":
      return (
        <div className={cn(common, "bg-[#161619]")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <rect x="16" y="22" width="48" height="42" fill="#fffefb" rx="2" />
            <rect x="22" y="28" width="36" height="30" fill="#eee" />
            <line x1="36" y1="70" x2="44" y2="70" stroke="#b0533a" strokeWidth="1.5" />
            <text x="40" y="80" textAnchor="middle" fontSize="6.5" fill="#ece7de" fontFamily="Fraunces, serif" fontWeight="500">Name</text>
            <text x="40" y="86" textAnchor="middle" fontSize="3" fill="#9b958a" fontFamily="sans-serif">Title</text>
          </svg>
        </div>
      );
    case "ticket":
      return (
        <div className={cn(common, "bg-[#fffefb] border border-border")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <rect x="8" y="10" width="64" height="80" fill="none" stroke="#161619" strokeWidth="0.8" />
            <rect x="8" y="10" width="64" height="8" fill="#161619" />
            <text x="14" y="15.5" fontSize="3" fill="#fffefb" fontFamily="sans-serif" fontWeight="600">VELLO · CONTACT</text>
            <rect x="22" y="24" width="36" height="30" fill="#f0ece4" stroke="#e0d9cd" strokeWidth="0.5" />
            <line x1="8" y1="58" x2="72" y2="58" stroke="#161619" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            <circle cx="8" cy="58" r="1.5" fill="#fffefb" />
            <circle cx="72" cy="58" r="1.5" fill="#fffefb" />
            <text x="40" y="70" textAnchor="middle" fontSize="6" fill="#161619" fontFamily="Fraunces, serif" fontWeight="500">Name</text>
            <text x="14" y="78" fontSize="2.5" fill="#6b655c" fontFamily="sans-serif">Title</text>
            <text x="14" y="83" fontSize="2.5" fill="#6b655c" fontFamily="sans-serif">phone · email</text>
          </svg>
        </div>
      );
    case "polaroid":
      return (
        <div className={cn(common, "bg-[#efeae1]")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <rect x="14" y="8" width="52" height="78" fill="#fffefb" rx="1" />
            <rect x="18" y="12" width="44" height="44" fill="#d9cfc1" />
            <rect x="44" y="14" width="18" height="18" fill="#fffefb" stroke="#e0d9cd" strokeWidth="0.3" />
            <text x="40" y="70" textAnchor="middle" fontSize="6" fill="#161619" fontFamily="Fraunces, serif" fontStyle="italic" fontWeight="500">Name</text>
            <text x="40" y="77" textAnchor="middle" fontSize="2.8" fill="#6b655c" fontFamily="sans-serif">Title</text>
          </svg>
        </div>
      );
  }
}
