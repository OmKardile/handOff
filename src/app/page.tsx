"use client";

import * as React from "react";
import { useHandOff } from "@/lib/store";
import { ViewProvider, useView } from "@/components/handoff/view-context";
import { AppShell } from "@/components/handoff/app-shell";
import { Onboarding } from "@/components/handoff/screens/onboarding";
import { HomeScreen } from "@/components/handoff/screens/home";
import { StudioScreen } from "@/components/handoff/screens/studio";
import { SettingsScreen } from "@/components/handoff/screens/settings";
import { PrivacyScreen } from "@/components/handoff/screens/privacy";
import { ViewTransition } from "@/components/handoff/motion";

// Lazy-load heavier screens to optimize bundle size and startup speed
const EditorScreen = React.lazy(() =>
  import("@/components/handoff/screens/editor").then((m) => ({ default: m.EditorScreen }))
);
const FullscreenQr = React.lazy(() =>
  import("@/components/handoff/screens/fullscreen-qr").then((m) => ({ default: m.FullscreenQr }))
);
const ShareSheet = React.lazy(() =>
  import("@/components/handoff/screens/share-sheet").then((m) => ({ default: m.ShareSheet }))
);
const WalletScreen = React.lazy(() =>
  import("@/components/handoff/screens/wallet").then((m) => ({ default: m.WalletScreen }))
);
const WallpaperScreen = React.lazy(() =>
  import("@/components/handoff/screens/wallpaper").then((m) => ({ default: m.WallpaperScreen }))
);
const BackupScreen = React.lazy(() =>
  import("@/components/handoff/screens/backup").then((m) => ({ default: m.BackupScreen }))
);
const ShowcaseScreen = React.lazy(() =>
  import("@/components/handoff/screens/showcase").then((m) => ({ default: m.ShowcaseScreen }))
);
const HelpScreen = React.lazy(() =>
  import("@/components/handoff/screens/help").then((m) => ({ default: m.HelpScreen }))
);
const HelpGuideScreen = React.lazy(() =>
  import("@/components/handoff/screens/help").then((m) => ({ default: m.HelpGuideScreen }))
);

function ScreenLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="brut flex items-center gap-3 px-4 py-2 text-xs font-mono tracking-widest uppercase">
        <span className="h-2 w-2 rounded-full bg-signal animate-ping" />
        LOADING…
      </div>
    </div>
  );
}

function Screens() {
  const { view } = useView();
  return (
    <React.Suspense fallback={<ScreenLoader />}>
      <ViewTransition viewKey={view}>
        {renderScreen(view)}
      </ViewTransition>
    </React.Suspense>
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
      <div className="relative z-10 flex flex-col items-center gap-4">
        <HandOffMark className="h-14 w-14" />
        <span className="font-display text-xl font-semibold tracking-tight">HandOff</span>
        <div className="h-0.5 w-20 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[ho-slide_1.2s_ease-in-out_infinite] bg-clay" />
        </div>
      </div>
      <style>{`@keyframes ho-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
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
