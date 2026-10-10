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
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#F2EFE6",
      style: "LIGHT",
    },
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#F2EFE6",
      showSpinner: false,
      androidSplashResourceName: "splash",
    },
    Preferences: {},
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
