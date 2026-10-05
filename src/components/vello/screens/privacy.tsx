"use client";

import * as React from "react";
import { ShieldCheck, Lock, Eye, WifiOff, FileDown, Trash2 } from "lucide-react";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { PRIVACY_PROMISE, BRAND } from "@/shared/brand";

const FACTS = [
  {
    icon: Lock,
    title: "No accounts",
    body: "You never sign in. There is no username, no password, no profile.",
  },
  {
    icon: WifiOff,
    title: "No network",
    body: "Vello makes zero requests. No fetch, no WebSocket, no analytics. Fonts and assets are bundled.",
  },
  {
    icon: Eye,
    title: "No tracking",
    body: "No cookies, no fingerprinting, no scan counts. Nobody knows you shared your card or who scanned it.",
  },
  {
    icon: ShieldCheck,
    title: "Stored on this device",
    body: "Your card lives in this browser's local storage (IndexedDB). It never syncs to a cloud.",
  },
  {
    icon: FileDown,
    title: "Only you share",
    body: "Data leaves your phone only when you choose to export, share, or back up — and only to where you send it.",
  },
  {
    icon: Trash2,
    title: "Erase anytime",
    body: "Erase all data in Settings removes everything instantly. No recovery, no residue.",
  },
];

export function PrivacyScreen() {
  const { navigate } = useView();
  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader title="Privacy" onBack={() => navigate("settings")} />
      <div className="px-5 pb-28 pt-4">
        <div className="rounded-3xl bg-foreground p-6 text-background">
          <ShieldCheck className="h-7 w-7 text-clay" />
          <h2 className="mt-3 font-display text-2xl font-medium leading-tight tracking-tight">
            Nothing leaves
            <br />
            your phone.
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-background/70">
            This is not a marketing promise. It is how the app is built.
          </p>
        </div>

        <div className="mt-6 space-y-2.5">
          {FACTS.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex gap-3.5 rounded-2xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-clay/10">
                  <Icon className="h-4 w-4 text-clay" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold">{f.title}</h3>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-50 p-4 dark:bg-amber-950/20">
          <h3 className="text-[13px] font-semibold text-amber-800 dark:text-amber-400">
            One thing to know
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-amber-700 dark:text-amber-400/80">
            Your QR contains your contact details directly (a vCard). If you change
            your details after sharing or printing, the old QR still shows the old
            information. Vello warns you when this happens.
          </p>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            The promise
          </p>
          <ul className="space-y-1.5">
            {PRIVACY_PROMISE.map((p) => (
              <li key={p} className="flex items-baseline gap-2 text-[13px]">
                <span className="h-1 w-1 flex-shrink-0 translate-y-[-2px] rounded-full bg-clay" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          {BRAND.name} {BRAND.version} · {BRAND.tagline}
        </p>
      </div>
    </div>
  );
}
