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
      // Draw content behind the status bar (edge-to-edge fullscreen)
      overlaysWebView: true,
      backgroundColor: "#F2EFE6",
      style: "LIGHT",
    },
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#F2EFE6",
      showSpinner: false,
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
