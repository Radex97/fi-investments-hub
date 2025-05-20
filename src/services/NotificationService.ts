
import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendPushParams {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: { to, subject, html, from }
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in sendEmail:", err);
    throw err;
  }
}

export async function sendPushNotification({ token, title, body, data, imageUrl }: SendPushParams) {
  try {
    const { data: response, error } = await supabase.functions.invoke("send-push-notification", {
      body: { token, title, body, data, imageUrl }
    });

    if (error) {
      console.error("Error sending push notification:", error);
      throw error;
    }

    return response;
  } catch (err) {
    console.error("Error in sendPushNotification:", err);
    throw err;
  }
}

export async function sendNotificationToUser(userId: string, notification: {
  title: string;
  content: string;
  type: "product_update" | "system" | "transaction";
  action_url?: string;
}) {
  // 1. Insert notification into database
  try {
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        read: false,
        action_url: notification.action_url || null
      });

    if (error) {
      console.error("Error inserting notification:", error);
      throw error;
    }

    // 2. Get user notification preferences
    const { data: settings, error: settingsError } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError && settingsError.code !== "PGRST116") {
      console.error("Error fetching notification settings:", settingsError);
      throw settingsError;
    }

    // If no settings found or the relevant notification type is disabled, return
    if (!settings) return;

    // Check if this notification type is enabled
    const notificationType = notification.type === "product_update" ? "product_updates" :
                            notification.type === "transaction" ? "transaction_alerts" : 
                            "marketing_notifications";
                            
    if (!settings[notificationType]) return;

    // 3. Send email if email notifications are enabled
    if (settings.email_enabled) {
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user email:", userError);
      } else if (userData?.email) {
        // Send email
        await sendEmail({
          to: userData.email,
          subject: notification.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${notification.title}</h2>
              <p>${notification.content}</p>
              ${notification.action_url ? 
                `<p><a href="${notification.action_url}" style="background-color: #cca352; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Mehr anzeigen</a></p>` : 
                ''}
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Diese E-Mail wurde automatisch von FI Investments gesendet.<br>
                Sie können Ihre Benachrichtigungseinstellungen jederzeit in Ihrem Profil ändern.
              </p>
            </div>
          `
        });
      }
    }

    // 4. Send push notification if enabled
    if (settings.push_enabled) {
      // Get user FCM tokens
      const { data: tokens, error: tokensError } = await supabase
        .from("fcm_tokens")
        .select("token")
        .eq("user_id", userId);

      if (tokensError) {
        console.error("Error fetching FCM tokens:", tokensError);
      } else if (tokens && tokens.length > 0) {
        // Send to all user devices
        for (const tokenData of tokens) {
          try {
            await sendPushNotification({
              token: tokenData.token,
              title: notification.title,
              body: notification.content,
              data: notification.action_url ? { url: notification.action_url } : {}
            });
          } catch (e) {
            console.error(`Error sending push to token ${tokenData.token}:`, e);
            // If token is invalid, we could remove it here
          }
        }
      }
    }

    return true;
  } catch (err) {
    console.error("Error in sendNotificationToUser:", err);
    throw err;
  }
}

// New utility functions for admin templates and notifications

export async function processTemplate(templateString: string, variables: Record<string, any>) {
  let processed = templateString;
  
  // Replace each variable placeholder with its value
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value?.toString() || '');
  });
  
  return processed;
}

export async function sendNotificationWithTemplate(userId: string, templateId: string, variables: Record<string, any> = {}) {
  try {
    // 1. Get the template
    const { data: template, error: templateError } = await supabase
      .from("notification_templates")
      .select("*")
      .eq("id", templateId)
      .single();
      
    if (templateError) {
      console.error("Error fetching template:", templateError);
      throw templateError;
    }
    
    // 2. Get user information for variables
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }
    
    // 3. Prepare variables
    const allVariables = {
      ...variables,
      "user.first_name": userData.first_name,
      "user.last_name": userData.last_name,
      "user.email": userData.email
    };
    
    // 4. Process the template
    let notificationTitle = template.subject || "FI Investments";
    let notificationContent = "";
    
    // Different processing based on template type
    if (template.type === 'email' && template.content_html) {
      notificationContent = await processTemplate(template.content_html, allVariables);
    } else if (template.type === 'push' && template.content_text) {
      notificationContent = await processTemplate(template.content_text, allVariables);
    } else {
      throw new Error("Invalid template content");
    }
    
    // 5. Create notification record and send notification
    const notificationType = template.trigger_event?.includes('product') ? 'product_update' :
                             template.trigger_event?.includes('transaction') ? 'transaction' :
                             'system';
                             
    await sendNotificationToUser(userId, {
      title: notificationTitle,
      content: notificationContent.replace(/<[^>]*>/g, ''), // Store plain text version
      type: notificationType as any
    });
    
    // 6. Log this template-based notification
    const { data: sessionData } = await supabase.auth.getSession();
    const adminId = sessionData.session?.user?.id;
    
    if (adminId) {
      await supabase
        .from("admin_notification_logs")
        .insert({
          admin_id: adminId,
          sent_to_user_id: userId,
          template_id: templateId,
          custom_content: false
        });
    }
    
    return true;
  } catch (err) {
    console.error("Error in sendNotificationWithTemplate:", err);
    throw err;
  }
}

// Function to send template-based notification to multiple users
export async function sendTemplateNotificationToUsers(userIds: string[], templateId: string, variables: Record<string, any> = {}) {
  const results = [];
  
  for (const userId of userIds) {
    try {
      const result = await sendNotificationWithTemplate(userId, templateId, variables);
      results.push({ userId, success: true });
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      results.push({ userId, success: false, error });
    }
  }
  
  return results;
}

// Function to get available variables for templates
export function getAvailableTemplateVariables() {
  return [
    { key: "user.first_name", description: "Vorname des Benutzers" },
    { key: "user.last_name", description: "Nachname des Benutzers" },
    { key: "user.email", description: "E-Mail-Adresse des Benutzers" },
    { key: "investment.amount", description: "Investitionsbetrag" },
    { key: "investment.date", description: "Datum der Investition" },
    { key: "investment.product", description: "Produktname der Investition" },
    { key: "transaction.amount", description: "Transaktionsbetrag" },
    { key: "transaction.date", description: "Transaktionsdatum" },
    { key: "product.name", description: "Produktname" },
    { key: "product.yield", description: "Produktrendite" },
    { key: "kyc.status", description: "KYC-Status" }
  ];
}
