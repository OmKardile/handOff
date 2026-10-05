"use client";

import * as React from "react";
import { Camera, Check, X, AlertTriangle, RotateCcw, ChevronDown, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useVello } from "@/lib/store";
import { useView } from "../view-context";
import { ScreenHeader } from "../app-shell";
import { QrPreview } from "../qr-preview";
import { processPhoto } from "@/lib/photo";
import { getQrSizeInfo, isQrOverflow } from "@/lib/qr";
import {
  normalizeName,
  normalizePhone,
  normalizeEmail,
  normalizeWebsite,
  normalizeJobTitle,
  normalizeCompany,
  normalizeLocation,
  normalizeLinkedin,
  normalizeInstagram,
  normalizeX,
  normalizeWhatsapp,
} from "@/lib/normalizers";
import type { Card, QrInclude, SocialLinkId } from "@/shared/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function EditorScreen() {
  const { card, style, photo, setCard, saveCardNow, setPhoto, startDraft, restoreDraft, hasDraft, clearDraft } = useVello();
  const { navigate } = useView();
  const [open, setOpen] = React.useState<string>("identity");

  React.useEffect(() => {
    startDraft();
    return () => clearDraft();
  }, []);

  if (!card) return null;

  const size = getQrSizeInfo(card);
  const overflow = isQrOverflow(card);

  const update = (patch: Partial<Card>) => setCard((c) => ({ ...c, ...patch }));

  const toggleQr = (key: keyof QrInclude) =>
    setCard((c) => ({ ...c, qrInclude: { ...c.qrInclude, [key]: !c.qrInclude[key] } }));

  async function handlePhoto(file: File) {
    try {
      const p = await processPhoto(file);
      await setPhoto(p);
      toast.success("Photo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add photo");
    }
  }

  async function save() {
    await saveCardNow();
    toast.success("Saved");
    navigate("home");
  }

  return (
    <div className="mx-auto max-w-md">
      <ScreenHeader
        title="Edit card"
        onBack={() => navigate("home")}
        helpGuideId="edit-card"
        action={
          <button
            onClick={save}
            className="no-tap flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
        }
      />

      <div className="px-5 pb-32 pt-4">
        {/* live preview */}
        <div className="mb-5 flex flex-col items-center">
          <button
            onClick={() => navigate("fullscreen-qr")}
            className="no-tap rounded-2xl border border-border bg-card p-2.5"
          >
            <QrPreview card={card} style={style} size={160} photoDataUrl={photo?.full} />
          </button>
          <SizeMeter info={size} overflow={overflow} />
        </div>

        {hasDraft && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-300/40 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5">
            <div className="flex items-center gap-2 text-[12px] text-amber-700 dark:text-amber-400">
              <RotateCcw className="h-3.5 w-3.5" />
              Unsaved changes in progress
            </div>
            <button
              onClick={() => {
                restoreDraft();
                toast("Restored to last saved version");
              }}
              className="text-[12px] font-medium text-amber-700 dark:text-amber-400 underline"
            >
              Restore
            </button>
          </div>
        )}

        {/* Photo */}
        <Section title="Photo" open={open === "photo"} onToggle={() => setOpen(open === "photo" ? "" : "photo")}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById("photo-input")?.click()}
              className="no-tap relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted"
            >
              {photo ? (
                <img src={photo.full} alt="" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1">
              <p className="text-[13px] text-foreground">
                {photo ? "Photo added" : "No photo"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Cropped square, EXIF stripped. Never in the QR.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => document.getElementById("photo-input")?.click()}
                  className="no-tap rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium"
                >
                  {photo ? "Change" : "Add"}
                </button>
                {photo && (
                  <button
                    onClick={() => void setPhoto(null)}
                    className="no-tap rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handlePhoto(f);
                e.target.value = "";
              }}
            />
          </div>
        </Section>

        {/* Identity */}
        <Section title="Identity" open={open === "identity"} onToggle={() => setOpen(open === "identity" ? "" : "identity")}>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name" value={card.firstName} onChange={(v) => update({ firstName: normalizeName(v) })} placeholder="Aarav" />
            <TextField label="Last name" value={card.lastName} onChange={(v) => update({ lastName: normalizeName(v) })} placeholder="Sharma" />
          </div>
          <TextField label="Job title" value={card.jobTitle} onChange={(v) => update({ jobTitle: normalizeJobTitle(v) })} placeholder="Product Designer" />
          <TextField label="Company" value={card.company} onChange={(v) => update({ company: normalizeCompany(v) })} placeholder="Studio Vellum" />
          <TextField label="Location" value={card.location} onChange={(v) => update({ location: normalizeLocation(v) })} placeholder="Mumbai, India" />
        </Section>

        {/* Contact */}
        <Section title="Contact" open={open === "contact"} onToggle={() => setOpen(open === "contact" ? "" : "contact")}>
          <TextField label="Phone" value={card.phone} onChange={(v) => update({ phone: normalizePhone(v) })} placeholder="+91 98765 43210" type="tel" normalize={normalizePhone} />
          <TextField label="Email" value={card.email} onChange={(v) => update({ email: normalizeEmail(v) })} placeholder="aarav@example.com" type="email" />
          <TextField label="Website" value={card.website} onChange={(v) => update({ website: normalizeWebsite(v) })} placeholder="aarav.studio" />
        </Section>

        {/* Links */}
        <Section title="Social links" open={open === "links"} onToggle={() => setOpen(open === "links" ? "" : "links")}>
          <p className="mb-3 text-[11px] text-muted-foreground">
            Drag to reorder. The order is used in the QR, the .vcf file and on your card.
          </p>
          <SortableSocialLinks card={card} update={update} />
        </Section>

        {/* QR contents */}
        <Section title="QR contents" open={open === "qr"} onToggle={() => setOpen(open === "qr" ? "" : "qr")}>
          <p className="mb-3 text-[12px] text-muted-foreground">
            Choose what appears in the QR. Fewer fields scan faster.
          </p>
          <div className="space-y-1">
            <ToggleRow label="Name" on={card.qrInclude.name} onToggle={() => toggleQr("name")} />
            <ToggleRow label="Job title" on={card.qrInclude.title} onToggle={() => toggleQr("title")} />
            <ToggleRow label="Company" on={card.qrInclude.company} onToggle={() => toggleQr("company")} />
            <ToggleRow label="Phone" on={card.qrInclude.phone} onToggle={() => toggleQr("phone")} />
            <ToggleRow label="Email" on={card.qrInclude.email} onToggle={() => toggleQr("email")} />
            <ToggleRow label="Website" on={card.qrInclude.website} onToggle={() => toggleQr("website")} />
            <ToggleRow label="Location" on={card.qrInclude.location} onToggle={() => toggleQr("location")} defaultOff />
            <ToggleRow label="LinkedIn" on={card.qrInclude.linkedin} onToggle={() => toggleQr("linkedin")} defaultOff />
            <ToggleRow label="Instagram" on={card.qrInclude.instagram} onToggle={() => toggleQr("instagram")} defaultOff />
            <ToggleRow label="X" on={card.qrInclude.x} onToggle={() => toggleQr("x")} defaultOff />
            <ToggleRow label="WhatsApp" on={card.qrInclude.whatsapp} onToggle={() => toggleQr("whatsapp")} defaultOff />
          </div>
        </Section>
      </div>

      {/* sticky save bar */}
      <div className="fixed inset-x-0 bottom-20 z-30 border-t border-border bg-background/90 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            onClick={() => navigate("home")}
            className="no-tap flex-1 rounded-full border border-border py-3 text-[14px] font-medium text-muted-foreground"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={overflow}
            className="no-tap flex-[2] rounded-full bg-foreground py-3 text-[14px] font-medium text-background disabled:opacity-40"
          >
            {overflow ? "Too large to encode" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 overflow-hidden rounded-2xl border border-border bg-card">
      <button
        onClick={onToggle}
        className="no-tap flex w-full items-center justify-between px-4 py-3.5"
      >
        <span className="text-[14px] font-semibold tracking-tight">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  normalize?: (v: string) => string;
}) {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => setLocal(value), [value]);
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        className="no-tap w-full rounded-xl border border-input bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-clay focus:ring-2 focus:ring-clay/15"
        value={local}
        type={type}
        placeholder={placeholder}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={() => setLocal(value)}
      />
    </label>
  );
}

function ToggleRow({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  defaultOff?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[14px]">{label}</span>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={cn(
          "no-tap relative h-6 w-10 rounded-full transition-colors",
          on ? "bg-clay" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            on ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

function SizeMeter({
  info,
  overflow,
}: {
  info: ReturnType<typeof getQrSizeInfo>;
  overflow: boolean;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          info.status === "green" && "bg-emerald-500",
          info.status === "amber" && "bg-amber-500",
          info.status === "red" && "bg-red-500",
          info.status === "overflow" && "bg-red-600"
        )}
      />
      <span className="text-[11px] text-muted-foreground">
        {info.bytes} bytes · {info.label}
      </span>
      {overflow && (
        <span className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertTriangle className="h-3 w-3" />
          Remove fields
        </span>
      )}
    </div>
  );
}

const SOCIAL_META: Record<SocialLinkId, { label: string; placeholder: string; type?: string; normalize: (v: string) => string }> = {
  linkedin: { label: "LinkedIn", placeholder: "linkedin.com/in/handle or @handle", normalize: normalizeLinkedin },
  instagram: { label: "Instagram", placeholder: "@handle", normalize: normalizeInstagram },
  x: { label: "X", placeholder: "@handle", normalize: normalizeX },
  whatsapp: { label: "WhatsApp", placeholder: "+91 98765 43210", type: "tel", normalize: normalizeWhatsapp },
};

function SortableSocialLinks({
  card,
  update,
}: {
  card: Card;
  update: (patch: Partial<Card>) => void;
}) {
  const order: SocialLinkId[] =
    card.socialOrder?.length === 4 ? card.socialOrder : ["linkedin", "instagram", "x", "whatsapp"];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = order.indexOf(active.id as SocialLinkId);
    const newIdx = order.indexOf(over.id as SocialLinkId);
    update({ socialOrder: arrayMove(order, oldIdx, newIdx) });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {order.map((id) => (
            <SortableSocialRow key={id} id={id} card={card} update={update} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableSocialRow({
  id,
  card,
  update,
}: {
  id: SocialLinkId;
  card: Card;
  update: (patch: Partial<Card>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const meta = SOCIAL_META[id];
  const value = id === "linkedin" ? card.linkedin : id === "instagram" ? card.instagram : id === "x" ? card.xHandle : card.whatsapp;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-card p-2.5",
        isDragging ? "border-clay shadow-lg" : "border-border"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="no-tap flex h-8 w-8 flex-shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground/50 hover:bg-muted hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag ${meta.label} to reorder`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{meta.label}</span>
          <input
            className="no-tap w-full rounded-lg border border-input bg-background px-3 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-clay focus:ring-2 focus:ring-clay/15"
            value={value}
            type={meta.type}
            placeholder={meta.placeholder}
            onChange={(e) => {
              const normalized = meta.normalize(e.target.value);
              update(
                id === "linkedin" ? { linkedin: normalized } :
                id === "instagram" ? { instagram: normalized } :
                id === "x" ? { xHandle: normalized } :
                { whatsapp: normalized }
              );
            }}
          />
        </label>
      </div>
    </div>
  );
}
