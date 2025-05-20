
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Firebase config wird dynamisch aus Supabase Edge Function geladen
let firebaseApp: any = null;
let messagingInstance: any = null;

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

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
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
    } else {
      console.log("Notification permission denied");
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
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      // Initialize Firebase app
      const app = await initializeFirebaseApp();
      if (!app) return;
      
      messagingInstance = getMessaging(app);
      
      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker is ready");
      
      // Check if notifications are already permitted
      if (Notification.permission === "granted") {
        const token = await getToken(messagingInstance, {
          vapidKey: "YOUR_VAPID_KEY", // Replace with your VAPID key
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          saveFCMToken(token);
        }
      }
      
      // Set up message listener for foreground messages
      onMessageListener();
    } catch (err) {
      console.error("Error initializing Firebase messaging:", err);
    }
  }
};
