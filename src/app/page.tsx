"use client";

import * as React from "react";
import { useSlate } from "@/lib/store";
import { ViewProvider, useView } from "@/components/slate/view-context";
import { AppShell } from "@/components/slate/app-shell";
import { Onboarding } from "@/components/slate/screens/onboarding";
import { HomeScreen } from "@/components/slate/screens/home";
import { EditorScreen } from "@/components/slate/screens/editor";
import { FullscreenQr } from "@/components/slate/screens/fullscreen-qr";
import { StudioScreen } from "@/components/slate/screens/studio";
import { SettingsScreen } from "@/components/slate/screens/settings";
import { PrivacyScreen } from "@/components/slate/screens/privacy";
import { ShareSheet } from "@/components/slate/screens/share-sheet";
import { BackupScreen } from "@/components/slate/screens/backup";
import { WalletScreen } from "@/components/slate/screens/wallet";
import { WallpaperScreen } from "@/components/slate/screens/wallpaper";
import { ShowcaseScreen } from "@/components/slate/screens/showcase";
import { HelpScreen, HelpGuideScreen } from "@/components/slate/screens/help";
import { ViewTransition } from "@/components/slate/motion";

function Screens() {
  const { view } = useView();
  return (
    <ViewTransition viewKey={view}>
      {renderScreen(view)}
    </ViewTransition>
  );
}

function renderScreen(view: string) {
  switch (view) {
    case "onboarding":
      return <Onboarding />;
    case "home":
      return <HomeScreen />;
    case "editor":
      return <EditorScreen />;
    case "fullscreen-qr":
      return <FullscreenQr />;
    case "studio":
      return <StudioScreen />;
    case "settings":
      return <SettingsScreen />;
    case "privacy":
      return <PrivacyScreen />;
    case "share":
      return <ShareSheet />;
    case "wallet":
      return <WalletScreen />;
    case "wallpaper":
      return <WallpaperScreen />;
    case "backup":
      return <BackupScreen />;
    case "showcase":
      return <ShowcaseScreen />;
    case "help":
      return <HelpScreen />;
    case "help-guide":
      return <HelpGuideScreen />;
    default:
      return <HomeScreen />;
  }
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background paper-grain">
      <div className="flex flex-col items-center gap-5">
        {/* animated Slate mark — the S slash draws itself */}
        <svg viewBox="0 0 40 40" className="h-16 w-16" fill="none" aria-hidden>
          <rect
            width="40"
            height="40"
            rx="10"
            fill="var(--ink, #161619)"
            className="opacity-0"
            style={{ animation: "slate-fade 0.4s ease 0.1s forwards" }}
          />
          <path
            d="M12 14 Q12 11 15 11 L25 11 Q28 11 28 14 Q28 17 25 17 L15 23 Q12 23 12 26 Q12 29 15 29 L25 29 Q28 29 28 26"
            stroke="var(--paper, #f6f3ee)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "slate-draw 0.9s ease 0.3s forwards" }}
          />
        </svg>
        <div className="flex flex-col items-center gap-2">
          <span
            className="font-display text-xl font-semibold tracking-tight opacity-0"
            style={{ animation: "slate-fade 0.4s ease 0.6s forwards" }}
          >
            Slate
          </span>
          <div className="h-0.5 w-20 overflow-hidden rounded-full bg-muted opacity-0" style={{ animation: "slate-fade 0.4s ease 0.8s forwards" }}>
            <div className="h-full w-1/2 animate-[slate-slide_1.2s_ease-in-out_infinite] bg-clay" />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slate-draw { to { stroke-dashoffset: 0; } }
        @keyframes slate-fade { to { opacity: 1; } }
        @keyframes slate-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}

export function SlateMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <rect width="40" height="40" rx="10" fill="var(--ink, #161619)" />
      <path
        d="M12 14 Q12 11 15 11 L25 11 Q28 11 28 14 Q28 17 25 17 L15 23 Q12 23 12 26 Q12 29 15 29 L25 29 Q28 29 28 26"
        stroke="var(--paper, #f6f3ee)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Home() {
  const { loaded, load, onboarded } = useSlate();

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!loaded) return <LoadingScreen />;

  return (
    <ViewProvider>
      <AppShell>
        <Screens />
      </AppShell>
    </ViewProvider>
  );
}
