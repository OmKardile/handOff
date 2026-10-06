import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.handoff.app",
  appName: "HandOff",
  webDir: "out",
  bundledWebRuntime: false,
  plugins: {
    Haptics: {},
    Filesystem: {},
    Share: {},
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
