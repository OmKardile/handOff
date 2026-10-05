"use client";

import * as React from "react";
import {
  Maximize2,
  Share2,
  Palette,
  Wallet,
  Image as ImageIcon,
  Pencil,
  ShieldCheck,
  AlertCircle,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";
import { Wordmark } from "../app-shell";
import { getQrSizeInfo } from "@/lib/qr";
import { getQrPayload } from "@/lib/qr";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function HomeScreen() {
  const { card, style, photo, qrChanged, dismissQrChanged } = useVello();
  const { navigate } = useView();
  const [copied, setCopied] = React.useState(false);

  if (!card) return null;

  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ");
  const size = getQrSizeInfo(card);

  async function copyVcard() {
    if (!card) return;
    try {
      await navigator.clipboard.writeText(getQrPayload(card));
      setCopied(true);
      toast.success("vCard copied — paste into any notes app");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-safe">
      {/* top bar */}
      <div className="flex items-center justify-between py-4">
        <Wordmark className="text-xl" />
        <button
          onClick={() => navigate("privacy")}
          className="no-tap flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[12px] font-medium text-muted-foreground"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-clay" />
          On device
        </button>
      </div>

      {/* QR changed banner */}
      {qrChanged && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-clay/20 bg-clay/5 p-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay" />
          <div className="flex-1">
            <p className="text-[13px] font-medium leading-snug text-foreground">
              Your QR changed.
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
              Anything printed or saved earlier still shows the old details.
            </p>
          </div>
          <button
            onClick={dismissQrChanged}
            className="no-tap -mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* hero card */}
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
        {/* name plate */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="min-w-0 flex-1">
            {photo ? (
              <img
                src={photo.full}
                alt=""
                className="mb-3 h-12 w-12 rounded-full object-cover ring-2 ring-border"
              />
            ) : null}
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">
              {card.company || "Your card"}
            </p>
            <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight tracking-tight">
              {fullName || "Your name"}
            </h1>
            {card.jobTitle && (
              <p className="mt-0.5 text-[14px] text-muted-foreground">
                {card.jobTitle}
              </p>
            )}
          </div>
        </div>

        {/* QR */}
        <div className="flex justify-center px-6 py-6">
          <button
            onClick={() => navigate("fullscreen-qr")}
            className="no-tap group relative"
            aria-label="Show QR fullscreen"
          >
            <QrPreview
              card={card}
              style={style}
              size={264}
              photoDataUrl={photo?.full}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-background/0 opacity-0 transition-opacity group-hover:bg-background/5 group-hover:opacity-100">
              <Maximize2 className="h-5 w-5 text-foreground/40" />
            </div>
          </button>
        </div>

        {/* size meter */}
        <div className="flex items-center justify-center gap-2 pb-5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              size.status === "green" && "bg-emerald-500",
              size.status === "amber" && "bg-amber-500",
              size.status === "red" && "bg-red-500",
              size.status === "overflow" && "bg-red-600"
            )}
          />
          <span className="text-[11px] text-muted-foreground">
            {size.bytes} bytes · {size.label}
          </span>
        </div>
      </div>

      {/* primary actions */}
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <PrimaryAction
          icon={Maximize2}
          label="Show"
          onClick={() => navigate("fullscreen-qr")}
        />
        <PrimaryAction
          icon={Share2}
          label="Share"
          onClick={() => navigate("share")}
          highlight
        />
        <PrimaryAction
          icon={Palette}
          label="Style"
          onClick={() => navigate("studio")}
        />
      </div>

      {/* secondary actions */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <SecondaryAction
          icon={Pencil}
          label="Edit"
          onClick={() => navigate("editor")}
        />
        <SecondaryAction
          icon={Wallet}
          label="Wallet"
          onClick={() => navigate("wallet")}
        />
        <SecondaryAction
          icon={ImageIcon}
          label="Wallpaper"
          onClick={() => navigate("wallpaper")}
        />
      </div>

      {/* contact details */}
      <div className="mt-7 mb-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          On your card
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <DetailRow label="Phone" value={card.phone} />
          <DetailRow label="Email" value={card.email} />
          <DetailRow label="Website" value={card.website.replace(/^https?:\/\//, "")} />
          <DetailRow label="Location" value={card.location} />
          {card.linkedin && <DetailRow label="LinkedIn" value={card.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "@")} />}
          {card.instagram && <DetailRow label="Instagram" value={card.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")} />}
          {card.xHandle && <DetailRow label="X" value={card.xHandle.replace(/^https?:\/\/(www\.)?x\.com\//, "@")} />}
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          The QR contains a vCard. Stock phone cameras offer{" "}
          <span className="font-medium text-foreground">Add contact</span> — no app needed.
        </p>
        <button
          onClick={copyVcard}
          className="no-tap mx-auto mt-2 flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy vCard text"}
        </button>
      </div>
    </div>
  );
}

function PrimaryAction({
  icon: Icon,
  label,
  onClick,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "no-tap flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all active:scale-[0.97]",
        highlight
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-clay/40"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
}

function SecondaryAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="no-tap flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card py-3.5 text-muted-foreground transition-colors hover:text-foreground active:scale-[0.97]"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 px-4 py-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="truncate text-right text-[13px] text-foreground">{value}</span>
    </div>
  );
}
