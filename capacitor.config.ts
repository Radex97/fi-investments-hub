import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fiinvestments.app',
  appName: 'fi-investments-hub',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true,
  },
  ios: {
    scheme: 'FIInvestments',
    backgroundColor: '#003595',
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#003595',
    allowMixedContent: true,
  },
};

export default config;
