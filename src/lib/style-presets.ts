/**
 * HandOff QR style presets — 17 built-in looks.
 * Modules / plate / extras. Hex values are a starting palette.
 * Banned words never appear in copy.
 */

import type { QrStyle } from "@/shared/types";

/** The DEFAULT style — beautiful by default, not generic.
 *  Rounded dots + rounded eyes + warm ink-on-paper palette.
 *  QR plate stays light (#FBF9F5) in both themes — inverting hurts scanning. */
export const PLAIN_STYLE: QrStyle = {
  presetId: "ink",
  moduleShape: "rounded",
  eyeShape: "rounded",
  eyeOuterColor: "#16161A",
  eyeInnerColor: "#B93D17",
  moduleColor: "#16161A",
  moduleGradient: null,
  background: "#FBF9F5",
  backgroundGradient: null,
  centerType: "none",
  centerValue: "",
  centerSize: 0,
  centerShape: "circle",
  centerRing: false,
  captionEnabled: false,
  captionText: "",
  captionFont: "Fraunces",
  plateRadius: 20,
  platePadding: 1.5,
  ecc: "M",
};

export interface StylePreset {
  id: string;
  name: string;
  group: "quiet" | "warm" | "cool" | "social";
  captionFontLabel: string;
  style: QrStyle;
}

export const STYLE_PRESETS: StylePreset[] = [
  // ===== Quiet & editorial =====
  {
    id: "ink",
    name: "Ink",
    group: "quiet",
    captionFontLabel: "Fraunces",
    style: {
      ...PLAIN_STYLE,
      presetId: "ink",
      moduleShape: "classy",
      eyeShape: "rounded",
      eyeOuterColor: "#16161A",
      eyeInnerColor: "#16161A",
      moduleColor: "#16161A",
      background: "#F6F3EE",
      captionFont: "Fraunces",
    },
  },
  {
    id: "midnight-press",
    name: "Midnight Press",
    group: "quiet",
    captionFontLabel: "Instrument Sans",
    style: {
      ...PLAIN_STYLE,
      presetId: "midnight-press",
      moduleShape: "square",
      eyeShape: "square",
      eyeOuterColor: "#0E1B33",
      eyeInnerColor: "#0E1B33",
      moduleColor: "#0E1B33",
      background: "#F4F1EA",
      captionFont: "Instrument Sans",
    },
  },
  {
    id: "sunday-linen",
    name: "Sunday Linen",
    group: "quiet",
    captionFontLabel: "Newsreader",
    style: {
      ...PLAIN_STYLE,
      presetId: "sunday-linen",
      moduleShape: "rounded",
      eyeShape: "rounded",
      eyeOuterColor: "#3A332B",
      eyeInnerColor: "#3A332B",
      moduleColor: "#3A332B",
      background: "#FBF8F1",
      captionFont: "Newsreader",
    },
  },
  {
    id: "paper-pine",
    name: "Paper & Pine",
    group: "quiet",
    captionFontLabel: "Cormorant Garamond",
    style: {
      ...PLAIN_STYLE,
      presetId: "paper-pine",
      moduleShape: "square",
      eyeShape: "rounded",
      eyeOuterColor: "#1F3A2E",
      eyeInnerColor: "#1F3A2E",
      moduleColor: "#1F3A2E",
      background: "#F7F2E7",
      captionFont: "Cormorant Garamond",
    },
  },
  {
    id: "graphite-mono",
    name: "Graphite Mono",
    group: "quiet",
    captionFontLabel: "JetBrains Mono",
    style: {
      ...PLAIN_STYLE,
      presetId: "graphite-mono",
      moduleShape: "extra-rounded",
      eyeShape: "circle",
      eyeOuterColor: "#2B2B2B",
      eyeInnerColor: "#2B2B2B",
      moduleColor: "#2B2B2B",
      background: "#EDEDED",
      captionFont: "JetBrains Mono",
    },
  },
  {
    id: "noir-gold",
    name: "Noir Gold",
    group: "quiet",
    captionFontLabel: "DM Serif Display",
    style: {
      ...PLAIN_STYLE,
      presetId: "noir-gold",
      moduleShape: "square",
      eyeShape: "square",
      eyeOuterColor: "#111111",
      eyeInnerColor: "#8A6A1F",
      moduleColor: "#111111",
      background: "#FAF6EC",
      captionFont: "DM Serif Display",
    },
  },
  // ===== Warm & colourful =====
  {
    id: "terracotta",
    name: "Terracotta",
    group: "warm",
    captionFontLabel: "Fraunces",
    style: {
      ...PLAIN_STYLE,
      presetId: "terracotta",
      moduleShape: "rounded",
      eyeShape: "rounded",
      eyeOuterColor: "#C4572F",
      eyeInnerColor: "#C4572F",
      moduleColor: "#8A3B22",
      background: "#FBF4EC",
      captionFont: "Fraunces",
    },
  },
  {
    id: "saffron-line",
    name: "Saffron Line",
    group: "warm",
    captionFontLabel: "Instrument Sans",
    style: {
      ...PLAIN_STYLE,
      presetId: "saffron-line",
      moduleShape: "square",
      eyeShape: "square",
      eyeOuterColor: "#1B1B1B",
      eyeInnerColor: "#B87400",
      moduleColor: "#1B1B1B",
      background: "#FFF6DC",
      captionFont: "Instrument Sans",
    },
  },
  {
    id: "ember",
    name: "Ember",
    group: "warm",
    captionFontLabel: "Space Grotesk",
    style: {
      ...PLAIN_STYLE,
      presetId: "ember",
      moduleShape: "square",
      eyeShape: "square",
      eyeOuterColor: "#B53A12",
      eyeInnerColor: "#3A1208",
      moduleColor: "#B53A12",
      moduleGradient: { type: "linear", rotation: 180, colors: ["#3A1208", "#B53A12"] },
      background: "#FFF4EA",
      captionFont: "Space Grotesk",
    },
  },
  {
    id: "dusk-rose",
    name: "Dusk Rose",
    group: "warm",
    captionFontLabel: "Newsreader",
    style: {
      ...PLAIN_STYLE,
      presetId: "dusk-rose",
      moduleShape: "dots",
      eyeShape: "rounded",
      eyeOuterColor: "#5B2A3A",
      eyeInnerColor: "#B24C63",
      moduleColor: "#B24C63",
      moduleGradient: { type: "linear", rotation: 180, colors: ["#5B2A3A", "#B24C63"] },
      background: "#FFF5F4",
      captionFont: "Newsreader",
    },
  },
  {
    id: "plum-hours",
    name: "Plum Hours",
    group: "warm",
    captionFontLabel: "Cormorant Garamond",
    style: {
      ...PLAIN_STYLE,
      presetId: "plum-hours",
      moduleShape: "square",
      eyeShape: "square",
      eyeOuterColor: "#3B1F4A",
      eyeInnerColor: "#3B1F4A",
      moduleColor: "#7A2E5E",
      moduleGradient: { type: "linear", rotation: 180, colors: ["#3B1F4A", "#7A2E5E"] },
      background: "#FAF3F6",
      captionFont: "Cormorant Garamond",
    },
  },
  // ===== Cool & fresh =====
  {
    id: "monsoon",
    name: "Monsoon",
    group: "cool",
    captionFontLabel: "Instrument Sans",
    style: {
      ...PLAIN_STYLE,
      presetId: "monsoon",
      moduleShape: "square",
      eyeShape: "square",
      eyeOuterColor: "#0F3D5C",
      eyeInnerColor: "#0F3D5C",
      moduleColor: "#1F7A8C",
      moduleGradient: { type: "linear", rotation: 180, colors: ["#0F3D5C", "#1F7A8C"] },
      background: "#F3F8F8",
      captionFont: "Instrument Sans",
    },
  },
  {
    id: "glacier",
    name: "Glacier",
    group: "cool",
    captionFontLabel: "Fraunces",
    style: {
      ...PLAIN_STYLE,
      presetId: "glacier",
      moduleShape: "rounded",
      eyeShape: "rounded",
      eyeOuterColor: "#123C4A",
      eyeInnerColor: "#123C4A",
      moduleColor: "#123C4A",
      background: "#EEF6F8",
      captionFont: "Fraunces",
    },
  },
  {
    id: "sage-room",
    name: "Sage Room",
    group: "cool",
    captionFontLabel: "Newsreader",
    style: {
      ...PLAIN_STYLE,
      presetId: "sage-room",
      moduleShape: "square",
      eyeShape: "rounded",
      eyeOuterColor: "#4F7A5A",
      eyeInnerColor: "#24402F",
      moduleColor: "#24402F",
      background: "#F2F4EC",
      captionFont: "Newsreader",
    },
  },
  {
    id: "cobalt-edit",
    name: "Cobalt Edit",
    group: "cool",
    captionFontLabel: "Space Grotesk",
    style: {
      ...PLAIN_STYLE,
      presetId: "cobalt-edit",
      moduleShape: "square",
      eyeShape: "square",
      eyeOuterColor: "#1738A8",
      eyeInnerColor: "#1738A8",
      moduleColor: "#1738A8",
      background: "#F5F7FF",
      captionFont: "Space Grotesk",
    },
  },
  // ===== Bolder social-profile style =====
  {
    id: "afterglow",
    name: "Afterglow",
    group: "social",
    captionFontLabel: "Instrument Sans",
    style: {
      ...PLAIN_STYLE,
      presetId: "afterglow",
      moduleShape: "dots",
      eyeShape: "circle",
      eyeOuterColor: "#E1306C",
      eyeInnerColor: "#C13584",
      moduleColor: "#C13584",
      moduleGradient: { type: "linear", rotation: 180, colors: ["#833AB4", "#E1306C"] },
      background: "#FFFFFF",
      captionFont: "Instrument Sans",
    },
  },
  {
    id: "open-sky",
    name: "Open Sky",
    group: "social",
    captionFontLabel: "Fraunces",
    style: {
      ...PLAIN_STYLE,
      presetId: "open-sky",
      moduleShape: "rounded",
      eyeShape: "rounded",
      eyeOuterColor: "#0B5CAD",
      eyeInnerColor: "#1B8FD6",
      moduleColor: "#1B8FD6",
      moduleGradient: { type: "linear", rotation: 180, colors: ["#0B5CAD", "#1B8FD6"] },
      background: "#FFFFFF",
      captionFont: "Fraunces",
      centerType: "initials",
      centerSize: 20,
      centerShape: "circle",
      centerRing: true,
    },
  },
  // ===== CHART editions — topographic QR styles =====
  // Contour = concentric rounded modules with a thin outline
  {
    id: "contour",
    name: "Contour",
    group: "chart",
    captionFontLabel: "Fraunces",
    style: {
      ...PLAIN_STYLE,
      presetId: "contour",
      moduleShape: "classy-rounded",
      eyeShape: "rounded",
      eyeOuterColor: "#0E1B33",
      eyeInnerColor: "#B93D17",
      moduleColor: "#0E1B33",
      background: "#F6F3EE",
      captionFont: "Fraunces",
    },
  },
  // Shoal = density-modulated dots (larger toward centre of each cluster)
  {
    id: "shoal",
    name: "Shoal",
    group: "chart",
    captionFontLabel: "Instrument Sans",
    style: {
      ...PLAIN_STYLE,
      presetId: "shoal",
      moduleShape: "dots",
      eyeShape: "circle",
      eyeOuterColor: "#0E1B33",
      eyeInnerColor: "#8A6A1F",
      moduleColor: "#0E1B33",
      background: "#FBF9F5",
      captionFont: "Instrument Sans",
    },
  },
  // Atoll = ring finder eyes with dotted lagoon inner
  {
    id: "atoll",
    name: "Atoll",
    group: "chart",
    captionFontLabel: "Fraunces",
    style: {
      ...PLAIN_STYLE,
      presetId: "atoll",
      moduleShape: "rounded",
      eyeShape: "circle",
      eyeOuterColor: "#0E1B33",
      eyeInnerColor: "#2E6B45",
      moduleColor: "#0E1B33",
      background: "#F6F3EE",
      captionFont: "Fraunces",
    },
  },
  // Meridian = thin vertical line modules
  {
    id: "meridian",
    name: "Meridian",
    group: "chart",
    captionFontLabel: "JetBrains Mono",
    style: {
      ...PLAIN_STYLE,
      presetId: "meridian",
      moduleShape: "classy",
      eyeShape: "square",
      eyeOuterColor: "#0E1B33",
      eyeInnerColor: "#0E1B33",
      moduleColor: "#0E1B33",
      background: "#FBF9F5",
      captionFont: "JetBrains Mono",
    },
  },
  // Fathom = depth gradient navy to teal
  {
    id: "fathom",
    name: "Fathom",
    group: "chart",
    captionFontLabel: "Fraunces",
    style: {
      ...PLAIN_STYLE,
      presetId: "fathom",
      moduleShape: "extra-rounded",
      eyeShape: "rounded",
      eyeOuterColor: "#0E1B33",
      eyeInnerColor: "#2E6B45",
      moduleColor: "#0E1B33",
      moduleGradient: { type: "linear", rotation: 180, colors: ["#0E1B33", "#2E6B45"] },
      background: "#F6F3EE",
      captionFont: "Fraunces",
    },
  },
];

export function getPreset(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find((p) => p.id === id);
}

/** Named swatch rows for the colour picker. */
export const SWATCH_ROWS: { name: string; colors: string[] }[] = [
  { name: "Neutrals", colors: ["#16161A", "#2B2B2B", "#4A4A4A", "#6B655C", "#9B958A", "#CDC7BC"] },
  { name: "Earth", colors: ["#8A3B22", "#B0533A", "#C4572F", "#8A6A1F", "#C8A24A", "#3A332B"] },
  { name: "Jewel", colors: ["#1738A8", "#0E1B33", "#1F3A2E", "#3B1F4A", "#5B2A3A", "#123C4A"] },
  { name: "Pastels", colors: ["#E9E1D3", "#EEF6F8", "#FFF5F4", "#FAF3F6", "#F2F4EC", "#FBF4EC"] },
  { name: "Brights", colors: ["#B53A12", "#1F7A8C", "#7A2E5E", "#B87400", "#1B8FD6", "#E1306C"] },
  { name: "Duotone", colors: ["#0E1B33", "#C8A24A", "#1F3A2E", "#C4572F", "#1738A8", "#1B8FD6"] },
];

/** QR caption font library. */
export const QR_FONTS: { family: string; label: string; category: string }[] = [
  { family: "Fraunces", label: "Fraunces", category: "Serif" },
  { family: "Newsreader", label: "Newsreader", category: "Serif" },
  { family: "DM Serif Display", label: "DM Serif Display", category: "Serif" },
  { family: "Cormorant Garamond", label: "Cormorant", category: "Serif" },
  { family: "Instrument Sans", label: "Instrument Sans", category: "Sans" },
  { family: "Space Grotesk", label: "Space Grotesk", category: "Sans" },
  { family: "JetBrains Mono", label: "JetBrains Mono", category: "Mono" },
  { family: "Caveat", label: "Caveat", category: "Handwritten" },
];

/** Random but scannable "Surprise me" — pick a preset, randomise a few safe params. */
export function surpriseMe(): QrStyle {
  const presets = STYLE_PRESETS.filter((p) => p.group !== "social");
  const base = presets[Math.floor(Math.random() * presets.length)].style;
  const shapes: QrStyle["moduleShape"][] = ["square", "rounded", "dots", "classy", "extra-rounded"];
  const eyes: QrStyle["eyeShape"][] = ["square", "rounded", "circle"];
  return {
    ...base,
    presetId: null,
    moduleShape: shapes[Math.floor(Math.random() * shapes.length)],
    eyeShape: eyes[Math.floor(Math.random() * eyes.length)],
    centerType: Math.random() > 0.6 ? "initials" : "none",
    centerSize: Math.random() > 0.6 ? 18 : 0,
    centerRing: Math.random() > 0.5,
    captionEnabled: Math.random() > 0.5,
  };
}
