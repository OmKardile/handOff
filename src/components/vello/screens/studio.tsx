"use client";

import * as React from "react";
import { Shuffle, RotateCcw, Save, Check, ScanLine } from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { QrPreview } from "../qr-preview";
import { STYLE_PRESETS, PLAIN_STYLE, SWATCH_ROWS, QR_FONTS, surpriseMe } from "@/lib/style-presets";
import { renderQrToCanvas } from "@/lib/qr-render";
import { evaluateScan } from "@/lib/scan-check";
import { getQrPayload } from "@/lib/qr";
import type { ModuleShape, EyeShape, QrStyle, Card } from "@/shared/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useFontMemory } from "@/lib/font-memory";
import { useStyleRecents } from "@/lib/style-memory";
import { Heart, Clock, History } from "lucide-react";

const SHAPES: { id: ModuleShape; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
  { id: "classy", label: "Classy" },
  { id: "extra-rounded", label: "Soft" },
  { id: "classy-rounded", label: "Classy R" },
];

const EYES: { id: EyeShape; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
  { id: "rounded", label: "Rounded" },
];

const TABS = ["Presets", "Shape", "Colour", "Centre", "Frame", "Caption"] as const;
type Tab = (typeof TABS)[number];

export function StudioScreen() {
  const { card, style, setStyle, applyPreset, photo, presets, saveCustomPreset } = useVello();
  const { navigate } = useView();
  const [tab, setTab] = React.useState<Tab>("Presets");
  const [scanOk, setScanOk] = React.useState<boolean | null>(null);
  const [scanMsg, setScanMsg] = React.useState<string>("");
  const checkRef = React.useRef<HTMLCanvasElement | null>(null);
  const { remember: rememberFont } = useFontMemory();
  const { recentStyles, remember: rememberStyle } = useStyleRecents();

  // scan check (debounced)
  React.useEffect(() => {
    if (!card) return;
    const t = setTimeout(async () => {
      const canvas = checkRef.current ?? document.createElement("canvas");
      checkRef.current = canvas;
      try {
        await renderQrToCanvas(canvas, card, style, 300, photo?.full);
        const payload = getQrPayload(card);
        const res = evaluateScan(canvas, payload, style.moduleColor, style.background);
        setScanOk(res.ok);
        setScanMsg(res.message);
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [card, style, photo]);

  if (!card) return null;

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader
        title="Style studio"
        onBack={() => navigate("home")}
        helpGuideId="style-qr"
        action={
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setStyle({ ...PLAIN_STYLE, presetId: "plain" });
                toast("Reset to plain");
              }}
              className="no-tap flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground"
              aria-label="Reset to plain"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setStyle(surpriseMe());
                toast("Surprise applied — stays scannable");
              }}
              className="no-tap flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground"
              aria-label="Surprise me"
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="px-5 pb-28">
        {/* live preview */}
        <div className="sticky top-14 z-20 -mx-5 mb-4 bg-background/90 px-5 py-3 backdrop-blur-xl">
          <div className="flex justify-center">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
              <QrPreview card={card} style={style} size={200} photoDataUrl={photo?.full} />
            </div>
          </div>
          {/* scan indicator */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <ScanLine className={cn("h-3.5 w-3.5", scanOk ? "text-emerald-500" : "text-amber-500")} />
            <span className={cn("text-[11px]", scanOk ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
              {scanMsg || "Checking…"}
            </span>
          </div>
        </div>

        {/* tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "no-tap whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                tab === t ? "bg-foreground text-background" : "border border-border text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Presets" && (
          <div className="space-y-5">
            {recentStyles.length > 0 && (
              <RecentStylesStrip
                styles={recentStyles}
                currentId={style.presetId}
                onApply={(id) => {
                  applyPreset(id);
                  rememberStyle(id);
                }}
                card={card}
                photo={photo?.full}
              />
            )}
            <PresetGroup title="Quiet & editorial" presets={STYLE_PRESETS.filter((p) => p.group === "quiet")} currentId={style.presetId} onApply={(id) => { applyPreset(id); rememberStyle(id); }} card={card} style={style} photo={photo?.full} />
            <PresetGroup title="Warm & colourful" presets={STYLE_PRESETS.filter((p) => p.group === "warm")} currentId={style.presetId} onApply={(id) => { applyPreset(id); rememberStyle(id); }} card={card} style={style} photo={photo?.full} />
            <PresetGroup title="Cool & fresh" presets={STYLE_PRESETS.filter((p) => p.group === "cool")} currentId={style.presetId} onApply={(id) => { applyPreset(id); rememberStyle(id); }} card={card} style={style} photo={photo?.full} />
            <PresetGroup title="Bolder social" presets={STYLE_PRESETS.filter((p) => p.group === "social")} currentId={style.presetId} onApply={(id) => { applyPreset(id); rememberStyle(id); }} card={card} style={style} photo={photo?.full} />
            {presets.length > 0 && (
              <PresetGroup title="Your presets" presets={presets.map((p) => ({ id: p.id, name: p.name, group: "quiet" as const, captionFontLabel: p.style.captionFont, style: p.style }))} currentId={style.presetId} onApply={applyPreset} card={card} style={style} photo={photo?.full} />
            )}
          </div>
        )}

        {tab === "Shape" && (
          <div className="space-y-5">
            <ControlGroup title="Modules">
              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map((s) => (
                  <Pill key={s.id} active={style.moduleShape === s.id} onClick={() => setStyle((st) => ({ ...st, moduleShape: s.id, presetId: null }))}>
                    {s.label}
                  </Pill>
                ))}
              </div>
            </ControlGroup>
            <ControlGroup title="Finder eyes">
              <div className="grid grid-cols-3 gap-2">
                {EYES.map((s) => (
                  <Pill key={s.id} active={style.eyeShape === s.id} onClick={() => setStyle((st) => ({ ...st, eyeShape: s.id, presetId: null }))}>
                    {s.label}
                  </Pill>
                ))}
              </div>
            </ControlGroup>
            <ControlGroup title="Error correction">
              <div className="grid grid-cols-4 gap-2">
                {(["L", "M", "Q", "H"] as const).map((e) => (
                  <Pill key={e} active={style.ecc === e} onClick={() => setStyle((st) => ({ ...st, ecc: e, presetId: null }))}>
                    {e}
                  </Pill>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Higher = more damage tolerance, denser QR. H is automatic with a centre image.
              </p>
            </ControlGroup>
          </div>
        )}

        {tab === "Colour" && (
          <div className="space-y-5">
            <ControlGroup title="Module colour">
              <ColorRow value={style.moduleColor} onChange={(v) => setStyle((st) => ({ ...st, moduleColor: v, moduleGradient: null, presetId: null }))} />
            </ControlGroup>
            <ControlGroup title="Eye colours">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-muted-foreground">Outer</label>
                  <ColorRow value={style.eyeOuterColor} onChange={(v) => setStyle((st) => ({ ...st, eyeOuterColor: v, presetId: null }))} compact />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-muted-foreground">Inner</label>
                  <ColorRow value={style.eyeInnerColor} onChange={(v) => setStyle((st) => ({ ...st, eyeInnerColor: v, presetId: null }))} compact />
                </div>
              </div>
            </ControlGroup>
            <ControlGroup title="Swatches">
              <div className="space-y-3">
                {SWATCH_ROWS.map((row) => (
                  <div key={row.name}>
                    <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{row.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {row.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setStyle((st) => ({ ...st, moduleColor: c, moduleGradient: null, presetId: null }))}
                          className="no-tap h-8 w-8 rounded-full border border-border transition-transform active:scale-90"
                          style={{ background: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ControlGroup>
          </div>
        )}

        {tab === "Centre" && (
          <div className="space-y-5">
            <ControlGroup title="Centre element">
              <div className="grid grid-cols-4 gap-2">
                {(["none", "initials", "photo", "emoji"] as const).map((t) => (
                  <Pill key={t} active={style.centerType === t} onClick={() => setStyle((st) => ({ ...st, centerType: t, centerSize: t === "none" ? 0 : st.centerSize || 20, ecc: t === "none" ? st.ecc : "H", presetId: null }))}>
                    {t === "none" ? "None" : t === "initials" ? "Initials" : t === "photo" ? "Photo" : "Emoji"}
                  </Pill>
                ))}
              </div>
            </ControlGroup>
            {style.centerType !== "none" && (
              <>
                <ControlGroup title="Size">
                  <input
                    type="range"
                    min={10}
                    max={30}
                    value={style.centerSize}
                    onChange={(e) => setStyle((st) => ({ ...st, centerSize: Number(e.target.value) }))}
                    className="w-full accent-clay"
                  />
                  <p className="text-[11px] text-muted-foreground">{style.centerSize}% — larger centres are harder to scan</p>
                </ControlGroup>
                <ControlGroup title="Shape">
                  <div className="grid grid-cols-2 gap-2">
                    <Pill active={style.centerShape === "circle"} onClick={() => setStyle((st) => ({ ...st, centerShape: "circle" }))}>Circle</Pill>
                    <Pill active={style.centerShape === "rounded-square"} onClick={() => setStyle((st) => ({ ...st, centerShape: "rounded-square" }))}>Rounded</Pill>
                  </div>
                </ControlGroup>
                <ControlGroup title="Ring">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px]">Border ring</span>
                    <button
                      onClick={() => setStyle((st) => ({ ...st, centerRing: !st.centerRing }))}
                      className={cn("no-tap relative h-6 w-10 rounded-full transition-colors", style.centerRing ? "bg-clay" : "bg-muted")}
                      role="switch"
                      aria-checked={style.centerRing}
                    >
                      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", style.centerRing ? "translate-x-[18px]" : "translate-x-0.5")} />
                    </button>
                  </div>
                </ControlGroup>
                {style.centerType === "emoji" && (
                  <ControlGroup title="Emoji">
                    <div className="flex flex-wrap gap-2">
                      {["✨", "👋", "◆", "●", "▲", "★", "♦", "♥"].map((e) => (
                        <button
                          key={e}
                          onClick={() => setStyle((st) => ({ ...st, centerValue: e }))}
                          className={cn("no-tap flex h-10 w-10 items-center justify-center rounded-xl border text-xl", style.centerValue === e ? "border-clay bg-clay/5" : "border-border")}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </ControlGroup>
                )}
              </>
            )}
          </div>
        )}

        {tab === "Frame" && (
          <div className="space-y-5">
            <ControlGroup title="Plate radius">
              <input
                type="range"
                min={0}
                max={40}
                value={style.plateRadius}
                onChange={(e) => setStyle((st) => ({ ...st, plateRadius: Number(e.target.value) }))}
                className="w-full accent-clay"
              />
              <p className="text-[11px] text-muted-foreground">{style.plateRadius}px</p>
            </ControlGroup>
            <ControlGroup title="Quiet zone">
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={style.platePadding}
                onChange={(e) => setStyle((st) => ({ ...st, platePadding: Number(e.target.value) }))}
                className="w-full accent-clay"
              />
              <p className="text-[11px] text-muted-foreground">{style.platePadding}× module margin — keep ≥ 1 for scanning</p>
            </ControlGroup>
            <ControlGroup title="Background">
              <ColorRow value={style.background} onChange={(v) => setStyle((st) => ({ ...st, background: v, backgroundGradient: null, presetId: null }))} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                QR plates stay light. Dark backgrounds break scanning.
              </p>
            </ControlGroup>
          </div>
        )}

        {tab === "Caption" && (
          <div className="space-y-5">
            <ControlGroup title="Caption">
              <div className="flex items-center justify-between">
                <span className="text-[14px]">Show caption</span>
                <button
                  onClick={() => setStyle((st) => ({ ...st, captionEnabled: !st.captionEnabled }))}
                  className={cn("no-tap relative h-6 w-10 rounded-full transition-colors", style.captionEnabled ? "bg-clay" : "bg-muted")}
                  role="switch"
                  aria-checked={style.captionEnabled}
                >
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", style.captionEnabled ? "translate-x-[18px]" : "translate-x-0.5")} />
                </button>
              </div>
            </ControlGroup>
            {style.captionEnabled && (
              <>
                <ControlGroup title="Caption text">
                  <input
                    className="no-tap w-full rounded-xl border border-input bg-background px-3.5 py-3 text-[15px] outline-none focus:border-clay"
                    value={style.captionText}
                    placeholder="Uses your name if empty"
                    onChange={(e) => setStyle((st) => ({ ...st, captionText: e.target.value }))}
                  />
                </ControlGroup>
                <ControlGroup title="Font">
                  <FontPicker
                    current={style.captionFont}
                    onSelect={(family) => {
                      setStyle((st) => ({ ...st, captionFont: family }));
                      rememberFont(family);
                    }}
                  />
                </ControlGroup>
              </>
            )}
            {/* save as preset */}
            <button
              onClick={() => {
                const name = window.prompt("Name this preset");
                if (!name) return;
                void saveCustomPreset(name, style);
                toast.success(`Saved "${name}"`);
              }}
              className="no-tap flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-[14px] font-medium"
            >
              <Save className="h-4 w-4" />
              Save as custom preset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PresetGroup({
  title,
  presets,
  currentId,
  onApply,
  card,
  style,
  photo,
}: {
  title: string;
  presets: typeof STYLE_PRESETS;
  currentId: string | null;
  onApply: (id: string) => void;
  card: Card;
  style: QrStyle;
  photo?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {presets.map((p) => {
          const active = currentId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onApply(p.id)}
              className={cn(
                "no-tap flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                active ? "border-clay" : "border-border"
              )}
            >
              <div className="relative">
                <QrPreview
                  card={card}
                  style={p.style}
                  size={96}
                  photoDataUrl={photo}
                  showLoading={false}
                />
                {active && (
                  <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
              <p className="px-2 py-1.5 text-center text-[11px] font-medium">{p.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "no-tap rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors",
        active ? "border-clay bg-clay/5 text-clay" : "border-border text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ColorRow({
  value,
  onChange,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", compact ? "" : "")}>
      <label className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-xl border border-border">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="block h-full w-full" style={{ background: value }} />
      </label>
      <input
        type="text"
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        className="no-tap w-24 rounded-lg border border-input bg-background px-2 py-2 text-[13px] font-mono outline-none focus:border-clay"
      />
    </div>
  );
}

function FontPicker({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (family: string) => void;
}) {
  const { recents, favs, toggleFav, isFav } = useFontMemory();

  const recentFonts = recents
    .map((f) => QR_FONTS.find((q) => q.family === f))
    .filter(Boolean) as typeof QR_FONTS;
  const favFonts = favs
    .map((f) => QR_FONTS.find((q) => q.family === f))
    .filter(Boolean) as typeof QR_FONTS;

  return (
    <div className="space-y-3">
      {favFonts.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-clay">
            <Heart className="h-3 w-3 fill-clay" /> Favourites
          </p>
          <FontGrid fonts={favFonts} current={current} onSelect={onSelect} isFav={isFav} onToggleFav={toggleFav} />
        </div>
      )}
      {recentFonts.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" /> Recent
          </p>
          <FontGrid fonts={recentFonts} current={current} onSelect={onSelect} isFav={isFav} onToggleFav={toggleFav} />
        </div>
      )}
      <div>
        {(favFonts.length > 0 || recentFonts.length > 0) && (
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">All</p>
        )}
        <FontGrid fonts={QR_FONTS} current={current} onSelect={onSelect} isFav={isFav} onToggleFav={toggleFav} />
      </div>
    </div>
  );
}

function FontGrid({
  fonts,
  current,
  onSelect,
  isFav,
  onToggleFav,
}: {
  fonts: typeof QR_FONTS;
  current: string;
  onSelect: (f: string) => void;
  isFav: (f: string) => boolean;
  onToggleFav: (f: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {fonts.map((f) => {
        const active = current === f.family;
        const fav = isFav(f.family);
        return (
          <div
            key={f.family}
            className={cn(
              "group relative rounded-xl border px-3 py-3 text-left transition-colors",
              active ? "border-clay bg-clay/5" : "border-border"
            )}
          >
            <button
              onClick={() => onSelect(f.family)}
              className="no-tap block w-full text-left"
            >
              <p className="text-[11px] text-muted-foreground">{f.category}</p>
              <p className="text-[15px]" style={{ fontFamily: f.family }}>
                {f.label}
              </p>
            </button>
            <button
              onClick={() => onToggleFav(f.family)}
              className="no-tap absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/50 opacity-0 transition-opacity hover:text-clay group-hover:opacity-100"
              aria-label={fav ? "Remove favourite" : "Add favourite"}
            >
              <Heart className={cn("h-3 w-3", fav && "fill-clay text-clay")} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RecentStylesStrip({
  styles,
  currentId,
  onApply,
  card,
  photo,
}: {
  styles: { id: string; name: string; style: QrStyle }[];
  currentId: string | null;
  onApply: (id: string) => void;
  card: Card;
  photo?: string;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-clay">
        <History className="h-3 w-3" /> Recently used
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {styles.map((s) => {
          const active = currentId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onApply(s.id)}
              className={cn(
                "no-tap flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                active ? "border-clay" : "border-border"
              )}
              aria-label={`Apply ${s.name}`}
            >
              <div className="relative">
                <QrPreview
                  card={card}
                  style={s.style}
                  size={72}
                  photoDataUrl={photo}
                  showLoading={false}
                />
                {active && (
                  <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-white">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                )}
              </div>
              <p className="px-2 py-1 text-center text-[10px] font-medium">{s.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
