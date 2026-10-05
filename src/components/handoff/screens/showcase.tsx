"use client";

import * as React from "react";
import { ArrowLeft, ShieldCheck, WifiOff, Lock, QrCode, Palette, Share2, Download, LayoutGrid } from "lucide-react";
import { useView } from "../view-context";
import { QrPreview } from "../qr-preview";
import { PageFooter } from "../dev-signature";
import { STYLE_PRESETS, PLAIN_STYLE } from "@/lib/style-presets";
import { SHARE_CARD_LAYOUTS, type ShareCardLayout } from "@/lib/export";
import { BRAND, PRIVACY_PROMISE } from "@/shared/brand";
import { makeEmptyCard } from "@/lib/store";
import type { Card, QrStyle } from "@/shared/types";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Does this send my data anywhere?",
    a: "No. HandOff makes zero network requests. Your card stays in your browser. Data leaves only when you choose to share or export.",
  },
  {
    q: "Do people need the app to scan my QR?",
    a: "No. The QR is a standard vCard. Stock iPhone and Android cameras offer \"Add contact\" directly — no app required.",
  },
  {
    q: "Can I change my details later?",
    a: "Yes, but the QR is static: a QR you already printed or shared keeps the old details. HandOff warns you when a change affects the QR.",
  },
  {
    q: "Is it really free and open?",
    a: "HandOff is MIT licensed. No accounts, no ads, no analytics, no data sales — ever.",
  },
];

export function ShowcaseScreen() {
  const { navigate } = useView();
  const [demoName, setDemoName] = React.useState("Aarav Sharma");
  const [demoTitle, setDemoTitle] = React.useState("Product Designer");
  const [demoCompany, setDemoCompany] = React.useState("Studio Vellum");
  const [style, setStyle] = React.useState<QrStyle>(STYLE_PRESETS[6].style); // Terracotta

  const demoCard: Card = React.useMemo(
    () => ({
      ...makeEmptyCard(),
      firstName: demoName.split(" ")[0] || "Aarav",
      lastName: demoName.split(" ").slice(1).join(" ") || "Sharma",
      jobTitle: demoTitle,
      company: demoCompany,
      phone: "+919876543210",
      email: "hello@example.com",
      website: "https://example.com",
    }),
    [demoName, demoTitle, demoCompany]
  );

  return (
    <div className="min-h-[100dvh] bg-background paper-grain">
      {/* top bar — Archipelago chart label */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-xl pt-safe">
        <button
          onClick={() => navigate("settings")}
          className="no-tap -ml-1 flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="chart-label">ATLAS · SHOWCASE</span>
      </div>

      {/* hero */}
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-clay" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Digital business card
          </span>
        </div>
        <h1 className="font-display text-[2.8rem] font-medium leading-[1.05] tracking-tight sm:text-6xl">
          One card.
          <br />
          One scan.
          <br />
          <span className="text-muted-foreground">Nothing leaves</span>
          <br />
          <span className="text-muted-foreground">your phone.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {BRAND.name} creates a QR that contains your contact directly. Anyone scans
          it with their phone camera and gets <strong className="text-foreground">Add contact</strong>.
          No app, no server, no network.
        </p>
      </section>

      {/* interactive demo */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">
            Live demo
          </p>
          <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">
            Type a name. Watch it scan.
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            This is the real QR engine. It stores nothing.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Name</span>
                <input
                  className="no-tap w-full rounded-xl border border-input bg-background px-3.5 py-3 text-[15px] outline-none focus:border-clay focus:ring-2 focus:ring-clay/15"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Title</span>
                <input
                  className="no-tap w-full rounded-xl border border-input bg-background px-3.5 py-3 text-[15px] outline-none focus:border-clay focus:ring-2 focus:ring-clay/15"
                  value={demoTitle}
                  onChange={(e) => setDemoTitle(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Company</span>
                <input
                  className="no-tap w-full rounded-xl border border-input bg-background px-3.5 py-3 text-[15px] outline-none focus:border-clay focus:ring-2 focus:ring-clay/15"
                  value={demoCompany}
                  onChange={(e) => setDemoCompany(e.target.value)}
                />
              </label>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-2xl border border-border bg-background p-3">
                <QrPreview card={demoCard} style={style} size={180} showLoading={false} />
              </div>
            </div>
          </div>

          {/* preset picker */}
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Try a style
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[PLAIN_STYLE, ...STYLE_PRESETS.slice(0, 8).map((p) => p.style)].map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "no-tap flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                    style.presetId === s.presetId ? "border-clay" : "border-border"
                  )}
                  aria-label={`Apply ${s.presetId} style`}
                >
                  <QrPreview card={demoCard} style={s} size={64} showLoading={false} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <h2 className="font-display text-2xl font-medium tracking-tight">How it works, in three steps</h2>
        <div className="mt-6 space-y-3">
          {[
            { n: "1", icon: QrCode, title: "Create your card", body: "Enter your name, contact and links. HandOff builds a compact vCard." },
            { n: "2", icon: Palette, title: "Style the QR", body: "Pick from 17 presets or fine-tune shapes, colours and a centre element." },
            { n: "3", icon: Share2, title: "Share it", body: "Show fullscreen, export PNG/SVG/.vcf, or make a wallpaper. No app needed to scan." },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-clay/10 font-display text-[15px] font-semibold text-clay">
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-[15px] font-semibold">{s.title}</h3>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* privacy proof */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <div className="rounded-3xl bg-foreground p-8 text-background">
          <ShieldCheck className="h-7 w-7 text-clay" />
          <h2 className="mt-3 font-display text-2xl font-medium tracking-tight">
            What this app can't do
          </h2>
          <p className="mt-1 text-[13px] text-background/70">
            Privacy isn't a setting here. It's the architecture.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              { icon: Lock, t: "No accounts", d: "There is no login. No username, no password, no profile." },
              { icon: WifiOff, t: "No network", d: "Zero requests. Fonts and assets are bundled. Works offline." },
              { icon: ShieldCheck, t: "No tracking", d: "No analytics, no scan counts, no cookies." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.t} className="flex gap-3">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay" />
                  <div>
                    <p className="text-[14px] font-medium">{f.t}</p>
                    <p className="text-[12.5px] text-background/70">{f.d}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* share-card layouts gallery */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-clay" />
          <h2 className="font-display text-2xl font-medium tracking-tight">Share-card layouts</h2>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Four designed layouts for every occasion — minimal, dark, ticket, and photo-first.
          Each exports at 1080×1350.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {SHARE_CARD_LAYOUTS.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-2xl border border-border bg-card p-3">
              <ShowcaseLayoutThumb layout={l.id} />
              <div className="mt-2.5 px-1">
                <p className="text-[13px] font-semibold">{l.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* install */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <h2 className="font-display text-2xl font-medium tracking-tight">Get HandOff</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Install the PWA from your browser, or wait for native apps.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { t: "Web / PWA", d: "Install from this browser. Works offline after first load.", soon: false },
            { t: "Android", d: "Play Store listing coming soon.", soon: true },
            { t: "iOS", d: "App Store listing coming soon.", soon: true },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-clay" />
                <h3 className="text-[14px] font-semibold">{p.t}</h3>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">{p.d}</p>
              {p.soon && (
                <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <h2 className="font-display text-2xl font-medium tracking-tight">Questions</h2>
        <div className="mt-4 space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-4">
              <summary className="flex cursor-pointer items-center justify-between text-[14px] font-medium no-tap">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <PageFooter />
    </div>
  );
}

function ShowcaseLayoutThumb({ layout }: { layout: ShareCardLayout }) {
  const common = "h-32 w-full rounded-lg overflow-hidden";
  switch (layout) {
    case "hairline":
      return (
        <div className={cn(common, "bg-[#fffefb] border border-border")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <line x1="10" y1="12" x2="70" y2="12" stroke="#161619" strokeWidth="0.5" />
            <text x="40" y="18" textAnchor="middle" fontSize="3" fill="#b0533a" fontFamily="sans-serif">DIGITAL CARD</text>
            <rect x="22" y="28" width="36" height="36" fill="#f0ece4" stroke="#e0d9cd" strokeWidth="0.5" />
            <text x="40" y="78" textAnchor="middle" fontSize="7" fill="#161619" fontFamily="Fraunces, serif" fontWeight="500">Name</text>
            <text x="40" y="85" textAnchor="middle" fontSize="3" fill="#6b655c" fontFamily="sans-serif">Title</text>
            <line x1="10" y1="92" x2="70" y2="92" stroke="#161619" strokeWidth="0.5" />
          </svg>
        </div>
      );
    case "plaque":
      return (
        <div className={cn(common, "bg-[#161619]")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <rect x="16" y="22" width="48" height="42" fill="#fffefb" rx="2" />
            <rect x="22" y="28" width="36" height="30" fill="#eee" />
            <line x1="36" y1="70" x2="44" y2="70" stroke="#b0533a" strokeWidth="1.5" />
            <text x="40" y="80" textAnchor="middle" fontSize="6.5" fill="#ece7de" fontFamily="Fraunces, serif" fontWeight="500">Name</text>
            <text x="40" y="86" textAnchor="middle" fontSize="3" fill="#9b958a" fontFamily="sans-serif">Title</text>
          </svg>
        </div>
      );
    case "ticket":
      return (
        <div className={cn(common, "bg-[#fffefb] border border-border")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <rect x="8" y="10" width="64" height="80" fill="none" stroke="#161619" strokeWidth="0.8" />
            <rect x="8" y="10" width="64" height="8" fill="#161619" />
            <text x="14" y="15.5" fontSize="3" fill="#fffefb" fontFamily="sans-serif" fontWeight="600">VELLO · CONTACT</text>
            <rect x="22" y="24" width="36" height="30" fill="#f0ece4" stroke="#e0d9cd" strokeWidth="0.5" />
            <line x1="8" y1="58" x2="72" y2="58" stroke="#161619" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            <circle cx="8" cy="58" r="1.5" fill="#fffefb" />
            <circle cx="72" cy="58" r="1.5" fill="#fffefb" />
            <text x="40" y="70" textAnchor="middle" fontSize="6" fill="#161619" fontFamily="Fraunces, serif" fontWeight="500">Name</text>
            <text x="14" y="78" fontSize="2.5" fill="#6b655c" fontFamily="sans-serif">Title</text>
            <text x="14" y="83" fontSize="2.5" fill="#6b655c" fontFamily="sans-serif">phone · email</text>
          </svg>
        </div>
      );
    case "polaroid":
      return (
        <div className={cn(common, "bg-[#efeae1]")}>
          <svg viewBox="0 0 80 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <rect x="14" y="8" width="52" height="78" fill="#fffefb" rx="1" />
            <rect x="18" y="12" width="44" height="44" fill="#d9cfc1" />
            <rect x="44" y="14" width="18" height="18" fill="#fffefb" stroke="#e0d9cd" strokeWidth="0.3" />
            <text x="40" y="70" textAnchor="middle" fontSize="6" fill="#161619" fontFamily="Caveat, cursive" fontWeight="500">Name</text>
            <text x="40" y="77" textAnchor="middle" fontSize="2.8" fill="#6b655c" fontFamily="sans-serif">Title</text>
          </svg>
        </div>
      );
  }
}
