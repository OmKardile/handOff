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
      {/* Vibrant mesh-gradient background — multiple colored orbs creating
          a rich, atmospheric canvas that the glass surfaces refract through.
          Inspired by Stripe/Linear gradient meshes, not boring flat fills. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Warm clay — top right */}
        <div
          className="absolute -top-[10%] -right-[5%] h-[55vh] w-[55vh] rounded-full opacity-[0.5] blur-[50px] animate-[drift1_20s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #b0533a, transparent 60%)" }}
        />
        {/* Deep navy — left center */}
        <div
          className="absolute top-[25%] -left-[12%] h-[50vh] w-[50vh] rounded-full opacity-[0.35] blur-[55px] animate-[drift2_25s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #1a2e4a, transparent 60%)" }}
        />
        {/* Amber gold — bottom right */}
        <div
          className="absolute bottom-[-8%] right-[5%] h-[45vh] w-[45vh] rounded-full opacity-[0.3] blur-[65px] animate-[drift3_30s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #c8a24a, transparent 60%)" }}
        />
        {/* Teal — center left */}
        <div
          className="absolute top-[55%] left-[10%] h-[40vh] w-[40vh] rounded-full opacity-[0.2] blur-[60px] animate-[drift4_28s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #2a8a7a, transparent 60%)" }}
        />
        {/* Soft rose — top left */}
        <div
          className="absolute top-[5%] left-[15%] h-[35vh] w-[35vh] rounded-full opacity-[0.25] blur-[55px] animate-[drift5_22s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #d97f6a, transparent 60%)" }}
        />
      </div>
      <style>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-30px, 40px) scale(1.1) rotate(60deg); }
          66% { transform: translate(20px, -20px) scale(0.92) rotate(120deg); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.15); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-40px, -50px) scale(1.08); }
          70% { transform: translate(30px, 20px) scale(0.88); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(40px, 30px) scale(1.12) rotate(180deg); }
        }
        @keyframes drift5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[drift"] {
            animation: none !important;
          }
        }
      `}</style>

      {/* Scrollable content area — the ONLY thing that scrolls.
          Header (sticky) and the floating dock stay put. Generous bottom
          padding so content never slides under the floating dock. */}
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
          <div className="glass-pill pointer-events-auto flex items-center gap-1 rounded-full p-1.5" style={{ boxShadow: "var(--elevation-floating)" }}>
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

/** A small header used on sub-screens. */
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
    <header className="glass sticky top-0 z-30 px-2" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
      <div className="relative z-10 flex h-14 items-center gap-1">
      {onBack && (
        <button
          onClick={onBack}
          className="no-tap flex h-9 items-center gap-0.5 rounded-full px-2 text-foreground/90 transition-colors hover:bg-foreground/5 active:bg-foreground/10"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-clay">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="-ml-0.5 text-[16px] font-normal">Back</span>
        </button>
      )}
      <h1 className={cn("flex-1 truncate font-display text-[17px] font-semibold tracking-tight", onBack && "text-center")}>
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
          className="no-tap flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 active:bg-foreground/10 hover:text-foreground"
          aria-label={`Help with ${title}`}
        >
          <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      )}
      {action}
      </div>
    </header>
  );
}

/** The Slate wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-semibold tracking-tight", className)}>
      {BRAND.name}
    </span>
  );
}
