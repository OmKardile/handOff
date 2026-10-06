"use client";

import * as React from "react";
import {
  Maximize2,
  Share2,
  Palette,
  Wallet,
  Image as ImageIcon,
  Pencil,
  AlertCircle,
  X,
  Copy,
  Check,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useHandOff } from "@/lib/store";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";
import { Wordmark } from "../app-shell";
import { getQrSizeInfo } from "@/lib/qr";
import { getQrPayload } from "@/lib/qr";
import { getFieldBytes, getTotalBytes, formatContactText } from "@/lib/qr-insights";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QrReveal, Reveal } from "../motion";
import { ScanBadge } from "../scan-badge";
import { motion } from "framer-motion";

export function HomeScreen() {
  const { card, style, photo, qrChanged, dismissQrChanged } = useHandOff();
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
        // fallback: download (native bridge handles Capacitor + web)
        const { downloadBlob } = await import("@/lib/export");
        await downloadBlob(blob, `${card.firstName || "contact"}-qr.png`);
        toast("Image saved (clipboard not supported here)");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't copy image");
    }
  }

  return (
    <div className="mx-auto max-w-md px-5">
      {/* top bar — wordmark + status chip.
          Uses the SAME top padding as ScreenHeader (max(safe,44px) + pb-2)
          so the HandOff wordmark aligns with Settings/Studio/etc titles. */}
      <div
        className="relative z-30 flex items-center justify-between pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 44px)" }}
      >
        <Wordmark className="text-[30px]" />
        <button
          onClick={() => navigate("privacy")}
          className="press no-tap flex h-9 items-center gap-1.5 border-2 border-ink bg-ink px-2.5 font-heavy text-[11px] uppercase tracking-wide text-bone shadow-[2px_2px_0_0_var(--ink)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal blink" />
          On device
        </button>
      </div>

      {/* QR changed banner */}
      {qrChanged && (
        <div className="mb-4 flex items-start gap-3 border-2 border-clay bg-clay/10 p-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay" strokeWidth={2.5} />
          <div className="flex-1">
            <p className="font-heavy text-[12px] uppercase leading-snug tracking-wide text-foreground">
              Your card changed
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
              Anything printed or saved earlier still shows the old details.
            </p>
          </div>
          <button
            onClick={dismissQrChanged}
            className="press no-tap -mr-1 -mt-1 flex h-7 w-7 items-center justify-center border-2 border-ink bg-card text-ink"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* hero card — YOUR CARD */}
      <Reveal delay={0.05}>
      <div className="brut-lg relative overflow-hidden">
        {/* header strip — INK ON LIME (black on yellow) */}
        <div className="flex items-center justify-between border-b-2 border-ink bg-signal px-4 py-1.5 text-black">
          <span className="field-label flex items-center gap-1.5 font-bold text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black blink" />
            YOUR CARD
          </span>
          <span className="field-label text-black/60">Ready</span>
        </div>

        {/* QR — centered at the top */}
        <div className="flex justify-center px-6 pt-8 pb-4">
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
          </button>
          </QrReveal>
        </div>

        {/* name plate — centered at the BOTTOM of the card */}
        <div className="flex flex-col items-center px-6 pb-7 text-center">
          {photo ? (
            <img
              src={photo.full}
              alt=""
              className="mb-3 h-12 w-12 border-2 border-ink object-cover"
            />
          ) : null}
          {card.company ? (
            <p className="field-label text-clay">{card.company}</p>
          ) : null}
          <h1 className="mt-1 font-display text-[2.1rem] uppercase leading-[0.95] tracking-tight">
            {fullName || "Your name"}
          </h1>
          {card.jobTitle && (
            <p className="mt-1 text-[14px] text-muted-foreground">
              {card.jobTitle}
            </p>
          )}
        </div>
      </div>
      </Reveal>

      {/* Scan status — minimal "Scans well" badge */}
      <Reveal delay={0.08}>
        <ScanBadge card={card} style={style} photoDataUrl={photo?.full} className="mt-3" />
      </Reveal>

      {/* QR insights — byte breakdown */}
      <QrInsights card={card} size={size} />

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
        {/* section label — INK ON LIME strip */}
        <div className="mb-2 flex items-center gap-2 border-2 border-ink bg-signal px-2 py-1 shadow-[2px_2px_0_0_var(--ink)]">
          <span className="h-1.5 w-1.5 bg-black" />
          <span className="font-heavy text-[11px] uppercase tracking-wide text-black">On your card</span>
        </div>
        {hasContactDetails ? (
          <div className="brut overflow-hidden">
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
        <p className="mt-3 text-center field-label leading-relaxed">
          THE QR ENCODES A vCARD · STOCK CAMERAS OFFER
          <span className="font-bold text-foreground"> ADD CONTACT </span>
          — NO APP NEEDED
        </p>
        <div className="mx-auto mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={copyVcard}
            className="press no-tap flex items-center gap-1.5 border-2 border-ink bg-card px-3 py-1.5 font-heavy text-[11px] uppercase text-ink shadow-[2px_2px_0_0_var(--ink)]"
          >
            {copied ? <Check className="h-3 w-3" strokeWidth={3} /> : <Copy className="h-3 w-3" strokeWidth={2.5} />}
            {copied ? "Copied" : "Copy vCard"}
          </button>
          <button
            onClick={copyQrImage}
            className="press no-tap flex items-center gap-1.5 border-2 border-ink bg-card px-3 py-1.5 font-heavy text-[11px] uppercase text-ink shadow-[2px_2px_0_0_var(--ink)]"
          >
            <ImageIcon className="h-3 w-3" strokeWidth={2.5} />
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
            className="press no-tap flex items-center gap-1.5 border-2 border-ink bg-card px-3 py-1.5 font-heavy text-[11px] uppercase text-ink shadow-[2px_2px_0_0_var(--ink)]"
          >
            <FileText className="h-3 w-3" strokeWidth={2.5} />
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
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
      className={cn(
        "press no-tap flex flex-col items-center gap-2 border-[2.5px] border-ink py-4 shadow-[4px_4px_0_0_var(--ink)]",
        highlight
          ? "bg-signal text-black"
          : "bg-card text-ink hover:bg-secondary"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={2.4} />
      <span className="font-heavy text-[12px] uppercase tracking-wide">{label}</span>
    </motion.button>
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
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93, transition: { duration: 0.1 } }}
      className="press no-tap flex flex-col items-center gap-1.5 border-2 border-ink bg-card py-3.5 text-ink shadow-[2px_2px_0_0_var(--ink)]"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      <span className="font-heavy text-[11px] uppercase tracking-wide">{label}</span>
    </motion.button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink px-4 py-2.5 last:border-b-0">
      <span className="field-label">{label}</span>
      <span className="truncate text-right font-mono text-[12px] text-foreground">{value}</span>
    </div>
  );
}

function EmptyContactState({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="brut border-2 border-dashed border-ink bg-card/50 px-4 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-ink bg-signal/40">
        <Pencil className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="mt-3 font-heavy text-[14px] uppercase tracking-wide">
        No contact details yet
      </p>
      <p className="mx-auto mt-1 max-w-[15rem] text-[12px] leading-relaxed text-muted-foreground">
        Add a phone, email or social link so people can reach you.
      </p>
      <button
        onClick={onEdit}
        className="press no-tap mx-auto mt-3 flex items-center gap-1.5 border-2 border-ink bg-signal px-3.5 py-1.5 font-heavy text-[12px] uppercase tracking-wide text-black shadow-[2px_2px_0_0_var(--ink)]"
      >
        Add details
        <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** QR insights panel — byte breakdown by field, with a visual bar chart. */
function QrInsights({ card, size }: { card: NonNullable<ReturnType<typeof useHandOff.getState>["card"]>; size: ReturnType<typeof getQrSizeInfo> }) {
  const { navigate } = useView();
  const [expanded, setExpanded] = React.useState(false);
  const fields = getFieldBytes(card);
  const total = getTotalBytes(fields);
  const dataFieldCount = fields.filter((f) => f.id !== "envelope").length;

  if (total === 0) return null;

  return (
    <Reveal delay={0.1}>
      <div className="brut mt-3 overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="press no-tap flex w-full items-center justify-between border-b-2 border-ink px-4 py-2.5"
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 border border-ink bg-signal" />
            <span className="font-heavy text-[12px] uppercase tracking-wide">QR breakdown</span>
            <span className="border border-ink bg-card px-1.5 field-label">
              {dataFieldCount} field{dataFieldCount === 1 ? "" : "s"}
            </span>
          </span>
          <span className="flex items-center gap-2 field-label">
            {total} bytes
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")} strokeWidth={2.5} />
          </span>
        </button>
        {expanded && (
          <div className="space-y-3 px-4 py-3">
            {/* Size meter — moved here from the hero card */}
            <div className="flex items-center justify-between gap-3">
              <span className="field-label font-bold">Size</span>
              <div className="flex flex-1 items-center gap-1">
                {Array.from({ length: 12 }).map((_, i) => {
                  const threshold = i / 12;
                  const lit =
                    size.status === "green" ? threshold < 0.4 :
                    size.status === "amber" ? threshold < 0.7 :
                    threshold < 1;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "h-3 flex-1 border border-ink",
                        lit && (size.status === "red" || size.status === "overflow" ? "bg-clay" : "bg-signal"),
                        !lit && "bg-card"
                      )}
                    />
                  );
                })}
              </div>
              <span className="field-label tabular-nums">{size.bytes}B</span>
            </div>
            <div className="border-t-2 border-ink pt-2">
            {fields
              .slice()
              .sort((a, b) => b.bytes - a.bytes)
              .map((f) => {
                const pct = total > 0 ? (f.bytes / total) * 100 : 0;
                const barColor =
                  f.id === "envelope" ? "bg-muted-foreground/40" :
                  pct < 15 ? "bg-signal" :
                  pct < 30 ? "bg-clay" :
                  pct < 50 ? "bg-amber-500" :
                  "bg-red-500";
                return (
                  <div key={f.id} className="flex items-center gap-2 py-0.5">
                    <span className="w-16 flex-shrink-0 field-label">{f.label}</span>
                    <div className="relative h-3 flex-1 border-2 border-ink bg-card">
                      <div
                        className={cn("absolute inset-y-0 left-0", barColor)}
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
            </div>
            <p className="pt-1 field-label leading-relaxed">
              The QR encodes a compact vCard. Fewer bytes = faster, more reliable scans.
              <button
                onClick={() => navigate("editor")}
                className="ml-1 font-bold text-foreground underline-offset-2 hover:underline"
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
