"use client";

import * as React from "react";
import { CreditCard, Palette, Settings as SettingsIcon } from "lucide-react";
import { useView } from "./view-context";
import { cn } from "@/lib/utils";
import { BRAND } from "@/shared/brand";

const TABS = [
  { id: "card", label: "Card", icon: CreditCard, view: "home" as const },
  { id: "studio", label: "Studio", icon: Palette, view: "studio" as const },
  { id: "settings", label: "Settings", icon: SettingsIcon, view: "settings" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view, navigate, tab } = useView();
  const hideBar = view === "onboarding" || view === "fullscreen-qr";

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-background paper-grain">
      <main
        className={cn(
          "flex-1 pb-safe",
          hideBar ? "pb-0" : "pb-24"
        )}
      >
        {children}
      </main>

      {!hideBar && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl pb-safe"
          aria-label="Primary"
        >
          <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(t.view)}
                  className={cn(
                    "no-tap relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label={t.label}
                >
                  <Icon
                    className="h-5 w-5 transition-transform"
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                      active ? "font-semibold" : ""
                    )}
                  >
                    {t.label}
                  </span>
                  {active && (
                    <span className="absolute top-0 h-[2px] w-8 rounded-full bg-clay" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

/** A small header used on sub-screens. */
export function ScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}) {
  const { navigate } = useView();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-xl pt-safe">
      {onBack && (
        <button
          onClick={onBack}
          className="no-tap -ml-1 flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <h1 className="flex-1 truncate font-display text-lg font-medium tracking-tight">
        {title}
      </h1>
      {action}
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
