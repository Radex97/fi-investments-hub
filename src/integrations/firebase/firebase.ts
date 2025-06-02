import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from '@capacitor/core';

// Firebase config wird dynamisch aus Supabase Edge Function geladen
let firebaseApp: any = null;
let messagingInstance: any = null;

// Globale Variable, die Notification-Features deaktiviert
const NOTIFICATIONS_ENABLED = false;

// Prüfe, ob die Web Notification API verfügbar ist
const isNotificationSupported = () => {
  // Auf iOS geben wir immer false zurück, um Probleme zu vermeiden
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
    return false;
  }
  
  // Auf anderen Plattformen prüfen wir die tatsächliche Verfügbarkeit
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         NOTIFICATIONS_ENABLED;
};

// Sicherer Zugriff auf Notification.permission
const getNotificationPermission = () => {
  if (isNotificationSupported()) {
    return window.Notification.permission;
  }
  return "default"; // Standardwert zurückgeben, wenn nicht unterstützt
};

// Prüfe, ob wir auf einer nativen Plattform sind
const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

// Initialisiere Firebase mit config
const initializeFirebaseApp = async () => {
  try {
    if (firebaseApp) return firebaseApp;

    const { data: firebaseConfig, error } = await supabase.functions.invoke("get-firebase-config");
    
    if (error) {
      console.error("Error fetching Firebase config:", error);
      return null;
    }
    
    if (!firebaseConfig) {
      console.error("Firebase config not found");
      return null;
    }

    console.log("Initializing Firebase app with config");
    firebaseApp = initializeApp(firebaseConfig);
    return firebaseApp;
  } catch (err) {
    console.error("Error initializing Firebase:", err);
    return null;
  }
};

// Save FCM token to Supabase
const saveFCMToken = async (token: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return;
    }

    const { error } = await supabase
      .from("fcm_tokens")
      .upsert({
        user_id: session.user.id,
        token: token,
        device: navigator.userAgent,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: "token",
        ignoreDuplicates: false
      });

    if (error) {
      console.error("Error saving FCM token:", error);
    }
  } catch (err) {
    console.error("Error in saveFCMToken:", err);
  }
};

// Sichere Methode zum Anfordern von Benachrichtigungsberechtigungen
const requestNotificationPermissionSafely = async () => {
  if (!isNotificationSupported()) {
    console.log("Notifications not supported, skipping permission request");
    return "granted"; // Auf nativen Plattformen nehmen wir an, dass es erlaubt ist
  }
  
  try {
    return await window.Notification.requestPermission();
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "denied";
  }
};

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    // Wenn wir auf iOS sind, ignorieren wir den Benachrichtigungsprozess
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      console.log("Skipping notifications on iOS");
      return false;
    }
    
    // Wenn wir auf einer nativen Plattform sind und Notification nicht verfügbar ist,
    // können wir den anderen Code trotzdem ausführen
    let permission = "granted";
    
    if (isNotificationSupported()) {
      permission = await requestNotificationPermissionSafely();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return false;
      }
    } else if (isNativePlatform()) {
      console.log("Running on native platform, skipping web Notification permission");
      // Auf native Plattformen verwenden wir die native Benachrichtigungsfunktion
      // Die genaue Implementierung wäre hier zusätzlich erforderlich
    } else {
      console.log("Notifications not supported in this environment");
      return false;
    }
    
    // Initialize Firebase app if not already initialized
    const app = await initializeFirebaseApp();
    if (!app) {
      return false;
    }

    // Get messaging instance
    messagingInstance = getMessaging(app);
    
    // Get the FCM token
    const currentToken = await getToken(messagingInstance, {
      vapidKey: "YOUR_VAPID_KEY" // Replace with your VAPID key
    });
    
    if (currentToken) {
      console.log("FCM token:", currentToken);
      // Save the token to Supabase
      await saveFCMToken(currentToken);
      return true;
    } else {
      console.log("No registration token available");
      return false;
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return false;
  }
};

// Listen for messages when the app is in the foreground
export const onMessageListener = () => {
  if (!messagingInstance) return;
  
  onMessage(messagingInstance, (payload) => {
    console.log("Message received in foreground:", payload);
    
    if (payload.notification) {
      toast(
        payload.notification.title || "Neue Benachrichtigung",
        {
          description: payload.notification.body,
          icon: "🔔",
          action: payload.data?.url ? {
            label: "Anzeigen",
            onClick: () => window.location.href = payload.data.url
          } : undefined
        }
      );
    }
  });
};

// Initialize Firebase messaging
export const initializeFirebaseMessaging = async () => {
  try {
    // Auf iOS überspringen wir die Firebase-Messaging-Initialisierung
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      console.log("Skipping Firebase messaging on iOS");
      return;
    }
    
    // Frühzeitig prüfen, ob notwendige APIs verfügbar sind
    if (!("serviceWorker" in navigator)) {
      console.log("Service workers not supported");
      return;
    }

    const supportsPush = "PushManager" in window || isNativePlatform();
    if (!supportsPush) {
      console.log("Push messaging not supported");
      return;
    }
    
    // Falls Web Notifications nicht unterstützt werden, beenden wir hier
    if (!isNotificationSupported() && !isNativePlatform()) {
      console.log("Web Notifications not supported");
      return;
    }
    
    // Initialize Firebase app
    const app = await initializeFirebaseApp();
    if (!app) return;
    
    // Get messaging instance
    try {
      messagingInstance = getMessaging(app);
      
      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker is ready");
      
      // Sichere Überprüfung des Notification-Status
      const notificationPermission = getNotificationPermission();
      
      if (notificationPermission === "granted") {
        try {
          const token = await getToken(messagingInstance, {
            vapidKey: "YOUR_VAPID_KEY", // Replace with your VAPID key
            serviceWorkerRegistration: registration
          });
          
          if (token) {
            saveFCMToken(token);
          }
        } catch (tokenErr) {
          console.error("Error getting token:", tokenErr);
        }
      } else if (isNativePlatform()) {
        // Für native Plattformen könnten wir hier den Token auf andere Weise abrufen
        console.log("Native platform detected, trying to get token");
        try {
          const token = await getToken(messagingInstance, {
            vapidKey: "YOUR_VAPID_KEY", // Replace with your VAPID key
            serviceWorkerRegistration: registration
          });
          
          if (token) {
            saveFCMToken(token);
          }
        } catch (tokenErr) {
          console.error("Error getting token on native platform:", tokenErr);
        }
      }
      
      // Set up message listener for foreground messages
      onMessageListener();
    } catch (messagingErr) {
      console.error("Error setting up Firebase messaging:", messagingErr);
    }
  } catch (err) {
    console.error("Error initializing Firebase messaging:", err);
  }
};
