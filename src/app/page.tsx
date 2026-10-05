"use client";

import * as React from "react";
import { useHandOff } from "@/lib/store";
import { ViewProvider, useView } from "@/components/handoff/view-context";
import { AppShell } from "@/components/handoff/app-shell";
import { Onboarding } from "@/components/handoff/screens/onboarding";
import { HomeScreen } from "@/components/handoff/screens/home";
import { EditorScreen } from "@/components/handoff/screens/editor";
import { FullscreenQr } from "@/components/handoff/screens/fullscreen-qr";
import { StudioScreen } from "@/components/handoff/screens/studio";
import { SettingsScreen } from "@/components/handoff/screens/settings";
import { PrivacyScreen } from "@/components/handoff/screens/privacy";
import { ShareSheet } from "@/components/handoff/screens/share-sheet";
import { BackupScreen } from "@/components/handoff/screens/backup";
import { WalletScreen } from "@/components/handoff/screens/wallet";
import { WallpaperScreen } from "@/components/handoff/screens/wallpaper";
import { ShowcaseScreen } from "@/components/handoff/screens/showcase";
import { HelpScreen, HelpGuideScreen } from "@/components/handoff/screens/help";
import { ViewTransition } from "@/components/handoff/motion";

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
        {/* HandOff mark — a card being handed off */}
        <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden>
          <rect
            width="64"
            height="64"
            rx="16"
            fill="var(--ink, #1C1C1E)"
            className="opacity-0"
            style={{ animation: "ho-fade 0.4s ease 0.1s forwards" }}
          />
          {/* card being handed off */}
          <rect x="18" y="16" width="20" height="14" rx="3" fill="var(--paper, #F2F0EB)" className="opacity-0" style={{ animation: "ho-fade 0.3s ease 0.4s forwards" }} />
          {/* hand-off arrow */}
          <path d="M40 23 L48 23 M45 20 L48 23 L45 26" stroke="#B93D17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "ho-draw 0.5s ease 0.7s forwards" }} />
          {/* receiving hand */}
          <path d="M16 42 Q16 36 22 36 L42 36 Q48 36 48 42 L48 48 Q48 50 46 50 L18 50 Q16 50 16 48 Z" fill="var(--paper, #F2F0EB)" opacity="0" style={{ animation: "ho-fade 0.3s ease 0.9s forwards" }} />
        </svg>
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight opacity-0" style={{ animation: "ho-fade 0.4s ease 0.6s forwards" }}>
            HandOff
          </span>
          <div className="h-0.5 w-20 overflow-hidden rounded-full bg-muted opacity-0" style={{ animation: "ho-fade 0.4s ease 0.8s forwards" }}>
            <div className="h-full w-1/2 animate-[ho-slide_1.2s_ease-in-out_infinite] bg-clay" />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ho-draw { to { stroke-dashoffset: 0; } }
        @keyframes ho-fade { to { opacity: 1; } }
        @keyframes ho-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}

export function HandOffMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <rect width="64" height="64" rx="16" fill="var(--ink, #1C1C1E)" />
      <rect x="18" y="16" width="20" height="14" rx="3" fill="var(--paper, #F2F0EB)" />
      <path d="M40 23 L48 23 M45 20 L48 23 L45 26" stroke="#B93D17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M16 42 Q16 36 22 36 L42 36 Q48 36 48 42 L48 48 Q48 50 46 50 L18 50 Q16 50 16 48 Z" fill="var(--paper, #F2F0EB)" opacity="0.9" />
    </svg>
  );
}

export default function Home() {
  const { loaded, load, onboarded } = useHandOff();

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
