"use client";

import * as React from "react";
import { useVello } from "@/lib/store";
import { ViewProvider, useView } from "@/components/vello/view-context";
import { AppShell } from "@/components/vello/app-shell";
import { Onboarding } from "@/components/vello/screens/onboarding";
import { HomeScreen } from "@/components/vello/screens/home";
import { EditorScreen } from "@/components/vello/screens/editor";
import { FullscreenQr } from "@/components/vello/screens/fullscreen-qr";
import { StudioScreen } from "@/components/vello/screens/studio";
import { SettingsScreen } from "@/components/vello/screens/settings";
import { PrivacyScreen } from "@/components/vello/screens/privacy";
import { ShareSheet } from "@/components/vello/screens/share-sheet";
import { BackupScreen } from "@/components/vello/screens/backup";
import { WalletScreen } from "@/components/vello/screens/wallet";
import { WallpaperScreen } from "@/components/vello/screens/wallpaper";
import { ShowcaseScreen } from "@/components/vello/screens/showcase";
import { HelpScreen, HelpGuideScreen } from "@/components/vello/screens/help";
import { ViewTransition } from "@/components/vello/motion";

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
        {/* animated V mark — the check draws itself */}
        <svg viewBox="0 0 40 40" className="h-16 w-16" fill="none" aria-hidden>
          <rect
            width="40"
            height="40"
            rx="10"
            fill="var(--ink, #161619)"
            className="opacity-0"
            style={{ animation: "vello-fade 0.4s ease 0.1s forwards" }}
          />
          <path
            d="M13 12.5L20 27l7-14.5"
            stroke="var(--paper, #f6f3ee)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "vello-draw 0.7s ease 0.3s forwards" }}
          />
        </svg>
        <div className="flex flex-col items-center gap-2">
          <span
            className="font-display text-xl font-semibold tracking-tight opacity-0"
            style={{ animation: "vello-fade 0.4s ease 0.6s forwards" }}
          >
            Vello
          </span>
          <div className="h-0.5 w-20 overflow-hidden rounded-full bg-muted opacity-0" style={{ animation: "vello-fade 0.4s ease 0.8s forwards" }}>
            <div className="h-full w-1/2 animate-[vello-slide_1.2s_ease-in-out_infinite] bg-clay" />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes vello-draw { to { stroke-dashoffset: 0; } }
        @keyframes vello-fade { to { opacity: 1; } }
        @keyframes vello-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}

export function VelloMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <rect width="40" height="40" rx="10" fill="var(--ink, #161619)" />
      <path
        d="M13 12.5L20 27l7-14.5"
        stroke="var(--paper, #f6f3ee)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const { loaded, load, onboarded } = useVello();

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
