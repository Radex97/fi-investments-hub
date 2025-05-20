
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'

// Import Capacitor
import { Capacitor } from '@capacitor/core'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

// Add special classes based on platform
if (Capacitor.isNativePlatform()) {
  document.body.classList.add('native-app');
  
  if (Capacitor.getPlatform() === 'ios') {
    document.body.classList.add('ios-app');
  } else if (Capacitor.getPlatform() === 'android') {
    document.body.classList.add('android-app');
  }
}

createRoot(rootElement).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
