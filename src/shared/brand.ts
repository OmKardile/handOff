/**
 * Vello — brand identity.
 * Single source of truth for name, tagline, identifiers and brand voice.
 * Nothing here should ever make a network call.
 */

export const BRAND = {
  name: "Vello",
  displayName: "Vello",
  tagline: "One card. One scan. Nothing leaves your phone.",
  oneLiner:
    "A digital business card that lives only on your phone — no app, no server, no network.",
  slug: "vello",
  appId: "com.example.vello", // placeholder — change before store submission
  androidPackage: "com.example.vello",
  iosBundleId: "com.example.vello",
  version: "1.0.0",
  /** Brand voice: confident, concise, human, specific. */
  voice: {
    do: [
      "Be confident and specific.",
      "Lead with the promise (privacy, simplicity).",
      "Use short, deliberate sentences.",
    ],
    dont: [
      "revolutionary",
      "next-generation",
      "seamless",
      "empowering",
      "cutting-edge",
      "world-class",
      "unlock",
    ],
  },
} as const;

export const PRIVACY_PROMISE = [
  "No accounts.",
  "No servers.",
  "No analytics.",
  "No tracking.",
  "No cloud backup.",
  "Nothing leaves your phone — except when you choose to share.",
] as const;
