import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.walletapp',
  appName: 'ميزانيتي الذكية',
  webDir: 'dist/mobile',   // ← تغيير من dist/client إلى dist/mobile
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
