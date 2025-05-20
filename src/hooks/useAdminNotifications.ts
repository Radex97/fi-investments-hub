
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendEmail, sendPushNotification } from "@/services/NotificationService";

export type AdminNotificationLog = {
  id: string;
  admin_id: string;
  sent_to_user_id: string | null;
  notification_id: string | null;
  template_id: string | null;
  custom_content: boolean;
  created_at: string;
};

export type UserBasicInfo = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

export type ManualNotificationParams = {
  userIds: string[];
  subject?: string;
  content: string;
  templateId?: string;
  sendEmail: boolean;
  sendPush: boolean;
};

export function useAdminNotificationLogs() {
  return useQuery({
    queryKey: ["admin-notification-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notification_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Fehler beim Laden der Benachrichtigungsprotokolle", {
          description: error.message
        });
        throw error;
      }

      return data as AdminNotificationLog[];
    },
  });
}

export function useUsersList() {
  return useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .order("email");

      if (error) {
        toast.error("Fehler beim Laden der Benutzerliste", {
          description: error.message
        });
        throw error;
      }

      return data as UserBasicInfo[];
    },
  });
}

export function useSendManualNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ManualNotificationParams) => {
      // Create a copy of userIds to avoid mutable params
      const userIds = [...params.userIds];
      const results = [];

      // Get current user ID for admin_id
      const { data: sessionData } = await supabase.auth.getSession();
      const adminId = sessionData.session?.user.id;
      
      if (!adminId) {
        throw new Error("Admin nicht authentifiziert");
      }

      // Process each user
      for (const userId of userIds) {
        try {
          // If email notification is selected
          if (params.sendEmail) {
            // If template is used, get template details
            let emailContent = params.content;
            let emailSubject = params.subject || "Benachrichtigung von FI Investments";
            
            // Get user email
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("email, first_name, last_name")
              .eq("id", userId)
              .single();
            
            if (userError || !userData?.email) {
              console.error(`Fehler beim Abrufen der E-Mail-Adresse für Benutzer ${userId}`, userError);
              continue;
            }
            
            // Personalize content if needed
            const personalizedContent = emailContent
              .replace(/{{user\.first_name}}/g, userData.first_name || '')
              .replace(/{{user\.last_name}}/g, userData.last_name || '');
            
            // Send email
            await sendEmail({
              to: userData.email,
              subject: emailSubject,
              html: personalizedContent
            });
          }
          
          // If push notification is selected
          if (params.sendPush) {
            // Get user FCM tokens
            const { data: tokens, error: tokensError } = await supabase
              .from("fcm_tokens")
              .select("token")
              .eq("user_id", userId);
              
            if (tokensError) {
              console.error(`Fehler beim Abrufen der FCM-Tokens für Benutzer ${userId}`, tokensError);
            } else if (tokens && tokens.length > 0) {
              // Get a simplified version of content for push notification
              const pushContent = params.subject || "Neue Benachrichtigung";
              
              // Send to all user devices
              for (const tokenData of tokens) {
                try {
                  await sendPushNotification({
                    token: tokenData.token,
                    title: pushContent,
                    body: params.content.replace(/<[^>]*>/g, '').substring(0, 100) // Strip HTML and limit length
                  });
                } catch (e) {
                  console.error(`Fehler beim Senden der Push-Benachrichtigung an Token ${tokenData.token}:`, e);
                }
              }
            }
          }
          
          // Create a notification record
          const { data: notification, error: notificationError } = await supabase
            .from("notifications")
            .insert({
              user_id: userId,
              title: params.subject || "Benachrichtigung von Administrator",
              content: params.content.replace(/<[^>]*>/g, ''), // Store non-HTML version
              type: "system",
              read: false
            })
            .select()
            .single();
            
          if (notificationError) {
            console.error(`Fehler beim Erstellen der Benachrichtigung für Benutzer ${userId}`, notificationError);
          }
          
          // Log the notification action
          const { data: log, error: logError } = await supabase
            .from("admin_notification_logs")
            .insert({
              admin_id: adminId,
              sent_to_user_id: userId,
              notification_id: notification?.id,
              template_id: params.templateId,
              custom_content: !params.templateId
            })
            .single();
            
          if (logError) {
            console.error(`Fehler beim Protokollieren der Benachrichtigung für Benutzer ${userId}`, logError);
          } else {
            results.push(log);
          }
          
        } catch (error) {
          console.error(`Fehler beim Verarbeiten der Benachrichtigung für Benutzer ${userId}`, error);
        }
      }
      
      return results;
    },
    onSuccess: () => {
      toast.success("Benachrichtigungen erfolgreich gesendet");
      queryClient.invalidateQueries({ queryKey: ["admin-notification-logs"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
