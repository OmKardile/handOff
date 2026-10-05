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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../motion";

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
      {/* iOS 27 large title — standalone, no nav bar, left-aligned, bold sans */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="px-5 pt-[max(env(safe-area-inset-top,0px),44px)] pb-2"
      >
        <h1 className="font-sans text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
          Settings
        </h1>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-5 pb-36 pt-4"
      >
        {/* appearance */}
        <SectionLabel>Appearance</SectionLabel>
        <CardGroup>
          <ThemeRow
            label="Theme"
            value={settings.theme}
            onChange={(v) => {
              setSettings((s) => ({ ...s, theme: v }));
              setTheme(v);
            }}
          />
          <RowDivider />
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Vibrate className="h-[18px] w-[18px] text-muted-foreground" />
              <span className="text-[15px]">Haptics</span>
            </div>
            <Switch
              checked={settings.haptics}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, haptics: v }))}
              aria-label="Haptics"
            />
          </div>
        </CardGroup>

        {/* storage */}
        <SectionLabel>Storage</SectionLabel>
        <CardGroup>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <HardDrive className="h-[18px] w-[18px] text-muted-foreground" />
              <div>
                <p className="text-[15px]">Persistent storage</p>
                <p className="text-[12px] text-muted-foreground">Keeps your card from being cleared</p>
              </div>
            </div>
            <span className={cn("text-[13px] font-medium", persisted ? "text-emerald-500" : "text-amber-500")}>
              {persisted === null ? "Checking…" : persisted ? "Protected" : "Not protected"}
            </span>
          </div>
          {!persisted && (
            <>
              <RowDivider />
              <div className="px-4 py-3">
                <button
                  onClick={async () => {
                    const { requestPersistence, checkPersistence } = await import("@/lib/storage");
                    const ok = await requestPersistence();
                    setPersisted(await checkPersistence());
                    setSettings((s) => ({ ...s, storagePersisted: ok }));
                    toast(ok ? "Storage protected" : "Couldn't enable — your browser may not support it");
                  }}
                  className="no-tap w-full rounded-xl bg-foreground py-2.5 text-[14px] font-medium text-background active:scale-[0.98] transition-transform"
                >
                  Enable persistence
                </button>
              </div>
            </>
          )}
          <RowDivider />
          <NavRow icon={Download} label="Backup & restore" onClick={() => navigate("backup")} />
        </CardGroup>

        {/* privacy */}
        <SectionLabel>Privacy</SectionLabel>
        <CardGroup>
          <NavRow icon={ShieldCheck} label="Privacy" onClick={() => navigate("privacy")} highlight />
        </CardGroup>
        <p className="mt-2 px-4 text-[12px] leading-relaxed text-muted-foreground">
          {PRIVACY_PROMISE[5]}
        </p>

        {/* danger */}
        <SectionLabel>Danger zone</SectionLabel>
        <CardGroup>
          <button
            onClick={async () => {
              if (window.confirm("Erase all data? This cannot be undone. Your card, photo and settings will be removed from this device.")) {
                await resetAll();
                toast.success("All data erased");
              }
            }}
            className="no-tap flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-red-500/10"
          >
            <Trash2 className="h-[18px] w-[18px] text-red-500" />
            <div>
              <p className="text-[15px] font-medium text-red-500 dark:text-red-400">Erase all data</p>
              <p className="text-[12px] text-muted-foreground">Removes everything from this device</p>
            </div>
          </button>
        </CardGroup>

        {/* about */}
        <SectionLabel>About</SectionLabel>
        <CardGroup>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Wordmark className="text-lg" />
            <span className="ml-auto text-[13px] text-muted-foreground">v{BRAND.version}</span>
          </div>
          <RowDivider />
          <div className="px-4 py-3.5">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {BRAND.oneLiner}
            </p>
          </div>
          <RowDivider />
          <div className="px-4 py-3.5">
            <p className="text-[12px] font-medium text-muted-foreground">Tagline</p>
            <p className="mt-0.5 font-display text-[15px] tracking-tight">{BRAND.tagline}</p>
          </div>
          <RowDivider />
          <NavRow icon={Sparkles} label="Showcase" onClick={() => navigate("showcase")} />
          <RowDivider />
          <NavRow icon={HelpCircle} label="Help centre" onClick={() => navigate("help")} />
          <RowDivider />
          <a
            href="https://omkardile.is-a.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-tap flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-foreground/5"
          >
            <ExternalLink className="h-[18px] w-[18px] text-muted-foreground" />
            <div className="flex-1">
              <p className="text-[15px]">Developer</p>
              <p className="text-[12px] text-muted-foreground">Omkar Kardile</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </CardGroup>

        <div className="mt-6 flex flex-col items-center gap-2">
          <DevSignature />
          <p className="text-[11px] text-muted-foreground/60">
            No servers. No tracking. Ever.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      variants={staggerItem}
      className="mb-2.5 mt-8 text-[12px] font-normal uppercase tracking-[0.06em] text-muted-foreground"
    >
      {children}
    </motion.p>
  );
}

/** iOS 27 grouped card — borderless, elevated, slightly lighter than bg. */
function CardGroup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={staggerItem}
      className="overflow-hidden rounded-2xl bg-card"
      style={{ boxShadow: "var(--elevation-card)" }}
    >
      {children}
    </motion.div>
  );
}

/** iOS-style row separator — barely visible, inset from the left. */
function RowDivider() {
  return <div className="ml-4 h-px bg-border/50" />;
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
      <span className="text-[15px]">{label}</span>
      {/* iOS 27 segmented control — capsule with sliding active indicator */}
      <div className="relative flex gap-0.5 rounded-full bg-muted p-0.5">
        {opts.map((o) => {
          const Icon = o.icon;
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={cn(
                "no-tap relative flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="theme-segment"
                  className="absolute inset-0 rounded-full bg-background"
                  style={{ boxShadow: "var(--elevation-subtle)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="relative h-3.5 w-3.5" />
              <span className="relative">{o.label}</span>
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
      className="no-tap flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-foreground/5"
    >
      <Icon className={cn("h-[18px] w-[18px]", highlight ? "text-clay" : "text-muted-foreground")} />
      <span className="flex-1 text-[15px]">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
