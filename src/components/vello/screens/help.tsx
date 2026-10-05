"use client";

import * as React from "react";
import { ArrowLeft, Search, ChevronRight, HelpCircle } from "lucide-react";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { PageFooter } from "../dev-signature";
import { HELP_CATEGORIES, HELP_GUIDES, searchGuides, type HelpCategory, type HelpGuide, type Platform } from "@/lib/help-content";
import { cn } from "@/lib/utils";

const PLATFORM_LABELS: Record<Platform, string> = {
  android: "Android",
  iphone: "iPhone",
  web: "Web",
};

export function HelpScreen() {
  const { navigate } = useView();
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<HelpCategory | "All">("All");

  const results = React.useMemo(() => {
    let r = searchGuides(query);
    if (activeCat !== "All") r = r.filter((g) => g.category === activeCat);
    return r;
  }, [query, activeCat]);

  return (
    <div className="mx-auto max-w-2xl">
      <ScreenHeader title="Help centre" onBack={() => navigate("settings")} />

      <div className="px-5 pb-16 pt-4">
        {/* search */}
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides…"
            className="no-tap w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-[15px] outline-none focus:border-clay focus:ring-2 focus:ring-clay/15"
            aria-label="Search help guides"
          />
        </div>

        {/* categories */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          <CatChip active={activeCat === "All"} onClick={() => setActiveCat("All")}>All</CatChip>
          {HELP_CATEGORIES.map((c) => (
            <CatChip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>{c}</CatChip>
          ))}
        </div>

        {/* results */}
        {results.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <HelpCircle className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-[14px] font-medium">No guides found</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Try a different search.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((g) => (
              <GuideRow key={g.id} guide={g} onOpen={() => navigate("help-guide")} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          All help is built into the app and works offline.
        </p>
      </div>
      <PageFooter />
    </div>
  );
}

// Store the selected guide in a module-level ref so the guide screen can read it.
// (Avoids prop drilling through the view router.)
const SELECTED: { current: HelpGuide | null } = { current: null };
export function setSelectedGuide(g: HelpGuide | null) {
  SELECTED.current = g;
}
export function getSelectedGuide(): HelpGuide | null {
  return SELECTED.current;
}

function GuideRow({ guide, onOpen }: { guide: HelpGuide; onOpen: () => void }) {
  return (
    <button
      onClick={() => {
        setSelectedGuide(guide);
        onOpen();
      }}
      className="no-tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-clay/40"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-clay">
          {guide.category}
        </p>
        <p className="mt-0.5 text-[14px] font-semibold">{guide.title}</p>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{guide.summary}</p>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </button>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "no-tap whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
        active ? "bg-foreground text-background" : "border border-border text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

/** The individual guide view. */
export function HelpGuideScreen() {
  const { navigate } = useView();
  const [guide, setGuide] = React.useState<HelpGuide | null>(null);
  const [platform, setPlatform] = React.useState<Platform>("android");

  React.useEffect(() => {
    setGuide(getSelectedGuide());
  }, []);

  if (!guide) {
    return (
      <div className="mx-auto max-w-2xl">
        <ScreenHeader title="Guide" onBack={() => navigate("help")} />
        <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">
          No guide selected.
        </div>
      </div>
    );
  }

  const stepsForPlatform = guide.steps.filter(
    (s) => !s.platform || s.platform === platform
  );

  return (
    <div className="mx-auto max-w-2xl">
      <ScreenHeader title="Guide" onBack={() => navigate("help")} />
      <div className="px-5 pb-16 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-clay">
          {guide.category}
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight">
          {guide.title}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {guide.summary}
        </p>

        {/* platform tabs (only if any step is platform-specific) */}
        {guide.steps.some((s) => s.platform) && (
          <div className="mt-5 flex gap-1 rounded-full bg-muted p-0.5">
            {(["android", "iphone", "web"] as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  "no-tap flex-1 rounded-full py-1.5 text-[12px] font-medium transition-colors",
                  platform === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        )}

        <ol className="mt-6 space-y-3">
          {stepsForPlatform.map((s, i) => (
            <li key={i} className="flex gap-3.5 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-clay/10 font-display text-[13px] font-semibold text-clay">
                {i + 1}
              </span>
              <p className="pt-0.5 text-[14px] leading-relaxed text-foreground">{s.text}</p>
            </li>
          ))}
        </ol>

        {guide.related && guide.related.length > 0 && (
          <div className="mt-8">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Related guides
            </p>
            <div className="space-y-2">
              {guide.related.map((id) => {
                const rel = HELP_GUIDES.find((g) => g.id === id);
                if (!rel) return null;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedGuide(rel);
                      setGuide(rel);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                    className="no-tap flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-[13px] font-medium hover:border-clay/40"
                  >
                    {rel.title}
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <PageFooter />
    </div>
  );
}
