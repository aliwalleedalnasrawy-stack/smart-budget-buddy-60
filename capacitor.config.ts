import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.walletapp',
  appName: 'ميزانيتي الذكية',
  webDir: 'dist/client',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorAnalytics: {
      analytics: false,
    },
  },
};

export default config;
