import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.walletapp',
  appName: 'ميزانيتي الذكية',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
