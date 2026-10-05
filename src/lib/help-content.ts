/**
 * HandOff help content — single source of truth.
 * Mirrors docs/USER_GUIDE.md, FAQ.md and TROUBLESHOOTING.md.
 * Built into the app at build time; fully offline; no analytics.
 */

export type Platform = "android" | "iphone" | "web";

export interface HelpStep {
  text: string;
  platform?: Platform;
}

export interface HelpGuide {
  id: string;
  category: HelpCategory;
  title: string;
  summary: string;
  steps: HelpStep[];
  related?: string[];
}

export type HelpCategory =
  | "Getting started"
  | "QR and styling"
  | "Sharing and exporting"
  | "Wallet"
  | "Wallpaper"
  | "Backup and privacy"
  | "Troubleshooting"
  | "About";

export const HELP_CATEGORIES: HelpCategory[] = [
  "Getting started",
  "QR and styling",
  "Sharing and exporting",
  "Wallet",
  "Wallpaper",
  "Backup and privacy",
  "Troubleshooting",
  "About",
];

export const HELP_GUIDES: HelpGuide[] = [
  // ===== Getting started =====
  {
    id: "create-card",
    category: "Getting started",
    title: "Create your card",
    summary: "Set up your digital business card in under a minute.",
    steps: [
      { text: "Open HandOff. If it's your first time, you'll see the welcome screen." },
      { text: "Tap Create your card." },
      { text: "Enter your first and last name (required), then an optional job title and company." },
      { text: "Tap Continue and add your phone, email and website. All optional." },
      { text: "Optionally add a photo. HandOff crops it square and strips location data." },
      { text: "Tap Finish. Your QR appears on the home screen." },
    ],
    related: ["style-qr", "show-qr"],
  },
  {
    id: "edit-card",
    category: "Getting started",
    title: "Edit your details",
    summary: "Change your name, contact info, links or photo anytime.",
    steps: [
      { text: "From the home screen, tap Edit." },
      { text: "Expand a section (Identity, Contact, Social links, QR contents) to edit it." },
      { text: "Use the QR contents toggles to choose what appears in the QR." },
      { text: "Tap Save changes. If the QR payload changed, HandOff shows a notice." },
    ],
    related: ["qr-changed", "qr-contents"],
  },

  // ===== QR and styling =====
  {
    id: "style-qr",
    category: "QR and styling",
    title: "Style your QR",
    summary: "Apply a preset or fine-tune shapes, colours and a centre element.",
    steps: [
      { text: "From home, tap Style (or use the Studio tab)." },
      { text: "Browse the Presets tab — 17 looks across Quiet, Warm, Cool and Social groups." },
      { text: "Tap a preset to apply it instantly. The live preview updates." },
      { text: "Use the Shape, Colour, Centre, Frame and Caption tabs to fine-tune." },
      { text: "Watch the scan indicator: green means it scans well." },
      { text: "Tap Reset to plain or Surprise me anytime." },
    ],
    related: ["qr-contents", "scan-check"],
  },
  {
    id: "qr-contents",
    category: "QR and styling",
    title: "Choose what's in the QR",
    summary: "Toggle which fields appear in the QR code.",
    steps: [
      { text: "Open the Editor and expand QR contents." },
      { text: "Toggle fields on or off. Name, title, company, phone, email and website are on by default." },
      { text: "Location and social links are off by default to keep the QR compact." },
      { text: "Watch the size meter: green is best, amber is fine, red means remove a field." },
    ],
    related: ["qr-wont-scan", "style-qr"],
  },
  {
    id: "scan-check",
    category: "QR and styling",
    title: "How the scan check works",
    summary: "HandOff verifies your styled QR stays scannable.",
    steps: [
      { text: "After every style change, HandOff renders the QR and decodes it with a QR reader library." },
      { text: "It compares the decoded result to your contact payload." },
      { text: "It also checks colour contrast between modules and background." },
      { text: "If something might be hard to scan, you'll see an amber warning — never a block." },
    ],
    related: ["qr-wont-scan", "style-qr"],
  },
  {
    id: "show-qr",
    category: "QR and styling",
    title: "Show your QR fullscreen",
    summary: "Display a large, bright QR for easy scanning.",
    steps: [
      { text: "From home, tap Show (or tap the QR itself)." },
      { text: "The QR fills the screen and the display stays awake." },
      { text: "On web, press Escape or tap Close to exit." },
    ],
    related: ["create-card", "style-qr"],
  },

  // ===== Sharing and exporting =====
  {
    id: "share-qr",
    category: "Sharing and exporting",
    title: "Share or export your QR",
    summary: "Send a PNG, SVG, .vcf file, story image and more.",
    steps: [
      { text: "From home, tap Share." },
      { text: "Choose an export: QR image (PNG), QR vector (SVG), Contact file (.vcf), Story, Square, Print card, or Wallet image." },
      { text: "Every export reflects your current style." },
      { text: "On mobile, the system share sheet opens. On desktop, the file downloads." },
    ],
    related: ["vcf-file", "print-card"],
  },
  {
    id: "vcf-file",
    category: "Sharing and exporting",
    title: "About the .vcf contact file",
    summary: "A standard vCard 3.0 file with all your details and photo.",
    steps: [
      { text: "From Share, choose Contact file (.vcf)." },
      { text: "The file includes your photo (256px), all social links as labelled items, and a UID." },
      { text: "Most phones import .vcf files directly into the contacts app." },
      { text: "The filename is ASCII-safe: First-Last.vcf." },
    ],
    related: ["share-qr"],
  },
  {
    id: "print-card",
    category: "Sharing and exporting",
    title: "Make a print-ready card",
    summary: "A 1050×600 PNG with your QR and details, ECC H for durability.",
    steps: [
      { text: "From Share, choose Print card." },
      { text: "The image is 1050×600 with your QR on the left and details on the right." },
      { text: "It uses error correction level H so it survives wear." },
      { text: "Send it to a printer or a print service." },
    ],
    related: ["share-qr"],
  },

  // ===== Wallet =====
  {
    id: "wallet-save",
    category: "Wallet",
    title: "Save a Wallet image",
    summary: "A clean, high-contrast QR for wallet apps that support photo passes.",
    steps: [
      { text: "From home, tap Wallet." },
      { text: "Review the preview — a pure light plate with a large, clean QR." },
      { text: "Tap Save wallet image." },
      { text: "Open your Wallet app and add the image as a photo pass." },
      { platform: "android", text: "Android: Wallet → Add to Wallet → Photo → choose the image." },
      { platform: "iphone", text: "iPhone: Photos → open the image → Add Pass to Wallet (where available)." },
    ],
    related: ["wallet-missing", "wallpaper-apply"],
  },
  {
    id: "wallet-missing",
    category: "Wallet",
    title: "The Wallet \"Photo\" option is missing",
    summary: "Not every device or region supports photo passes.",
    steps: [
      { text: "The Wallet Photo option first shipped on Pixel phones and may not exist on your device." },
      { text: "If it's missing, the lock-screen wallpaper works regardless — see the Wallpaper guide." },
      { text: "HandOff does not use an official Wallet API, because that needs a server and breaks the privacy model." },
    ],
    related: ["wallet-save", "wallpaper-apply"],
  },

  // ===== Wallpaper =====
  {
    id: "wallpaper-apply",
    category: "Wallpaper",
    title: "Set a lock-screen wallpaper",
    summary: "A phone-shaped image with your QR in the safe zone.",
    steps: [
      { text: "From home, tap Wallpaper." },
      { text: "Choose a backdrop (Charcoal, Navy, Warm, Clay)." },
      { text: "Tap Download wallpaper." },
      { platform: "android", text: "Android: open the image, tap Set as wallpaper → Lock screen." },
      { platform: "iphone", text: "iPhone: save to Photos, then Settings → Wallpaper → Add New Wallpaper → Photos." },
      { platform: "web", text: "Web: the image downloads. Transfer it to your phone to use." },
      { text: "Some manufacturers override lock-screen wallpapers with their own theming." },
    ],
    related: ["wallet-save"],
  },

  // ===== Backup and privacy =====
  {
    id: "backup-export",
    category: "Backup and privacy",
    title: "Back up your card",
    summary: "Export a single JSON file with everything, kept entirely offline.",
    steps: [
      { text: "Go to Settings → Backup & restore." },
      { text: "Tap Export backup. A file named handoff-backup-YYYYMMDD.json downloads." },
      { text: "It contains your card, style, photo, settings and custom presets." },
      { text: "Keep it somewhere safe — it has your contact details in plain JSON." },
    ],
    related: ["backup-restore", "erase-data"],
  },
  {
    id: "backup-restore",
    category: "Backup and privacy",
    title: "Restore from a backup",
    summary: "Import a backup file to replace current data.",
    steps: [
      { text: "Go to Settings → Backup & restore." },
      { text: "Tap Restore from file and pick your backup JSON." },
      { text: "HandOff validates the file and replaces your current data after a prompt." },
      { text: "If the file is invalid or hostile, HandOff rejects it safely." },
    ],
    related: ["backup-export"],
  },
  {
    id: "erase-data",
    category: "Backup and privacy",
    title: "Erase all data",
    summary: "Remove everything from this device instantly.",
    steps: [
      { text: "Go to Settings → Danger zone → Erase all data." },
      { text: "Confirm the prompt. This cannot be undone." },
      { text: "Your card, photo, style, settings and presets are wiped from local storage." },
      { text: "You return to onboarding." },
    ],
    related: ["backup-export", "privacy-policy"],
  },
  {
    id: "privacy-policy",
    category: "Backup and privacy",
    title: "The privacy promise",
    summary: "What HandOff stores, and what it never does.",
    steps: [
      { text: "HandOff stores your card, style, photo and settings in this browser's local storage (IndexedDB)." },
      { text: "It makes zero network requests. No fetch, no WebSocket, no analytics." },
      { text: "No accounts, no cookies, no tracking, no cloud sync." },
      { text: "Data leaves your phone only when you choose to share or export." },
      { text: "See Settings → Privacy for the full, plain-language policy." },
    ],
    related: ["erase-data", "storage-cleared"],
  },

  // ===== Troubleshooting =====
  {
    id: "qr-wont-scan",
    category: "Troubleshooting",
    title: "My QR won't scan",
    summary: "Common causes and fixes for unscannable QRs.",
    steps: [
      { text: "Check the scan indicator in the Style studio. Amber or red means trouble." },
      { text: "Reduce the centre element size — large centres hide too many modules." },
      { text: "Increase contrast: dark modules on a light background scan best." },
      { text: "Remove fields from the QR contents to make it less dense." },
      { text: "Use error correction level H if you have a centre element." },
      { text: "Clean your screen and the scanner's camera lens." },
    ],
    related: ["scan-check", "qr-contents"],
  },
  {
    id: "qr-changed",
    category: "Troubleshooting",
    title: "The \"QR changed\" notice",
    summary: "Why your old shared QR still shows old details.",
    steps: [
      { text: "HandOff's QR is static — it contains your contact directly." },
      { text: "If you edit your details, the QR changes. A banner warns you." },
      { text: "Anything you already printed or shared still shows the old details." },
      { text: "Re-export or re-share to update people." },
    ],
    related: ["edit-card", "share-qr"],
  },
  {
    id: "fonts-not-showing",
    category: "Troubleshooting",
    title: "A caption font isn't showing for my name",
    summary: "Some fonts don't cover all scripts.",
    steps: [
      { text: "Caption fonts are Latin-only in this build. Devanagari (Hindi, Marathi) names may not render in the chosen caption font." },
      { text: "HandOff falls back to a matching system font when characters aren't covered." },
      { text: "For best results, use a name in the script the font supports, or pick a different caption font." },
    ],
    related: ["style-qr"],
  },
  {
    id: "storage-cleared",
    category: "Troubleshooting",
    title: "My card disappeared",
    summary: "Browsers can clear storage; here's how to protect it.",
    steps: [
      { text: "Browsers may clear IndexedDB if storage is under pressure or you haven't visited in a while." },
      { text: "In Settings, check the Persistent storage status. If it says \"Not protected\", tap Enable persistence." },
      { text: "Installing HandOff as a PWA improves persistence." },
      { text: "Export a backup regularly so you can restore if storage is cleared." },
    ],
    related: ["backup-export", "privacy-policy"],
  },
  {
    id: "wallpaper-not-applying",
    category: "Troubleshooting",
    title: "Wallpaper isn't applying",
    summary: "Why some phones override the wallpaper.",
    steps: [
      { text: "Some manufacturers (Samsung, Xiaomi, others) override lock-screen wallpapers with their own theming." },
      { text: "Try setting it as the Home wallpaper instead, or use your manufacturer's wallpaper picker." },
      { text: "On iPhone, there's no API for apps to set wallpapers — save the image and set it manually via Settings." },
    ],
    related: ["wallpaper-apply"],
  },

  // ===== About =====
  {
    id: "about-handoff",
    category: "About",
    title: "About HandOff",
    summary: "What it is, what it isn't, and who made it.",
    steps: [
      { text: "HandOff is a privacy-first digital business card. It lives only on your device." },
      { text: "It's MIT licensed and open source." },
      { text: "No accounts, no servers, no analytics, no tracking — by design, not by setting." },
      { text: "Designed & developed by Omkar Kardile." },
    ],
    related: ["privacy-policy", "backup-export"],
  },
  {
    id: "install-pwa",
    category: "About",
    title: "Install HandOff as an app",
    summary: "Add HandOff to your home screen for a native-like experience.",
    steps: [
      { platform: "android", text: "Android (Chrome): tap the menu → Install app / Add to Home screen." },
      { platform: "iphone", text: "iPhone (Safari): tap Share → Add to Home Screen." },
      { platform: "web", text: "Desktop (Chrome/Edge): click the install icon in the address bar." },
      { text: "Once installed, HandOff works offline and persists storage more reliably." },
    ],
    related: ["about-handoff", "storage-cleared"],
  },
];

export function searchGuides(query: string): HelpGuide[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP_GUIDES;
  return HELP_GUIDES.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.steps.some((s) => s.text.toLowerCase().includes(q))
  );
}

/** Module-level store for the currently selected guide (shared with the app-shell help links). */
const SELECTED: { current: HelpGuide | null } = { current: null };
export function setSelectedGuide(g: HelpGuide | null) {
  SELECTED.current = g;
}
export function getSelectedGuide(): HelpGuide | null {
  return SELECTED.current;
}
