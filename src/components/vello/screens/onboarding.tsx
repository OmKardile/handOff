"use client";

import * as React from "react";
import { Camera, ChevronRight, Check, Sparkles } from "lucide-react";
import { useVello, makeEmptyCard } from "@/lib/store";
import { useView } from "../view-context";
import { VelloMark } from "@/app/page";
import { QrPreview } from "../qr-preview";
import { processPhoto } from "@/lib/photo";
import { BRAND, PRIVACY_PROMISE } from "@/shared/brand";
import { Reveal, staggerContainer, staggerItem } from "../motion";
import { motion } from "framer-motion";
import {
  normalizeName,
  normalizePhone,
  normalizeEmail,
  normalizeWebsite,
  normalizeJobTitle,
} from "@/lib/normalizers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = "welcome" | "identity" | "contact" | "photo" | "done";

export function Onboarding() {
  const { completeOnboarding, setPhoto, style, photo } = useVello();
  const { navigate } = useView();
  const [step, setStep] = React.useState<Step>("welcome");
  const [card, setCard] = React.useState<Card>(makeEmptyCard());

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");

  const previewCard: Card = React.useMemo(
    () => ({
      ...card,
      firstName: normalizeName(firstName),
      lastName: normalizeName(lastName),
      jobTitle: normalizeJobTitle(jobTitle),
      company: company.trim(),
      phone: normalizePhone(phone),
      email: normalizeEmail(email),
      website: normalizeWebsite(website),
    }),
    [card, firstName, lastName, jobTitle, company, phone, email, website]
  );

  async function handlePhoto(file: File) {
    try {
      const p = await processPhoto(file);
      await setPhoto(p);
      toast.success("Photo added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add photo");
    }
  }

  async function finish() {
    const final = {
      ...previewCard,
      updatedAt: new Date().toISOString(),
    };
    await completeOnboarding(final);
    setStep("done");
    setTimeout(() => navigate("home"), 600);
  }

  if (step === "done") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-clay/10">
          <Check className="h-8 w-8 text-clay" />
        </div>
        <p className="font-display text-2xl tracking-tight">Your card is ready</p>
        <p className="text-sm text-muted-foreground">Nothing leaves your phone.</p>
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="flex min-h-[100dvh] flex-col px-6 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5"
        >
          <VelloMark className="h-9 w-9" />
          <span className="font-display text-2xl font-semibold tracking-tight">
            {BRAND.name}
          </span>
        </motion.div>

        <div className="mt-16 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-clay">
            Digital business card
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 font-display text-[2.6rem] font-medium leading-[1.05] tracking-tight"
          >
            One card.
            <br />
            One scan.
            <br />
            <span className="text-muted-foreground">Nothing leaves</span>
            <br />
            <span className="text-muted-foreground">your phone.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xs text-[15px] leading-relaxed text-muted-foreground"
          >
            Create your card. Vello makes a QR anyone can scan with their phone
            camera to save your contact. No app, no server, no network.
          </motion.p>
        </div>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mb-8 space-y-2"
        >
          {PRIVACY_PROMISE.slice(0, 4).map((p) => (
            <motion.li
              key={p}
              variants={staggerItem}
              className="flex items-center gap-2 text-[13px] text-muted-foreground"
            >
              <span className="h-1 w-1 rounded-full bg-clay" />
              {p}
            </motion.li>
          ))}
        </motion.ul>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setStep("identity")}
          className="no-tap flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-[15px] font-medium text-background transition-transform active:scale-[0.98]"
        >
          Create your card
          <ChevronRight className="h-4 w-4" />
        </motion.button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Takes 30 seconds. Everything stays on this device.
        </p>
      </div>
    );
  }

  const steps: Step[] = ["identity", "contact", "photo"];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="flex min-h-[100dvh] flex-col px-6 pt-safe">
      {/* progress */}
      <div className="flex items-center gap-3 py-5">
        <button
          onClick={() => setStep(stepIndex === 0 ? "welcome" : steps[stepIndex - 1])}
          className="no-tap -ml-1 text-sm text-muted-foreground"
        >
          Back
        </button>
        <div className="flex h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-clay transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {stepIndex + 1}/{steps.length}
        </span>
      </div>

      {/* live QR preview */}
      <div className="mb-6 flex justify-center">
        <motion.div
          key={`qr-${step}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-border bg-card p-3 shadow-sm"
        >
          <QrPreview
            card={previewCard}
            style={style}
            size={140}
            photoDataUrl={photo?.full}
          />
        </motion.div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {step === "identity" && (
          <IdentityStep
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            company={company}
            setCompany={setCompany}
          />
        )}

        {step === "contact" && (
          <ContactStep
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            website={website}
            setWebsite={setWebsite}
          />
        )}

        {step === "photo" && (
          <PhotoStep photo={photo} onPhoto={handlePhoto} />
        )}
      </motion.div>

      <div className="mt-auto pb-8 pt-6">
        {step === "photo" ? (
          <button
            onClick={finish}
            className="no-tap flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-[15px] font-medium text-background transition-transform active:scale-[0.98]"
          >
            <Check className="h-4 w-4" />
            Finish
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(steps[stepIndex + 1])}
              disabled={step === "identity" && !firstName.trim()}
              className="no-tap flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-4 text-[15px] font-medium text-background transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
            {step !== "identity" && (
              <button
                onClick={() => setStep(steps[stepIndex + 1])}
                className="no-tap rounded-full border border-border px-5 py-4 text-[15px] text-muted-foreground"
              >
                Skip
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import type { Card } from "@/shared/types";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputCls =
  "no-tap w-full rounded-xl border border-input bg-background px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-clay focus:ring-2 focus:ring-clay/20";

function IdentityStep({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  jobTitle,
  setJobTitle,
  company,
  setCompany,
}: {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  jobTitle: string;
  setJobTitle: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-medium tracking-tight">Your identity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is what people see first.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <input
            className={inputCls}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Aarav"
            autoFocus
            maxLength={60}
          />
        </Field>
        <Field label="Last name">
          <input
            className={inputCls}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Sharma"
            maxLength={60}
          />
        </Field>
      </div>
      <Field label="Job title" hint="Optional">
        <input
          className={inputCls}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Product Designer"
          maxLength={80}
        />
      </Field>
      <Field label="Company" hint="Optional">
        <input
          className={inputCls}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Studio Vellum"
          maxLength={80}
        />
      </Field>
    </div>
  );
}

function ContactStep({
  phone,
  setPhone,
  email,
  setEmail,
  website,
  setWebsite,
}: {
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-medium tracking-tight">How to reach you</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All optional — add what you want to share.
        </p>
      </div>
      <Field label="Phone" hint="We format and validate it automatically.">
        <input
          className={inputCls}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          inputMode="tel"
          type="tel"
        />
      </Field>
      <Field label="Email">
        <input
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="aarav@example.com"
          inputMode="email"
          type="email"
        />
      </Field>
      <Field label="Website">
        <input
          className={inputCls}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="aarav.studio"
          inputMode="url"
          type="url"
        />
      </Field>
    </div>
  );
}

function PhotoStep({
  photo,
  onPhoto,
}: {
  photo: { full: string } | null;
  onPhoto: (f: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-medium tracking-tight">Add a photo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional. We crop it square and strip all location data.
        </p>
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        className="no-tap flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card transition-colors hover:border-clay/50"
      >
        {photo ? (
          <>
            <img
              src={photo.full}
              alt="Your photo"
              className="h-28 w-28 rounded-full object-cover"
            />
            <span className="text-sm font-medium">Change photo</span>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Choose a photo</span>
            <span className="text-xs text-muted-foreground">JPEG or PNG, up to 12 MB</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPhoto(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
