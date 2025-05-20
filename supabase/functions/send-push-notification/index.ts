
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { initializeApp, cert, getApps } from "npm:firebase-admin/app";
import { getMessaging } from "npm:firebase-admin/messaging";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  try {
    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}");
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

interface PushNotificationRequest {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, title, body, data = {}, imageUrl }: PushNotificationRequest = await req.json();

    if (!token || !title || !body) {
      throw new Error("Missing required fields: token, title, or body");
    }

    console.log(`Sending push notification to token: ${token.substring(0, 10)}...`);

    const messaging = getMessaging();
    const message = {
      token,
      notification: {
        title,
        body,
        ...(imageUrl ? { imageUrl } : {})
      },
      data
    };

    const response = await messaging.send(message);
    console.log("Push notification sent successfully:", response);

    return new Response(JSON.stringify({ success: true, messageId: response }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
