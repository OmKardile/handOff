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
      {/* ARCHIPELAGO: Nautical chart background.
          Faint graticule grid lines (like a sea chart) sit behind everything.
          No mesh gradient orbs — the chart IS the background. */}
      <div className="graticule pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

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
