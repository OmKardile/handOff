/**
 * Slate core types.
 * The card is the user's identity. The QR style makes it beautiful.
 * Everything is local — no server types here.
 */

/** Per-field toggle for what appears in the compact QR payload. */
export interface QrInclude {
  name: boolean;
  title: boolean;
  company: boolean;
  phone: boolean;
  email: boolean;
  website: boolean;
  location: boolean;
  linkedin: boolean;
  instagram: boolean;
  x: boolean;
  whatsapp: boolean;
}

/** The user's business card. */
export interface Card {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  phone: string; // E.164 or empty
  email: string;
  website: string; // normalized https URL or empty
  location: string;
  linkedin: string; // canonical URL or empty
  instagram: string; // canonical URL or empty
  xHandle: string; // canonical URL or empty
  whatsapp: string; // E.164 or empty
  photoPresent: boolean;
  qrInclude: QrInclude;
  /** Order of social links for display + QR. */
  socialOrder: SocialLinkId[];
  createdAt: string;
  updatedAt: string;
  qrFingerprint: string;
}

/** Identifiers for the four social/deep-link fields, reorderable. */
export type SocialLinkId = "linkedin" | "instagram" | "x" | "whatsapp";

/** QR error-correction level. */
export type EccLevel = "L" | "M" | "Q" | "H";

/** QR module shape options. */
export type ModuleShape =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "extra-rounded"
  | "classy-rounded";

export type EyeShape = "square" | "circle" | "rounded";

export type GradientType = "linear" | "radial";

export interface QrStyleGradient {
  type: GradientType;
  rotation: number; // degrees
  colors: [string, string];
}

export interface QrStyle {
  presetId: string | null; // null = custom
  moduleShape: ModuleShape;
  eyeShape: EyeShape;
  eyeOuterColor: string;
  eyeInnerColor: string;
  moduleColor: string; // solid or first stop
  moduleGradient: QrStyleGradient | null;
  background: string; // hex
  backgroundGradient: QrStyleGradient | null;
  /** Centre element: none | initials | photo | emoji | icon */
  centerType: "none" | "initials" | "photo" | "emoji" | "icon";
  centerValue: string; // emoji text or lucide icon name
  centerSize: number; // 0-40 (% of QR)
  centerShape: "circle" | "rounded-square";
  centerRing: boolean;
  /** Caption beneath the QR. */
  captionEnabled: boolean;
  captionText: string; // empty = use name
  captionFont: string; // font family
  /** Plate styling. */
  plateRadius: number; // px
  platePadding: number; // quiet zone multiplier
  ecc: EccLevel; // L/M/Q/H
}

export type ThemePref = "light" | "dark" | "system";

export interface Settings {
  theme: ThemePref;
  haptics: boolean;
  defaultEcc: EccLevel;
  storagePersisted: boolean | null;
}

/** Stored photo data (base64 JPEG, already square-cropped). */
export interface PhotoData {
  full: string; // 512px JPEG data URL
  thumb: string; // 256px JPEG data URL (for vcf)
}

/** A named custom QR preset saved by the user. */
export interface CustomPreset {
  id: string;
  name: string;
  style: QrStyle;
  createdAt: string;
}
