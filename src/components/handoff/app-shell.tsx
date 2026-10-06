"use client";

import * as React from "react";
import { CreditCard, Palette, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useView } from "./view-context";
import { cn } from "@/lib/utils";
import { BRAND } from "@/shared/brand";
import { HELP_GUIDES, setSelectedGuide } from "@/lib/help-content";

const TABS = [
  { id: "card", label: "CARD", icon: CreditCard, view: "home" as const },
  { id: "studio", label: "STUDIO", icon: Palette, view: "studio" as const },
  { id: "settings", label: "CONFIG", icon: SettingsIcon, view: "settings" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view, navigate, tab } = useView();
  const hideBar = view === "onboarding" || view === "fullscreen-qr";

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden field-grain">
      {/* ===== DEAD DROP background field =====
          Layer 1: full graph-paper grid (field-grid)
          Layer 2: drifting "interference" color blocks (lime + cobalt) that hue-cycle
          Layer 3: scanlines (CRT)
          Layer 4: giant rotated watermark word
          All pointer-events-none, all behind content. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* base canvas wash */}
        <div className="absolute inset-0 bg-background" />
        {/* field grid */}
        <div className="absolute inset-0 field-grid opacity-70" />
        {/* interference blocks — drift + hue cycle (nested wrappers) */}
        <div className="absolute -top-[15%] -right-[10%] h-[60vh] w-[60vh] animate-[hueA_50s_linear_infinite]" style={{ animationDelay: "-10s" }}>
          <div className="h-full w-full opacity-[0.18] blur-[70px] animate-[driftA_24s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #C6FF00, transparent 60%)" }} />
        </div>
        <div className="absolute top-[40%] -left-[15%] h-[55vh] w-[55vh] animate-[hueB_64s_linear_infinite]" style={{ animationDelay: "-30s" }}>
          <div className="h-full w-full opacity-[0.14] blur-[75px] animate-[driftB_30s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #1B2BE0, transparent 60%)" }} />
        </div>
        <div className="absolute bottom-[-12%] right-[10%] h-[45vh] w-[45vh] animate-[hueC_72s_linear_infinite]" style={{ animationDelay: "-50s" }}>
          <div className="h-full w-full opacity-[0.12] blur-[80px] animate-[driftC_28s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #FF3B1F, transparent 60%)" }} />
        </div>
        {/* scanlines */}
        <div className="absolute inset-0 scanlines opacity-60" />
        {/* giant watermark word — rotated, very faint */}
        <div className="absolute -right-[12%] top-[8%] -rotate-[24deg] select-none font-display text-[42vh] leading-none text-ink/[0.035]">
          DEAD
        </div>
        <div className="absolute -left-[10%] bottom-[6%] -rotate-[24deg] select-none font-display text-[42vh] leading-none text-ink/[0.035]">
          DROP
        </div>
      </div>
      <style>{`
        @keyframes driftA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,40px) scale(1.14)} }
        @keyframes driftB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,30px) scale(1.1)} }
        @keyframes driftC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-50px) scale(0.9)} }
        @keyframes hueA { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes hueB { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes hueC { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @media (prefers-reduced-motion: reduce) { [class*="animate-[drift"], [class*="animate-[hue"], .blink, .ticker-track { animation: none !important; } }
      `}</style>

      {/* ===== Transmission status bar (top) =====
          Mono readout: SIGNAL · live clock · ticker · REC dot. */}
      {!hideBar && <TransmissionBar />}

      {/* Scrollable content area — the ONLY thing that scrolls.
          no-scrollbar hides the 10px ink scrollbar so it doesn't eat into
          the right padding and shift centered (mx-auto) content off-center. */}
      <main
        className={cn(
          "no-scrollbar relative z-10 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain",
          hideBar ? "pb-0" : "pb-32 pt-7"
        )}
      >
        {children}
      </main>

      {/* corner readouts — fixed, mono */}
      {!hideBar && (
        <>
          <span className="pointer-events-none fixed bottom-2 left-3 z-40 field-label opacity-50">
            {"//CH.01"}
          </span>
          <span className="pointer-events-none fixed bottom-2 right-3 z-40 field-label opacity-50">
            v{BRAND.version}
          </span>
        </>
      )}

      {/* ===== Brutalist bottom nav ===== */}
      {!hideBar && (
        <nav
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),10px)]"
          aria-label="Primary"
        >
          <div className="pointer-events-auto flex w-full max-w-md items-stretch gap-0 border-[2.5px] border-ink bg-card shadow-[5px_5px_0_0_var(--ink)]">
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <DockItem
                  key={t.id}
                  label={t.label}
                  active={active}
                  onClick={() => navigate(t.view)}
                  icon={Icon}
                />
              );
            })}
            {/* REC indicator block */}
            <div className="flex items-center gap-1.5 border-l-[2.5px] border-ink bg-ink px-3">
              <span className="h-2 w-2 rounded-full bg-clay blink" />
              <span className="field-label text-bone/80">REC</span>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

/** Top transmission status bar — mono readout with live clock + scrolling ticker. */
function TransmissionBar() {
  const [now, setNow] = React.useState<string>("");
  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setNow(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex h-6 items-center gap-2 border-b border-ink/80 bg-ink px-3 text-bone">
      <span className="field-label flex items-center gap-1.5 text-bone/90">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        SIGNAL·OK
      </span>
      <span className="field-label text-bone/50">|</span>
      {/* scrolling ticker — duplicated content for seamless loop */}
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track field-label text-bone/70">
          <span className="mx-4">DEAD DROP // DEVICE-ONLY TRANSMISSION</span>
          <span className="mx-4">NO NETWORK · NO SERVER · NO TRACKING</span>
          <span className="mx-4">PAYLOAD ENCRYPTED ON-DEVICE</span>
          <span className="mx-4">RADIO SILENCE ENGAGED</span>
          <span className="mx-4">DEAD DROP // DEVICE-ONLY TRANSMISSION</span>
          <span className="mx-4">NO NETWORK · NO SERVER · NO TRACKING</span>
          <span className="mx-4">PAYLOAD ENCRYPTED ON-DEVICE</span>
          <span className="mx-4">RADIO SILENCE ENGAGED</span>
        </div>
      </div>
      <span className="field-label tabular-nums text-bone/90">{now}</span>
    </div>
  );
}

/** A single brutalist nav tab. Active = filled signal-lime block w/ ink icon. */
function DockItem({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 600, damping: 25 }}
      className={cn(
        "no-tap press relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5",
        active ? "bg-signal text-ink" : "bg-card text-ink hover:bg-secondary"
      )}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.6 : 2} />
      <span className="field-label text-[9px] font-bold">{label}</span>
    </motion.button>
  );
}

/** A large title header — DEAD DROP style: heavy Anton, bracketed, with readout. */
export function ScreenHeader({
  title,
  onBack,
  action,
  helpGuideId,
}: {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
  helpGuideId?: string;
}) {
  const { navigate } = useView();
  return (
    <div
      className="relative z-30 px-5 pb-2"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 44px)" }}
    >
      <div className="flex items-center gap-2">
        <h1 className="flex-1 font-display text-[30px] font-normal uppercase leading-[0.95] tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {helpGuideId && (
          <button
            onClick={() => {
              const g = HELP_GUIDES.find((x) => x.id === helpGuideId);
              if (g) {
                setSelectedGuide(g);
                navigate("help-guide");
              }
            }}
            className="no-tap press flex h-9 w-9 items-center justify-center border-2 border-ink bg-card text-ink shadow-[2px_2px_0_0_var(--ink)] transition-colors hover:bg-signal"
            aria-label={`Help with ${title}`}
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

/** The HandOff wordmark — DEAD DROP style. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-normal uppercase tracking-[-0.01em]", className)}>
      {BRAND.name}
    </span>
  );
}
