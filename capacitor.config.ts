import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartbudget.buddy',
  appName: 'ميزانيتي الذكية',
  webDir: 'dist/mobile',
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
