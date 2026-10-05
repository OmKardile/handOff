"use client";

import * as React from "react";
import {
  Moon,
  Sun,
  Monitor,
  Vibrate,
  ShieldCheck,
  Download,
  Trash2,
  ChevronRight,
  Info,
  HardDrive,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader, Wordmark } from "../app-shell";
import { DevSignature } from "../dev-signature";
import { BRAND, PRIVACY_PROMISE } from "@/shared/brand";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export function SettingsScreen() {
  const { settings, setSettings, photo, card, resetAll } = useVello();
  const { navigate } = useView();
  const { setTheme } = useTheme();
  const [persisted, setPersisted] = React.useState<boolean | null>(settings.storagePersisted);

  React.useEffect(() => {
    import("@/lib/storage").then(async ({ checkPersistence }) => {
      setPersisted(await checkPersistence());
    });
  }, []);

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader title="Settings" />

      <div className="px-5 pb-28 pt-4">
        {/* appearance */}
        <SectionLabel>Appearance</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <ThemeRow
            label="Theme"
            value={settings.theme}
            onChange={(v) => {
              setSettings((s) => ({ ...s, theme: v }));
              setTheme(v);
            }}
          />
          <div className="flex items-center justify-between border-t border-border px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Vibrate className="h-4 w-4 text-muted-foreground" />
              <span className="text-[14px]">Haptics</span>
            </div>
            <button
              onClick={() => setSettings((s) => ({ ...s, haptics: !s.haptics }))}
              className={cn("no-tap relative h-6 w-10 rounded-full transition-colors", settings.haptics ? "bg-clay" : "bg-muted")}
              role="switch"
              aria-checked={settings.haptics}
            >
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", settings.haptics ? "translate-x-[18px]" : "translate-x-0.5")} />
            </button>
          </div>
        </div>

        {/* storage */}
        <SectionLabel>Storage</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[14px]">Persistent storage</p>
                <p className="text-[11px] text-muted-foreground">Keeps your card from being cleared</p>
              </div>
            </div>
            <span className={cn("text-[12px] font-medium", persisted ? "text-emerald-500" : "text-amber-500")}>
              {persisted === null ? "Checking…" : persisted ? "Protected" : "Not protected"}
            </span>
          </div>
          {!persisted && (
            <div className="border-t border-border px-4 py-3">
              <button
                onClick={async () => {
                  const { requestPersistence, checkPersistence } = await import("@/lib/storage");
                  const ok = await requestPersistence();
                  setPersisted(await checkPersistence());
                  setSettings((s) => ({ ...s, storagePersisted: ok }));
                  toast(ok ? "Storage protected" : "Couldn't enable — your browser may not support it");
                }}
                className="no-tap w-full rounded-lg bg-foreground py-2.5 text-[13px] font-medium text-background"
              >
                Enable persistence
              </button>
            </div>
          )}
          <NavRow icon={Download} label="Backup & restore" onClick={() => navigate("backup")} />
        </div>

        {/* privacy */}
        <SectionLabel>Privacy</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <NavRow icon={ShieldCheck} label="Privacy" onClick={() => navigate("privacy")} highlight />
        </div>
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
          {PRIVACY_PROMISE[5]}
        </p>

        {/* danger */}
        <SectionLabel>Danger zone</SectionLabel>
        <button
          onClick={async () => {
            if (window.confirm("Erase all data? This cannot be undone. Your card, photo and settings will be removed from this device.")) {
              await resetAll();
              toast.success("All data erased");
            }
          }}
          className="no-tap flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-left dark:border-red-900/40 dark:bg-red-950/20"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-[14px] font-medium text-red-600 dark:text-red-400">Erase all data</p>
            <p className="text-[11px] text-red-500/80">Removes everything from this device</p>
          </div>
        </button>

        {/* about */}
        <SectionLabel>About</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Wordmark className="text-lg" />
            <span className="ml-auto text-[12px] text-muted-foreground">v{BRAND.version}</span>
          </div>
          <div className="border-t border-border px-4 py-3.5">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {BRAND.oneLiner}
            </p>
          </div>
          <div className="border-t border-border px-4 py-3.5">
            <p className="text-[12px] font-medium text-muted-foreground">Tagline</p>
            <p className="mt-0.5 font-display text-[15px] tracking-tight">{BRAND.tagline}</p>
          </div>
          <NavRow icon={Sparkles} label="Showcase" onClick={() => navigate("showcase")} />
          <NavRow icon={HelpCircle} label="Help centre" onClick={() => navigate("help")} />
          <a
            href="https://omkardile.is-a.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-tap flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-[14px]">Developer</p>
              <p className="text-[11px] text-muted-foreground">Omkar Kardile</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <DevSignature />
          <p className="text-[11px] text-muted-foreground/60">
            No servers. No tracking. Ever.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-6 px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

function ThemeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "light" | "dark" | "system";
  onChange: (v: "light" | "dark" | "system") => void;
}) {
  const opts: { id: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "Auto", icon: Monitor },
  ];
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[14px]">{label}</span>
      <div className="flex gap-1 rounded-full bg-muted p-0.5">
        {opts.map((o) => {
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={cn(
                "no-tap flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                value === o.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavRow({
  icon: Icon,
  label,
  onClick,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="no-tap flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left"
    >
      <Icon className={cn("h-4 w-4", highlight ? "text-clay" : "text-muted-foreground")} />
      <span className="flex-1 text-[14px]">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
