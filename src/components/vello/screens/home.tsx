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
  ChevronRight,
  FileText,
} from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";
import { Wordmark } from "../app-shell";
import { getQrSizeInfo } from "@/lib/qr";
import { getQrPayload } from "@/lib/qr";
import { getFieldBytes, getTotalBytes, formatContactText } from "@/lib/qr-insights";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QrReveal, Reveal } from "../motion";

export function HomeScreen() {
  const { card, style, photo, qrChanged, dismissQrChanged } = useVello();
  const { navigate } = useView();
  const [copied, setCopied] = React.useState(false);

  if (!card) return null;

  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ");
  const size = getQrSizeInfo(card);
  const hasContactDetails = Boolean(
    card.phone || card.email || card.website || card.location || card.linkedin || card.instagram || card.xHandle
  );

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

  async function copyQrImage() {
    if (!card) return;
    try {
      const { exportQrPng } = await import("@/lib/export");
      const blob = await exportQrPng(card, style, 600, photo?.full);
      const w = window as unknown as { ClipboardItem?: typeof ClipboardItem };
      if (w.ClipboardItem && navigator.clipboard && "write" in navigator.clipboard) {
        const item = new w.ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        toast.success("QR image copied — paste into any app");
      } else {
        // fallback: download
        const { downloadBlob } = await import("@/lib/export");
        downloadBlob(blob, `${card.firstName || "contact"}-qr.png`);
        toast("Image copied to downloads (clipboard not supported here)");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't copy image");
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-safe">
      {/* top bar */}
      <div className="flex items-center justify-between py-4">
        <Wordmark className="text-xl" />
        <button
          onClick={() => navigate("privacy")}
          className="glass-pill no-tap flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
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

      {/* hero card — Figma Glassy style: frosted glass, 1px white border, soft shadow */}
      <Reveal delay={0.05}>
      <div className="glass-card relative overflow-hidden rounded-3xl">
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
          <QrReveal>
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
          </QrReveal>
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
      </Reveal>

      {/* QR insights — byte breakdown */}
      <QrInsights card={card} />

      {/* primary actions */}
      <Reveal delay={0.15}>
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
      </Reveal>

      {/* secondary actions */}
      <Reveal delay={0.22}>
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
      </Reveal>

      {/* contact details */}
      <Reveal delay={0.28}>
      <div className="mt-7 mb-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          On your card
        </p>
        {hasContactDetails ? (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <DetailRow label="Phone" value={card.phone} />
            <DetailRow label="Email" value={card.email} />
            <DetailRow label="Website" value={card.website.replace(/^https?:\/\//, "")} />
            <DetailRow label="Location" value={card.location} />
            {(card.socialOrder?.length === 4 ? card.socialOrder : ["linkedin", "instagram", "x", "whatsapp"]).map((id) => {
              if (id === "linkedin" && card.linkedin) return <DetailRow key={id} label="LinkedIn" value={card.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "@")} />;
              if (id === "instagram" && card.instagram) return <DetailRow key={id} label="Instagram" value={card.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")} />;
              if (id === "x" && card.xHandle) return <DetailRow key={id} label="X" value={card.xHandle.replace(/^https?:\/\/(www\.)?x\.com\//, "@")} />;
              if (id === "whatsapp" && card.whatsapp) return <DetailRow key={id} label="WhatsApp" value={card.whatsapp} />;
              return null;
            })}
          </div>
        ) : (
          <EmptyContactState onEdit={() => navigate("editor")} />
        )}
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          The QR contains a vCard. Stock phone cameras offer{" "}
          <span className="font-medium text-foreground">Add contact</span> — no app needed.
        </p>
        <div className="mx-auto mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={copyVcard}
            className="glass-pill no-tap flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy vCard text"}
          </button>
          <button
            onClick={copyQrImage}
            className="glass-pill no-tap flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ImageIcon className="h-3 w-3" />
            Copy image
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(formatContactText(card));
                toast.success("Contact copied — paste into messages or notes");
              } catch {
                toast.error("Couldn't copy");
              }
            }}
            className="glass-pill no-tap flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <FileText className="h-3 w-3" />
            Copy as text
          </button>
        </div>
      </div>
      </Reveal>
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
        "no-tap flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all active:scale-[0.96]",
        highlight
          ? "border-foreground bg-foreground text-background shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]"
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

function EmptyContactState({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Pencil className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="mt-3 font-display text-[15px] font-medium tracking-tight">
        No contact details yet
      </p>
      <p className="mx-auto mt-1 max-w-[15rem] text-[12px] leading-relaxed text-muted-foreground">
        Add a phone, email or social link so people can reach you.
      </p>
      <button
        onClick={onEdit}
        className="no-tap mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[12px] font-medium transition-colors hover:border-clay/50 hover:text-clay"
      >
        Add details
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

/** QR insights panel — byte breakdown by field, with a visual bar chart. */
function QrInsights({ card }: { card: NonNullable<ReturnType<typeof useVello.getState>["card"]> }) {
  const { navigate } = useView();
  const [expanded, setExpanded] = React.useState(false);
  const fields = getFieldBytes(card);
  const total = getTotalBytes(fields);
  const dataFieldCount = fields.filter((f) => f.id !== "envelope").length;

  if (total === 0) return null;

  return (
    <Reveal delay={0.1}>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="no-tap flex w-full items-center justify-between px-4 py-3"
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-clay" />
            <span className="text-[12px] font-semibold tracking-tight">QR breakdown</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              {dataFieldCount} field{dataFieldCount === 1 ? "" : "s"}
            </span>
          </span>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {total} bytes
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")} />
          </span>
        </button>
        {expanded && (
          <div className="space-y-2 border-t border-border px-4 py-3">
            {fields
              .slice()
              .sort((a, b) => b.bytes - a.bytes)
              .map((f) => {
                const pct = total > 0 ? (f.bytes / total) * 100 : 0;
                // color scale: envelope = muted, small fields = emerald, large = amber, dominant = red
                const barColor =
                  f.id === "envelope" ? "bg-muted-foreground/40" :
                  pct < 15 ? "bg-emerald-500" :
                  pct < 30 ? "bg-clay" :
                  pct < 50 ? "bg-amber-500" :
                  "bg-red-500";
                return (
                  <div key={f.id} className="flex items-center gap-2">
                    <span className="w-16 flex-shrink-0 text-[10.5px] text-muted-foreground">{f.label}</span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("absolute inset-y-0 left-0 rounded-full transition-all", barColor)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 flex-shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                      {f.bytes}B
                    </span>
                    <span className="w-9 flex-shrink-0 text-right font-mono text-[9.5px] text-muted-foreground/70">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            <p className="pt-1 text-[10.5px] leading-relaxed text-muted-foreground">
              The QR encodes a compact vCard. Fewer bytes = faster, more reliable scans.
              <button
                onClick={() => navigate("editor")}
                className="ml-1 font-medium text-clay underline-offset-2 hover:underline"
              >
                Edit contents
              </button>
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}
