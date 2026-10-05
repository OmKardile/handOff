"use client";

import * as React from "react";
import { FileImage, FileText, Image as ImageIcon, Square, Share2, Download, Loader2, Wallet, Monitor } from "lucide-react";
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
  shareOrDownload,
} from "@/lib/export";
import { toast } from "sonner";

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

  if (!card) return null;

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
