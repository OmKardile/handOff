"use client";

import * as React from "react";
import { Download, Upload, FileJson, Loader2, Check } from "lucide-react";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { exportBackup, importBackup } from "@/lib/storage";
import { BRAND } from "@/shared/brand";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BackupScreen() {
  const { card, load } = useVello();
  const { navigate } = useView();
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportBackup();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${BRAND.slug}-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Backup saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Backup failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const bundle = await importBackup(text);
      await load();
      toast.success(`Restored ${bundle.card?.firstName || "card"}`);
      navigate("home");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid backup file");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader title="Backup & restore" onBack={() => navigate("settings")} />
      <div className="px-5 pb-28 pt-4">
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-clay/10">
            <FileJson className="h-5 w-5 text-clay" />
          </div>
          <h2 className="mt-3 font-display text-xl font-medium tracking-tight">
            Your card, your file
          </h2>
          <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            Export a single JSON file with your card, style, photo and settings.
            Import it on any device. The file never touches a server.
          </p>
        </div>

        <div className="mt-5 space-y-2.5">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="no-tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left disabled:opacity-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-medium">Export backup</p>
              <p className="text-[11.5px] text-muted-foreground">
                {card ? `Saves ${card.firstName || "your card"}` : "Saves your card"} + style + photo
              </p>
            </div>
          </button>

          <button
            onClick={() => inputRef.current?.click()}
            disabled={importing}
            className="no-tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left disabled:opacity-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              {importing ? <Loader2 className="h-4 w-4 animate-spin text-clay" /> : <Upload className="h-4 w-4 text-foreground" />}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-medium">Restore from file</p>
              <p className="text-[11.5px] text-muted-foreground">
                Replaces current data with the backup
              </p>
            </div>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImport(f);
              e.target.value = "";
            }}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-amber-300/40 bg-amber-50 p-4 dark:bg-amber-950/20">
          <p className="text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> The backup file contains your contact details and
            photo in plain JSON. Keep it somewhere safe, like you would a paper card.
          </p>
        </div>
      </div>
    </div>
  );
}
