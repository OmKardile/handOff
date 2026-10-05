/** Field length limits — shared across the app. */
export const LIMITS = {
  firstName: 60,
  lastName: 60,
  jobTitle: 80,
  company: 80,
  phone: 20, // display; stored E.164
  email: 254,
  website: 2000,
  location: 100,
  linkedinHandle: 100,
  instagramHandle: 30,
  xHandle: 15,
  whatsapp: 20,
  /** QR payload thresholds (bytes). */
  qrGreen: 250,
  qrAmber: 450,
  qrHardCap: 700,
  /** Photo limits. */
  photoMaxBytes: 12 * 1024 * 1024, // 12 MB
  photoMaxSide: 8000,
  photoOutput: 512,
  photoVcf: 256,
  /** Storage. */
  schemaVersion: 1,
} as const;

export const DEFAULT_REGION = "IN" as const;
