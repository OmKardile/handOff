"use client";

import * as React from "react";
import { CreditCard, Palette, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useView } from "./view-context";
import { cn } from "@/lib/utils";
import { BRAND } from "@/shared/brand";
import { HELP_GUIDES, setSelectedGuide } from "@/lib/help-content";

const TABS = [
  { id: "card", label: "Card", icon: CreditCard, view: "home" as const },
  { id: "studio", label: "Studio", icon: Palette, view: "studio" as const },
  { id: "settings", label: "Settings", icon: SettingsIcon, view: "settings" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view, navigate, tab } = useView();
  const hideBar = view === "onboarding" || view === "fullscreen-qr";

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden paper-grain">
      {/* Vibrant mesh-gradient background — the colored orbs that glass refracts through.
          Kept alongside the Archipelago chart labels. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -right-[5%] h-[55vh] w-[55vh] rounded-full opacity-[0.4] blur-[50px] animate-[drift1_20s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #B93D17, transparent 60%)" }} />
        <div className="absolute top-[25%] -left-[12%] h-[50vh] w-[50vh] rounded-full opacity-[0.3] blur-[55px] animate-[drift2_25s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #0E1B33, transparent 60%)" }} />
        <div className="absolute bottom-[-8%] right-[5%] h-[45vh] w-[45vh] rounded-full opacity-[0.22] blur-[65px] animate-[drift3_30s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #8A6A1F, transparent 60%)" }} />
        <div className="absolute top-[55%] left-[10%] h-[40vh] w-[40vh] rounded-full opacity-[0.15] blur-[60px] animate-[drift4_28s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #2E6B45, transparent 60%)" }} />
        <div className="absolute top-[5%] left-[15%] h-[35vh] w-[35vh] rounded-full opacity-[0.18] blur-[55px] animate-[drift5_22s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #B93D17, transparent 60%)" }} />
      </div>
      <style>{`
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1) rotate(0deg)} 33%{transform:translate(-30px,40px) scale(1.1) rotate(60deg)} 66%{transform:translate(20px,-20px) scale(0.92) rotate(120deg)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-40px) scale(1.15)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-40px,-50px) scale(1.08)} 70%{transform:translate(30px,20px) scale(0.88)} }
        @keyframes drift4 { 0%,100%{transform:translate(0,0) scale(1) rotate(0deg)} 50%{transform:translate(40px,30px) scale(1.12) rotate(180deg)} }
        @keyframes drift5 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.1)} }
        @media (prefers-reduced-motion: reduce) { [class*="animate-[drift"] { animation: none !important; } }
      `}</style>

      {/* Scrollable content area — the ONLY thing that scrolls. */}
      <main
        className={cn(
          "relative z-10 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain",
          hideBar ? "pb-0" : "pb-36"
        )}
      >
        {children}
      </main>

      {!hideBar && (
        <nav
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),14px)]"
          aria-label="Primary"
        >
          {/* macOS dock–style floating glass capsule */}
          <div className="glass-pill pointer-events-auto flex items-center gap-1 rounded-full p-1.5">
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
          </div>
        </nav>
      )}
    </div>
  );
}

/** A single macOS-dock-style tab item with hover magnification.
    No tooltip — on mobile they get stuck; the icons are self-explanatory. */
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
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className={cn(
        "no-tap relative flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        active ? "text-foreground" : "text-muted-foreground"
      )}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      {/* active background highlight — a frosted disc behind the icon */}
      {active && (
        <motion.span
          layoutId="dock-active-bg"
          className="absolute inset-0 rounded-full bg-foreground/8"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <motion.div
        animate={active ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className="relative z-10"
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
      </motion.div>
      {/* macOS dock running indicator — a small dot beneath the active icon */}
      {active && (
        <motion.span
          layoutId="dock-indicator"
          className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-clay"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

/** A large title header — iOS 27 style. No glass bar, no back button.
 *  Just a large bold title at the top, with action buttons inline to the right.
 *  Back navigation is handled by the floating dock + Android back gesture. */
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
        <h1 className="flex-1 font-sans text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
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
            className="no-tap flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground active:scale-95"
            aria-label={`Help with ${title}`}
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

/** The HandOff wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-semibold tracking-tight", className)}>
      {BRAND.name}
    </span>
  );
}
