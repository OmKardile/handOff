/**
 * HandOff — brand identity.
 * Single source of truth for name, tagline, identifiers and brand voice.
 * Nothing here should ever make a network call.
 */

export const BRAND = {
  name: "HandOff",
  displayName: "HandOff",
  tagline: "Hand your card off. Nothing leaves your phone.",
  oneLiner:
    "A digital business card that lives only on your phone — no app, no server, no network.",
  slug: "handoff",
  appId: "com.example.handoff", // placeholder — change before store submission
  androidPackage: "com.example.handoff",
  iosBundleId: "com.example.handoff",
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
