import type { NextConfig } from "next";

// For Capacitor (Android/iOS) builds, set NEXT_STATIC_EXPORT=1 in env:
//   NEXT_STATIC_EXPORT=1 npm run build
// This generates static files in /out for `cap sync` to pick up.
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // "export" for Capacitor (static files in /out), "standalone" for dev/server
  output: isStaticExport ? "export" : "standalone",
  // Required for static export — no server-side features
  ...(isStaticExport
    ? {
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
