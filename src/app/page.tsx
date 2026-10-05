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

function Screens() {
  const { view } = useView();
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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center">
          <VelloMark />
        </div>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[slide_1.2s_ease-in-out_infinite] bg-clay" />
        </div>
      </div>
      <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
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
