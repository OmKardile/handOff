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
      {/* Ambient background — gives the liquid glass something to refract.
          Soft warm radial blobs in the editorial palette; never glow/neon.
          Sits at z-0 (above the body bg, below content) so the glass surfaces
          can actually blur these colors through. Slowly drifts so the glass
          shows live refraction as the user scrolls/moves. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-[15%] -right-[10%] h-[60vh] w-[60vh] rounded-full opacity-[0.35] blur-[60px] animate-[drift1_18s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, var(--clay), transparent 65%)" }}
        />
        <div
          className="absolute top-[35%] -left-[18%] h-[55vh] w-[55vh] rounded-full opacity-[0.22] blur-[70px] animate-[drift2_22s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, var(--ink), transparent 65%)" }}
        />
        <div
          className="absolute bottom-[-12%] right-[8%] h-[50vh] w-[50vh] rounded-full opacity-[0.20] blur-[80px] animate-[drift3_26s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, var(--clay-soft), transparent 65%)" }}
        />
      </div>
      <style>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(20px, -20px) scale(0.95); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -30px) scale(1.1); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-30px, -40px) scale(1.05); }
          70% { transform: translate(30px, 20px) scale(0.92); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[drift1_18s_ease-in-out_infinite\\],
          .animate-\\[drift2_22s_ease-in-out_infinite\\],
          .animate-\\[drift3_26s_ease-in-out_infinite\\] {
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
          <div className="glass-pill pointer-events-auto flex items-center gap-1 rounded-full p-1.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.25),0_2px_8px_-2px_rgba(0,0,0,0.15)]">
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
    <header className="glass sticky top-0 z-30 border-b border-white/10 px-2" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
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

/** The Vello wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-semibold tracking-tight", className)}>
      {BRAND.name}
    </span>
  );
}
