
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5f1e37a5c3504a1b8d6ca71c6f3157ba',
  appName: 'fi-investments-hub',
  webDir: 'dist',
  server: {
    url: 'https://5f1e37a5-c350-4a1b-8d6c-a71c6f3157ba.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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
