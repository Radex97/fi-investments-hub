import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fiinvestments.app',
  appName: 'fi-investments-hub',
  webDir: 'dist',
  ios: {
    scheme: 'FIInvestments',
    backgroundColor: '#003595',
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#003595'
  },
};

export default config;
