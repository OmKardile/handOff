# Business Documentation — HandOff

**Product Name:** HandOff  
**Tagline:** "One card. One scan. Nothing leaves your phone."  
**Version:** 1.6.9  
**Developer:** Omkar Kardile (omkardile84@gmail.com)  
**License:** MIT  

---

## 1. Problem Statement & Mission

Traditional digital business cards rely on server-hosted profiles, requiring user accounts, monthly subscriptions, tracking cookies, and persistent internet connections. When a contact scans a typical digital business card QR code, they are directed to an ad-tracked web landing page rather than adding the contact directly.

**HandOff's Mission:** Provide a high-velocity, offline-first digital business card that encodes contact details directly into a standardized vCard 3.0 QR code. Zero servers, zero user accounts, zero analytics, zero data transmission.

---

## 2. Target Audience & Personas

1. **Privacy-Conscious Professionals:** Developers, security researchers, executives, and journalists who refuse to store address books or networking data on third-party SaaS databases.
2. **Field Workers & Conference Attendees:** Attendees networking in crowded venues or low-connectivity environments where cellular data is congested or unavailable.
3. **Designers & Creatives:** Users seeking a bold, distinctive business card aesthetic (DEAD DROP brutalism) rather than generic corporate templates.

---

## 3. Core Business Rules

1. **Zero Runtime Network Connectivity:**
   - The application must not make any outgoing network requests (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`).
   - Static asset verification gate `npm run check:privacy` enforces this statically.

2. **Offline Data Sovereignty:**
   - User profile data, contact cards, and custom style presets must live exclusively on the user's physical device.
   - On Android: stored in encrypted native app storage (`@capacitor/preferences`).
   - On Web: stored in browser IndexedDB with backup copy rotation.

3. **Standardized Contact Interoperability:**
   - Every generated QR code must decode natively via iOS Camera and Android Google Lens without requiring the recipient to have HandOff installed.
   - Encodes standardized vCard 3.0 with standard phone, email, name, organization, job title, and social links.

4. **Brutalist Brand Discipline:**
   - Adhere strictly to the "DEAD DROP" aesthetic: bone canvas (`#F2EFE6`), ink text/borders (`#0A0A0A`), acid-lime accent (`#C6FF00`), and vermilion alert accents (`#FF3B1F`).
   - **The #1 Rule:** Fixed black text on all lime surfaces (`text-black` on `bg-signal`). Never allow dark mode inversions to produce low-contrast white-on-lime text.

---

## 4. Feature Matrix

- **Card Creator & Editor:** Grouped contact details with byte-metering to prevent QR code density overflow (>700 bytes warning).
- **Style Studio:** 36 presets across 5 moods (Quiet, Warm, Cool, Social, Vivid), custom eye/module geometry, center icons, and transparent previews.
- **Lockscreen Wallpapers:** 11 live artistic templates (Sunburst, Kawaii Cat, Halftone, Mountains, Comic, etc.) with safe-zone clock placement and live previews.
- **Multi-Format Exporting:** PNG, SVG, full vCard `.vcf`, Wallet pass image, and social share cards.
- **Hardware Integration:** Edge-to-edge status bar, hardware back button routing, and haptic feedback.
