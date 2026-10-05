"use client";

import * as React from "react";
import { Wallet, Loader2, Image as ImageIcon, Smartphone, Info } from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { QrPreview } from "../qr-preview";
import { exportWalletImage, shareOrDownload } from "@/lib/export";
import { PLAIN_STYLE } from "@/lib/style-presets";
import { toast } from "sonner";

export function WalletScreen() {
  const { card, photo } = useVello();
  const { navigate } = useView();
  const [busy, setBusy] = React.useState(false);

  if (!card) return null;

  async function save() {
    if (!card) return;
    setBusy(true);
    try {
      const blob = await exportWalletImage(card, PLAIN_STYLE, photo?.full);
      await shareOrDownload(blob, `${card.firstName || "contact"}-wallet.png`, "Wallet image", "Save to wallet");
      toast.success("Wallet image ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader title="Wallet" onBack={() => navigate("home")} />
      <div className="px-5 pb-28 pt-4">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-clay" />
            <h2 className="font-display text-xl font-medium tracking-tight">Save to Wallet</h2>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            A clean, high-contrast QR image optimised for wallet apps. Save it,
            then add it as a photo pass.
          </p>

          {/* wallet preview (9:4 portrait) */}
          <div className="mt-5 flex justify-center">
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-md" style={{ width: 200, height: 250 }}>
              <div className="flex flex-col items-center pt-5">
                <div className="rounded-lg bg-white p-2">
                  <QrPreview card={card} style={PLAIN_STYLE} size={150} showLoading={false} />
                </div>
                <p className="mt-3 font-display text-[15px] font-semibold text-[#161619]">
                  {[card.firstName, card.lastName].filter(Boolean).join(" ") || "Your name"}
                </p>
                {card.jobTitle && (
                  <p className="text-[11px] text-[#6b655c]">{card.jobTitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={busy}
          className="no-tap mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-[14px] font-medium text-background disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          Save wallet image
        </button>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-clay" />
            <h3 className="text-[13px] font-semibold">How to add it</h3>
          </div>
          <ol className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-mono text-clay">1.</span>
              Save the image above.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-clay">2.</span>
              Open your Wallet app and choose <strong>Add to Wallet → Photo</strong>.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-clay">3.</span>
              Pick the saved image and name it.
            </li>
          </ol>
        </div>

        <div className="mt-4 flex gap-2 rounded-2xl border border-amber-300/40 bg-amber-50 p-3 dark:bg-amber-950/20">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
          <p className="text-[11.5px] leading-relaxed text-amber-700 dark:text-amber-400/80">
            The Photo option may not exist on every device or region. The
            lock-screen wallpaper works regardless. Vello does not use an official
            Wallet API — that needs a server, which breaks the privacy model.
          </p>
        </div>
      </div>
    </div>
  );
}
