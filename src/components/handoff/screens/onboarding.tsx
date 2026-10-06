"use client";

import * as React from "react";
import { Camera, ChevronRight, Check, Sparkles, ShieldCheck } from "lucide-react";
import { useHandOff, makeEmptyCard } from "@/lib/store";
import { useView } from "../view-context";
import { HandOffMark } from "@/app/page";
import { QrPreview } from "../qr-preview";
import { processPhoto } from "@/lib/photo";
import { BRAND, PRIVACY_PROMISE } from "@/shared/brand";
import { DevSignature } from "../dev-signature";
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
  const { completeOnboarding, setPhoto, style, photo } = useHandOff();
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
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 px-6">
        <div className="brut-signal flex h-16 w-16 items-center justify-center">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <p className="font-display text-3xl uppercase tracking-tight">Your card is ready</p>
        <p className="field-label">Nothing leaves this device</p>
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="relative flex min-h-[100dvh] flex-col px-5 pt-[max(env(safe-area-inset-top,0px),48px)] pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-col gap-4"
        >
          {/* small tag */}
          <div className="flex items-center gap-2">
            <span className="tape field-label rotate-[-2deg] px-2 py-1 text-ink">Digital business card</span>
            <span className="field-label opacity-60">No app needed to scan</span>
          </div>

          {/* giant wordmark */}
          <h1 className="font-display text-[19vw] leading-[0.82] tracking-[-0.02em] text-foreground sm:text-[7rem]">
            HAND<br />OFF
          </h1>

          {/* tagline */}
          <div className="brut-ink max-w-[20rem] px-3 py-2">
            <p className="font-heavy text-[13px] uppercase leading-tight tracking-wide text-bone">
              Your card.<br />Nothing leaves your phone.
            </p>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
          {/* Developer signature — centered in the open space */}
          <DevSignature className="text-[12px]" />
          <p className="field-label opacity-50">
            {BRAND.name} v{BRAND.version}
          </p>
        </div>

        {/* privacy spec strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-4 flex items-center gap-4 border-y-2 border-ink py-2"
        >
          {[
            { k: "ACCOUNT", v: "NONE" },
            { k: "SERVER", v: "NONE" },
            { k: "TRACKING", v: "NONE" },
            { k: "STORAGE", v: "ON DEVICE" },
          ].map((s) => (
            <div key={s.k} className="flex flex-col">
              <span className="field-label opacity-60">{s.k}</span>
              <span className="font-heavy text-[12px] text-foreground">{s.v}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA — brutalist block button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => setStep("identity")}
            className="press no-tap flex w-full items-center justify-center gap-2 border-[2.5px] border-ink bg-signal py-4 font-heavy text-[15px] uppercase tracking-wide text-black shadow-[5px_5px_0_0_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--ink)]"
          >
            ▸ Create your card
          </button>
          <p className="mt-3 text-center field-label">
            Takes 30 seconds · Stays on this device
          </p>
        </motion.div>
      </div>
    );
  }

  const steps: Step[] = ["identity", "contact", "photo"];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const stepLabels: Record<Step, string> = {
    identity: "Name",
    contact: "Reach",
    photo: "Face",
    welcome: "",
    done: "",
  };

  return (
    <div className="flex h-[100dvh] flex-col px-5 pt-safe">
      {/* progress — PACKET 01/03 readout */}
      <div className="flex items-center gap-3 py-5 pb-3">
        <button
          onClick={() => setStep(stepIndex === 0 ? "welcome" : steps[stepIndex - 1])}
          className="press no-tap -ml-1 border-2 border-ink bg-card px-2 py-1 font-heavy text-[11px] uppercase text-ink shadow-[2px_2px_0_0_var(--ink)]"
        >
          ◂ Back
        </button>
        <div className="flex flex-1 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2.5 flex-1 border-2 border-ink transition-colors",
                i <= stepIndex ? "bg-signal" : "bg-card"
              )}
            />
          ))}
        </div>
        <span className="field-label tabular-nums">{stepIndex + 1}/{steps.length}</span>
      </div>

      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain">
        {/* live QR preview — payload packet */}
        <div className="mb-6 flex justify-center pt-2">
          <motion.div
            key={`qr-${step}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="brut-lg relative p-3"
          >
            <span className="absolute -top-2 left-3 bg-card px-1.5 field-label">Preview</span>
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
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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

        <ScrollHint />
      </div>

      {/* Sticky bottom bar */}
      <div className="border-t-2 border-ink bg-bone px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
        {step === "photo" ? (
          <motion.button
            onClick={finish}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            className="press no-tap flex w-full items-center justify-center gap-2 border-[2.5px] border-ink bg-signal py-4 font-heavy text-[15px] uppercase tracking-wide text-black shadow-[5px_5px_0_0_var(--ink)]"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Create card
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <motion.button
              onClick={() => setStep(steps[stepIndex + 1])}
              disabled={step === "identity" && !firstName.trim()}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
              className="press no-tap flex flex-1 items-center justify-center gap-2 border-[2.5px] border-ink bg-signal py-4 font-heavy text-[15px] uppercase tracking-wide text-black shadow-[5px_5px_0_0_var(--ink)] disabled:opacity-40"
            >
              Continue
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </motion.button>
            {step !== "identity" && (
              <button
                onClick={() => setStep(steps[stepIndex + 1])}
                className="press no-tap border-[2.5px] border-ink bg-card px-5 py-4 font-heavy text-[15px] uppercase tracking-wide text-ink shadow-[5px_5px_0_0_var(--ink)]"
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

/** A subtle scroll hint that appears at the bottom of scrollable content,
    nudging the user that there's more below. Fades out when scrolled to bottom. */
function ScrollHint() {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      setVisible(!atBottom && el.scrollHeight > el.clientHeight + 20);
    }
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className="flex justify-center" aria-hidden="true">
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none -mt-2 mb-2 flex flex-col items-center gap-1"
      >
        <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground/40" />
      </motion.div>
    </div>
  );
}


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
      <span className="mb-1.5 block field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block field-label opacity-70">{"//"}{hint}</span>}
    </label>
  );
}

const inputCls =
  "no-tap w-full border-2 border-ink bg-card px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:bg-signal focus:text-black focus:placeholder:text-black/40";

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
        <p className="field-label opacity-70">Step 1 · Identity</p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-[0.92] tracking-tight">Who are you</h2>
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
        <p className="field-label opacity-70">Step 2 · Contact</p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-[0.92] tracking-tight">Reach you how</h2>
      </div>
      <Field label="Phone">
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
        <p className="field-label opacity-70">Step 3 · Photo</p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-[0.92] tracking-tight">Add a face</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Optional. Cropped square. All location data stripped on-device.
        </p>
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        className="press no-tap flex aspect-square w-full flex-col items-center justify-center gap-3 border-[2.5px] border-ink border-dashed bg-card shadow-[4px_4px_0_0_var(--ink)] transition-colors hover:bg-signal/30"
      >
        {photo ? (
          <>
            <img
              src={photo.full}
              alt="Your photo"
              className="h-28 w-28 border-2 border-ink object-cover"
            />
            <span className="font-heavy text-[13px] uppercase">Change face</span>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center border-2 border-ink bg-signal/40">
              <Camera className="h-6 w-6" strokeWidth={2} />
            </div>
            <span className="font-heavy text-[13px] uppercase">Choose a photo</span>
            <span className="field-label">JPEG / PNG · MAX 12MB</span>
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
