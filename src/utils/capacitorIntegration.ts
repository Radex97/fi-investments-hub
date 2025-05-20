
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

export const getAppVersion = async (): Promise<string> => {
  if (isNativePlatform()) {
    try {
      // When we add plugins like App, we can get the version
      // import { App } from '@capacitor/app';
      // const info = await App.getInfo();
      // return info.version;
      return '1.0.0'; // Placeholder until we add the App plugin
    } catch (error) {
      console.error('Error getting app version:', error);
      return '1.0.0';
    }
  }
  return '1.0.0'; // Default version for web
};

export const getPlatformName = (): string => {
  return Capacitor.getPlatform();
};
