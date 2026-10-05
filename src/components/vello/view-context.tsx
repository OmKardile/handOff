"use client";

import * as React from "react";

export type View =
  | "onboarding"
  | "home"
  | "editor"
  | "fullscreen-qr"
  | "studio"
  | "share"
  | "wallet"
  | "wallpaper"
  | "settings"
  | "privacy"
  | "fonts"
  | "backup"
  | "showcase"
  | "help"
  | "help-guide";

interface ViewCtx {
  view: View;
  navigate: (v: View) => void;
  /** tab for bottom bar highlight */
  tab: "card" | "studio" | "settings";
}

const Ctx = React.createContext<ViewCtx | null>(null);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = React.useState<View>("onboarding");

  const navigate = React.useCallback((v: View) => {
    setView(v);
    // scroll to top on view change
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const tab: ViewCtx["tab"] =
    view === "home" || view === "editor" || view === "fullscreen-qr" || view === "share" || view === "wallet" || view === "wallpaper"
      ? "card"
      : view === "studio" || view === "fonts"
      ? "studio"
      : "settings";

  return <Ctx.Provider value={{ view, navigate, tab }}>{children}</Ctx.Provider>;
}

export function useView() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useView must be used within ViewProvider");
  return ctx;
}
