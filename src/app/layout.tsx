import type { Metadata, Viewport } from "next";
import { Anton, Archivo_Black, Fraunces, Instrument_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "@fontsource/caveat/400.css";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

/* DEAD DROP design system fonts.
   - Anton: heavy condensed display — the "wtf" headlines
   - Archivo Black: alt heavy for stamps/labels
   - Space Grotesk: modern grotesk body sans
   - Fraunces / Instrument Sans / JetBrains Mono: retained so existing QR caption
     presets (which reference these families by name in canvas rendering) still work. */
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HandOff — One card. One scan. Nothing leaves your phone.",
  description:
    "HandOff is a digital business card that lives only on your phone. Generate a scannable QR, style it beautifully, and share your contact — no app, no server, no network.",
  keywords: [
    "digital business card",
    "QR code",
    "vCard",
    "contact sharing",
    "privacy",
    "offline",
    "HandOff",
  ],
  authors: [{ name: "Omkar Kardile", url: "https://omkardile.is-a.dev/" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HandOff",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "HandOff — One card. One scan. Nothing leaves your phone.",
    description:
      "A digital business card that lives only on your phone. No accounts, no servers, no tracking.",
    siteName: "HandOff",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Content Security Policy: pure offline, zero network.
            Enforces the privacy promise at the browser level. */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; form-action 'none'; base-uri 'self'; object-src 'none';"
        />
        {/* iOS status bar: translucent so the glass header refracts through it */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${anton.variable} ${archivoBlack.variable} ${spaceGrotesk.variable} ${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased select-none`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
